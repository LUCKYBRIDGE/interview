// 기록장 배치 규칙(DOM 없음). 기록 영역은 늘 보이고, 자료는 패널로 연다.
// 폭 1024px 이상(가로 태블릿, PC)은 기록 옆 패널, 그보다 좁으면(세로 태블릿) 기록 위에 덮는 시트다.
// 저장은 기존 interview-explore-pane-v1의 mode 값을 그대로 쓴다: both = 열림, writing = 닫힘.
export const WIDE_MIN = 1024;
export const WIDE_QUERY = `(min-width: ${WIDE_MIN}px)`;
// 미디어 쿼리 change 이벤트는 회전이나 화면 흉내에서 빠질 때가 있어, 판단은 실제 폭으로 한다.
export const isWideWidth = width => Number.isFinite(width) && width >= WIDE_MIN;

export function modeFor(open) {
  return open ? 'both' : 'writing';
}

// 처음 열 때 패널을 열지 정한다.
// - 좁은 화면은 늘 닫고 시작한다(쓰기 칸이 먼저 보이게).
// - 넓은 화면은 ?view=both로 들어왔거나, 전에 닫지 않았으면 연다.
//   예전 값 explore(자료만 보기)도 열림으로 읽는다.
export function panelOpenOnLoad({mode, forced = false, wide}) {
  if (!wide) return false;
  if (forced) return true;
  return mode !== 'writing';
}

// 화면 폭이 바뀔 때(태블릿을 돌릴 때) 패널을 어떻게 할지 정한다.
// 넓다가 좁아지면 쓰기 칸을 가리지 않게 닫는다(저장한 선택은 그대로 둔다).
// 좁다가 넓어지면 저장한 선택대로 다시 연다.
export function panelOpenAfterResize({mode, wide}) {
  return wide && mode !== 'writing';
}

// 지금 보고 있는 단계: 화면 위쪽 기준선(offset)을 지난 마지막 단계.
// tops는 단계 제목 위치(화면 기준 px) 목록이다. 아무것도 지나지 않았으면 첫 단계다.
export function currentStepIndex(tops, offset) {
  if (!tops.length) return -1;
  let current = 0;
  tops.forEach((top, index) => { if (top <= offset) current = index; });
  return current;
}
