from io import BytesIO
import os
import pathlib
import platform

import albumentations as A
import numpy as np
import requests
import torch
from albumentations.pytorch import ToTensorV2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

try:
    from torch.serialization import add_safe_globals
except ImportError:
    add_safe_globals = None

from breed_classifier.models.efficientnet import EfficientNetClassifier


if platform.system() == "Windows":
    pathlib.PosixPath = pathlib.WindowsPath

if add_safe_globals is not None:
    add_safe_globals([pathlib.PosixPath])

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
BASE_DIR = pathlib.Path(__file__).resolve().parent
IMAGE_SIZE = int(os.getenv("IMAGE_SIZE", "300"))
TOP_K = int(os.getenv("TOP_K", "5"))

MODEL_PATH = os.getenv(
    "MODEL_PATH",
    "checkpoints/outputs_merged_efficientnet_b3_fast/best.ckpt",
)
CLASS_MAP_PATH = os.getenv(
    "CLASS_MAP_PATH",
    "checkpoints/outputs_merged_efficientnet_b3_fast/class_map.tsv",
)

CAT_LABELS = {
    "abyssinian",
    "bengal",
    "birman",
    "bombay",
    "british_shorthair",
    "egyptian_mau",
    "maine_coon",
    "persian",
    "ragdoll",
    "russian_blue",
    "siamese",
    "sphynx",
}


class PredictRequest(BaseModel):
    imageUrl: str
    type: str


def format_breed(name: str) -> str:
    name = name.split("-")[-1]
    return name.replace("_", " ").title()


def load_class_map(path: str) -> dict[int, str]:
    idx_to_class: dict[int, str] = {}

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            idx_str, name = line.strip().split(maxsplit=1)
            idx_to_class[int(idx_str)] = name

    return idx_to_class


def resolve_path(path: str) -> str:
    candidate = pathlib.Path(path)
    if candidate.is_absolute():
        return str(candidate)
    return str(BASE_DIR / candidate)


def load_model(ckpt_path: str, class_map_path: str):
    ckpt_path = resolve_path(ckpt_path)
    class_map_path = resolve_path(class_map_path)
    idx_to_class = load_class_map(class_map_path)
    try:
        checkpoint = torch.load(ckpt_path, map_location=DEVICE, weights_only=False)
    except TypeError:
        checkpoint = torch.load(ckpt_path, map_location=DEVICE)
    hparams = dict(checkpoint.get("hyper_parameters", {}))
    hparams["num_classes"] = len(idx_to_class)

    model = EfficientNetClassifier(**hparams)
    model.load_state_dict(checkpoint["state_dict"])
    model.to(DEVICE)
    model.eval()

    return model, idx_to_class


breed_model, breed_classes = load_model(MODEL_PATH, CLASS_MAP_PATH)


transform = A.Compose(
    [
        A.LongestMaxSize(max_size=IMAGE_SIZE),
        A.PadIfNeeded(min_height=IMAGE_SIZE, min_width=IMAGE_SIZE, border_mode=0),
        A.CenterCrop(height=IMAGE_SIZE, width=IMAGE_SIZE),
        A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
        ToTensorV2(),
    ]
)


def load_image_from_url(url: str) -> Image.Image:
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return Image.open(BytesIO(response.content)).convert("RGB")
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Не вдалося завантажити зображення за URL",
        ) from exc


def normalize_animal_type(animal_type: str) -> str:
    value = animal_type.strip().lower()

    if value in {"cat", "cats", "kit", "kits", "koti", "кіт", "коти", "кішка", "кішки", "рљрѕс‚рё"}:
        return "cat"

    if value in {"dog", "dogs", "sobaka", "sobaky", "собака", "собаки", "рўрѕр±р°рєрё"}:
        return "dog"

    raise HTTPException(
        status_code=400,
        detail="Оберіть тип тварини: собаки або коти",
    )


def class_matches_type(class_name: str, animal_type: str) -> bool:
    is_cat = class_name.lower() in CAT_LABELS
    return is_cat if animal_type == "cat" else not is_cat


@app.get("/")
def root():
    return {
        "message": "Breed classifier API is running",
        "device": str(DEVICE),
        "model": "efficientnet_b3_merged",
        "classes": len(breed_classes),
        "imageSize": IMAGE_SIZE,
    }


@app.post("/predict")
def predict(request: PredictRequest):
    animal_type = normalize_animal_type(request.type)

    image = load_image_from_url(request.imageUrl)
    image_np = np.array(image)

    transformed = transform(image=image_np)
    x = transformed["image"].unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = breed_model(x)
        probs = torch.softmax(logits, dim=1)[0]

    predictions = []
    ranked_idxs = torch.argsort(probs, descending=True).cpu().numpy()

    for idx in ranked_idxs:
        raw_name = breed_classes[int(idx)]
        if not class_matches_type(raw_name, animal_type):
            continue

        predictions.append(
            {
                "breed": format_breed(raw_name),
                "rawBreed": raw_name,
                "confidence": float(probs[int(idx)].cpu()),
            }
        )

        if len(predictions) == TOP_K:
            break

    if not predictions:
        raise HTTPException(
            status_code=500,
            detail="Модель не повернула прогнозів для вибраного типу тварини",
        )

    return {
        "modelType": "efficientnet_b3_merged",
        "animalType": request.type,
        "bestPrediction": predictions[0],
        "topPredictions": predictions,
    }
