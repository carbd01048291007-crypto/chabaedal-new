#!/usr/bin/env python3
"""페이지 조립 도구

src/ 폴더의 각 페이지 본문에 공통 틀(맨 위 메뉴, 바닥글, 오른쪽 버튼)을 씌워
저장소 맨 위에 완성된 .html 파일을 만듭니다.

사용법:  python3 tools/build.py

src/*.html 맨 첫 줄에는 아래처럼 페이지 정보를 적습니다.
<!-- {"title": "...", "description": "...", "image": "images/....jpg", "solid": false} -->
"""
import hashlib
import json
import re
from pathlib import Path

# 홈페이지 인터넷 주소 (도메인을 연결하면 여기만 바꾸면 됩니다. 끝에 / 를 붙입니다)
SITE_URL = "https://carbd01048291007-crypto.github.io/chabaedal-new/"
SHARE_IMAGE = "images/share.jpg"   # 카카오톡·문자 공유 미리보기 사진 (1200x630)

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
        .replace("{{image}}", SITE_URL + meta.get("image", SHARE_IMAGE))
        .replace("{{url}}", SITE_URL + ("" if page.name == "index.html" else page.name))
        .replace("{{header_attr}}", " data-solid" if meta.get("solid") else "")
        .replace("{{nav}}", nav_html(page.name))
        .replace("{{scripts}}", "".join(f'\n<script src="{s}"></script>' for s in meta.get("scripts", [])))
        .replace("{{body}}", body.rstrip() + "\n")
    )
    # 디자인·동작 파일이 바뀌면 주소 뒤 버전이 바뀌어, 휴대폰·컴퓨터가 예전 파일을 쓰지 않게 함
    def bust(m):
        f = ROOT / m.group(2)
        v = hashlib.md5(f.read_bytes()).hexdigest()[:8] if f.exists() else "0"
        return f'{m.group(1)}="{m.group(2)}?v={v}"'
    html = re.sub(r'(href|src)="((?:css|js)/[^"?]+)"', bust, html)
    (ROOT / page.name).write_text(html, encoding="utf-8")
    print("만듦:", page.name)


if __name__ == "__main__":
    for p in sorted(SRC.glob("*.html")):
        build(p)
