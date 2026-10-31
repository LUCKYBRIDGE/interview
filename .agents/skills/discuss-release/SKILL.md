---
name: discuss-release
description: 놀토의(knoldiscuss) 변경을 GitHub main에 push해 GitHub Pages로 공개하거나, 공개 사이트를 확인하거나 되돌릴 때 쓴다.
---

# 놀토의 공개

main에 push하면 몇 분 안에 학생이 쓰는 공개 사이트(https://luckybridge.github.io/interview/)가 바뀐다.

1. 사용자 승인: 무엇을 언제 공개할지 묻는다. 수업 시간은 피한다.
2. 준비
   - `git fetch` 뒤 main과 원격 차이를 본다. 다른 컴퓨터의 새 커밋이 있으면 먼저 받아 합친다.
   - `npm test`, `npm run check`가 통과하고 `discuss-verify` 기록이 있다.
3. 공개 파일 확인: 학생 기록, 검증 자료, `.qa/`, 실명 자료가 커밋에 없는지 본다. Markdown의 Liquid 문법은 `npm run check`가 막는다.
4. push한다. 강제 push는 하지 않는다.
5. 배포 확인
   - `gh api repos/LUCKYBRIDGE/interview/pages/builds/latest`의 상태가 built이고 커밋이 맞는지 본다.
   - 바뀐 공개 파일이 HTTP 200이고 내용이 로컬과 같은지 본다. 옛 화면이 보이면 새 `?v=` 주소로 다시 본다.
   - CI(`.github/workflows/ci.yml`) 결과를 본다. CI는 배포를 막지 않으므로 실패하면 바로 고친다.
6. 되돌리기: 문제가 생기면 `git revert`로 새 커밋을 만들어 push한다. reset이나 강제 push를 쓰지 않는다.
7. `PROJECT_STATUS.md`에 커밋, Pages 빌드 결과, 확인한 주소를 남긴다.
