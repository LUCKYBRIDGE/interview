# 인수인계: UI·UX 개편 4단계부터 이어서 하기
> 2026-11-01 덧붙임: 4단계와 3단계에 남긴 정리는 브랜치 `stage4-content`, `stage3-hidden-cleanup`에서 끝났고 승인을 기다린다. 이 노트 대신 [2026-11-01 인수인계](2026-11-01-ux-revamp-review-handoff.md)를 읽는다. 아래는 기록으로만 남긴다.


- 다음 세션 목표: 개편 계획의 4단계(내용 정리)를 하고, 3단계에 남긴 항목과 5·6단계를 이어서 한다.
- 저장소: GitHub `LUCKYBRIDGE/interview`, 기본 브랜치 `main`. 명령은 저장소 루트에서 실행한다.
- 작성: Kiro 세션, 2026-10-31. 앞선 노트(`docs/logs/2026-10-31-ux-revamp-stage2-handoff.md`, `docs/logs/2026-10-31-ux-revamp-stage3-handoff.md`)는 기록으로만 남긴다.
- 다음 세션의 첫 메시지: "`docs/logs/2026-10-31-ux-revamp-stage4-handoff.md`를 읽고 '다음 단계'부터 이어서 해 줘."

## 상태

- 끝남(main `e26157c`, 공개 중): 0단계 하네스, 1단계(지도안 항목 제외), 2단계 기록장, 3단계 자료 페이지 길 찾기(숨긴 STEP 정리와 인라인 스크립트 옮기기 제외). 내용은 `PROJECT_STATUS.md` 맨 위 항목들.
- 남은 것:
  - 3단계 3: 숨긴 STEP 2·3·4 마크업 정리. 자료 페이지의 입력 자동 저장(`index.html` 인라인 스크립트, 키 `openclass-student-inputs-v1`)은 지금 화면에 있는 칸만 다시 써서, 칸을 지우면 그 칸의 값이 다음 저장 때 사라진다. 먼저 저장을 '저장된 다른 키를 지키며 합치기'로 바꾸고, 그 규칙을 모듈로 빼서 테스트한 뒤 정리한다. 값이 있으면 '이전에 적은 내용'으로 읽기 전용으로 보인다.
  - 3단계 4: 남은 인라인 스크립트 5개(가장 큰 것 약 29KB)를 `assets/`로 옮기고 순수한 부분에 테스트.
  - 4단계 내용 정리(`docs/plans/ux-revamp.md` 4단계, 기준은 `docs/content-guide.md`). 사용자 승인 필요: 바꾼 학생 문구와 통계 확인 결과.
  - 5단계 디자인 마감: 13px보다 작은 글자 선언 68개, `!important` 44개, 선택 상태 모양 통일, 기록장 CSS 합치기(2단계에서 옮겨 옴).
  - 6단계 문서와 자료 정리, 결정 5(공개 지도안 속 교사·학교 정보)와 6~10.
- 남은 확인: 모둠 활동 첫 입력란이 갤럭시 탭 가로(720px)에서 첫 칸 위쪽만 보인다. 실제 갤럭시 탭·아이패드에서는 아직 보지 않았다.

## 확인한 것

- main `e26157c`: `npm test` 43개, `npm run check` 통과, GitHub CI 성공, Pages 빌드 완료, 공개 파일 5개가 저장소와 해시로 같다.
- 단계별 측정과 동작 확인: `docs/audits/2026-10-31-stage2-workroom.md`, `docs/audits/2026-10-31-stage3-explore.md`.

## 확인하지 않은 것 (먼저 확인)

- 공개 사이트를 브라우저로 열어 보지 않았다(사용자 프로필의 실제 기록을 건드리지 않으려고 해시만 비교). 공개 확인은 사용자에게 먼저 묻는다.
- 실제 기기의 화면 키보드, 파일 저장, 화면 낭독기.

## 결정

- [0001](../decisions/0001-working-copy-and-harness.md), [0002](../decisions/0002-target-devices.md) 주 기기 갤럭시 탭과 PC(아이패드 지원), [0003](../decisions/0003-deploy-and-delegated-decisions.md) 검증한 단계는 바로 배포·결정 3과 4는 추천안.
- 사용자 요청: main에는 어느 정도 완결된 묶음만, 진행 중 작업은 브랜치에.
- 인물 카드 21~24번의 나이는 교사가 준 Gem 설정 원본(저장소 밖 discussion 작업 공간의 sources/originals)에서 가져왔다.

## 알아 둘 것

- 검증은 `node scripts/serve.mjs 4191`(사용자가 쓰지 않는 포트)에서 하고, 끝나면 그 포트에 생긴 빈 기록과 검증 표시가 든 기록만 지운다.
- Kiro에서 한 응답의 도구 호출은 동시에 실행된다. 파일 쓰기 뒤 검사, 브라우저 작업 뒤 서버 끄기, 브라우저 스크립트 두 개는 차례를 나눈다. 같은 주소로 `page.goto`하면 해시 이동만 일어나 새로 불러오지 않는다(다른 주소를 먼저 연다).
- heredoc 뒤 파이프는 Kiro 권한 검사가 거부한다. ego-browser 스크립트는 파일로 만들어 `ego-browser nodejs < 파일`.
- `page.click()`은 `aria-disabled="true"` 요소를 누르지 않는다(좌표로 누른다).
- 큰 편집은 `.qa/`에 일회성 스크립트를 두고 '원문이 정확히 한 번 있을 때만 바꾸고, 하나라도 어긋나면 아무것도 쓰지 않는' 방식으로 했다.

## 먼저 읽을 것

- `AGENTS.md`, `docs/plans/ux-revamp.md`(4단계와 3단계 결과의 '남긴 것'), `docs/content-guide.md`, `docs/audits/2026-10-31-baseline.md` 3절(내용 문제 목록, 줄 번호는 옛 기준).
- `.agents/skills/discuss-content-edit/SKILL.md`, `.agents/skills/discuss-records-compat/SKILL.md`(자동 저장을 바꿀 때), `.agents/skills/discuss-verify/SKILL.md`.

## 다음 단계

1. `git fetch origin`, `git switch main`, `git pull`, `npm test`, `npm run check`. 새 브랜치(예: `stage4-content`).
2. 4단계: 용어표(가상 인물, 개인 활동·모둠 활동, 모둠 토의, 놀토의 등)를 화면과 글 출력에 적용하고, 긴 문장·반복 주의문을 줄인다. 바꾼 문구 표(위치, 전, 후, 이유)를 만든다.
3. 4단계: 통계 카드 15개의 출처를 직접 열어 기관, 기준 연도, 자료 종류, 확인 날짜를 붙인다. 확인한 것과 못 한 것을 `docs/audits/`에 새 파일로 남긴다. 해결책을 먼저 주는 문구(AI 질문 예시, '모범사례', '시행 중', 시설 개선 수치)를 고친다. Gemini 계정 안내를 붙인다.
4. 바꾼 문구 표와 통계 확인 결과를 사용자에게 보여 승인을 받은 뒤 배포한다.
5. 3단계에 남긴 자동 저장 합치기와 숨긴 STEP 정리, 이어서 5·6단계.

## 하네스 루프

- 열린 루프가 없다(작업 공간 루트에서 `node scripts/harness/loop.mjs status`).
