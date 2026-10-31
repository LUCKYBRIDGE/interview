# 구조와 계약

2026-10-31, 커밋 `7347d9a` 기준이다. 개편으로 구조가 바뀌면 같은 변경에서 이 문서를 고친다. '계약'이라고 쓴 것은 기존 학생 기록, 인쇄물 QR, 외부에서 건 링크가 기대는 것이라 함부로 바꾸지 않는다.

## 1. 페이지

| 파일 | 역할 | 진입 주소 |
| --- | --- | --- |
| `index.html` | 자료: 두 주제의 탐구 자료, 가상 인물 인터뷰, 토의 방법 학습 자료, 활동지·지도안 다운로드 | 해시가 없거나 `#home`이면 `workroom.html?view=both#personal`로 이동한다(머리의 인라인 스크립트. 2026-11-01부터 사이트에 남은 유일한 인라인 스크립트다). `?explore=1`은 자료만 단독으로, `?embed=1`은 기록장 안 패널로 연다. |
| `workroom.html` | 기록장: 개인 활동, 모둠 활동, 자료 패널 | `#personal`, `#group`. `?view=both`는 넓은 화면에서 자료 패널을 연 채로 시작한다. `?view`와 옛 `?panel=1`은 읽은 뒤 주소에서 지운다(새로고침해도 학생이 닫은 패널이 다시 열리지 않게). 다른 페이지의 iframe 안에서 열리면 자료로 돌아간다. |

### 자료 경로 (계약)

| 해시 | `index.html` 패널 | 탭 이름(현재) |
| --- | --- | --- |
| `#home` | `panel-home` | ① 위험 찾기·자료 조사 |
| `#walking` | `panel-walking` | ② 가상 인물 인터뷰 (24명) |
| `#discussion` | `panel-discussion` | ③ 모둠 의견 점검 |
| `#noise` | `panel-noise` | ① 소음 탐색·자료 조사 (준비 중) |
| `#interview` | `panel-interview` | ② 인물 인터뷰 (32명, 준비 중) |
| `#study` | `panel-resources` | 토의 방법 |
| `#downloads` | `panel-downloads` | 활동지·지도안 |

3단계(2026-10-31)부터 탭 5개가 머리글 아래에 늘 보인다(소음 탭 두 개는 준비 중이라 숨긴다). 탭은 기록장 패널 안(`?embed=1`)에서는 숨는다(패널에 자료 버튼이 따로 있다). 늦은 시각 소음 경로는 준비 중이다(결정 0003). 탭, 주제 카드, 머리글 버튼, 소음으로 가는 링크를 누르거나 `#noise`·`#interview`로 들어오면 `#home`으로 돌아가고 `#noise-pending-note`에 안내 문구를 보인다. 패널 내용은 그대로 있다. 본문 안 절로 가는 해시(예: `#policy-cases`)는 그 절이 있는 탭을 보여 주고 그 절로 스크롤한다.

`assets/explore-state.mjs`의 `ROUTES`(home, walking, study, discussion, noise, interview)는 기록장 자료 패널이 받아들이는 경로다.

## 2. 모듈과 스타일

| 파일 | 책임 | 테스트 |
| --- | --- | --- |
| `assets/workroom-state.mjs` | 기록 모델, 검증, 이관, 저장, 글 파일 출력. DOM이 없는 순수 모듈 | `tests/workroom-state.test.mjs` |
| `assets/workroom.mjs` | 기록장 렌더링, 자동 저장, 충돌 경고, 불러오기·내보내기·인쇄, 의견 이미지, 패들렛 링크 | 없음(브라우저 확인) |
| `assets/explore-state.mjs` | 자료 패널 상태 정규화, 경로 목록, iframe 주소 | `tests/explore-state.test.mjs` |
| `assets/explore-pane.mjs` | 자료 패널: 열기·닫기, 볼 자료 고르기, 1024px 이상은 옆 패널·그보다 좁으면 덮는 시트, 시트일 때 배경 `inert`와 Esc, iframe 메시지와 스크롤 위치 | 없음(배치 규칙만 아래 모듈에서 테스트) |
| `assets/workroom-layout.mjs` | 배치 규칙(DOM 없음): 처음 열 때와 회전할 때 패널을 열지, 지금 보고 있는 단계 | `tests/workroom-layout.test.mjs` |
| `assets/explore-embed.mjs`, `.css` | `index.html?embed=1` 안에서 기록장 링크를 부모 화면 전환으로 바꾸고 스크롤 위치를 알림 | 없음 |
| `assets/opinion-image.mjs` | 1920×1080 의견 이미지와 파일 이름 | `tests/opinion-image.test.mjs` |
| `assets/brand.css` | 색 토큰(`--knol-*`)과 로고 | |
| `assets/explore.css` | 자료 페이지 스타일. 3단계에서 `index.html`의 인라인 style(약 43KB)을 같은 자리의 파일로 옮겼다 | |
| `assets/explore-main.js` | 자료 페이지의 화면 동작(일반 스크립트, 본문 끝에서 바로 돈다): 사례 검색 링크, 탭과 해시, 인물 카드와 방문 표시, 사이트 QR, 위험 상황 대화상자, 통계 필터, 소음 정리, 대화상자 닫기 안전장치. 2026-11-01에 `index.html` 인라인 스크립트를 순서 그대로 옮겼고 부분마다 `try`로 감쌌다 | 없음(브라우저 확인) |
| `assets/explore-page.mjs` | 입력 자동 저장(되살리기, 합쳐 저장), 위험 상황 묶음 8개 접기와 고른 수, '이전에 적은 내용'. 위 스크립트 다음에 돈다 | 없음(규칙만 아래 모듈에서 테스트) |
| `assets/explore-inputs.mjs` | 자동 저장 규칙(DOM 없음): 칸 키 형식, 저장된 값 읽기, 합쳐 저장, 손상 값 백업, 화면에서 뺀 칸 목록과 '이전에 적은 내용' | `tests/explore-inputs.test.mjs` |
| `assets/explore-labels.mjs` | 위험 상황 묶음의 고른 수 문구, 탭 방향키가 숨은·준비 중 탭을 건너뛰는 규칙 | `tests/explore-labels.test.mjs` |

기록장 스타일은 `assets/workroom.css` → `assets/brand.css` → `assets/workroom-redesign.css` 순서로 덮어쓴다. 2단계에서 분할 화면용 `explore-pane.css`와 옛 배치 블록을 지우고, `workroom.html`의 인라인 style 2개를 `workroom-redesign.css` 맨 앞으로 옮겼다(`brand.css`와 겹치는 규칙이 없다). 새 배치 규칙은 `workroom-redesign.css` 끝에 있다. 글 파일·인쇄 출력(`formatText`)의 단계 번호는 화면과 같고, 화면에 없는 이전 버전 항목은 내용이 있을 때만 나온다. 같은 선택자를 여러 파일에서 다시 정의한 곳이 많다([기준선 점검](audits/2026-10-31-baseline.md#1-기록장)).

## 3. 학생 기록 (계약)

학생 기록은 그 기기의 브라우저와 학생이 내려받은 파일에만 있다. 지우거나 형식을 바꾸면 되살릴 수 없다.

### 저장 키

| 저장소 | 키 | 내용 | 규칙 |
| --- | --- | --- | --- |
| localStorage | `interview-workroom-v4-personal`, `interview-workroom-v4-group` | 기록장 기록(현재 버전) | 여기에만 쓴다 |
| localStorage | `interview-workroom-v3-*`, `-v2-*`, `-v1-*` | 이전 버전 기록 | 읽기만 하고 지우지 않는다. v4가 없을 때 v3, v2, v1 순서로 읽는다 |
| localStorage | `openclass-student-inputs-v1` | 자료 페이지의 입력란 자동 저장. 칸마다 `id:칸id`, `risk:묶음:문구`, `noise:문구`, `noise-source:문구`, `stage-eval:번호`, `name:이름:값` 키에 값이나 체크 여부를 둔다(id가 있으면 id 키가 먼저다) | 학생 입력이다. 지우지 않는다. 저장할 때 화면의 값을 저장된 값 위에 합쳐서, 화면에서 뺀 칸의 값도 남는다(2026-11-01부터). 모듈이 돌기 전에 학생이 고친 칸은 되살리기로 덮지 않는다. 칸 문구와 id가 키라서, 위험 상황 문구·묶음 이름·칸 id를 바꾸면 이관이 필요하다. 지금 칸의 키 목록은 `tests/baselines/input-keys.json`이고 `npm test`가 지킨다 |
| localStorage | `openclass-student-inputs-v1-damaged` | 위 값을 읽을 수 없을 때, 새로 쓰기 전에 원문을 옮겨 둔 것 | 지우지 않는다. 비어 있을 때만 쓴다. 여기에 다른 원문이 이미 있는데 또 읽을 수 없는 값이 생기면 둘 다 덮어쓰지 않고 그 페이지의 자동 저장을 멈춘다 |
| localStorage | `pedestrian-case-study-v1` | 2026-10-28에 잠시 보였던 사례 조사 칸 7개(배열) | 읽기만 한다. 칸은 2026-11-01에 지웠고, 값은 '이전에 적은 내용'으로만 보인다. 지우지 않는다 |

2026-10-28에 숨기고 2026-11-01에 지운 자료 페이지 칸(STEP 2·3·4, 아이디어, 사례 조사, 위험 상황 출처와 메모)은 `assets/explore-inputs.mjs`의 `PREVIOUS_GROUPS`에 있다. 그 칸에 글이 있으면 홈 위쪽에 닫힌 '이전에 적은 내용' 상자(읽기 전용, 복사)를 보인다.

GitHub Pages 프로젝트 사이트는 모두 같은 출처(`https://luckybridge.github.io`)라서 LUCKYBRIDGE의 다른 Pages 사이트와 localStorage를 함께 쓴다. 새 키를 만들 때는 다른 사이트와 겹치지 않을 이름을 쓴다.

### 기록 파일과 데이터

- 봉투: `{app: 'interview-workroom', version: 4, kind: 'personal' | 'group', updatedAt, data}`. 키 집합이 정확히 같아야 받는다. 버전 1~4를 받고 kind가 지금 활동과 같아야 한다.
- 개인 data: label, groupNumber, perspectives[2](kind, person, difficulty, value), experience, sources[2](title, url, date, claim, relevance, scope), who, where, difficulty, problem, ideas[3], proposal, reason, evidence, uncertainties, handoff.
- 모둠 data: label, groupNumber, focus, focusReason, discussion, members[3~5](name, problem, proposal, reason, source, strength, concern, question, revision, checked), criteria(feasible, effective, shared, extra), criteriaList, proposal, reason, evidence, changes, remaining, method, clarity, next.
- 화면에 입력란이 없는 필드도 보관한다. 키 집합을 엄격히 검사하므로 필드 하나를 더하거나 빼도 기존 파일과 저장 기록이 '항목이 맞지 않습니다'로 거부된다. 필드를 바꾸려면 버전을 올리고(v5) 이전 버전 이관을 더한다.
- 한도: 파일 2,000,000바이트, 글 칸 8000자, 개인 이름 40자, 검토 기준 12개와 각 200자, 모둠 번호 빈 값 또는 1~6, 모둠원 3~5명.
- 이관: v1~v3은 groupNumber를 더해 v4로 읽는다. 모둠 이름이 '3' 또는 '3모둠'이면 번호를 되살린다. 모둠 v1·v2는 criteriaList를 기준 켜짐 여부와 extra로 만든다. v1의 discussion은 빈 값으로 채운다.
- 손상된 저장 기록은 옛 키로 우회하지 않고 덮어쓰지 않는다. 저장 실패, 손상, 다른 창의 변경을 감지하면 자동 저장을 멈추고 알린다.
- 모둠 최종 확인(checked)은 label, groupNumber, checked 외의 내용을 고치거나 기준을 바꾸거나 개인 기록을 불러오면 모두 풀린다.
- 의견 이미지에는 proposal과 reason, evidence만 담는다. 이름과 모둠은 파일 이름에만 쓴다.

### 화면 설정 (바꿔도 기록에는 영향 없음)

| 저장소 | 키 | 내용 |
| --- | --- | --- |
| sessionStorage | `interview-explore-pane-v1` | 자료 패널 `{route, mode, y}`. mode는 `both`가 패널 열림, `writing`이 닫힘이다. 예전 값 `explore`는 열림으로 읽는다 |
| sessionStorage, localStorage | `knoltalk-single-source`, `knoltalk-left-source`, `knoltalk-right-source`, `knoltalk-workspace-split-v1` | 2단계 전 분할 화면의 선택과 비율. 지금은 읽지도 쓰지도 않는다(남은 값은 그대로 둔다) |
| localStorage | `interview-visited-v1` | 인터뷰 링크를 열어 본 표시(완료가 아니다) |

## 4. 페이지 사이 메시지 (계약)

모두 같은 출처(`location.origin`)와 해당 창만 받는다.

| 메시지 | 보내는 쪽 → 받는 쪽 | 뜻 |
| --- | --- | --- |
| `discussion-activity` `{kind}` | 자료 iframe → 기록장 | 자료 안의 기록장 링크를 누르면 부모의 활동을 바꾼다 |
| `discussion-explore-position` `{route, y, restored}` | 자료 iframe → 기록장 | 자료 경로와 스크롤 위치를 알린다 |
| `discussion-explore-restore` `{route, y}` | 기록장 → 자료 iframe | 저장한 위치로 되돌린다 |

## 5. 캐시 갱신 값 `?v=`

- HTML과 모듈이 자산을 `?v=날짜-번호`로 부른다. 고친 파일을 부르는 모든 곳의 값을 같은 새 값으로 올린다.
- 같은 모듈을 서로 다른 값으로 부르면 브라우저가 두 번 내려받아 상태가 갈라진다. `npm test`가 검사한다.
- `assets/explore-state.mjs`는 값 없이 불러온다. `materials/personal-9-10.*`에도 값이 없다.

## 6. 배포

- GitHub Pages legacy 빌드가 main 루트를 그대로 공개한다. push하면 보통 몇 분 안에 바뀐다. 2026-10-31 확인: 최신 빌드 `7347d9a`, built.
- `.nojekyll`이 없어 Jekyll이 처리한다. `.`이나 `_`로 시작하는 파일과 폴더(`.agents/`, `.kiro/`, `.github/`, `.qa/`)는 공개되지 않는다. 나머지는 공개되고, README가 아닌 Markdown은 HTML로도 공개된다. Markdown에 Liquid 문법이 있으면 빌드가 실패한다.
- `.github/workflows/ci.yml`은 push와 PR에서 `npm test`, `npm run check`를 돌린다. Pages 배포를 막지는 않는다.
- 공개 주소는 인쇄된 활동지 QR(`assets/worksheet/site-qr.png`)과 수업 슬라이드에 있다. GitHub는 저장소 이름을 바꿀 때 Pages 프로젝트 주소는 리디렉션하지 않는다.

## 7. 외부 서비스

| 서비스 | 쓰임 | 비고 |
| --- | --- | --- |
| Gemini (Gem) | 가상 인물 인터뷰, 모둠 의견 점검 도우미, 소음 사실조사 도우미 | 다른 사이트 안에 넣을 수 없어(X-Frame-Options: DENY) 새 탭으로 연다. 계정이 필요할 수 있다 |
| NotebookLM | 토의 방법 학습 카드·퀴즈 6개 | 공유 권한에 따라 열리지 않을 수 있다 |
| 패들렛 | 개인(1~6모둠)과 모둠(학급) 의견 이미지 제출 | 학생이 직접 이미지를 올린다. 주소는 `assets/workroom.mjs` |
| Google Drive | 다른 제출 방법(폴더) | |
| 검색·공공기관·기사 링크 | 자료 찾기 | `tests/baselines/external-links.json`에 목록이 있다 |

화면을 열 때 외부에서 불러오는 파일은 없다. 사이트 QR(다운로드 탭, 사이트 QR 대화상자)은 2026-10-31부터 저장소 안 `assets/worksheet/site-qr.png`(https://luckybridge.github.io/interview/)를 쓴다. 전에는 api.qrserver.com에서 그때그때 만들었다.
