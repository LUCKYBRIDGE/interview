---
inclusion: fileMatch
fileMatchPattern: ["assets/workroom-state.mjs", "assets/workroom.mjs", "assets/explore-state.mjs", "tests/**"]
---

# 놀토의 기록 호환

knoldiscuss 폴더의 기록 모델이나 테스트를 다룬다. 학생 기록은 기기 브라우저와 학생이 내려받은 파일에만 있어 잃으면 되살릴 수 없다.

먼저 `docs/architecture.md`의 '학생 기록' 절과 `.agents/skills/discuss-records-compat/SKILL.md`를 읽고 따른다. 저장 키를 지우거나 필드 이름·구조를 바꾸지 않는다. 바꿔야 하면 버전을 올리고 이관 테스트를 먼저 쓴다.
