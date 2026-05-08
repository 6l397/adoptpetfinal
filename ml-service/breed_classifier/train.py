import argparse
from pathlib import Path
from typing import Any

import pytorch_lightning as pl
import yaml
from pytorch_lightning.callbacks import LearningRateMonitor, ModelCheckpoint

from breed_classifier.config import TrainingConfig
from breed_classifier.data.datamodule import BreedDataModule
from breed_classifier.models.efficientnet import EfficientNetClassifier


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train a breed classifier")
    parser.add_argument("--config", type=Path, default=Path("configs/example.yaml"), help="Path to YAML config")
    parser.add_argument("--precision", type=int, default=None, help="Override precision (e.g., 16)")
    parser.add_argument("--unfreeze-epoch", type=int, default=None, help="Epoch to unfreeze the backbone")
    parser.add_argument("--devices", type=str, default=None, help="Devices for Lightning trainer (e.g., '1' or '0,1')")
    return parser.parse_args()


def load_config(path: Path) -> TrainingConfig:
    with path.open("r", encoding="utf-8") as f:
        data: dict[str, Any] = yaml.safe_load(f)
    if "data_dir" in data:
        data["data_dir"] = Path(data["data_dir"])
    if "log_dir" in data:
        data["log_dir"] = Path(data["log_dir"])
    cfg = TrainingConfig(**data)
    return cfg


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config)

    if args.precision is not None:
        cfg.precision = args.precision
    if args.unfreeze_epoch is not None:
        cfg.unfreeze_epoch = args.unfreeze_epoch
    if args.devices is not None:
        cfg.devices = args.devices

    pl.seed_everything(cfg.seed)

    datamodule = BreedDataModule(
        data_dir=cfg.data_dir,
        batch_size=cfg.batch_size,
        num_workers=cfg.num_workers,
        image_size=cfg.image_size,
    )
    datamodule.setup("fit")

    model = EfficientNetClassifier(
        num_classes=datamodule.num_classes,
        model_name=cfg.model_name,
        learning_rate=cfg.learning_rate,
        weight_decay=cfg.weight_decay,
        unfreeze_epoch=cfg.unfreeze_epoch,
        label_smoothing=cfg.label_smoothing,
        mixup_alpha=cfg.mixup_alpha,
        cutmix_alpha=cfg.cutmix_alpha,
        top_k=cfg.top_k,
    )

    cfg.log_dir.mkdir(parents=True, exist_ok=True)

    checkpoint_cb = ModelCheckpoint(
        dirpath=cfg.log_dir,
        filename=cfg.checkpoint_name,
        monitor="val_loss",
        save_top_k=1,
        mode="min",
    )
    lr_monitor = LearningRateMonitor(logging_interval="epoch")

    trainer = pl.Trainer(
        max_epochs=cfg.max_epochs,
        default_root_dir=cfg.log_dir,
        precision=cfg.precision,
        accelerator=cfg.accelerator,
        devices=cfg.devices,
        callbacks=[checkpoint_cb, lr_monitor],
        log_every_n_steps=10,
    )

    trainer.fit(model, datamodule=datamodule)

    if datamodule.test_dataset is not None:
        trainer.test(model, datamodule=datamodule, ckpt_path="best")

    class_map_path = cfg.log_dir / "class_map.tsv"
    datamodule.save_class_map(class_map_path)


if __name__ == "__main__":
    main()