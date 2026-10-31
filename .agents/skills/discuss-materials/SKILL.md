---
name: discuss-materials
description: 놀토의(knoldiscuss)의 활동지·지도안 PDF·DOCX·HWPX 다운로드 파일, 활동지 QR, 브랜드 이미지처럼 생성하거나 넣는 자료 파일을 바꿀 때 쓴다.
---

# 놀토의 자료 파일

경로는 knoldiscuss 저장소 루트 기준이다. 저장소 밖 작업 공간은 이름으로만 부른다.

## 어디에 있나 (2026-10-31)

- 웹 다운로드: `materials/`(공개). 다운로드 탭(`index.html#downloads`)과 `workroom.html`이 `?v=`를 붙여 링크한다.
- 모둠 활동지 2쪽판: 이 저장소에서 만든다. `scripts/templates/`(1쪽 원판) → `scripts/revise_group_worksheet.py` → `output/pdf/`(git 제외) → `materials/group-11-12.pdf`로 복사 → `scripts/sync_group_editables.py`(DOCX, HWPX).
- 지도안 4개(`materials/lesson-plan-*`): 2026-10-28 사용자가 준 수정본을 그대로 넣었다. 생성기가 없다.
- 개인 활동지, 모둠 활동지 1쪽 원판, 지도안 생성기: 형제 작업 공간 discussion의 teaching 폴더와 scripts 폴더. 그곳의 동기화·검사 스크립트는 옛 클론(discussion 안의 interview 폴더)을 대상으로 한다. 이 저장소에 쓰면 최신 모둠 활동지와 지도안을 옛 판으로 덮어쓰므로 정리 전까지 쓰지 않는다.
- 활동지 QR: `assets/worksheet/site-qr.png`(`scripts/generate_worksheet_site_qr.py`).
- 브랜드 이미지: `assets/brand/`(`scripts/build_brand.py`, `scripts/export-brand.mjs`, 설명은 `assets/brand/README.md`).

## 바꿀 때

1. 공개 파일이다. 학생·교사 실명, 학교·학급, 수업 일시가 새로 들어가지 않았는지 `pdftotext`로 확인한다.
2. PDF는 쪽마다 렌더해서 본다(`pdftoppm`). 쪽수, A4, 양면 설정을 확인한다. HWPX는 압축 무결성과 문구를 확인하고, 가능하면 한글 편집기(이음오피스)에서 표시를 본다.
3. 바꾼 파일을 부르는 `?v=`를 모두 올리고, 다운로드 탭의 설명(쪽수, 형식)을 맞춘다.
4. 원본과 웹 파일의 SHA-256을 비교해 기록한다.
5. 의존성: Python 3, pypdf, reportlab, python-docx, lxml, Pillow, fontTools, qrcode, zxing-cpp, Poppler(pdftoppm). 글꼴 경로가 Windows의 맑은 고딕 기준이라 macOS에서는 스크립트의 글꼴 경로를 바꿔야 한다.
6. `PROJECT_STATUS.md`에 무엇을 어떻게 확인했는지 남긴다. 실제 인쇄 확인은 따로 적는다.
