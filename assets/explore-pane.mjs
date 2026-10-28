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
const narrow = matchMedia('(max-width: 1050px)');
const persist = () => writePane(storage, state);

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
    ? '이 화면에서는 탐구와 기록이 위아래로 이어집니다. 버튼으로 한쪽만 볼 수도 있어요.'
    : '탐구를 오가도 작성 내용과 보던 자료는 그대로 남아요.';
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
