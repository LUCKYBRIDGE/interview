// 자료 페이지의 화면 문구 규칙(DOM 없음). tests/explore-labels.test.mjs가 덮는다.
export function riskSummaryText(total, chosen) {
  const count = Number.isInteger(total) && total > 0 ? total : 0;
  const picked = Number.isInteger(chosen) && chosen > 0 ? Math.min(chosen, count) : 0;
  return `${count ? '상황 고르기' : '상황 없음'}${picked ? ` · ${picked}개 고름` : ''}`;
}

// 탭 사이를 방향키로 움직일 때 숨었거나 준비 중인 탭은 건너뛴다.
// usable은 탭 순서대로 쓸 수 있는지(true/false) 목록이다. 쓸 수 있는 탭이 없으면 지금 탭을 돌려준다.
export function nextTabIndex(usable, current, key) {
  const order = usable.map((ok, index) => (ok ? index : -1)).filter(index => index >= 0);
  if (!order.length) return current;
  if (key === 'Home') return order[0];
  if (key === 'End') return order[order.length - 1];
  const step = key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : 0;
  if (!step) return current;
  const position = order.indexOf(current);
  if (position < 0) return step > 0 ? order[0] : order[order.length - 1];
  return order[(position + step + order.length) % order.length];
}
