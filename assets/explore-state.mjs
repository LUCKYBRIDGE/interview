export const PANE_KEY = 'interview-explore-pane-v1';
export const ROUTES = ['home', 'walking', 'study', 'noise', 'interview'];
export const MODES = ['writing', 'explore', 'both'];

export function paneState(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    route: ROUTES.includes(source.route) ? source.route : 'home',
    mode: MODES.includes(source.mode) ? source.mode : 'both',
    y: typeof source.y === 'number' && Number.isFinite(source.y) ? Math.min(10000000, Math.max(0, source.y)) : 0,
  };
}

export function readPane(storage) {
  try {
    const previous = paneState(JSON.parse(storage.getItem(PANE_KEY)));
    // On this update, show both panes once. Keep the existing route and scroll position.
    const migrationKey = PANE_KEY + '-default-both-v2';
    if (!storage.getItem(migrationKey)) {
      storage.setItem(migrationKey, '1');
      return {...previous, mode:'both'};
    }
    return previous;
  } catch { return paneState(); }
}

export function writePane(storage, value) {
  try { storage.setItem(PANE_KEY, JSON.stringify(paneState(value))); return true; }
  catch { return false; }
}

export function frameURL(route) {
  if (!ROUTES.includes(route)) throw new Error('알 수 없는 탐구 자료입니다.');
  return `index.html?embed=1#${route}`;
}
