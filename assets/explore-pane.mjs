import {ROUTES, readPane, writePane, frameURL, paneState} from './explore-state.mjs';

const $ = id => document.getElementById(id);
const frame = $('explore-frame');
const writing = $('writing-pane');
const pane = $('explore-pane');
let storage;
try { storage = window.sessionStorage; } catch { storage = null; }
let state = readPane(storage);
if (new URLSearchParams(location.search).get('view') === 'both') state = {...state, mode:'both', route:'home', y:0};
let loaded = false;
let restoring = false;
let writingY = 0;
let lastField;
const narrow = matchMedia('(max-width: 1120px)');
const persist = () => writePane(storage, state);

const splitter = $('split-divider');
const workbench = $('workbench');
const resetSplit = $('reset-split');
const SPLIT_KEY = 'knoltalk-workspace-split-v1';
const SPLIT_MIN = 25, SPLIT_MAX = 70, SPLIT_DEFAULT = 40;
let splitValue = SPLIT_DEFAULT;
try {
  const stored = Number(localStorage.getItem(SPLIT_KEY));
  if (Number.isFinite(stored) && stored >= SPLIT_MIN && stored <= SPLIT_MAX) splitValue = stored;
} catch {}
function setSplit(value, save = false) {
  splitValue = Math.max(SPLIT_MIN, Math.min(SPLIT_MAX, Math.round(value)));
  workbench.style.setProperty('--split-left', splitValue + '%');
  splitter.setAttribute('aria-valuenow', String(splitValue));
  splitter.setAttribute('aria-valuetext', '탐구 ' + splitValue + '%, 기록 ' + (100 - splitValue) + '%');
  if (save) try { localStorage.setItem(SPLIT_KEY, String(splitValue)); } catch {}
}
setSplit(splitValue);
let dragging = false;
splitter.addEventListener('pointerdown', event => {
  if (document.body.dataset.workspaceView !== 'both' || narrow.matches || event.button !== 0) return;
  dragging = true;
  splitter.setPointerCapture(event.pointerId);
  document.body.classList.add('is-resizing');
  event.preventDefault();
});
splitter.addEventListener('pointermove', event => {
  if (!dragging) return;
  const rect = workbench.getBoundingClientRect();
  // Reserve the divider width and use the same percent convention as CSS.
  setSplit((event.clientX - rect.left - 8) / rect.width * 100);
});
const finishSplit = () => {
  if (!dragging) return;
  dragging = false;
  document.body.classList.remove('is-resizing');
  setSplit(splitValue, true);
};
splitter.addEventListener('pointerup', finishSplit);
splitter.addEventListener('pointercancel', finishSplit);
splitter.addEventListener('lostpointercapture', finishSplit);
splitter.addEventListener('keydown', event => {
  const delta = event.shiftKey ? 10 : 5;
  if (event.key === 'ArrowLeft') setSplit(splitValue - delta, true);
  else if (event.key === 'ArrowRight') setSplit(splitValue + delta, true);
  else if (event.key === 'Home') setSplit(SPLIT_MIN, true);
  else if (event.key === 'End') setSplit(SPLIT_MAX, true);
  else return;
  event.preventDefault();
});
resetSplit.addEventListener('click', () => setSplit(SPLIT_DEFAULT, true));


writing.addEventListener('focusin', event => {
  if (event.target.matches('input,textarea,select')) lastField = event.target;
});

function ensureFrame() {
  if (loaded) return;
  loaded = true;
  frame.src = frameURL(state.route);
}

function restoreFrame() {
  restoring = true;
  frame.contentWindow?.postMessage({type:'discussion-explore-restore', route:state.route, y:state.y}, location.origin);
}

frame.addEventListener('load', restoreFrame);

function renderMode({restoreWriting = false} = {}) {
  const wasHidden = pane.hidden;
  document.body.dataset.workspaceView = state.mode;
  pane.hidden = state.mode === 'writing';
  writing.hidden = state.mode === 'explore';
  for (const [id, mode] of [['show-writing','writing'],['show-explore','explore'],['show-both','both']]) {
    $(id).setAttribute('aria-pressed', String(state.mode === mode));
  }
  const hint = $('workspace-hint');
  if (hint) hint.textContent = state.mode === 'both' && narrow.matches
    ? '좁은 화면에서는 탐구와 기록이 위아래로 표시됩니다. 기록만 또는 탐구만 보기를 이용하세요.'
    : state.mode === 'both' ? '가운데 분할선을 드래그하거나 방향키로 탐구·기록 너비를 조절하세요.' : '작성 내용과 탐구 위치는 유지됩니다.';
  if (!pane.hidden) {
    ensureFrame();
    if (wasHidden) requestAnimationFrame(restoreFrame);
  }
  if (restoreWriting) {
    window.scrollTo({top:writingY, behavior:'instant'});
    if (lastField?.isConnected) lastField.focus({preventScroll:true});
  }
}

function show(mode) {
  if (state.mode === mode) return;
  if (state.mode !== 'explore') writingY = window.scrollY;
  if (mode === 'writing' && loaded && !pane.hidden) {
    try { state = {...state, y:frame.contentWindow.scrollY}; } catch {}
  }
  state = {...state, mode}; persist();
  renderMode({restoreWriting:mode === 'writing'});
  if (mode !== 'writing') pane.scrollIntoView({block:'start', behavior:'instant'});
}

$('show-writing').addEventListener('click', () => show('writing'));
$('show-explore').addEventListener('click', () => show('explore'));
$('show-both').addEventListener('click', () => show('both'));
$('close-explore').addEventListener('click', () => show('writing'));

document.querySelectorAll('[data-explore-route]').forEach(link => {
  link.addEventListener('click', event => {
    const route = link.dataset.exploreRoute;
    if (!ROUTES.includes(route)) return;
    event.preventDefault();
    const changed = route !== state.route;
    state = {...state, route, y:changed ? 0 : state.y}; persist();
    show(narrow.matches ? 'explore' : 'both');
    ensureFrame();
    if (changed) restoreFrame();
  });
});

$('open-explore-window').addEventListener('click', () => {
  window.open(`index.html?explore=1#${state.route}`, '_blank', 'noopener,noreferrer');
});

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
  const value = event.data;
  if (value?.type === 'discussion-activity' && ['personal','group'].includes(value.kind)) {
    location.hash = value.kind;
    show('both');
    return;
  }
  if (!value || value.type !== 'discussion-explore-position' || !ROUTES.includes(value.route)) return;
  if (pane.hidden || (restoring && value.restored !== true)) return;
  restoring = false;
  state = {...state, ...paneState({...state, route:value.route, y:value.y})}; persist();
});
narrow.addEventListener('change', () => renderMode());
renderMode();
