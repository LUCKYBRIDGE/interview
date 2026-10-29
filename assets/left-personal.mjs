import {MAX_RECORD_BYTES,loadRecord,parseRecord} from './workroom-state.mjs?v=20261028-13';
const content = document.getElementById('left-personal-content');
const status = document.getElementById('left-personal-status');
const input = document.getElementById('left-personal-file');
const refresh = document.getElementById('refresh-left-personal');
let externalRecord = null;
const fields = [
  ['듣고, 찾고, 알고 있던 것', d => d.experience],
  ['집중할 문제', d => d.problem],
  ['아이디어', d => (d.ideas || []).filter(Boolean).join('\n')],
  ['내 의견', d => d.proposal],
  ['이유와 근거', d => [d.reason,d.evidence].filter(Boolean).join('\n')]
];
function draw(record, origin) {
  content.replaceChildren();
  if (!record?.data) {
    status.textContent = '이 브라우저에 개인활동 기록이 없습니다. 개인활동을 작성하거나 JSON 파일을 선택하세요.';
    return;
  }
  status.textContent = origin;
  for(const [title, take] of fields) {
    const section = document.createElement('section');
    section.className = 'left-personal-entry';
    const heading = document.createElement('h3');
    heading.textContent = title;
    const value = document.createElement('p');
    value.textContent = take(record.data)?.trim() || '아직 작성한 내용이 없습니다.';
    section.append(heading,value);
    content.append(section);
  }
}
function refreshLocal() {
  externalRecord = null;
  try {
    const store = window.localStorage;
    const result = loadRecord(store,'personal');
    if (result.status === 'error') throw new Error(result.message);
    draw(result.record, '이 브라우저에 저장된 개인활동 기록');
  } catch (error) {content.replaceChildren();status.textContent = '개인 기록을 불러오지 못했습니다: ' + error.message;}
}
refresh.addEventListener('click',refreshLocal);
window.addEventListener('knoltalk-personal-reference-refresh', () => {
  if(!externalRecord)refreshLocal();
});
input.addEventListener('change',async () => {
  const file = input.files?.[0];
  if (!file) return;
  try {
    if(file.size > MAX_RECORD_BYTES)throw new Error('2MB 이하의 JSON 파일을 선택하세요.');
    const record = parseRecord(await file.text(),'personal');
    externalRecord = record;
    draw(record, '파일에서 불러온 개인활동 기록 · ' + file.name);
  } catch(error) {status.textContent='파일을 열 수 없습니다: ' + error.message;}
  finally {input.value='';}
});
window.addEventListener('storage',event => {
  if (event.key?.includes('personal')) {
    if(!externalRecord && !document.getElementById('left-personal').hidden)refreshLocal();
  }
});
refreshLocal();
