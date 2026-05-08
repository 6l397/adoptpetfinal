from typing import Tuple

import albumentations as A
from albumentations.pytorch import ToTensorV2


IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


def build_transforms(image_size: int) -> Tuple[A.Compose, A.Compose, A.Compose]:
    """Створює train/val/test трансформації Albumentations."""
    train_tf = A.Compose(
        [
            A.LongestMaxSize(max_size=image_size),
            A.PadIfNeeded(image_size, image_size, border_mode=0),
            A.RandomResizedCrop(size=(image_size, image_size), scale=(0.9, 1.0)),
            A.HorizontalFlip(p=0.5),
            A.Rotate(limit=10, p=0.5),
            A.ColorJitter(
                brightness=0.15, contrast=0.15, saturation=0.15, hue=0.05, p=0.5
            ),
            A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ToTensorV2(),
        ]
    )

    eval_tf = A.Compose(
        [
            A.LongestMaxSize(max_size=image_size),
            A.PadIfNeeded(image_size, image_size, border_mode=0),
            A.CenterCrop(image_size, image_size),
            A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ToTensorV2(),
        ]
    )

    # test = та сама, що й val
    test_tf = eval_tf

    return train_tf, eval_tf, test_tf
