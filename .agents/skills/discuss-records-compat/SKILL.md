---
name: discuss-records-compat
description: 놀토의(knoldiscuss) 기록장의 저장 키, 기록 파일(JSON) 형식, 필드, 버전 이관, 불러오기·내보내기를 바꾸거나 기록이 사라지는 문제를 고칠 때 쓴다.
---

# 놀토의 기록 호환

학생이 쓴 기록은 그 기기의 브라우저와 학생이 내려받은 파일에만 있다. 잃으면 되살릴 방법이 없다. 경로는 knoldiscuss 저장소 루트 기준이다.

## 계약

`docs/architecture.md`의 '학생 기록' 절이 정본이다. 요약:
- `interview-workroom-v4-personal`, `interview-workroom-v4-group`에 쓰고 v1~v3은 읽기만 한다. 어떤 키도 지우지 않는다.
- 자료 페이지의 `pedestrian-case-study-v1`, `openclass-student-inputs-v1`도 학생 입력이다. `openclass-student-inputs-v1`은 칸마다 키를 두고 합쳐 저장하며, 지금 칸의 키 목록은 `tests/baselines/input-keys.json`이 지킨다(바꾸면 이관을 먼저 만들고 `npm run baseline:keys`).
- 기록 파일의 봉투와 data 필드는 키 집합을 엄격히 검사한다. 필드 하나를 더하거나 빼도 기존 파일이 거부된다.

## 바꿀 때

1. 테스트를 먼저 쓴다(`tests/workroom-state.test.mjs`): 이전 버전 파일과 저장 기록이 그대로 읽히는지, 새 버전으로 왕복되는지, 잘못된 입력이 거부되는지.
2. 필드를 더하거나 뜻을 바꾸면 `VERSION`을 올리고(v5) `parseRecord`에 이전 버전 이관을 더한다. 이전 버전 키를 읽기 목록에 남긴다.
3. 화면에서 칸을 없애도 data에서는 지우지 않는다. 값이 있으면 '이전에 적은 내용'으로 읽기 전용으로 보여 준다. 다른 뜻의 칸으로 옮기지 않는다.
4. 손상된 기록은 우회하지 않고 덮어쓰지 않는다. 자동 저장을 멈추고 백업 방법을 보여 준다.
5. 화면 설정 키(`interview-explore-pane-v1`, knoltalk로 시작하는 키)는 바꿀 수 있지만, 이전 값을 읽어 새 상태로 옮긴다.
6. 의견 이미지와 글 파일 출력이 어떤 필드를 쓰는지 확인한다(`assets/opinion-image.mjs`, `formatText`).

## 확인

- `npm test`
- 브라우저: 이전 버전 기록 파일 불러오기(취소하면 그대로), 저장 후 새로고침, 개인과 모둠 전환 뒤 보존, 다른 창 수정 감지, 손상 기록 경고.
- 검증용 기록은 사용자의 실제 기록과 섞이지 않게 다른 포트에서 만든다(`node scripts/serve.mjs 4191`). 끝나면 내가 만든 키만 지운다. 사용자의 브라우저 저장소를 통째로 지우지 않는다.
