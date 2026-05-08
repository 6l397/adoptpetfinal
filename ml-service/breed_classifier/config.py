from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class TrainingConfig:
    data_dir: Path
    batch_size: int = 32
    num_workers: int = 8
    image_size: int = 300
    max_epochs: int = 25
    learning_rate: float = 1e-4
    weight_decay: float = 1e-4
    model_name: str = "efficientnet_b3"
    unfreeze_epoch: int = 5
    precision: Optional[int] = 16
    accelerator: str = "auto"
    devices: int | str | list[int] | None = None
    log_dir: Path = Path("outputs")
    checkpoint_name: str = "best.ckpt"
    seed: int = 42
    top_k: int = 5
    label_smoothing: float = 0.0
    mixup_alpha: Optional[float] = None
    cutmix_alpha: Optional[float] = None


@dataclass
class InferenceConfig:
    checkpoint: Path
    image: Path
    top_k: int = 5
    image_size: int = 300
    class_map: Optional[Path] = None
    device: str = "cpu"


@dataclass
class DatasetPaths:
    train: Path
    val: Path
    test: Optional[Path] = None


@dataclass
class AugmentationConfig:
    rotate_degrees: int = 10
    horizontal_flip_prob: float = 0.5
    color_jitter: float = 0.15
    blur_prob: float = 0.0
    crop_scale: tuple[float, float] = field(default_factory=lambda: (0.9, 1.0))