# 문서 지도

무엇이 어디에 있고 언제 읽는지 정리한다. 작업 규칙은 [AGENTS.md](../AGENTS.md)에서 시작한다.

| 문서 | 언제 읽나 |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | 작업을 시작할 때. 지킬 것과 명령 |
| [DESIGN.md](../DESIGN.md) | 화면, 내비게이션, 상호작용, 스타일을 바꿀 때 |
| [content-guide.md](content-guide.md) | 학생 문구, 용어, 가상 인물, 통계, 외부 링크를 고칠 때 |
| [lesson-contract.md](lesson-contract.md) | 수업 흐름과 웹·AI의 역할을 확인할 때 |
| [architecture.md](architecture.md) | 페이지, 모듈, 주소, 메시지, 저장 키, 배포를 확인할 때 |
| [workroom.md](workroom.md) | 기록장 운영 설명(2026-10-28 기준, 개편 6단계에서 현재 화면에 맞춘다) |
| [gems-28-32.md](gems-28-32.md) | 소음 주제 28~32번 가상 시민 Gem 지침 |
| [plans/ux-revamp.md](plans/ux-revamp.md) | UI·UX 개편 단계, 완료 조건, 열린 결정 |
| [audits/2026-10-31-baseline.md](audits/2026-10-31-baseline.md) | 개편 전 기준선 점검 |
| [audits/2026-10-31-tablet-pc.md](audits/2026-10-31-tablet-pc.md) | 주 기기(태블릿, PC) 크기에서 다시 잰 측정 |
| [decisions/README.md](decisions/README.md) | 정한 결정과 이유 |
| [PROJECT_STATUS.md](../PROJECT_STATUS.md), [CHECKLIST.md](../CHECKLIST.md) | 현재 상태와 확인 항목 |
| [../.agents/skills/](../.agents/skills/) | 작업 절차 6개: discuss-ui-change, discuss-content-edit, discuss-records-compat, discuss-materials, discuss-verify, discuss-release |
| [../.kiro/README.md](../.kiro/README.md) | Kiro에서 이 지침을 읽는 방식 |

## 문서를 둘 곳

- 지금의 구조와 계약은 `architecture.md`, 기준은 `DESIGN.md`·`content-guide.md`·`lesson-contract.md`, 앞으로 할 일은 `plans/`, 시점 기록은 `audits/`, 정한 이유는 `decisions/`, 진행 상황은 `PROJECT_STATUS.md`에 둔다.
- 새 문서를 만들면 이 표에 더한다. `npm run check`가 표에 없는 문서를 알려 준다.
- 공개 저장소다. 학생·교사 실명, 학교·학급 정보, 비공개 링크를 쓰지 않는다. Liquid 문법(여는 중괄호 두 개, 여는 중괄호와 퍼센트)을 쓰지 않는다.
- 다른 컴퓨터에서도 읽히도록 로컬 절대 경로를 쓰지 않는다. 저장소 밖 작업 공간은 이름(예: discussion)으로만 부른다.
