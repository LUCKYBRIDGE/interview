import test from 'node:test';
import assert from 'node:assert/strict';
import { createData, makeRecord, parseRecord, updateValue, updateActivity, importPersonalToMember, formatText, loadRecord, saveRecord, storageKey, updateCriteria, VERSION } from '../assets/workroom-state.mjs';

test('personal and group defaults are independent and have distinct storage keys', () => {
  const one = createData('personal'); const two = createData('personal');
  one.perspectives[0].person = '변경';
  assert.equal(two.perspectives[0].person, '');
  assert.equal(createData('group').members.length, 4);
  assert.notEqual(storageKey('personal'), storageKey('group'));
  assert.throws(() => createData('unknown'));
});
test('immutable update changes only an allowed existing path', () => {
  const original = createData('group');
  const next = updateValue(original, 'members.0.proposal', '통로를 확보하자');
  assert.equal(original.members[0].proposal, '');
  assert.equal(next.members[0].proposal, '통로를 확보하자');
  assert.throws(() => updateValue(original, '__proto__.polluted', 'x'));
  assert.throws(() => updateValue(original, 'members.99.proposal', 'x'));
  assert.throws(() => updateValue(original, 'members.0.checked', 'yes'));
});
test('roundtrip preserves separate fictional account, verified fact and doubts', () => {
  const data = createData('personal');
  data.perspectives[0] = {kind:'fictional',person:'김도윤',difficulty:'길이 좁음',value:'친구와 걷기'};
  data.sources[0] = {title:'관찰 기록',url:'',date:'2026-10-28',claim:'통로 폭을 관찰함',relevance:'통행 문제',scope:'학교 주변'};
  data.uncertainties = '다른 시간대도 확인하기';
  const serialized = JSON.stringify(makeRecord('personal',data));
  assert.deepEqual(parseRecord(serialized,'personal').data, data);
  const text = formatText('personal',data);
  assert.match(text,/수업용 가상 인물/); assert.match(text,/학교 주변/); assert.match(text,/다른 시간대/);
});
test('rejects wrong kind, version, missing fields, unexpected fields and excessive input', () => {
  const record = makeRecord('personal',createData('personal'));
  for (const edit of [r=>r.version=8,r=>r.kind='group',r=>delete r.data.problem,r=>r.data.extra='x',r=>r.data.problem='x'.repeat(8001),r=>r.data.perspectives[0].kind='verified']) {
    const next=structuredClone(record); edit(next);
    assert.throws(()=>parseRecord(JSON.stringify(next),'personal'));
  }
  assert.throws(()=>parseRecord('not-json','personal'));
  assert.throws(()=>parseRecord(' '.repeat(2000001),'personal'));
  assert.throws(()=>parseRecord('null','personal'));
  assert.throws(()=>makeRecord('personal',{...createData('personal'),ideas:[true]}));
});
test('group accepts only 3 to 5 complete members and preserves minority concerns', () => {
  const data=createData('group'); data.remaining='少数の意見も残す';
  data.members[0].checked=true; data.criteria.feasible=true;
  const record=makeRecord('group',data);
  assert.deepEqual(parseRecord(JSON.stringify(record),'group').data,data);
  assert.match(formatText('group',data),/少数/);
  data.members=[]; assert.throws(()=>makeRecord('group',data));
});
test('storage reports unavailable, quota and corrupt data without silently claiming success', () => {
  const mem=new Map(); const storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
  assert.equal(loadRecord(storage,'personal').status,'empty');
  const record=makeRecord('personal',createData('personal'));
  assert.equal(saveRecord(storage,record).ok,true);
  assert.equal(loadRecord(storage,'personal').status,'loaded');
  mem.set(storageKey('personal'),'{bad'); assert.equal(loadRecord(storage,'personal').status,'error');
  assert.equal(loadRecord(null,'personal').status,'error');
  assert.equal(saveRecord(null,record).ok,false);
  const fail={getItem(){throw Error('denied')},setItem(){throw Error('quota')}};
  assert.equal(loadRecord(fail,'group').status,'error'); assert.equal(saveRecord(fail,record).ok,false);
});

test('decision edits invalidate confirmations while confirming one member preserves others', () => {
  const data=createData('group');data.members=data.members.map(m=>({...m,checked:true}));
  const changed=updateActivity('group',data,'proposal','바뀐 제안');
  assert.ok(changed.members.every(m=>!m.checked));assert.ok(data.members.every(m=>m.checked));
  const checked=updateActivity('group',changed,'members.0.checked',true);
  assert.equal(checked.members[0].checked,true);assert.equal(checked.members[1].checked,false);
  assert.equal(updateActivity('group',data,'label','별칭').members[0].checked,true);
  assert.equal(updateActivity('personal',createData('personal'),'proposal','내 제안').proposal,'내 제안');
});
test('a maximum-length five-member Korean record can be exported and imported', () => {
  const data=createData('group');data.members.push(structuredClone(data.members[0]));
  const fill=value=>Object.fromEntries(Object.entries(value).map(([key,v])=>[key,typeof v==='string'?(key==='groupNumber'?'6':'가'.repeat(8000)):Array.isArray(v)?v.map(item=>typeof item==='string'?'가'.repeat(200):fill(item)):typeof v==='object'?fill(v):v]));
  const maximal=fill(data);const text=JSON.stringify(makeRecord('group',maximal),null,2);
  assert.ok(new TextEncoder().encode(text).byteLength<2000000);
  assert.deepEqual(parseRecord(text,'group').data,maximal);
});

test('personal-to-member bridge preserves the group and other people and clears confirmations', () => {
  const group=createData('group');group.proposal='공동 제안 유지';group.members=group.members.map((m,i)=>({...m,name:`기존${i}`,proposal:`제안${i}`,strength:'검토',checked:true}));
  const personal=createData('personal');personal.label='새 별칭';personal.problem='내 문제';personal.proposal='내 제안';personal.reason='내 이유';personal.evidence='확인한 근거';personal.sources[0].title='자료 제목';personal.sources[0].url='https://example.com/report';
  const before=structuredClone(group);const next=importPersonalToMember(group,1,makeRecord('personal',personal));
  assert.deepEqual(group,before);assert.equal(next.proposal,'공동 제안 유지');assert.equal(next.members[1].name,'새 별칭');assert.equal(next.members[1].problem,'내 문제');assert.equal(next.members[1].proposal,'내 제안');assert.equal(next.members[1].reason,'내 이유');assert.match(next.members[1].source,/확인한 근거/);assert.match(next.members[1].source,/https:\/\/example.com\/report/);assert.equal(next.members[1].strength,'');
  assert.deepEqual({...next.members[0],checked:true},group.members[0]);assert.ok(next.members.every(m=>!m.checked));
});
test('personal-to-member bridge rejects invalid records, indexes and overlong combined source', () => {
  const group=createData('group'),personal=createData('personal'),record=makeRecord('personal',personal);
  for(const index of [-1,9,1.5,'1'])assert.throws(()=>importPersonalToMember(group,index,record));
  assert.throws(()=>importPersonalToMember(group,0,makeRecord('group',group)));
  assert.throws(()=>importPersonalToMember(group,0,{...record,version:9}));
  assert.throws(()=>importPersonalToMember(group,0,{...record,data:{...personal,extra:'bad'}}));
  personal.evidence='가'.repeat(8000);personal.sources[0].title='추가 출처';assert.throws(()=>importPersonalToMember(group,0,makeRecord('personal',personal)));
  const fallback=importPersonalToMember(group,0,record);assert.equal(fallback.members[0].problem,'');
});

test('version 1 records migrate without losing personal details or member reviews', () => {
  const personal=createData('personal');personal.perspectives[1].value='이전 상세 기록';personal.ideas[2]='세 번째 생각';
  const oldPersonal={...makeRecord('personal',personal),version:1};delete oldPersonal.data.groupNumber;
  const migrated=parseRecord(JSON.stringify(oldPersonal),'personal');
  assert.equal(migrated.version,VERSION);assert.deepEqual(migrated.data,personal);
  const group=createData('group');delete group.groupNumber;delete group.discussion;delete group.criteriaList;group.members[2].question='예전 질문';
  const oldGroup={app:'interview-workroom',version:1,kind:'group',updatedAt:new Date().toISOString(),data:group};
  const next=parseRecord(JSON.stringify(oldGroup),'group');
  assert.equal(next.data.discussion,'');assert.equal(next.data.members[2].question,'예전 질문');
  assert.deepEqual(oldGroup.data,group);
  assert.throws(()=>parseRecord(JSON.stringify({...oldGroup,data:{...group,discussion:'invalid v1 field'}}),'group'));
});
test('legacy storage is read without deleting it and a corrupt current record stays protected', () => {
  const data=createData('group');delete data.groupNumber;delete data.discussion;delete data.criteriaList;data.members[0].source='옛 출처';
  const legacy=JSON.stringify({app:'interview-workroom',version:1,kind:'group',updatedAt:new Date().toISOString(),data});
  const mem=new Map([['interview-workroom-v1-group',legacy]]);const storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
  const loaded=loadRecord(storage,'group');assert.equal(loaded.status,'loaded');assert.equal(loaded.record.data.members[0].source,'옛 출처');
  assert.equal(saveRecord(storage,loaded.record).ok,true);assert.equal(mem.get('interview-workroom-v1-group'),legacy);
  mem.set(storageKey('group'),'{broken');assert.equal(loadRecord(storage,'group').status,'error');
});
test('shared group discussion survives export and invalidates confirmations on edit', () => {
  const data=createData('group');assert.equal(data.discussion,'');data.members[0].checked=true;
  const next=updateActivity('group',data,'discussion','효과는 좋지만 관리가 걱정됨');
  assert.equal(next.members[0].checked,false);assert.equal(data.discussion,'');
  assert.equal(parseRecord(JSON.stringify(makeRecord('group',next)),'group').data.discussion,next.discussion);
  assert.match(formatText('group',next),/효과는 좋지만 관리가 걱정됨/);
});


test('criteria are editable immutable lists with bounded draft values', () => {
  const original=createData('group');
  assert.deepEqual(original.criteriaList,['실천 가능한 방법인가?','문제 해결에 효과적인가?','여러 사람에게 도움이 되는가?']);
  original.members[0].checked=true;
  const next=updateCriteria(original,['함께 지킬 수 있나요?','']);
  assert.deepEqual(next.criteriaList,['함께 지킬 수 있나요?','']);
  assert.equal(next.members[0].checked,false);assert.equal(original.members[0].checked,true);
  assert.equal(original.criteriaList.length,3);
  assert.deepEqual(parseRecord(JSON.stringify(makeRecord('group',next)),'group').data.criteriaList,next.criteriaList);
  assert.deepEqual(updateCriteria(next,[]).criteriaList,[]);
  for(const list of [null,{},Array(13).fill('a'),['가'.repeat(201)],[3]])assert.throws(()=>updateCriteria(original,list));
  assert.throws(()=>updateActivity('group',original,'criteriaList.0','가'.repeat(201)));
  assert.match(formatText('group',next),/함께 지킬 수 있나요/);
  assert.doesNotMatch(formatText('group',next),/검토 기준: 실천 가능성/);
});

test('version 2 migration keeps changed criteria, legacy content and member records', () => {
  const current=createData('group');
  const {criteriaList,groupNumber,...data}=current;
  data.criteria={feasible:false,effective:true,shared:false,extra:'다른 관점도 반영하는가?'};
  data.members[0].question='보존할 질문';
  const old={app:'interview-workroom',version:2,kind:'group',updatedAt:new Date().toISOString(),data};
  const next=parseRecord(JSON.stringify(old),'group');
  assert.equal(next.version,VERSION);
  assert.deepEqual(next.data.criteriaList,['문제 해결에 효과적인가?','다른 관점도 반영하는가?']);
  assert.deepEqual(next.data.criteria,data.criteria);
  assert.equal(next.data.members[0].question,'보존할 질문');
  data.criteria.extra='가'.repeat(8000);
  const long=parseRecord(JSON.stringify({...old,data}),'group');
  assert.equal(long.data.criteria.extra.length,8000);
  assert.deepEqual(long.data.criteriaList,['문제 해결에 효과적인가?']);
  assert.throws(()=>parseRecord(JSON.stringify({...old,data:{...data,criteriaList:[]}}),'group'));
});

test('storage prefers v3 then v2 then v1, preserving corrupt latest records', () => {
  const {criteriaList,groupNumber,...data}=createData('group');data.discussion='v2 토의';
  const v2=JSON.stringify({app:'interview-workroom',version:2,kind:'group',updatedAt:new Date().toISOString(),data});
  const mem=new Map([[storageKey('group',2),v2]]), storage={getItem:k=>mem.get(k)??null};
  assert.equal(loadRecord(storage,'group').record.data.discussion,'v2 토의');
  mem.set(storageKey('group',3),'{broken');
  assert.equal(loadRecord(storage,'group').status,'error');
  mem.delete(storageKey('group',3));mem.set(storageKey('group',2),'{broken');
  assert.equal(loadRecord(storage,'group').status,'error');
});

test('v3 records migrate to v4 with identity and latest corrupt storage is protected',()=>{
 for(const kind of ['personal','group']){
  const oldData=createData(kind);delete oldData.groupNumber;
  oldData.label=kind==='personal'?'이전 이름':'3모둠';oldData.proposal='보존할 의견';
  const old={app:'interview-workroom',version:3,kind,updatedAt:new Date().toISOString(),data:oldData};
  const raw=JSON.stringify(old),mem=new Map([[storageKey(kind,3),raw]]);
  const storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
  const loaded=loadRecord(storage,kind);
  assert.equal(loaded.status,'loaded');assert.equal(loaded.record.version,4);
  assert.equal(loaded.record.data.label,oldData.label);
  assert.equal(loaded.record.data.groupNumber,kind==='personal'?'':'3');
  assert.equal(loaded.record.data.proposal,'보존할 의견');
  assert.equal(saveRecord(storage,loaded.record).ok,true);
  assert.equal(mem.get(storageKey(kind,3)),raw);
  mem.set(storageKey(kind,4),'{broken');
  assert.equal(loadRecord(storage,kind).status,'error');
 }
});

test('group selection and name survive a record roundtrip and invalid groups are rejected',()=>{
 const data=createData('personal');data.groupNumber='5';data.label='예시 이름';
 assert.deepEqual(parseRecord(JSON.stringify(makeRecord('personal',data)),'personal').data,data);
 assert.throws(()=>makeRecord('personal',{...data,groupNumber:'7'}),/모둠/);
 assert.match(formatText('personal',data),/5모둠/);
});

test('group text follows worksheet terminology and preserves prior adjustment notes only when present',()=>{
 const data=createData('group');data.members[0].strength='실천하기 쉽다';data.members[0].concern='비용이 든다';
 data.proposal='최종 의견';data.reason='최종 근거';
 const text=formatText('group',data);
 assert.match(text,/장점과 이유: 실천하기 쉽다/);assert.match(text,/단점과 이유: 비용이 든다/);
 assert.match(text,/우리 모둠의 최종 의견: 최종 의견/);assert.match(text,/최종 의견의 근거: 최종 근거/);
 assert.doesNotMatch(text,/이전에 기록한 의견 조정 내용/);
 data.changes='기존에 적었던 내용';
 assert.match(formatText('group',data),/이전에 기록한 의견 조정 내용: 기존에 적었던 내용/);
});

test('text output follows the on-screen steps and omits empty earlier-version fields', () => {
  const personal = formatText('personal', createData('personal'));
  for (const heading of ['1 듣고, 찾고, 알고 있던 것', '2 집중할 문제', '3 아이디어', '4 내 의견 정하기']) assert.match(personal, new RegExp(`^${heading}$`, 'm'));
  assert.doesNotMatch(personal, /^5 /m);
  assert.doesNotMatch(personal, /수업용 가상 인물|조사 자료 1|누가:|더 확인할 점/);
  const group = formatText('group', createData('group'));
  for (const heading of ['1 의견 나누기', '2 의견 모으기 · 장단점 검토하기', '3 의견 결정하기']) assert.match(group, new RegExp(`^${heading}$`, 'm'));
  assert.doesNotMatch(group, /^4 /m);
  assert.doesNotMatch(group, /해결하려는 문제|결정 방법과 협의 과정/);
});
