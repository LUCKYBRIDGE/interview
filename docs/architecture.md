# 구조와 계약

2026-10-31, 커밋 `7347d9a` 기준이다. 개편으로 구조가 바뀌면 같은 변경에서 이 문서를 고친다. '계약'이라고 쓴 것은 기존 학생 기록, 인쇄물 QR, 외부에서 건 링크가 기대는 것이라 함부로 바꾸지 않는다.

## 1. 페이지

| 파일 | 역할 | 진입 주소 |
| --- | --- | --- |
| `index.html` | 자료: 두 주제의 탐구 자료, 가상 인물 인터뷰, 토의 방법 학습 자료, 활동지·지도안 다운로드 | 해시가 없거나 `#home`이면 `workroom.html?view=both#personal`로 이동한다(첫 인라인 스크립트). `?explore=1`은 자료만 단독으로, `?embed=1`은 기록장 안 패널로 연다. |
| `workroom.html` | 기록장: 개인 활동, 모둠 활동, 자료 패널 | `#personal`, `#group`. `?view=both`는 분할 화면을 강제한다. `?panel=1`은 기록장 안의 편집 iframe용이다. 다른 페이지의 iframe 안에서 `?panel=1` 없이 열리면 자료로 돌아간다. |

### 자료 경로 (계약)

| 해시 | `index.html` 패널 | 탭 이름(현재) |
| --- | --- | --- |
| `#home` | `panel-home` | ① 위험 탐색·자료 조사 |
| `#walking` | `panel-walking` | ② 인물 인터뷰 (24명) |
| `#discussion` | `panel-discussion` | ③ 모둠토의 |
| `#noise` | `panel-noise` | ① 소음 탐색·자료 조사 (준비 중) |
| `#interview` | `panel-interview` | ② 인물 인터뷰 (32명, 준비 중) |

늦은 시각 소음 경로는 준비 중이다(결정 0003). 탭, 주제 카드, 머리글 버튼, 소음으로 가는 링크를 누르거나 `#noise`·`#interview`로 들어오면 `#home`으로 돌아가고 `#noise-pending-note`에 안내 문구를 보인다. 패널 내용은 그대로 있다. 본문 안 절로 가는 해시(예: `#policy-cases`)는 그 절이 있는 탭을 보여 주고 그 절로 스크롤한다.
| `#study` | `panel-resources` | 토의 방법·학습 자료 |
| `#downloads` | `panel-downloads` | 활동지 다운로드 |

`assets/explore-state.mjs`의 `ROUTES`(home, walking, study, discussion, noise, interview)는 기록장 자료 패널이 받아들이는 경로다.

## 2. 모듈과 스타일

| 파일 | 책임 | 테스트 |
| --- | --- | --- |
| `assets/workroom-state.mjs` | 기록 모델, 검증, 이관, 저장, 글 파일 출력. DOM이 없는 순수 모듈 | `tests/workroom-state.test.mjs` |
| `assets/workroom.mjs` | 기록장 렌더링, 자동 저장, 충돌 경고, 불러오기·내보내기·인쇄, 의견 이미지, 패들렛 링크 | 없음(브라우저 확인) |
| `assets/explore-state.mjs` | 자료 패널 상태 정규화, 경로 목록, iframe 주소 | `tests/explore-state.test.mjs` |
| `assets/explore-pane.mjs` | 화면 구성(한 화면, 분할 화면), 왼쪽·오른쪽 내용 선택, 분할선, iframe 메시지 | 없음 |
| `assets/explore-embed.mjs`, `.css` | `index.html?embed=1` 안에서 기록장 링크를 부모 화면 전환으로 바꾸고 스크롤 위치를 알림 | 없음 |
| `assets/left-personal.mjs` | 읽기 전용 개인 기록 패널. 지금은 늘 숨겨져 있다 | 없음 |
| `assets/opinion-image.mjs` | 1920×1080 의견 이미지와 파일 이름 | `tests/opinion-image.test.mjs` |
| `assets/brand.css` | 색 토큰(`--knol-*`)과 로고 | |
| `index.html` 인라인 | 스타일 약 41KB, 스크립트 6개(가장 큰 것 약 29KB: 탭, 인물 카드, 위험 상황, 통계, 대화상자, QR) | 없음 |

기록장 스타일은 `assets/workroom.css` → `assets/explore-pane.css` → `workroom.html` 인라인 style 2개 → `assets/brand.css` → `assets/workroom-redesign.css` 순서로 덮어쓴다. 같은 선택자를 여러 파일에서 다시 정의한 곳이 많다([기준선 점검](audits/2026-10-31-baseline.md#1-기록장)).

## 3. 학생 기록 (계약)

학생 기록은 그 기기의 브라우저와 학생이 내려받은 파일에만 있다. 지우거나 형식을 바꾸면 되살릴 수 없다.

### 저장 키

| 저장소 | 키 | 내용 | 규칙 |
| --- | --- | --- | --- |
| localStorage | `interview-workroom-v4-personal`, `interview-workroom-v4-group` | 기록장 기록(현재 버전) | 여기에만 쓴다 |
| localStorage | `interview-workroom-v3-*`, `-v2-*`, `-v1-*` | 이전 버전 기록 | 읽기만 하고 지우지 않는다. v4가 없을 때 v3, v2, v1 순서로 읽는다 |
| localStorage | `pedestrian-case-study-v1` | 자료 페이지의 정책 사례 비교 입력 | 학생 입력이다. 지우지 않는다 |
| localStorage | `openclass-student-inputs-v1` | 자료 페이지의 입력란 자동 저장(지금은 숨긴 단계의 칸 포함) | 학생 입력이다. 지우지 않는다 |

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
| sessionStorage | `interview-explore-pane-v1` | 자료 패널 `{route, mode, y}`. 개편 뒤에도 이전 값을 읽어 새 상태로 바꾼다 |
| sessionStorage | `knoltalk-single-source`, `knoltalk-left-source`, `knoltalk-right-source` | 한 화면·왼쪽·오른쪽에 고른 내용 |
| localStorage | `knoltalk-workspace-split-v1` | 분할 비율(25~70, 기본 40) |
| localStorage | `interview-visited-v1` | 인터뷰 링크를 열어 본 표시(완료가 아니다) |

## 4. 페이지 사이 메시지 (계약)

모두 같은 출처(`location.origin`)와 해당 창만 받는다.

| 메시지 | 보내는 쪽 → 받는 쪽 | 뜻 |
| --- | --- | --- |
| `discussion-activity` `{kind}` | 자료 iframe → 기록장 | 자료 안의 기록장 링크를 누르면 부모의 활동을 바꾼다 |
| `discussion-explore-position` `{route, y, restored}` | 자료 iframe → 기록장 | 자료 경로와 스크롤 위치를 알린다 |
| `discussion-explore-restore` `{route, y}` | 기록장 → 자료 iframe | 저장한 위치로 되돌린다 |
| `knoltalk-personal-reference-refresh` | 기록장 안 이벤트 | 개인 기록 패널 새로 읽기 |

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
