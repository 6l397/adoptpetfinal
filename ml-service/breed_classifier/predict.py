import argparse
from pathlib import Path
from typing import List

import numpy as np
import torch
from PIL import Image

from breed_classifier.config import InferenceConfig
from breed_classifier.data.datamodule import AlbumentationsTransform, BreedDataModule
from breed_classifier.data.transforms import build_transforms
from breed_classifier.models.efficientnet import EfficientNetClassifier


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run inference for breed classification")
    parser.add_argument("--checkpoint", type=Path, required=True, help="Path to Lightning checkpoint")
    parser.add_argument("--image", type=Path, required=True, help="Image file or directory")
    parser.add_argument("--top-k", type=int, default=5, help="Number of predictions to return")
    parser.add_argument("--image-size", type=int, default=300, help="Resize size for inference")
    parser.add_argument("--class-map", type=Path, default=None, help="Optional TSV mapping of index to class name")
    parser.add_argument("--device", type=str, default="cpu", help="Device: cpu or cuda")
    return parser.parse_args()


def collect_images(path: Path) -> List[Path]:
    if path.is_file():
        return [path]
    if path.is_dir():
        images = [p for p in path.iterdir() if p.suffix.lower() in IMAGE_EXTENSIONS]
        if not images:
            raise FileNotFoundError(f"No images with extensions {IMAGE_EXTENSIONS} found in {path}")
        return images
    raise FileNotFoundError(f"Path {path} does not exist")


def load_class_map(path: Path | None, num_classes: int) -> dict[int, str]:
    if path and path.exists():
        return BreedDataModule.load_class_map(path)
    return {idx: f"class_{idx}" for idx in range(num_classes)}


def run_inference(cfg: InferenceConfig) -> None:
    model: EfficientNetClassifier = EfficientNetClassifier.load_from_checkpoint(
        cfg.checkpoint
    )
    model.eval()
    model.to(cfg.device)

    _, eval_tf, _ = build_transforms(cfg.image_size)
    transform = AlbumentationsTransform(eval_tf)

    class_map = load_class_map(cfg.class_map, model.hparams["num_classes"])

    images = collect_images(cfg.image)
    for image_path in images:
        image = Image.open(image_path).convert("RGB")
        tensor = transform(np.array(image)).unsqueeze(0).to(cfg.device)
        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1)
            topk = torch.topk(probs, k=min(cfg.top_k, probs.shape[1]))

        indices = topk.indices.squeeze(0).tolist()
        scores = topk.values.squeeze(0).tolist()
        print(f"Results for {image_path}:")
        for idx, score in zip(indices, scores):
            print(f"  {class_map.get(idx, str(idx))}: {score:.4f}")


def main() -> None:
    args = parse_args()
    cfg = InferenceConfig(
        checkpoint=args.checkpoint,
        image=args.image,
        top_k=args.top_k,
        image_size=args.image_size,
        class_map=args.class_map,
        device=args.device,
    )
    run_inference(cfg)


if __name__ == "__main__":
    main()