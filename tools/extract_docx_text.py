from __future__ import annotations

from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def para_text(paragraph: ET.Element) -> str:
    return "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()


def para_style(paragraph: ET.Element) -> str:
    style = paragraph.find("./w:pPr/w:pStyle", NS)
    if style is None:
        return ""
    return style.attrib.get(f"{{{NS['w']}}}val", "")


def table_text(table: ET.Element) -> list[str]:
    rows: list[str] = []
    for row in table.findall("./w:tr", NS):
        cells = []
        for cell in row.findall("./w:tc", NS):
            cell_text = " ".join(
                text
                for paragraph in cell.findall(".//w:p", NS)
                if (text := para_text(paragraph))
            )
            cells.append(cell_text)
        if any(cells):
            rows.append(" | ".join(cells))
    return rows


def main() -> None:
    docx_path = Path(r"C:\Users\Huawei\Downloads\Диплом.docx")
    out_path = Path("tools/diploma_extracted.txt")

    with ZipFile(docx_path) as archive:
        document = ET.fromstring(archive.read("word/document.xml"))

    body = document.find("w:body", NS)
    lines: list[str] = []

    if body is None:
        raise RuntimeError("No document body found")

    for child in body:
        tag = child.tag.rsplit("}", 1)[-1]
        if tag == "p":
            text = para_text(child)
            if text:
                style = para_style(child)
                prefix = f"[{style}] " if style else ""
                lines.append(prefix + text)
        elif tag == "tbl":
            rows = table_text(child)
            if rows:
                lines.append("[TABLE]")
                lines.extend(rows)

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(out_path.resolve())
    print(f"lines={len(lines)}")


if __name__ == "__main__":
    main()
