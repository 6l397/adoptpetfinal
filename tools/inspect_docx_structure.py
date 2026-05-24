from pathlib import Path

from docx import Document


SOURCE = Path(r"C:\Users\Huawei\Downloads\Диплом.docx")


def main() -> None:
    doc = Document(SOURCE)
    needles = (
        "АНОТАЦІЯ",
        "ВСТУП",
        "РОЗДІЛ",
        "ВИСНОВОК",
        "ДОДАТОК",
        "Метою роботи",
        "Must have",
    )
    for index, paragraph in enumerate(doc.paragraphs):
        text = paragraph.text.strip()
        if text and any(needle in text for needle in needles):
            print(f"{index:04d} | {paragraph.style.name} | {text[:180]}")


if __name__ == "__main__":
    main()
