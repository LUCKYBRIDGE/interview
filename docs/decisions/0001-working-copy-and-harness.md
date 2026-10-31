# 0001. knoldiscuss 작업 사본과 저장소 안 하네스

- 상태: 채택
- 날짜: 2026-10-31
- 요청: 사용자가 knoldiscuss 폴더에서 interview 저장소를 확인하고, UI·UX 개편 전에 하네스, 스킬, 폴더 구성, 지침을 세우라고 요청했다.

## 맥락

- 웹은 GitHub `LUCKYBRIDGE/interview`(공개)이고 main 루트가 GitHub Pages로 바로 공개된다. 인쇄된 활동지 QR과 수업 슬라이드가 그 주소를 가리킨다.
- 웹 작업은 형제 작업 공간 discussion 안의 옛 클론과 다른 컴퓨터(Windows)의 체크아웃에서 이뤄졌다. 작업 지침과 스킬, 수업 기준은 저장소 밖 discussion 작업 공간에만 있어 다른 컴퓨터와 다른 도구에서 보이지 않았다.
- 이 Mac의 Kiro는 앱 다섯 개를 한 작업 공간(다중 루트)으로 연다. 각 루트의 AGENTS.md와 always 스티어링은 다른 앱 세션에도 들어간다.

## 결정

1. 이 Mac에서는 knoldiscuss 폴더를 `LUCKYBRIDGE/interview`의 작업 사본으로 쓴다. 저장소 이름과 Pages 주소는 바꾸지 않는다.
2. 하네스를 저장소 안에 둔다.
   - 진입: `AGENTS.md`(짧게, knoldiscuss에만 적용한다고 시작)
   - 기준: `DESIGN.md`, `docs/content-guide.md`, `docs/lesson-contract.md`, `docs/architecture.md`
   - 계획과 기록: `docs/plans/`, `docs/audits/`, `docs/decisions/`, `PROJECT_STATUS.md`, `CHECKLIST.md`
   - 절차: `.agents/skills/discuss-*` 6개를 정본으로 둔다(Codex가 읽는 위치)
   - 센서: `npm test`(단위 테스트와 사이트 무결성), `npm run check`(하네스 검사), `.github/workflows/ci.yml`
3. Kiro 연결은 얇게 둔다. always 스티어링과 hook은 두지 않고, fileMatch·auto 스티어링이 정본 경로를 가리킨다. 다중 루트에서 `#[[file:]]`의 기준 루트가 문서에 없으므로 원문을 포함하지 않는다.
4. 수업 문서(지도안·활동지)의 원본과 생성기는 결정 전까지 discussion 작업 공간에 둔다. 이 저장소는 웹 다운로드 파일과 모둠 활동지 2쪽판 생성기를 가진다.
5. 하네스 구축은 로컬 브랜치 `harness-foundation`에서 하고, push는 사용자 승인 뒤에 한다.

## 결과

- 어느 컴퓨터, 어느 도구에서든 저장소만 받으면 같은 지침과 검사를 쓴다.
- 지침 파일도 Pages로 공개된다(저장소가 이미 공개라 새로 드러나는 정보는 없다). Markdown에 Liquid 문법을 쓰면 빌드가 깨지므로 `npm run check`가 막는다.
- discussion 작업 공간의 스킬과 동기화 스크립트는 아직 옛 클론을 가리킨다. 정리는 계획의 결정 6을 따른다.

## 검토한 다른 길

- 사이트를 `site/` 폴더로 옮기고 GitHub Actions로 배포: 개발 문서가 공개되지 않고 CI 통과 뒤에만 배포할 수 있지만, 수업 기간에 배포 설정을 바꾸는 위험이 있어 보류했다(계획의 결정 10).
- 저장소 이름을 knoldiscuss로 변경: Pages 프로젝트 주소는 리디렉션되지 않아 QR이 깨지므로 보류했다(결정 7).
- discussion 작업 공간을 이 저장소에 합치기: 공개 저장소에 원본과 실명 자료가 들어가므로 보류했다(결정 6).
