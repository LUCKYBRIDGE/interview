// 자료 페이지 입력 자동 저장(openclass-student-inputs-v1)의 규칙. 저장 키와 칸 키 형식은 학생 기록 계약이다.
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CASE_KEY, INPUTS_DAMAGED_KEY, INPUTS_KEY, PREVIOUS_GROUPS,
  fieldKey, parseCaseStudy, parseInputs, planSave, previousGroups, previousText,
} from '../assets/explore-inputs.mjs';

test('storage keys stay the same', () => {
  assert.equal(INPUTS_KEY, 'openclass-student-inputs-v1');
  assert.equal(CASE_KEY, 'pedestrian-case-study-v1');
  assert.equal(INPUTS_DAMAGED_KEY, 'openclass-student-inputs-v1-damaged');
});

test('field keys keep the format older saved inputs use', () => {
  assert.equal(fieldKey({id: 'risk-extra', classes: []}), 'id:risk-extra');
  assert.equal(fieldKey({id: 'x', classes: ['risk-check'], group: 'g', value: 'v'}), 'id:x', 'an id wins over a class');
  assert.equal(fieldKey({classes: ['risk-check'], group: '도로·시설', value: '보도가 너무 좁음'}), 'risk:도로·시설:보도가 너무 좁음');
  assert.equal(fieldKey({classes: ['risk-check'], value: '노인'}), 'risk:undefined:노인', 'a missing group is written as before');
  assert.equal(fieldKey({classes: ['noise-check'], value: '오토바이 소리'}), 'noise:오토바이 소리');
  assert.equal(fieldKey({classes: ['noise-source'], inNoiseChoice: true, noiseValue: '오토바이 소리'}), 'noise-source:오토바이 소리');
  assert.equal(fieldKey({classes: ['noise-source'], inNoiseChoice: false}), null);
  assert.equal(fieldKey({classes: ['stage-eval'], stageEvalIndex: 2}), 'stage-eval:2');
  assert.equal(fieldKey({classes: [], name: 'pick', value: 'a'}), 'name:pick:a');
  assert.equal(fieldKey({classes: []}), null);
});

test('saved inputs are read only when they are a plain object', () => {
  assert.deepEqual(parseInputs(null), {ok: true, data: {}});
  assert.deepEqual(parseInputs(''), {ok: true, data: {}});
  assert.deepEqual(parseInputs('{"id:a":"x","risk:g:v":true}'), {ok: true, data: {'id:a': 'x', 'risk:g:v': true}});
  for (const raw of ['[1]', '"x"', 'null', '3', '{bad']) assert.equal(parseInputs(raw).ok, false, raw);
});

test('saving keeps values of fields that are no longer on the page', () => {
  const raw = JSON.stringify({'id:define-who': '어두운 길로 귀가하는 사람들', 'risk:g:v': true, 'id:risk-extra': '옛 값'});
  const plan = planSave(raw, {'risk:g:v': false, 'id:risk-extra': ''});
  assert.equal(plan.damaged, null);
  assert.deepEqual(JSON.parse(plan.value), {'id:define-who': '어두운 길로 귀가하는 사람들', 'risk:g:v': false, 'id:risk-extra': ''},
    'fields on the page win, including a cleared value');
  assert.deepEqual(JSON.parse(planSave(null, {'id:a': 'x'}).value), {'id:a': 'x'});
});

test('a damaged saved value is handed back for a backup instead of being lost', () => {
  const plan = planSave('{oops', {'id:a': 'x'});
  assert.equal(plan.damaged, '{oops');
  assert.deepEqual(JSON.parse(plan.value), {'id:a': 'x'});
  assert.equal(planSave('[]', {}).damaged, '[]');
});

test('the case study list is read as text values only', () => {
  assert.deepEqual(parseCaseStudy(null), []);
  assert.deepEqual(parseCaseStudy('{bad'), []);
  assert.deepEqual(parseCaseStudy('{"a":1}'), []);
  assert.deepEqual(parseCaseStudy('["사례", 3, null, "출처"]'), ['사례', '', '', '출처']);
});

test('previous inputs list only removed fields that have text, in page order', () => {
  assert.deepEqual(previousGroups({}, []), []);
  assert.deepEqual(previousGroups({'id:define-who': '   ', 'id:ideas-1': '', 'stage-eval:0': false}, ['', '']), []);
  assert.deepEqual(previousGroups({'id:risk-extra': '지금 화면에 있는 칸', 'risk:g:v': true, 'id:search': '민지'}, []), [],
    'fields still on the page are not previous inputs');
  const groups = previousGroups({
    'id:opinion-choice': '횡단보도에 조명을 단다',
    'id:define-who': '어두운 길로 귀가하는 사람들',
    'id:define-where': 7,
    'stage-eval:0': true,
    'stage-eval:2': true,
  }, []);
  assert.deepEqual(groups.map(group => group.title), ['문제 정의', '의견 마련']);
  assert.deepEqual(groups[0].items, [{label: '누가 어려움을 겪나요?', value: '어두운 길로 귀가하는 사람들'}]);
  assert.deepEqual(groups[1].items, [
    {label: '내가 제안할 방법', value: '횡단보도에 조명을 단다'},
    {label: '의견 검토에서 고른 것', value: '우리가 실제로 할 수 있는 방법인가?, 여러 사람에게 도움이 될까?'},
  ]);
});

test('case study values come from the input autosave first and the older case list second', () => {
  const groups = previousGroups({'id:case-name': '안심 귀갓길', 'id:case-type': ''}, ['옛 이름', '강릉시', '', '', '', '', '2025 기사']);
  assert.deepEqual(groups.map(group => group.title), ['사례 조사']);
  assert.deepEqual(groups[0].items, [
    {label: '사례의 이름', value: '안심 귀갓길'},
    {label: '지역과 운영 기관', value: '강릉시'},
    {label: '출처·조사 시기', value: '2025 기사'},
  ]);
});

test('every previous field names a removed field once', () => {
  const keys = PREVIOUS_GROUPS.flatMap(group => group.fields.map(field => field.key));
  assert.equal(new Set(keys).size, keys.length);
  for (const key of ['id:risk-extra', 'id:search', 'id:more-noise', 'id:noise-example', 'id:noise-thought']) {
    assert.ok(!keys.includes(key), `${key} is still on the page`);
  }
});

test('previous inputs copy as plain text with group titles', () => {
  const text = previousText([
    {title: '문제 정의', items: [{label: '누가 어려움을 겪나요?', value: '어두운 길로 귀가하는 사람들'}]},
    {title: '아이디어', items: [{label: '아이디어 1', value: '조명\n더 달기'}]},
  ]);
  assert.equal(text, '[이전에 적은 내용]\n\n[문제 정의]\n누가 어려움을 겪나요?: 어두운 길로 귀가하는 사람들\n\n[아이디어]\n아이디어 1: 조명\n더 달기');
  assert.equal(previousText([]), '');
});
