// 기록장 자료 패널. 기록 영역은 늘 보이고, 같은 사이트의 자료(index.html?embed=1)를 패널로 연다.
// 폭 1024px 이상은 기록 옆 패널, 그보다 좁으면 기록 위에 덮는 시트다(DESIGN.md 6절).
// 계약(docs/architecture.md 4절): 메시지 discussion-activity, discussion-explore-position,
// discussion-explore-restore는 같은 출처와 해당 iframe만 주고받는다. 상태는 interview-explore-pane-v1에 둔다.
import {ROUTES, readPane, writePane, frameURL, paneState} from './explore-state.mjs';
import {WIDE_QUERY, modeFor, panelOpenOnLoad, panelOpenAfterResize} from './workroom-layout.mjs?v=20261031-2';

const $ = id => document.getElementById(id);
const panel = $('reference-panel');
const frame = $('explore-frame');
const toggle = $('reference-toggle');
const closeButton = $('reference-close');
const title = $('reference-title');
const writing = $('writing-pane');
const wide = matchMedia(WIDE_QUERY);
const TITLES = {home: '보행자 안전 자료', walking: '가상 인물 인터뷰', study: '토의 방법 학습 자료', discussion: '모둠 의견 점검 도우미', noise: '보행자 안전 자료', interview: '보행자 안전 자료'};

let storage;
try { storage = window.sessionStorage; } catch { storage = null; }
let state = readPane(storage);
const params = new URLSearchParams(location.search);
const forced = params.get('view') === 'both';
if (forced) state = {...state, mode: 'both', route: 'home', y: 0};
// 한 번 읽은 화면 매개변수는 주소에서 지운다. 그래야 새로고침해도 학생이 닫은 패널이 다시 열리지 않는다.
if (params.has('view') || params.has('panel')) {
  params.delete('view');
  params.delete('panel');
  const query = params.toString();
  history.replaceState(null, '', location.pathname + (query ? `?${query}` : '') + location.hash);
}
let open = panelOpenOnLoad({mode: state.mode, forced, wide: wide.matches});
let loadedRoute = '';
let restoring = false;
let returnFocus = null;

const persist = () => writePane(storage, state);
const sheet = () => open && !wide.matches;
const background = () => [$('site-header'), $('activity-nav'), $('group-padlet-top'), writing, document.querySelector('footer'), document.querySelector('.skip-link')].filter(Boolean);

function restoreFrame() {
  restoring = true;
  frame.contentWindow?.postMessage({type: 'discussion-explore-restore', route: state.route, y: state.y}, location.origin);
}
frame.addEventListener('load', restoreFrame);

function syncRoute() {
  const label = TITLES[state.route] ?? TITLES.home;
  title.textContent = label;
  frame.title = label;
  panel.querySelectorAll('[data-explore-route]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.exploreRoute === state.route));
  });
}

function loadFrame() {
  if (loadedRoute === state.route && frame.getAttribute('src')) {
    // 숨겨졌던 iframe은 스크롤 위치를 잃는다. 다시 보일 때 저장한 위치로 돌린다.
    requestAnimationFrame(restoreFrame);
    return;
  }
  loadedRoute = state.route;
  frame.src = frameURL(state.route);
}

function render() {
  const isSheet = sheet();
  panel.hidden = !open;
  document.body.dataset.reference = open ? (isSheet ? 'sheet' : 'side') : 'closed';
  document.body.classList.toggle('reference-sheet-open', isSheet);
  for (const node of background()) node.inert = isSheet;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? '자료 닫기' : '자료 보기';
  syncRoute();
  if (open) loadFrame();
}

function setOpen(next, {remember = true} = {}) {
  if (next === open) return;
  if (next) returnFocus = document.activeElement;
  open = next;
  if (remember) { state = {...state, mode: modeFor(open)}; persist(); }
  render();
  if (open) closeButton.focus({preventScroll: true});
  else (returnFocus?.isConnected && !returnFocus.closest('#reference-panel') ? returnFocus : toggle).focus({preventScroll: true});
}

function showRoute(route) {
  if (!ROUTES.includes(route)) return;
  if (route !== state.route) state = {...state, route, y: 0};
  persist();
  if (!open) setOpen(true);
  else render();
}

toggle.addEventListener('click', () => setOpen(!open));
closeButton.addEventListener('click', () => setOpen(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sheet()) { event.preventDefault(); setOpen(false); }
});
// 패널 안 자료 버튼과 기록장 아래쪽 자료 링크가 같은 패널을 연다.
document.addEventListener('click', event => {
  const link = event.target.closest('[data-explore-route]');
  if (!link) return;
  event.preventDefault();
  showRoute(link.dataset.exploreRoute);
});
$('open-explore-window').addEventListener('click', () => {
  window.open(`index.html?explore=1#${state.route}`, '_blank', 'noopener,noreferrer');
});
wide.addEventListener('change', () => {
  open = panelOpenAfterResize({mode: state.mode, wide: wide.matches});
  render();
});

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
  const value = event.data;
  if (value?.type === 'discussion-activity' && ['personal', 'group'].includes(value.kind)) {
    if (sheet()) setOpen(false, {remember: false});
    location.hash = value.kind;
    return;
  }
  if (!value || value.type !== 'discussion-explore-position' || !ROUTES.includes(value.route)) return;
  if (panel.hidden || (restoring && value.restored !== true)) return;
  restoring = false;
  state = {...state, ...paneState({...state, route: value.route, y: value.y})};
  loadedRoute = state.route;
  persist();
  syncRoute();
});

render();
