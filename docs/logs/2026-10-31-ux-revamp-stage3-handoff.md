# 인수인계: UI·UX 개편 3단계부터 이어서 하기

- 다음 세션 목표: 개편 계획의 3단계(자료 페이지 길 찾기)를 시작한다. 이어서 4단계(내용 정리), 5단계(디자인 마감), 6단계(문서와 자료 정리)를 한다.
- 저장소: GitHub `LUCKYBRIDGE/interview`, 기본 브랜치 `main`. 명령은 저장소 루트에서 실행한다.
- 작성: Kiro 세션, 2026-10-31. 앞선 노트 `docs/logs/2026-10-31-ux-revamp-stage2-handoff.md`는 같은 날 2단계를 마쳐 기록으로만 남긴다.
- 다음 세션의 첫 메시지: "`docs/logs/2026-10-31-ux-revamp-stage3-handoff.md`를 읽고 '다음 단계'부터 이어서 해 줘."

## 상태

- 끝남(main `5fbd77f`, 공개 중): 0단계 하네스, 1단계 바로 고칠 것(지도안 항목 제외), 2단계 기록장 단순화. 내용은 `PROJECT_STATUS.md`의 2026-10-31 항목들에 있다.
- 시작 안 함: 3~6단계(`docs/plans/ux-revamp.md`). 2단계에서 옮겨 온 기록장 CSS 합치기는 5단계에 있다.
- 남은 확인: 모둠 활동 첫 입력란이 갤럭시 탭 가로(720px)에서 첫 칸 위쪽만 보인다(`CHECKLIST.md`). 실제 갤럭시 탭·아이패드 확인은 아직이다.

## 확인한 것

- main에서 `npm test` 41개, `npm run check` 통과. GitHub CI `5fbd77f` 성공. Pages 빌드 `5fbd77f` 완료, 공개 파일 8개가 저장소와 해시로 같다. 지운 `assets/left-personal.mjs`, `assets/explore-pane.css`는 공개 주소에서 404다.
- 2단계 화면 측정과 동작 확인: `docs/audits/2026-10-31-stage2-workroom.md`(로컬 QA 서버, 공개 사이트와 같은 파일).

## 확인하지 않은 것 (먼저 확인)

- 공개 사이트를 브라우저로 열어 보지 않았다(파일이 같음만 확인). 기록장은 페이지를 떠날 때 저장하므로, 사용자 브라우저 프로필로 공개 주소를 열면 실제 기록의 저장 시각이 바뀌고 열려 있는 다른 탭에 '다른 창에서 바뀌었습니다' 경고가 뜰 수 있다. 공개 사이트 확인은 사용자에게 먼저 묻는다.
- 화면 키보드, 파일 저장(갤럭시 탭 다운로드 폴더, 아이패드 파일 앱), 화면 낭독기.

## 결정

- [0001](../decisions/0001-working-copy-and-harness.md) 작업 사본과 하네스, [0002](../decisions/0002-target-devices.md) 주 기기는 갤럭시 탭과 PC(아이패드도 지원), [0003](../decisions/0003-deploy-and-delegated-decisions.md) 검증을 마친 단계는 바로 배포·결정 3과 4는 추천안.
- 사용자 요청: main에는 어느 정도 완결된 묶음만 올린다. 진행 중 작업은 브랜치에 push한다.
- 열린 것: 결정 5(공개 지도안 속 학교·학급·교사 실명·수업 일시), 6~10(`docs/plans/ux-revamp.md`의 열린 결정).

## 알아 둘 것

- 검증은 사용자가 쓰지 않는 포트에서: `node scripts/serve.mjs 4191`. 끝나면 그 포트에 생긴 빈 기록과 검증 표시가 든 기록만 지운다.
- Kiro에서 한 응답에 넣은 도구 호출은 동시에 실행된다. 파일을 쓴 뒤의 검사, 브라우저 작업 뒤의 서버 끄기는 다음 차례에 한다. 브라우저 스크립트 두 개를 같은 작업 공간에서 동시에 돌리면 같은 페이지를 서로 움직여 결과가 섞인다(2026-10-31에 겪음).
- heredoc 뒤에 파이프를 붙인 셸 명령은 Kiro 권한 검사가 거부한다. ego-browser 스크립트는 파일로 만들어 `ego-browser nodejs < 파일`로 넘긴다.
- ego-browser의 `page.click()`은 `aria-disabled="true"` 요소를 누르지 않는다. 좌표로 누른다. Ego Lite 업데이트 알림이 떠 있다(업데이트는 사용자 승인 뒤).
- 화면 크기를 바꾸는 검증(회전)에서 기록장 패널은 실제 폭으로 판단한다(`assets/workroom-layout.mjs`의 `isWideWidth`).
- 지도안·활동지 편집 원본과 생성기는 저장소 밖 수업 자료 작업 공간(discussion)에 있고, 다른 컴퓨터에는 없을 수 있다. 그곳의 동기화 스크립트는 옛 사본을 대상으로 하므로 쓰지 않는다.
- 원격에 합친 작업 브랜치(`harness-foundation`, `stage1-quick-fixes`, `stage2-workroom-layout`)가 남아 있다. 지워도 된다.

## 먼저 읽을 것

- `AGENTS.md`, `docs/plans/ux-revamp.md`(3단계 항목과 완료 조건).
- `docs/architecture.md` 1절(자료 경로와 해시), 4절(페이지 사이 메시지): 3단계에서 지킬 계약.
- `docs/audits/2026-10-31-baseline.md` 2·3절: 자료 페이지의 길 찾기와 내용 문제, 줄 번호(`7347d9a` 기준이라 지금과 조금 다르다).
- `docs/content-guide.md`: 4단계 문구·용어·통계 기준.
- `.agents/skills/discuss-ui-change/SKILL.md`, `.agents/skills/discuss-content-edit/SKILL.md`, `.agents/skills/discuss-verify/SKILL.md`.

## 다음 단계

1. `git fetch origin`, `git switch main`, `git pull`, `npm test`, `npm run check`. 새 브랜치를 만든다(예: `stage3-explore-nav`).
2. 3단계 1: `index.html` 머리글을 한 겹으로 줄이고, '탐구 자료 세부 메뉴 보기' 접기 안의 탭 7개를 늘 보이게 한다. 안내 상자, 주제 카드, ①②활동 버튼, 공통 자료 버튼의 중복을 정리한다. 자료 경로 해시 7개, `?explore=1`, `?embed=1`, 기록장 패널 안 동작(`assets/explore-embed.mjs`가 숨기는 요소)을 지킨다.
3. 3단계 2: 홈 패널을 절로 나누고 절 목차를 둔다. 위험 상황 54개는 묶음 8개로 접는다. 페이지 안 절 링크는 1단계에서 고친 `fromHash`가 처리한다.
4. 3단계 3~5: 숨긴 STEP 2·3·4 마크업 정리(`openclass-student-inputs-v1`의 값은 지우지 않고, 있으면 '이전에 적은 내용'으로 보이기), 인라인 style·script를 `assets/`로 옮기고 순수한 부분에 테스트, 인물 카드 나이 표기와 인터뷰 버튼 44px.
5. 크기 7가지와 기록장 패널 안에서 확인하고 측정을 `docs/audits/`에 새 파일로 남긴다. 브랜치 CI 통과 뒤 main으로 앞당겨 배포하고 Pages를 확인한다(`.agents/skills/discuss-release/SKILL.md`).
6. 4단계는 통계 출처 확인과 학생 문구 승인이 필요하다. 바꿀 문구 표와 확인한 출처를 먼저 만들어 사용자에게 보인다.

## 하네스 루프

- 열린 루프가 없다(작업 공간 루트에서 `node scripts/harness/loop.mjs status`).

## 쓸 스킬

- `discuss-ui-change`, `discuss-content-edit`, `discuss-verify`, `discuss-release`. 기록 형식을 건드릴 때만 `discuss-records-compat`.
