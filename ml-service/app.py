from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from io import BytesIO
import requests
import torch
import pathlib
import platform
import numpy as np
import albumentations as A
from albumentations.pytorch import ToTensorV2
from torch.serialization import add_safe_globals

from breed_classifier.models.efficientnet import EfficientNetClassifier

if platform.system() == "Windows":
    pathlib.PosixPath = pathlib.WindowsPath

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

DOG_PATH = "checkpoints/outputs_stanford/best.ckpt"
DOG_CLASSES = "checkpoints/outputs_stanford/class_map.tsv"

CAT_PATH = "checkpoints/outputs_oxford/best.ckpt"
CAT_CLASSES = "checkpoints/outputs_oxford/class_map.tsv"


class PredictRequest(BaseModel):
    imageUrl: str
    type: str


def format_breed(name: str) -> str:
    name = name.split("-")[-1]   
    return name.replace("_", " ").title()


def load_class_map(path: str):
    idx_to_class = {}

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) >= 2:
                idx = int(parts[0])
                name = parts[1]
                idx_to_class[idx] = name

    return idx_to_class


def load_model(ckpt_path: str, class_map_path: str):
    idx_to_class = load_class_map(class_map_path)

    model = EfficientNetClassifier.load_from_checkpoint(
        ckpt_path,
        num_classes=len(idx_to_class),
        map_location=DEVICE,
        weights_only=False,
    )

    model.to(DEVICE)
    model.eval()

    return model, idx_to_class


dog_model, dog_classes = load_model(DOG_PATH, DOG_CLASSES)
cat_model, cat_classes = load_model(CAT_PATH, CAT_CLASSES)


transform = A.Compose([
    A.LongestMaxSize(max_size=300),
    A.PadIfNeeded(min_height=300, min_width=300, border_mode=0),
    A.CenterCrop(height=300, width=300),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
])


def load_image_from_url(url: str):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return Image.open(BytesIO(response.content)).convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Не вдалося завантажити зображення за URL"
        )


def choose_model(animal_type: str):
    if animal_type == "Собаки":
        return dog_model, dog_classes, "dog"

    if animal_type == "Коти":
        return cat_model, cat_classes, "cat"

    raise HTTPException(
        status_code=400,
        detail="Оберіть тип тварини: Собаки або Коти"
    )


@app.get("/")
def root():
    return {
        "message": "Breed classifier API is running",
        "device": str(DEVICE),
        "dogClasses": len(dog_classes),
        "catClasses": len(cat_classes),
    }


@app.post("/predict")
def predict(request: PredictRequest):
    model, idx_to_class, model_type = choose_model(request.type)

    image = load_image_from_url(request.imageUrl)
    image_np = np.array(image)

    transformed = transform(image=image_np)
    x = transformed["image"].unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]
        top_probs, top_idxs = torch.topk(probs, k=5)

    predictions = []

    for prob, idx in zip(top_probs.cpu().numpy(), top_idxs.cpu().numpy()):
        raw_name = idx_to_class[int(idx)]

        predictions.append({
            "breed": format_breed(raw_name),
            "rawBreed": raw_name,
            "confidence": float(prob),
        })

    return {
        "modelType": model_type,
        "animalType": request.type,
        "bestPrediction": predictions[0],
        "topPredictions": predictions,
    }