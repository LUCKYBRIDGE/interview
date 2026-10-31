// 자료 페이지(index.html) 보조 동작. 기록장 패널 안(?embed=1)에서도 돈다.
// 1) 입력 자동 저장(openclass-student-inputs-v1): 저장된 값을 되살리고, 고칠 때마다 저장된 값 위에 합쳐 쓴다.
//    화면에서 뺀 칸의 값도 지우지 않는다(규칙은 explore-inputs.mjs).
// 2) 위험 상황 묶음 8개의 선택지를 접고 고른 수를 보인다.
// 3) 화면에서 뺀 칸(2026-10-28에 숨긴 STEP 2·3·4 등)에 예전 글이 있으면 '이전에 적은 내용'으로 읽기 전용으로 보여 준다.
// 모듈은 문서를 다 읽고 다른 스크립트가 돈 뒤에 실행된다. 그 스크립트들은 값을 되살린 뒤 보내는 input·change 이벤트로 화면을 맞춘다.
import {nextTabIndex, riskSummaryText} from './explore-labels.mjs?v=20261031-2';
import {
  CASE_KEY, INPUTS_DAMAGED_KEY, INPUTS_KEY, fieldKey, parseCaseStudy, parseInputs, planSave, previousGroups, previousText,
} from './explore-inputs.mjs?v=20261101-2';

// 탭 방향키 규칙(인라인 탭 스크립트가 있으면 쓴다).
window.knolNextTabIndex = nextTabIndex;

const storage = (() => {
  try { return window.localStorage; } catch { return null; }
})();
const readStored = key => {
  try { return storage?.getItem(key) ?? null; } catch { return null; }
};

function startAutosave(root) {
  if (!root) return {};
  const stageEvals = [...document.querySelectorAll('.stage-eval')];
  const fields = [...root.querySelectorAll('input,textarea,select')].filter(el =>
    !['button', 'submit', 'reset', 'file', 'hidden'].includes(el.type)
    && !el.closest('.share-qr-overlay,.risk-modal')
    && !(el.id || '').startsWith('share-'));
  const persistent = fields.map(el => {
    const choice = el.classList.contains('noise-source') ? el.closest('.noise-choice') : null;
    const key = fieldKey({
      id: el.id, classes: [...el.classList], group: el.dataset.group, value: el.value, name: el.name,
      inNoiseChoice: Boolean(choice), noiseValue: choice?.querySelector('.noise-check')?.value,
      stageEvalIndex: stageEvals.indexOf(el),
    });
    return {el, key};
  }).filter(item => item.key);

  // 모듈이 돌기 전에 학생이 이미 고친 칸은 되살리지 않고, 고친 값을 바로 저장한다.
  const changedEarly = el => {
    if (el.type === 'checkbox' || el.type === 'radio') return el.checked !== el.defaultChecked;
    if (el.tagName === 'SELECT') return el.selectedIndex !== Math.max(0, [...el.options].findIndex(option => option.defaultSelected));
    return el.value !== el.defaultValue;
  };
  const saved = parseInputs(readStored(INPUTS_KEY));
  let early = false;
  for (const {el, key} of persistent) {
    if (changedEarly(el)) { early = true; continue; }
    if (!Object.prototype.hasOwnProperty.call(saved.data, key)) continue;
    const value = saved.data[key];
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = value === true;
    else if (typeof value === 'string') el.value = value;
  }

  let paused = true;
  let stopped = false;
  const save = () => {
    if (paused || stopped || !storage) return;
    const current = {};
    for (const {el, key} of persistent) current[key] = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value;
    try {
      const plan = planSave(storage.getItem(INPUTS_KEY), current, storage.getItem(INPUTS_DAMAGED_KEY));
      if (plan.value === null) {
        // 손상된 값이 두 번째로 생겼다. 어느 것도 덮어쓰지 않고 이 페이지의 자동 저장을 멈춘다.
        stopped = true;
        console.warn(`${INPUTS_KEY}을 읽을 수 없고 ${INPUTS_DAMAGED_KEY}에 다른 값이 있어 자동 저장을 멈췄습니다.`);
        return;
      }
      if (plan.backup !== null) storage.setItem(INPUTS_DAMAGED_KEY, plan.backup);
      storage.setItem(INPUTS_KEY, plan.value);
    } catch {
      // 저장할 수 없는 기기에서는 화면에서만 쓴다.
    }
  };
  root.addEventListener('input', save);
  root.addEventListener('change', save);
  window.addEventListener('pagehide', save);
  // 버튼으로 한꺼번에 지우면 input 이벤트가 없어서 따로 저장한다(소음 활동지 지우기, 인터뷰 검색 지우기).
  for (const id of ['clear-worksheet', 'reset']) {
    document.getElementById(id)?.addEventListener('click', () => queueMicrotask(save));
  }
  // 되살린 값에 맞춰 다른 스크립트가 화면을 고치게 한다. 이때는 저장하지 않는다(바뀐 값이 없다).
  for (const {el} of persistent) {
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.dispatchEvent(new Event('change', {bubbles: true}));
  }
  paused = false;
  if (early) save();
  return saved.data;
}

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function showPreviousInputs(saved) {
  const box = document.getElementById('previous-inputs');
  if (!box) return;
  const groups = previousGroups(saved, parseCaseStudy(readStored(CASE_KEY)));
  if (!groups.length) return;
  const details = element('details');
  const summary = element('summary', '', '이전에 적은 내용');
  summary.append(' ', element('span', '', '읽기만 할 수 있어요'));
  details.append(summary, element('p', '', '전에 이 페이지에 적은 글이에요. 지금은 기록장에 적어요. 필요하면 복사해서 기록장에 붙여 넣어요.'));
  for (const group of groups) {
    const list = element('dl');
    for (const item of group.items) list.append(element('dt', '', item.label), element('dd', '', item.value));
    details.append(element('p', 'previous-inputs-title', group.title), list);
  }
  const actions = element('div', 'previous-inputs-actions');
  const copy = element('button', '', '이전에 적은 내용 복사');
  copy.type = 'button';
  const status = element('span');
  status.setAttribute('role', 'status');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(previousText(groups));
      status.textContent = '복사했어요. 기록장에 붙여 넣어요.';
    } catch {
      status.textContent = '자동으로 복사되지 않아요. 위 글을 보고 옮겨 적어요.';
    }
  });
  actions.append(copy, status);
  details.append(actions);
  box.append(details);
  box.hidden = false;
}

function foldRiskGroups() {
  for (const group of document.querySelectorAll('#walk-risk-choices .risk-group')) {
    const options = group.querySelector('.risk-options');
    if (!options || options.closest('details')) continue;
    const checks = [...options.querySelectorAll('.risk-check')];
    const details = document.createElement('details');
    details.className = 'risk-more';
    const summary = document.createElement('summary');
    options.before(details);
    details.append(summary, options);
    const update = () => { summary.textContent = riskSummaryText(checks.length, checks.filter(check => check.checked).length); };
    options.addEventListener('change', update);
    update();
  }
}

const saved = startAutosave(document.querySelector('main'));
foldRiskGroups();
showPreviousInputs(saved);
