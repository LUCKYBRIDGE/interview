// 자료 페이지(index.html) 입력 자동 저장과 '이전에 적은 내용'의 규칙. DOM이 없는 순수 모듈이다.
// 저장 키와 칸 키 형식(id:, risk:묶음:문구, noise:, noise-source:, stage-eval:, name:)은 학생 기록 계약이다(docs/architecture.md 3절).
// 화면에서 칸을 빼도 저장된 값은 지우지 않는다. 저장할 때 지금 화면의 값을 저장된 값 위에 합친다.

export const INPUTS_KEY = 'openclass-student-inputs-v1';
// 저장된 값을 읽을 수 없을 때 덮어쓰기 전에 원문을 한 번 옮겨 두는 키.
export const INPUTS_DAMAGED_KEY = 'openclass-student-inputs-v1-damaged';
// 2026-10-28에 잠시 보였던 사례 조사 칸 7개(배열). 지금은 읽기만 한다.
export const CASE_KEY = 'pedestrian-case-study-v1';

// 칸 하나의 저장 키. field는 화면에서 읽은 값이다:
// {id, classes, group(data-group), value, name, inNoiseChoice, noiseValue, stageEvalIndex}
export function fieldKey(field) {
  const classes = field.classes ?? [];
  if (field.id) return `id:${field.id}`;
  if (classes.includes('risk-check')) return `risk:${field.group}:${field.value}`;
  if (classes.includes('noise-check')) return `noise:${field.value}`;
  if (classes.includes('noise-source')) return field.inNoiseChoice ? `noise-source:${field.noiseValue}` : null;
  if (classes.includes('stage-eval')) return `stage-eval:${field.stageEvalIndex}`;
  return field.name ? `name:${field.name}:${field.value}` : null;
}

const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function parseInputs(raw) {
  if (raw === null || raw === undefined || raw === '') return {ok: true, data: {}};
  try {
    const value = JSON.parse(raw);
    if (isPlainObject(value)) return {ok: true, data: value};
  } catch {
    // 아래에서 손상으로 알린다.
  }
  return {ok: false, data: {}};
}

// 저장할 내용. raw는 지금 저장된 값, damaged는 INPUTS_DAMAGED_KEY의 값이다.
// value가 null이면 아무것도 쓰지 않는다. backup이 있으면 value보다 먼저 INPUTS_DAMAGED_KEY에 쓴다.
// 읽을 수 없는 값은 백업 칸이 비었거나 같은 원문이 이미 있을 때만 새로 쓴다. 백업 칸에 다른 원문이 있으면
// 어느 쪽도 덮어쓰지 않고 저장을 멈춘다(손상된 기록은 덮어쓰지 않는다).
export function planSave(raw, current, damaged = null) {
  const saved = parseInputs(raw);
  if (saved.ok) return {value: JSON.stringify({...saved.data, ...current}), backup: null};
  if (damaged === null) return {value: JSON.stringify(current), backup: raw};
  if (damaged === raw) return {value: JSON.stringify(current), backup: null};
  return {value: null, backup: null};
}

export function parseCaseStudy(raw) {
  try {
    const value = JSON.parse(raw ?? '[]');
    return Array.isArray(value) ? value.map(item => (typeof item === 'string' ? item : '')) : [];
  } catch {
    return [];
  }
}

// 2026-11-01 정리로 화면에서 뺀 칸(2026-10-28에 숨긴 칸). 순서는 예전 화면의 순서다.
// 사례 조사 칸의 index는 pedestrian-case-study-v1 배열의 자리다. ignore는 처음부터 들어 있던 값이라 학생이 고른 것인지 알 수 없는 값이다.
export const PREVIOUS_GROUPS = [
  {title: '위험 상황 찾기', fields: [
    {key: 'id:risk-source-main', label: '선택한 위험 상황을 주로 어디에서 알았나요?', ignore: ['내가 직접 경험함']},
    {key: 'id:risk-place', label: '어디에서, 어떤 상황이 위험했나요?'},
    {key: 'id:risk-people', label: '누구에게 특히 위험할까요? 왜 그렇게 생각하나요?'},
    {key: 'id:risk-question', label: '인터뷰나 자료에서 더 확인하고 싶은 점'},
  ]},
  {title: '문제 정의', fields: [
    {key: 'id:define-who', label: '누가 어려움을 겪나요?'},
    {key: 'id:define-where', label: '어디에서 어떤 어려움을 겪나요?'},
    {key: 'id:define-proof', label: '확인한 사실 또는 더 확인해야 할 점'},
  ]},
  {title: '자료 조사', fields: [
    {key: 'id:research-found', label: '자료에서 새롭게 알게 된 사실'},
    {key: 'id:research-source', label: '자료의 제목과 출처'},
    {key: 'id:research-link', label: '내가 정한 문제와 어떤 관련이 있나요?'},
  ]},
  {title: '사례 조사', fields: [
    {key: 'id:case-name', label: '사례의 이름', index: 0},
    {key: 'id:case-owner', label: '지역과 운영 기관', index: 1},
    {key: 'id:case-type', label: '운영 형태', index: 2},
    {key: 'id:case-action', label: '어떤 일을 했나요?', index: 3},
    {key: 'id:case-result', label: '확인된 성과나 어려움은 무엇인가요?', index: 4},
    {key: 'id:case-compare', label: '우리 지역과 비교하면 어떤 점을 생각할 수 있나요?', index: 5},
    {key: 'id:case-source', label: '출처·조사 시기', index: 6},
  ]},
  {title: '아이디어', fields: [
    {key: 'id:ideas-1', label: '아이디어 1'},
    {key: 'id:ideas-2', label: '아이디어 2 · 다른 방식으로'},
    {key: 'id:ideas-3', label: '아이디어 3 · 다른 사람의 입장에서'},
  ]},
  {title: '의견 마련', fields: [
    {key: 'id:opinion-choice', label: '내가 제안할 방법'},
    {key: 'id:opinion-reason', label: '이 방법을 선택한 까닭과 근거'},
    {key: 'id:opinion-existing', label: '이미 하고 있는 방법인지, 더 나아질 점은 무엇인지'},
    {key: 'stage-eval:0', label: '우리가 실제로 할 수 있는 방법인가?', check: true},
    {key: 'stage-eval:1', label: '문제를 줄이는 데 도움이 될까?', check: true},
    {key: 'stage-eval:2', label: '여러 사람에게 도움이 될까?', check: true},
  ]},
];

const CHECKS_LABEL = '의견을 따져 보며 체크한 것';
const text = value => (typeof value === 'string' ? value.trim() : '');

// 저장된 값 가운데 화면에서 뺀 칸의 글만 묶음별로 고른다. 글이 없는 묶음은 뺀다.
export function previousGroups(saved, caseStudy = []) {
  const groups = [];
  for (const group of PREVIOUS_GROUPS) {
    const items = [];
    const checked = [];
    for (const field of group.fields) {
      if (field.check) {
        if (saved[field.key] === true) checked.push(field.label);
        continue;
      }
      const value = text(saved[field.key]) || (field.index === undefined ? '' : text(caseStudy[field.index]));
      if (value && !(field.ignore ?? []).includes(value)) items.push({label: field.label, value});
    }
    if (checked.length) items.push({label: CHECKS_LABEL, value: checked.join(', ')});
    if (items.length) groups.push({title: group.title, items});
  }
  return groups;
}

export function previousText(groups) {
  if (!groups.length) return '';
  const blocks = groups.map(group => [`[${group.title}]`, ...group.items.map(item => `${item.label}: ${item.value}`)].join('\n'));
  return ['[이전에 적은 내용]', ...blocks].join('\n\n');
}
