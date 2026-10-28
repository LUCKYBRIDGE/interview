# 놀토의 로고

놀 시리즈의 둥근 사각형·짙은 외곽선·흰 캐릭터·타원형 눈을 이어받고, 두 말풍선으로 의견을 주고받는 토의를 표현한다.

## 색상

| 브랜드 | 참조 색상 |
| --- | --- |
| 놀스토리 | 보라 `#B69DF8` |
| 놀아트 | 하늘 `#BCE4F6` |
| 놀프린트 | 분홍 `#F7CFDA` |
| 놀퀴즈 | 노랑 `#FFDA56` |
| **놀토의** | **민트 `#A8DFC3`** |

외곽선과 눈은 `#182632`, 캐릭터는 `#FFFFFF`. 사각형 밖은 투명하다.

## 파일

- `knoltalk-mark.svg`: 정사각형 심벌 원본, 100×100 viewBox.
- `knoltalk-mark.png`: 투명 RGBA, 1024×1024.
- `knoltalk-logo.svg`: 심벌+한글 가로형, 254×100 viewBox. 한글은 윤곽선으로 변환해 설치 글꼴에 의존하지 않는다.
- `knoltalk-logo.png`: 투명 RGBA, 1524×600.
- `knoltalk-favicon.png`: 32×32.
- `knoltalk-touch.png`: 180×180.

웹 상단은 심벌 SVG와 실제 한글 텍스트를 조합해 작은 화면에서도 이름과 설명을 읽을 수 있도록 했다. `index.html`, `workroom.html`에서 공통 `assets/brand.css`를 사용한다.

## 로컬 디자인 참조

- `apps/knolart/assets/knolart-mark.svg`: 사각형 비율, 외곽선, 캐릭터 눈.
- `apps/knolart/assets/knolstory-mark.svg`, `apps/print/assets/knolstory-mark.svg`: 책과 캐릭터의 겹침, 보라색 브랜드.
- `apps/print/assets/nolprint-mark-pink.png`, `assets/brand-notes.md`: 분홍색, 소품을 활용한 서비스 구분, 웹 상단 조합.
- `apps/pinky-ne-site/src/assets/knolquiz-mark.svg`: 노랑색, 질문 카드와 캐릭터의 겹침.
- `apps/new-knolstory/.codex-brand-main/apps/web/components/book-entry.module.css`, `book-introduction.tsx`, `app/globals.css`: 심벌·한글 이름·설명의 웹 배치 참고. 이 체크아웃은 별도 `knolstory-mark.svg`가 없어, 형제 저장소에 공유된 놀스토리 심벌을 함께 참고했다.

참조 저장소는 수정하지 않았다. 이 파일의 색상은 확인한 로컬 자산을 기준으로 한다.

## 재생성

1. `python scripts/build_brand.py` — Malgun Gothic Bold의 한글 윤곽선으로 가로형 SVG 작성 (`fonttools` 필요).
2. 프로젝트 루트에서 `python -m http.server 4173` 실행.
3. `ego-browser nodejs -e "await import('file:///C:/ai_dev/apps/discussion/scripts/export-brand.mjs')"` — 브라우저의 SVG 렌더링으로 PNG 4종 생성. 작업 공간 ID는 출력에 표시되며, 사용 후 같은 공간을 `finish`로 종료한다.

날짜: 2026-10-28.

## 웹 색상 체계

`assets/brand.css`의 `--knol-*` 변수를 두 페이지와 탐구 iframe에서 공통으로 사용한다. 배경 `#F4FAF6`, 패널 흰색, 보조 영역 `#EDF8F2`, 선택 상태 `#A8DFC3`, 본문 `#182632`, 주요 버튼 `#21664B`, 보조 글씨 `#597467`이다. 경고는 의미를 유지하도록 노란색 계열을 보존한다. 출력용 의견 이미지도 민트 배경과 짙은 글씨로 통일한다.

실제 웹에서 참조하지 않는 가로형·고해상도 로고도 원본과 함께 저장소에 보존한다. 수업용 생성 삽화와 모둠별 QR도 `assets/lesson-slides/`에 포함한다. 임시 도구·패키지의 이미지와 검증용 렌더링은 배포 자산이 아니므로 기존 `.gitignore`를 유지한다.
