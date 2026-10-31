# 인수인계: 승인 대기 브랜치 두 개에서 이어서 하기
- 다음 세션 목표: 교사(사용자)가 승인하면 브랜치 두 개를 main에 배포하고, 개편 5단계(디자인 마감)와 6단계(문서와 자료 정리)를 이어서 한다.
- 저장소: GitHub `LUCKYBRIDGE/interview`, 기본 브랜치 `main`. 명령은 저장소 루트에서 실행한다.
- 작성: Kiro 세션, 2026-11-01. 앞선 노트(`docs/logs/2026-10-31-ux-revamp-stage4-handoff.md` 등)는 기록으로만 남긴다.
- 다음 세션의 첫 메시지: "`docs/logs/2026-11-01-ux-revamp-review-handoff.md`를 읽고 '다음 단계'부터 이어서 해 줘."

## 상태
- 공개 중(main): 0~3단계(코드는 main `e26157c`)와 문서. 이 노트를 올린 커밋도 문서만 바꿨다.
- 승인 대기 브랜치(GitHub CI 성공, 배포 전). 이어져 있다: main `f4ee026` → `stage4-content` → `stage3-hidden-cleanup`.
  - `stage4-content`(`25d6d1c`): 4단계 내용 정리. 자료 페이지 학생 문구 20곳, 통계 카드 15개의 출처 표기(9개는 출처에서 확인하고 날짜를 붙임, 6개는 확인 못 함). 바꾼 문구 표와 통계 확인은 그 브랜치의 `docs/audits/2026-10-31-stage4-content.md`.
  - `stage3-hidden-cleanup`(`26d6e0e`): 3단계에서 남긴 정리. 자동 저장 합치기(테스트), 숨긴 칸 지우기와 '이전에 적은 내용', 본문 끝 인라인 스크립트를 `assets/explore-main.js`로 옮기기, 위험 상황 대화상자 오류('24명 전체 보기', 초점) 고침, 칸 키 기준선. 그 브랜치의 `docs/audits/2026-11-01-stage3-cleanup.md`.
- 사용자에게 물은 것(답을 기다림):
  1. 두 브랜치를 배포해도 되는지. 추천: 함께 배포.
  2. 결정 5, 공개 지도안 속 학교·학급·교사 실명·수업 일시. 추천: 그 정보를 지운 판으로 바꾸고 선생님 자료로 옮긴다. Git 이력은 다시 쓰지 않는다.
  3. Ego Lite 업데이트 알림. 업그레이드는 사용자 승인 뒤에만 한다.
- 남은 것:
  - 통계 카드 6개 확인: TAAS 통계 조회 화면 4개(화면을 스크립트로 그려 내려받은 문서에 숫자가 없음), 뉴스1 기사, 인천연구원 보고서(내려받기 시간 초과).
  - 5단계 디자인 마감: 13px보다 작은 글자 선언 67개, `!important` 41개(두 브랜치 기준), 선택 상태 모양 한 가지, 기록장 CSS 합치기, 초점·움직임 줄이기·대비·200% 확대.
  - 탭 경로와 인물 데이터를 DOM과 나눠 테스트한다(`assets/explore-main.js`, 브랜치에 있음).
  - 6단계: README와 `docs/workroom.md`에 2단계 전 분할 화면 설명이 남아 있다. 스크립트의 Windows 경로, 활동지·지도안 원본 위치(결정 6).
  - 확인: 실제 갤럭시 탭·아이패드. 모둠 활동 첫 입력란이 1280×720에서 위쪽만 보인다.

## 배포 절차 (승인 뒤)
1. `git fetch origin`, `git switch stage3-hidden-cleanup`, `git pull`, `npm test`, `npm run check`.
2. main에는 이 노트를 올린 문서 커밋이 있어 브랜치를 앞당기기로 올릴 수 없다. `git switch main`, `git pull`, `git merge --no-ff stage3-hidden-cleanup`(4단계 커밋도 함께 들어간다). main 쪽은 `docs/logs/`의 파일 두 개만 바꿔서 충돌이 없어야 한다. 4단계만 먼저 낼 때는 `git merge --no-ff stage4-content`.
3. `npm test`, `npm run check` 뒤 `git push origin main`. `gh run list --branch main`이 성공인지, `gh api repos/LUCKYBRIDGE/interview/pages/builds/latest`가 새 커밋으로 built인지 본다.
4. 바뀐 공개 파일(`index.html`, `assets/explore-main.js`, `assets/explore-page.mjs`, `assets/explore-inputs.mjs`, `assets/explore.css`, `assets/explore-embed.css`)을 `curl`로 `?cb=`를 붙여 받아 저장소 파일과 해시를 비교한다. 공개 사이트를 사용자 브라우저 프로필로 열지 않는다(실제 기록이 있다).
5. `PROJECT_STATUS.md`의 두 브랜치 항목 제목을 배포로 고치고 `CHECKLIST.md`의 배포 항목을 체크한다. 합친 브랜치를 원격에서 지울지는 사용자에게 묻는다.

## 확인한 것
- `stage4-content`: `npm test` 43개, `npm run check`, CI 성공. 브라우저 확인은 그 브랜치의 감사 문서 3절.
- `stage3-hidden-cleanup`: `npm test` 56개, `npm run check`, CI 성공. ego-browser(검증 포트 4191)로 자동 저장(되살리기, 합쳐 저장, 손상 백업과 저장 멈춤, 모듈 전에 고친 칸), '이전에 적은 내용'(크기 5가지와 터치 태블릿 3가지, iframe 안), 대화상자(초점 가두기, 초점 복귀, '24명 전체 보기'), 탭, 통계 필터, 소음 안내를 봤다. 동작 검토(`semantic_reviewer`)는 막을 문제 없음으로 승인했고 지적을 반영했다.

## 확인하지 않은 것 (먼저 확인)
- 실제 기기(갤럭시 탭, 아이패드)의 화면 키보드, 파일 저장, 화면 낭독기.
- 새 파일이 공개 사이트에서 도는지(배포 전).

## 결정
- [0001](../decisions/0001-working-copy-and-harness.md), [0002](../decisions/0002-target-devices.md), [0003](../decisions/0003-deploy-and-delegated-decisions.md).
- 3단계 남은 정리를 4단계 브랜치 위에 쌓았다. 같은 `index.html`의 긴 줄을 둘 다 고쳐서, 따로 두면 합칠 때 충돌한다. 4단계 문구를 고쳐 달라고 하면 `stage4-content`에 커밋하고 `stage3-hidden-cleanup`에 병합한다.
- 위험 상황 54개 문구는 저장 키라 4단계에서도 바꾸지 않았다. 브랜치의 칸 키 기준선(`tests/baselines/input-keys.json`)이 지킨다.
- 안의 내용이 숨어 제목만 보이던 '위험 상황 선택 내용 확인·복사' 상자는 되살리지 않고 지웠다. 자료 페이지는 탐구, 쓰기는 기록장이라는 2026-10-28 방향(`8ee4a5a`)에 맞췄다.
- 읽을 수 없는 자동 저장 값은 한 번만 백업하고, 백업 칸에 다른 값이 있으면 저장을 멈춘다(기록 호환 스킬 4번).

## 알아 둘 것
- Kiro에서 한 응답의 도구 호출은 동시에 실행된다. 파일 쓰기 뒤 검사, 브라우저 스크립트 두 개는 차례를 나눈다. 같은 주소로 `page.goto`하면 해시 이동만 일어난다(다른 주소를 먼저 연다).
- heredoc 뒤 파이프는 Kiro 권한 검사가 거부한다. ego-browser 스크립트는 파일로 만들어 `ego-browser nodejs < 파일`.
- ego-browser TaskSpace가 사라질 수 있다(이번에 9번이 없어져 이름으로 새로 만들었다). 사용자 공간은 건드리지 않는다.
- 자료 페이지는 떠날 때 저장한다. 검증용 씨앗 값을 넣거나 되돌릴 때는 같은 출처의 다른 파일(예: `assets/explore-inputs.mjs`, 브랜치에 있음)을 연 상태에서 한다.
- '모듈 전에 고친 칸'은 CDP `Fetch`로 `explore-page.mjs` 요청을 붙잡아 재현한다.
- 큰 편집은 `.qa/`의 일회성 스크립트로 '원문이 정확히 한 번 있을 때만 바꾸고, 하나라도 어긋나면 아무것도 쓰지 않는' 방식으로 했다.

## 먼저 읽을 것
- `AGENTS.md`, `DESIGN.md`(5단계면 4~9절), 브랜치 판 `docs/plans/ux-revamp.md`(4단계와 3단계 남은 정리 결과), `PROJECT_STATUS.md` 맨 위 항목.
- `.agents/skills/discuss-ui-change/SKILL.md`, `.agents/skills/discuss-verify/SKILL.md`, `.agents/skills/discuss-release/SKILL.md`.

## 다음 단계
1. 위 질문 1~3의 답을 확인한다.
2. 승인되면 배포 절차대로 배포한다. 4단계 문구를 고쳐 달라고 하면 고친 뒤 다시 승인을 받는다.
3. 5단계: 배포한 main 위에 새 브랜치(예: `stage5-design`). 글자 14px 이상, `!important`를 10개 이하로, 선택 상태 모양 한 가지, 기록장 CSS 합치기(`assets/workroom.css`, `assets/workroom-redesign.css`, `assets/brand.css`와 덮어쓰는 순서 확인). 화면 전체를 크기별로 다시 본다.
4. 6단계, 결정 5의 답에 따른 지도안 처리.

## 하네스 루프
- 열린 루프가 없다(작업 공간 루트에서 `node scripts/harness/loop.mjs status`, 2026-11-01 확인).
