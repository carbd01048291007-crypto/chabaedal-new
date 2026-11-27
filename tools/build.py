#!/usr/bin/env python3
"""페이지 조립 도구

src/ 폴더의 각 페이지 본문에 공통 틀(맨 위 메뉴, 바닥글, 오른쪽 버튼)을 씌워
저장소 맨 위에 완성된 .html 파일을 만듭니다.

사용법:  python3 tools/build.py

src/*.html 맨 첫 줄에는 아래처럼 페이지 정보를 적습니다.
<!-- {"title": "...", "description": "...", "image": "images/....jpg", "solid": false} -->
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
LAYOUT = (ROOT / "tools" / "layout.html").read_text(encoding="utf-8")

MENU = [
    ("about.html", "회사 소개"),
    ("car.html", "승용차 탁송"),
    ("heavy.html", "대형·특장차 탁송"),
    ("driver.html", "대리운전·일일기사"),
    ("price.html", "요금"),
    ("cases.html", "진행사례"),
    ("recruit.html", "기사 모집"),
    ("contact.html", "문의하기"),
]


def nav_html(current: str) -> str:
    items = []
    for href, label in MENU:
        cur = ' aria-current="page"' if href == current else ""
        items.append(f'        <li><a href="{href}"{cur}>{label}</a></li>')
    return "\n".join(items)


def build(page: Path) -> None:
    text = page.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--\s*(\{.*?\})\s*-->\s*", text, re.S)
    if not m:
        raise SystemExit(f"{page.name}: 첫 줄에 페이지 정보가 없습니다")
    meta = json.loads(m.group(1))
    body = text[m.end():]
    html = (
        LAYOUT.replace("{{title}}", meta["title"])
        .replace("{{description}}", meta["description"])
        .replace("{{image}}", meta.get("image", "images/hero-buses.jpg"))
        .replace("{{header_attr}}", " data-solid" if meta.get("solid") else "")
        .replace("{{nav}}", nav_html(page.name))
        .replace("{{scripts}}", "".join(f'\n<script src="{s}"></script>' for s in meta.get("scripts", [])))
        .replace("{{body}}", body.rstrip() + "\n")
    )
    (ROOT / page.name).write_text(html, encoding="utf-8")
    print("만듦:", page.name)


if __name__ == "__main__":
    for p in sorted(SRC.glob("*.html")):
        build(p)
