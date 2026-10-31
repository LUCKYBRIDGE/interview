# 인수인계: UI·UX 개편 2단계(기록장 배치) 이어서 하기

- 다음 세션 목표: 브랜치 `stage2-workroom-layout`의 기록장 새 배치를 브라우저로 검증해 고치고, 2단계를 마무리해 main에 올린다.
- 저장소: GitHub `LUCKYBRIDGE/interview`. 이 Mac에서는 작업 공간의 apps/knoldiscuss 폴더다. 명령은 저장소 루트에서 실행한다.
- 작성: Kiro 세션, 2026-10-31.
- 다음 세션의 첫 메시지: "`docs/logs/2026-10-31-ux-revamp-stage2-handoff.md`를 읽고 '다음 단계'부터 이어서 해 줘."

## 상태

- 끝남(main, 공개 중): 하네스 `00d7e08`, 개편 1단계 `ee0c9c0`. 무엇을 바꿨는지는 `PROJECT_STATUS.md`의 2026-10-31 항목에 있다.
- 진행 중(브랜치 `stage2-workroom-layout`, 배포 전): 기록장을 '기록 하나와 자료 패널'로 바꿨다. 커밋 하나다.
  - 지운 것: 화면 구성 버튼(한 화면, 분할 화면), 선택 상자 3개, 분할선과 비율 초기화, 왼쪽 편집 iframe, 빈 상태 2개, 늘 숨어 있던 개인 기록 패널(`assets/left-personal.mjs`), 분할 화면 스타일(`assets/explore-pane.css`).
  - 새 배치: `assets/explore-pane.mjs`를 자료 패널로 다시 썼다. 폭 1024px 이상(가로 갤럭시 탭, PC)은 기록 옆 패널, 그보다 좁으면(세로 태블릿) 기록 위에 덮는 시트다. 시트일 때 배경은 `inert`이고 Esc와 '자료 닫기'로 닫는다. 배치 규칙은 `assets/workroom-layout.mjs`에 있고 `tests/workroom-layout.test.mjs`가 덮는다.
  - 첫 화면: 소개 문단과 안내 상자를 지웠다. 단계 이동 링크와 '자료 보기' 버튼을 위쪽 고정 막대 한 줄로 모았고, 지금 단계에 `aria-current="step"`을 붙인다. 학생 화면의 차시 꼬리표(9~10차시 등)를 뺐다. 인쇄 글은 그대로다.
  - 모둠 2단계의 의견 요약이 1단계를 입력하는 대로 바뀐다.
  - `?view=both`는 넓은 화면에서 패널을 연 채로 시작하고, `?view`와 옛 `?panel=1`은 읽은 뒤 주소에서 지운다. 다른 페이지의 iframe 안에서 기록장을 열면 자료로 돌려보낸다.
  - 스타일: 옛 배치 블록 6개를 지우고 새 배치 규칙을 `assets/workroom-redesign.css` 끝에 더했다. `!important` 55개에서 44개, 13px보다 작은 글자 선언 83개에서 68개로 줄었고 기준선도 낮췄다.
  - 기록 형식과 저장 키는 바꾸지 않았다(`assets/workroom-state.mjs` 변경 없음).
- 시작 안 함(2단계에 남은 것, `docs/plans/ux-revamp.md` 2단계 4~6): 공유 카드 정리, 글 파일·인쇄 출력의 단계 번호를 화면과 맞추기, 기록장 CSS 여러 층을 한 파일로 합치기. 그 뒤 3~6단계.

## 확인한 것

- 브랜치에서 `npm test` 39개 통과, `npm run check` 통과(로컬, 2026-10-31). 브랜치 CI 결과는 GitHub Actions의 `stage2-workroom-layout` 실행에서 본다.
- main의 공개 사이트: Pages 빌드 `ee0c9c0` 완료, 공개 `index.html`·`workroom.html`·`assets/workroom.mjs`·`assets/workroom-redesign.css`가 저장소 파일과 해시로 같다.
- 브랜치와 main 사이에 `assets/workroom-state.mjs` 차이가 없다(`git diff`).

## 확인하지 않은 것 (먼저 확인)

브라우저 검증을 시작하다 중단했다. 아래는 코드로만 맞다고 보는 것이다. `.agents/skills/discuss-verify/SKILL.md`의 크기(갤럭시 탭 세로 800×1200·가로 1280×720, 아이패드 820×1180·1180×820, 1024×768, PC 1366×768·1920×1080)로 본다.

- 개인·모둠 활동 모두 첫 입력란이 첫 화면 안에 보이는지. 기준선은 1,454~2,036px 아래였다(`docs/audits/2026-10-31-tablet-pc.md`).
- 옆 패널: 화면 높이에 맞고 패널 안에서만 스크롤되는지, 기록 칸 폭이 560px 이상인지, 1024px에서 두 칸이 비좁지 않은지.
- 시트: 열면 배경을 누를 수 없고, Esc와 '자료 닫기'로 닫히며, 초점이 닫기 버튼으로 갔다가 연 버튼으로 돌아오는지.
- 태블릿을 돌려 1024px 경계를 넘을 때 패널이 닫히고 다시 열리는지.
- 자료 버튼 4개, '새 창', 자료 안의 기록장 링크가 활동을 바꾸는지(`discussion-activity` 메시지), 패널을 닫았다 열 때 자료의 스크롤 위치가 돌아오는지.
- 고정 막대가 단계 제목과 입력란을 가리지 않는지, 태블릿 화면 키보드가 올라올 때.
- 저장, 새로고침, 개인·모둠 전환, 기록 파일 불러오기·내려받기, 다른 창 수정 경고, 의견 이미지, 패들렛 링크, 인쇄가 전과 같은지.
- 휴대폰 폭(390px)에서 가로로 넘치지 않는지.
- 바꾼 `assets/explore-embed.mjs`·`.css`(안내 문구, 글자 14px)가 자료 단독 화면(`index.html?explore=1`)에 영향이 없는지.

## 결정

- 정한 것: [0001](../decisions/0001-working-copy-and-harness.md) 작업 사본과 하네스, [0002](../decisions/0002-target-devices.md) 주 기기는 갤럭시 탭과 PC(아이패드도 지원), [0003](../decisions/0003-deploy-and-delegated-decisions.md) 검증을 마친 단계는 바로 배포·결정 3과 4는 추천안.
- 사용자 요청(2026-10-31): main에는 어느 정도 완결된 묶음만 올린다. 검증 전 작업은 브랜치에 둔다.
- 열린 것: 결정 5(공개 지도안 속 학교·학급·교사 실명·수업 일시)는 사용자 답을 기다린다. 6~10도 열려 있다(`docs/plans/ux-revamp.md`의 열린 결정).

## 알아 둘 것

- 검증은 사용자가 쓰지 않는 포트에서 한다: `node scripts/serve.mjs 4191`. 기록장은 페이지를 떠날 때 빈 기록도 저장하므로, 끝나면 그 포트에 생긴 빈 기록만 지운다.
- ego-browser의 `page.click()`은 `aria-disabled="true"` 요소를 누르지 않는다. 좌표로 누른다(`page.mouse.click`). Ego Lite 업데이트 알림이 떠 있다(업데이트는 사용자 승인 뒤).
- Kiro에서는 한 응답에 넣은 도구 호출이 동시에 실행된다. 파일을 쓴 뒤의 검사나 서버 끄기는 다음 차례에 한다. heredoc 뒤에 파이프를 붙인 셸 명령은 권한 검사가 거부하므로 스크립트를 파일로 만들어 넘긴다.
- 이 Mac의 `.qa/`(화면 캡처, 측정 원본, 일회성 스크립트)는 git에 없다. 측정 수치는 `docs/audits/`에 옮겨 두었다.
- 지도안·활동지 편집 원본과 생성기는 저장소 밖 수업 자료 작업 공간(discussion)에 있고, 그곳의 동기화 스크립트는 옛 사본을 대상으로 한다. 다른 컴퓨터에는 없을 수 있다. 쓰지 않는다(`.agents/skills/discuss-materials/SKILL.md`).
- 다른 컴퓨터(Windows)의 예전 체크아웃은 먼저 `git status`로 미커밋 변경을 확인한다. 있으면 커밋하거나 따로 보관한 뒤 원격을 받는다.
- 합친 작업 브랜치 `harness-foundation`, `stage1-quick-fixes`는 원격에 남아 있다. 지워도 된다.

## 먼저 읽을 것

- `AGENTS.md`: 지킬 것과 명령.
- `docs/plans/ux-revamp.md`: 2단계 항목과 완료 조건, 열린 결정.
- `DESIGN.md` 4·6절: 터치 기준, 화면 폭 기준(1024px, 600px).
- `docs/architecture.md`: 브랜치판은 새 패널 구조와 상태 키를 설명한다.
- `.agents/skills/discuss-verify/SKILL.md`, `.agents/skills/discuss-ui-change/SKILL.md`.

## 다음 단계

1. 원격을 받고 브랜치로 바꾼 뒤 검사한다.
   ```sh
   git fetch origin
   git switch stage2-workroom-layout
   npm test
   npm run check
   ```
   저장소가 아직 없으면 먼저 `git clone https://github.com/LUCKYBRIDGE/interview.git`.
2. `node scripts/serve.mjs 4191`로 띄우고 위 '확인하지 않은 것'을 크기별로 확인해 고친다. 전후 캡처를 남긴다.
3. 2단계에 남은 항목(공유 카드, 출력 단계 번호, CSS 합치기)을 할지, 검증한 배치만 먼저 main에 올릴지 사용자에게 묻는다. 사용자는 어느 정도 완결된 묶음을 main에 올리기를 원한다.
4. 브랜치 CI가 통과하면 main을 브랜치로 앞당겨 배포한다(`.agents/skills/discuss-release/SKILL.md`). 수업 시간은 피한다. 배포 뒤 Pages 빌드와 공개 파일을 확인한다.
5. `PROJECT_STATUS.md`, `CHECKLIST.md`, `docs/plans/ux-revamp.md`의 상태, `DESIGN.md` 3절과 `docs/architecture.md`의 '현재'를 고친다.

## 하네스 루프

- 열린 루프가 없다(작업 공간 루트에서 `node scripts/harness/loop.mjs status`로 확인, 2026-10-31).

## 쓸 스킬

- `discuss-ui-change`: 기록장 화면을 고칠 때.
- `discuss-verify`: 끝났다고 말하기 전 브라우저 확인과 기록.
- `discuss-records-compat`: 기록 형식이나 저장 키를 건드려야 할 때(이번 단계는 건드리지 않는다).
- `discuss-release`: main 반영과 Pages 확인.
