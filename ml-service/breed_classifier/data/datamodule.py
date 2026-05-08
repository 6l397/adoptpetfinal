from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Dict, Any

import numpy as np
import pytorch_lightning as pl
import torch
from PIL import Image
from torch.utils.data import DataLoader
from torchvision.datasets import ImageFolder

from breed_classifier.data.transforms import build_transforms


@dataclass
class DatasetPaths:
    train: Path
    val: Path
    test: Optional[Path] = None


class AlbumentationsTransform:
    """Обгортка над Albumentations для роботи з PIL / numpy."""

    def __init__(self, transform) -> None:
        self.transform = transform

    def __call__(self, img: Any) -> torch.Tensor:
        # torchvision передає PIL.Image, а в predict ми можeмо передати і numpy
        if isinstance(img, Image.Image):
            img = np.array(img)
        elif not isinstance(img, np.ndarray):
            img = np.array(img)
        augmented = self.transform(image=img)
        return augmented["image"]


class BreedDataModule(pl.LightningDataModule):
    def __init__(
        self,
        data_dir: Path | str,
        batch_size: int = 32,
        num_workers: int = 8,
        image_size: int = 300,
    ) -> None:
        super().__init__()
        self.data_dir = Path(data_dir)
        self.batch_size = batch_size
        self.num_workers = num_workers
        self.image_size = image_size

        self.train_dataset: Optional[ImageFolder] = None
        self.val_dataset: Optional[ImageFolder] = None
        self.test_dataset: Optional[ImageFolder] = None

        self.num_classes: int = 0

    # --------- допоміжне ---------
    @property
    def paths(self) -> DatasetPaths:
        return DatasetPaths(
            train=self.data_dir / "train",
            val=self.data_dir / "val",
            test=(self.data_dir / "test") if (self.data_dir / "test").exists() else None,
        )

    # --------- Lightning API ---------
    def setup(self, stage: Optional[str] = None) -> None:  # type: ignore[override]
        train_tf, eval_tf, test_tf = build_transforms(self.image_size)
        paths = self.paths

        if stage in (None, "fit", "validate"):
            self.train_dataset = ImageFolder(
                root=paths.train, transform=AlbumentationsTransform(train_tf)
            )
            self.val_dataset = ImageFolder(
                root=paths.val, transform=AlbumentationsTransform(eval_tf)
            )
            self.num_classes = len(self.train_dataset.classes)

        if stage in (None, "test") and paths.test is not None:
            self.test_dataset = ImageFolder(
                root=paths.test, transform=AlbumentationsTransform(test_tf)
            )

    def train_dataloader(self) -> DataLoader:  # type: ignore[override]
        assert self.train_dataset is not None
        return DataLoader(
            self.train_dataset,
            batch_size=self.batch_size,
            shuffle=True,
            num_workers=self.num_workers,
            pin_memory=True,
        )

    def val_dataloader(self) -> DataLoader:  # type: ignore[override]
        assert self.val_dataset is not None
        return DataLoader(
            self.val_dataset,
            batch_size=self.batch_size,
            shuffle=False,
            num_workers=self.num_workers,
            pin_memory=True,
        )

    def test_dataloader(self) -> DataLoader:  # type: ignore[override]
        assert self.test_dataset is not None
        return DataLoader(
            self.test_dataset,
            batch_size=self.batch_size,
            shuffle=False,
            num_workers=self.num_workers,
            pin_memory=True,
        )

    # --------- робота з мапою класів ---------
    def save_class_map(self, path: Path) -> None:
        """Зберегти індекс -> назва класу (порода) у TSV."""
        if self.train_dataset is None:
            raise RuntimeError("Train dataset is not initialized. Call setup('fit') first.")
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as f:
            for idx, name in enumerate(self.train_dataset.classes):
                f.write(f"{idx}\t{name}\n")

    @staticmethod
    def load_class_map(path: Path) -> Dict[int, str]:
        mapping: Dict[int, str] = {}
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                idx_str, name = line.strip().split("\t", maxsplit=1)
                mapping[int(idx_str)] = name
        return mapping
