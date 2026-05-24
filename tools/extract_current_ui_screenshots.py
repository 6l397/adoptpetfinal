from __future__ import annotations

import base64
import json
from pathlib import Path


SESSION = Path(
    r"C:\Users\Huawei\.codex\sessions\2026\05\22"
    r"\rollout-2026-05-22T18-39-31-019e508e-5791-7423-aa9d-e4249d375ecc.jsonl"
)
OUTPUT_DIR = Path("outputs/diploma_ui_screenshots")
MARKER = "тоді в останню версію диплому"
FILENAMES = [
    "01_home.png",
    "02_catalog.png",
    "03_lost_found.png",
    "04_donation.png",
    "05_profile.png",
    "06_dashboard.png",
    "07_login.png",
    "08_ai_assistant.png",
    "09_lost_found_form.png",
    "10_animal_details.png",
    "11_adoption_form.png",
    "12_admin_panel_top.png",
    "13_admin_panel_lists.png",
]


def find_message() -> list[dict[str, str]]:
    with SESSION.open(encoding="utf-8") as source:
        for line in source:
            item = json.loads(line)
            payload = item.get("payload", {})
            if payload.get("type") != "message" or payload.get("role") != "user":
                continue
            content = payload.get("content", [])
            text = "".join(
                part.get("text", "")
                for part in content
                if part.get("type") == "input_text"
            )
            if MARKER in text:
                return [part for part in content if part.get("type") == "input_image"]
    raise ValueError("The user message with UI screenshots was not found.")


def main() -> None:
    images = find_message()
    if len(images) != len(FILENAMES):
        raise ValueError(f"Expected {len(FILENAMES)} screenshots, found {len(images)}.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, image in zip(FILENAMES, images):
        data_url = image["image_url"]
        _, encoded = data_url.split(",", 1)
        target = OUTPUT_DIR / filename
        target.write_bytes(base64.b64decode(encoded))
        print(target.resolve())


if __name__ == "__main__":
    main()
