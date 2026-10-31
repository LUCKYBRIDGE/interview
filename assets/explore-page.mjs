// 자료 페이지(index.html) 보조 동작. 기록장 패널 안(?embed=1)에서도 돈다.
// 1) 입력 자동 저장(openclass-student-inputs-v1): 저장된 값을 되살리고, 고칠 때마다 저장된 값 위에 합쳐 쓴다.
//    화면에서 뺀 칸의 값도 지우지 않는다(규칙은 explore-inputs.mjs).
// 2) 위험 상황 묶음 8개의 선택지를 접고 고른 수를 보인다.
// 모듈은 문서를 다 읽고 다른 스크립트가 돈 뒤에 실행된다. 그 스크립트들은 값을 되살린 뒤 보내는 input·change 이벤트로 화면을 맞춘다.
import {nextTabIndex, riskSummaryText} from './explore-labels.mjs?v=20261031-2';
import {INPUTS_DAMAGED_KEY, INPUTS_KEY, fieldKey, parseInputs, planSave} from './explore-inputs.mjs?v=20261101-1';

// 탭 방향키 규칙(인라인 탭 스크립트가 있으면 쓴다).
window.knolNextTabIndex = nextTabIndex;

const storage = (() => {
  try { return window.localStorage; } catch { return null; }
})();
const readStored = key => {
  try { return storage?.getItem(key) ?? null; } catch { return null; }
};

function startAutosave(root) {
  if (!root) return;
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

  const saved = parseInputs(readStored(INPUTS_KEY));
  for (const {el, key} of persistent) {
    if (!Object.prototype.hasOwnProperty.call(saved.data, key)) continue;
    const value = saved.data[key];
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = value === true;
    else if (typeof value === 'string') el.value = value;
  }

  let paused = true;
  const save = () => {
    if (paused || !storage) return;
    const current = {};
    for (const {el, key} of persistent) current[key] = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value;
    try {
      const plan = planSave(storage.getItem(INPUTS_KEY), current);
      if (plan.damaged !== null && storage.getItem(INPUTS_DAMAGED_KEY) === null) storage.setItem(INPUTS_DAMAGED_KEY, plan.damaged);
      storage.setItem(INPUTS_KEY, plan.value);
    } catch {
      // 저장할 수 없는 기기에서는 화면에서만 쓴다.
    }
  };
  root.addEventListener('input', save);
  root.addEventListener('change', save);
  window.addEventListener('pagehide', save);
  // 버튼으로 한꺼번에 지우면 input 이벤트가 없어서 따로 저장한다.
  for (const id of ['risk-clear', 'clear-worksheet', 'reset', 'case-clear']) {
    document.getElementById(id)?.addEventListener('click', () => queueMicrotask(save));
  }
  // 되살린 값에 맞춰 다른 스크립트가 화면을 고치게 한다. 이때는 저장하지 않는다(바뀐 값이 없다).
  for (const {el} of persistent) {
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.dispatchEvent(new Event('change', {bubbles: true}));
  }
  paused = false;
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

startAutosave(document.querySelector('main'));
foldRiskGroups();
