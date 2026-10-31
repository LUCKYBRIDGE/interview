# 놀토의 (knoldiscuss)

이 지침은 `knoldiscuss` 폴더 작업에만 적용한다. 같은 작업 공간의 다른 앱에는 적용하지 않는다.

초등 5학년 국어 「의견을 조정해요」 토의 단원의 정적 웹이다. 학생은 보행자 안전과 늦은 시각 소음 문제를 탐구하고(가상 인물 인터뷰, 조사 자료), 개인 의견(9~10차시)과 모둠 의견(11~12차시)을 기록장에 쓴다. 교사는 활동지와 지도안을 내려받는다. 원격은 GitHub `LUCKYBRIDGE/interview`이고, main 루트를 GitHub Pages가 https://luckybridge.github.io/interview/ 로 바로 공개한다.

## 먼저 읽을 것
작업 영역에 맞는 것만 읽는다. 스킬은 `.agents/skills/<이름>/SKILL.md`에 있다.
- 화면·상호작용: `DESIGN.md`, 스킬 `discuss-ui-change`
- 학생 문구·인물·통계·링크: `docs/content-guide.md`, 스킬 `discuss-content-edit`
- 기록 저장·파일 형식: `docs/architecture.md`, 스킬 `discuss-records-compat`
- 활동지·지도안·생성 이미지: 스킬 `discuss-materials`
- 완료 보고 전: `discuss-verify`. push와 배포: `discuss-release`
- 수업 흐름과 웹의 역할 `docs/lesson-contract.md`, 개편 계획 `docs/plans/ux-revamp.md`, 문서 지도 `docs/README.md`, 현재 상태 `PROJECT_STATUS.md`

## 지킬 것
1. 웹과 AI는 학생 대신 문제·해결책·주장·근거를 쓰지 않고 순위나 정답을 매기지 않는다. 가상 인물의 말은 실제 증거가 아니라고 구분한다.
2. 학생 기록은 그 기기의 브라우저와 학생이 내려받은 파일에만 있다. 로그인·서버 전송·중앙 수집을 만들지 않는다. 학생·교사 실명, 학교·학급 정보를 공개 파일에 새로 넣지 않는다.
3. 저장 키(`interview-workroom-v1`~`v4`, 탐구 페이지 입력 키)와 기록 파일 형식(필드 이름·구조·버전)을 바꾸거나 지우지 않는다. 뜻을 바꿔야 하면 새 버전과 이관 테스트를 먼저 만든다.
4. 공개 주소를 지킨다: 저장소 이름, `index.html`·`workroom.html`, 해시(`#personal`, `#group`, `#walking` 등), `?explore=1`·`?embed=1`·`?view=both`. 인쇄된 활동지 QR과 수업 슬라이드가 이 주소를 가리킨다.
5. 외부 링크와 소음 주제는 지우지 않는다. 링크 목록은 `tests/baselines/external-links.json`이 지킨다. 바꿀 때는 이유를 남기고 같은 변경에서 기준선을 고친다.
6. 빌드 없는 정적 HTML·CSS·ES 모듈이다. 런타임 외부 의존성을 더하지 않는다. 파일을 고치면 그 파일을 부르는 모든 `?v=` 값을 같은 새 값으로 올린다.
7. 저장소 루트의 거의 모든 파일이 공개된다(Jekyll 처리). 학생 기록·검증 자료·임시 파일은 git에서 빠진 `.qa/`, `tmp/`, `output/`에 둔다. Markdown에 Liquid 문법(여는 중괄호 두 개, 여는 중괄호와 퍼센트)을 쓰면 Pages 빌드가 깨진다.
8. push, Pages 배포, 저장소 설정 변경은 사용자 승인 뒤에만 한다. 수업 시간에는 배포하지 않는다.
9. 여러 컴퓨터(macOS, Windows)와 Codex·Kiro가 이 저장소를 함께 쓴다. 시작할 때 `git status`와 `git fetch`로 남의 변경을 확인하고, 문서·스크립트에 로컬 절대 경로를 쓰지 않는다.

## 명령 (Node 22 이상)
- `npm start`: http://127.0.0.1:4173 정적 미리보기
- `npm test`: 기록 상태·이미지·탐구 상태 단위 테스트와 사이트 무결성(로컬 참조, `?v=` 일치, 외부 링크 기준선, 화면 부채 지표)
- `npm run check`: 지침·스킬·Kiro 스티어링·문서 링크 검사. 지침이나 `docs/`를 고친 뒤 실행한다.
- 화면 확인은 `ego-browser`로 390·820·1440px, 키보드, 인쇄를 본다(`discuss-verify`).

## 기록
작업을 마치면 `PROJECT_STATUS.md`(최신이 위)와 `CHECKLIST.md`를 갱신한다. 정한 결정은 `docs/decisions/`, 점검 근거는 `docs/audits/`에 둔다. 보고는 한국어로 하고 바뀐 파일, 검증, 다음 단계로 끝낸다.
