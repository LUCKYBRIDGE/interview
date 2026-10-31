# Kiro 연결 (놀토의)

정본은 `AGENTS.md`, `DESIGN.md`, `docs/`, `.agents/skills/`다. 이 폴더는 Kiro가 그 정본을 언제 읽을지만 정한다. 절차를 고칠 때는 정본을 고치고, 여기는 경로가 바뀔 때만 고친다.

## 다중 루트 작업 공간에서

이 Mac의 Kiro는 앱 여러 개를 한 작업 공간으로 연다. Kiro 문서(2026-10-31 확인)에 따라 이렇게 정했다.

- 루트의 `AGENTS.md`는 어느 앱을 작업하든 모든 세션에 들어간다. 그래서 짧게 두고 'knoldiscuss 작업에만 적용'으로 시작한다.
- `inclusion: always` 스티어링도 다른 앱 세션에 들어간다. 여기서는 쓰지 않는다.
- `inclusion: fileMatch` 스티어링은 같은 루트의 파일을 다룰 때만 들어간다.
- 다중 루트에서 `#[[file:]]` 경로의 기준 루트와, 루트마다 Kiro 스킬 폴더를 찾는지는 문서에 없다. 그래서 Kiro 스킬 폴더는 두지 않고, 스티어링은 원문을 포함하지 않고 정본 경로(이 루트 기준)를 가리킨다.
- PreToolUse 같은 hook은 다른 앱의 도구 호출에도 걸릴 수 있다. 여기에는 hook을 두지 않았다. push와 배포 승인은 `AGENTS.md` 규칙과 Kiro 권한 확인에 맡긴다.
- 2026-10-31 관찰: 이 폴더의 `discuss-ui`, `discuss-records`, `discuss-materials`는 맞는 파일을 다루자 바로 붙었다. 반대로 knoldiscuss 파일만 다루는 중에 다른 루트(knolart)의 스티어링이 붙은 적도 있다. 그래서 스티어링 본문은 모두 'knoldiscuss 폴더'로 시작해 다른 앱 세션에 붙어도 적용 범위를 알 수 있게 한다(`npm run check`가 검사).

## 스티어링

| 파일 | 들어가는 때 | 가리키는 정본 |
| --- | --- | --- |
| `steering/discuss-ui.md` | `index.html`, `workroom.html`, `assets/`, `DESIGN.md`를 다룰 때 | `DESIGN.md`, `discuss-ui-change` |
| `steering/discuss-records.md` | 기록 상태 모듈과 테스트를 다룰 때 | `docs/architecture.md`, `discuss-records-compat` |
| `steering/discuss-materials.md` | `materials/`, `scripts/`를 다룰 때 | `discuss-materials` |
| `steering/discuss-content.md` | 학생 문구·인물·통계·링크를 고치는 요청(auto) | `docs/content-guide.md`, `discuss-content-edit` |
| `steering/discuss-verify.md` | 끝내기 전 검증 요청(auto) | `discuss-verify` |
| `steering/discuss-release.md` | push·배포 요청(auto) | `discuss-release` |

auto 스티어링은 채팅에서 `/discuss-content`처럼 직접 부를 수도 있다.

## 도구 호출 순서

한 응답에 함께 넣은 도구 호출은 동시에 실행된다. 2026-10-31에 파일을 쓰면서 같은 차례에 검사를 돌려 옛 결과를 받은 일, 서버를 멈추는 호출과 브라우저 작업이 겹쳐 연결이 끊긴 일이 네 번 있었다. 앞 결과가 필요한 호출(쓰기 뒤 검사, 브라우저 작업 뒤 서버 멈춤)은 다음 차례로 나눈다.

## 고친 뒤

`npm run check`가 스티어링 front matter, always 금지, fileMatch 패턴에 맞는 파일, 가리키는 경로, 스킬과의 연결을 검사한다.

## 아직 확인하지 않은 것

새 세션에서 Agent Steering 패널의 knoldiscuss 항목에 여섯 파일이 보이는지, `index.html`을 열었을 때 `discuss-ui`가 붙는지 확인해야 한다(2026-10-31 미확인).
