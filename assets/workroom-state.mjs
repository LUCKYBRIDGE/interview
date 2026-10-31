export const VERSION = 4;
export const MAX_RECORD_BYTES = 2000000;
const APP = 'interview-workroom';
const MAX_TEXT = 8000;
export const DEFAULT_CRITERIA = Object.freeze(['실천 가능한 방법인가?','문제 해결에 효과적인가?','여러 사람에게 도움이 되는가?']);
export const MAX_CRITERIA = 12;
export const MAX_CRITERION_LENGTH = 200;
const blankPerspective = () => ({kind:'fictional',person:'',difficulty:'',value:''});
const blankSource = () => ({title:'',url:'',date:'',claim:'',relevance:'',scope:''});
export const blankMember = () => ({name:'',problem:'',proposal:'',reason:'',source:'',strength:'',concern:'',question:'',revision:'',checked:false});

export function createData(kind) {
  if (kind === 'personal') return {label:'',groupNumber:'',perspectives:[blankPerspective(),blankPerspective()],experience:'',sources:[blankSource(),blankSource()],who:'',where:'',difficulty:'',problem:'',ideas:['','',''],proposal:'',reason:'',evidence:'',uncertainties:'',handoff:''};
  if (kind === 'group') return {label:'',groupNumber:'',focus:'',focusReason:'',discussion:'',members:Array.from({length:4},blankMember),criteria:{feasible:true,effective:true,shared:true,extra:''},criteriaList:[...DEFAULT_CRITERIA],proposal:'',reason:'',evidence:'',changes:'',remaining:'',method:'',clarity:'',next:''};
  throw new Error('알 수 없는 활동 종류입니다.');
}
export function storageKey(kind,version=VERSION) { createData(kind); return `${APP}-v${version}-${kind}`; }
function plain(value) { return value !== null && typeof value==='object' && !Array.isArray(value) && Object.getPrototypeOf(value)===Object.prototype; }
function checkObject(value, template) {
  if (!plain(value) || Object.keys(value).sort().join('|') !== Object.keys(template).sort().join('|')) throw new Error('활동 기록의 항목이 맞지 않습니다.');
  for (const key of Object.keys(template)) {
    const expected=template[key], actual=value[key];
    if (typeof expected==='string' && (typeof actual!=='string' || actual.length>MAX_TEXT)) throw new Error('글 항목은 8000자 이내여야 합니다.');
    if (typeof expected==='boolean' && typeof actual!=='boolean') throw new Error('확인 항목이 올바르지 않습니다.');
    if (plain(expected)) checkObject(actual,expected);
  }
}
function validateData(kind,data) {
  const template=createData(kind); checkObject(data,template);
  if(!['','1','2','3','4','5','6'].includes(data.groupNumber))throw new Error('모둠은 1~6모둠 중에서 선택하세요.');
  if(kind==='personal') {
    if(!Array.isArray(data.perspectives)||data.perspectives.length!==2||!Array.isArray(data.sources)||data.sources.length!==2||!Array.isArray(data.ideas)||data.ideas.length!==3) throw new Error('개인 활동의 기록 수가 맞지 않습니다.');
    data.perspectives.forEach(p=>{checkObject(p,blankPerspective());if(!['fictional','real'].includes(p.kind))throw new Error('인터뷰 출처 구분이 올바르지 않습니다.');});
    data.sources.forEach(s=>checkObject(s,blankSource()));
    data.ideas.forEach(s=>{if(typeof s!=='string'||s.length>MAX_TEXT)throw new Error('아이디어 항목이 올바르지 않습니다.');});
  } else {
    if(!Array.isArray(data.members)||data.members.length<3||data.members.length>5)throw new Error('모둠원 기록은 3~5명이어야 합니다.');
    data.members.forEach(m=>checkObject(m,blankMember()));
    validateCriteria(data.criteriaList);
  }
  return data;
}
function validateCriteria(list) {
  if(!Array.isArray(list)||list.length>MAX_CRITERIA||list.some(value=>typeof value!=='string'||value.length>MAX_CRITERION_LENGTH))throw new Error('검토 기준은 12개 이내, 각 200자 이내로 적어 주세요.');
}
function migrateCriteria(criteria) {
  const enabled=[criteria.feasible,criteria.effective,criteria.shared];
  return [...DEFAULT_CRITERIA.filter((_,i)=>enabled[i]),...(criteria.extra.trim()&&criteria.extra.length<=MAX_CRITERION_LENGTH?[criteria.extra]:[])];
}
export function updateCriteria(group,list) {
  validateData('group',group);validateCriteria(list);
  return {...structuredClone(group),criteriaList:[...list],members:group.members.map(member=>({...member,checked:false}))};
}
export function makeRecord(kind,data,updatedAt=new Date().toISOString()) {
  validateData(kind,data);
  if(typeof updatedAt!=='string'||!Number.isFinite(Date.parse(updatedAt)))throw new Error('저장 시간이 올바르지 않습니다.');
  return {app:APP,version:VERSION,kind,updatedAt,data:structuredClone(data)};
}
export function parseRecord(text,kind) {
  if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>MAX_RECORD_BYTES)throw new Error('파일 크기가 너무 큽니다. 2MB 이하의 활동 기록을 선택하세요.');
  const record=JSON.parse(text);
  if(!plain(record)||Object.keys(record).sort().join('|')!=='app|data|kind|updatedAt|version'||record.app!==APP||![1,2,3,VERSION].includes(record.version)||record.kind!==kind)throw new Error('현재 활동과 맞는 버전의 기록 파일이 아닙니다. 개인과 모둠 파일을 확인하세요.');
  if(record.version<VERSION){
    const {groupNumber:unusedGroup,...legacyTemplate}=createData(kind);
    if(kind==='group'&&record.version<3){
      delete legacyTemplate.criteriaList;
      if(record.version===1)delete legacyTemplate.discussion;
    }
    checkObject(record.data,legacyTemplate);
    const labelMatch=kind==='group'?/^([1-6])(?:모둠)?$/.exec(record.data.label.trim()):null;
    const migrated={...record.data,groupNumber:labelMatch?.[1]||''};
    if(kind==='group'&&record.version<3){
      migrated.discussion=record.version===1?'':record.data.discussion;
      migrated.criteriaList=migrateCriteria(record.data.criteria);
    }
    return makeRecord(kind,migrated,record.updatedAt);
  }
  return makeRecord(kind,record.data,record.updatedAt);
}
export function updateValue(data,path,value) {
  const keys=path.split('.'); const result=structuredClone(data); let target=result;
  for (const key of keys.slice(0,-1)) {
    if(!Object.hasOwn(target,key)||['__proto__','constructor','prototype'].includes(key))throw new Error('없는 기록 항목입니다.');
    target=target[key];
  }
  const key=keys.at(-1);
  if(!Object.hasOwn(target,key)||typeof target[key]!==typeof value||typeof value==='object')throw new Error('기록 값의 종류가 맞지 않습니다.');
  target[key]=value; return result;
}
export function updateActivity(kind,data,path,value) {
  const next=updateValue(data,path,value);
  if(kind==='group'&&path.startsWith('criteriaList.'))validateCriteria(next.criteriaList);
  if(kind!=='group'||path==='label'||path==='groupNumber'||/^members\.\d+\.checked$/.test(path))return next;
  return {...next,members:next.members.map(member=>({...member,checked:false}))};
}
export function importPersonalToMember(group,index,record) {
  validateData('group',group);
  if(!Number.isInteger(index)||index<0||index>=group.members.length)throw new Error('불러올 모둠원 칸을 확인하세요.');
  const personal=parseRecord(JSON.stringify(record),'personal').data;
  const sources=personal.sources.filter(source=>Object.values(source).some(Boolean)).map((source,i)=>[
    `조사 자료 ${i+1}`,line('제목',source.title),line('출처',source.url),line('확인 날짜',source.date),line('자료의 대상과 범위',source.scope),line('확인한 내용',source.claim),line('문제와의 관련',source.relevance)
  ].join('\n'));
  const source=[personal.evidence,...sources].filter(Boolean).join('\n\n');
  if(source.length>MAX_TEXT)throw new Error('근거와 출처가 한 칸의 8000자를 넘습니다. 개인 기록에서 핵심 내용을 정리한 뒤 다시 불러오세요. 원본 내용은 바꾸지 않았습니다.');
  const member={...blankMember(),name:personal.label,problem:personal.problem||[personal.who,personal.where,personal.difficulty].filter(Boolean).join(' · '),proposal:personal.proposal,reason:personal.reason,source};
  const next={...group,members:group.members.map((old,i)=>i===index?member:{...old,checked:false})};
  validateData('group',next);return next;
}
export function loadRecord(storage,kind) {
  try {
    for(const version of [VERSION,3,2,1]) {
      const text=storage.getItem(storageKey(kind,version));
      if(text!==null)return {status:'loaded',record:parseRecord(text,kind)};
    }
    return {status:'empty'};
  }
  catch { return {status:'error',message:'저장 기록을 읽을 수 없습니다. 기존 기록을 덮어쓰지 않습니다. 파일을 불러오거나 저장을 다시 시작하세요.'}; }
}
export function saveRecord(storage,record) {
  try { const checked=parseRecord(JSON.stringify(record),record.kind);storage.setItem(storageKey(record.kind),JSON.stringify(checked));return {ok:true}; }
  catch { return {ok:false,message:'이 브라우저에 저장하지 못했습니다. 기록 파일을 내려받아 보관하세요.'}; }
}
const line=(label,value)=>`${label}: ${value||'(아직 기록하지 않음)'}`;
// 화면에 없는 이전 버전 항목은 내용이 있을 때만 출력한다.
const filled=value=>typeof value==='string'&&value.trim().length>0;
const optional=(label,value)=>filled(value)?[line(label,value)]:[];
export function formatText(kind,data) {
  validateData(kind,data);
  if(kind==='personal'){
    const perspectives=data.perspectives.filter(p=>[p.person,p.difficulty,p.value].some(filled)).flatMap((p,i)=>[`${i+1}. ${p.kind==='fictional'?'수업용 가상 인물':'실제 주변 사람'} · ${p.person||'인물 미기록'}`,line('어려움',p.difficulty),line('중요하게 여기는 것',p.value)]);
    const sources=data.sources.filter(s=>Object.values(s).some(filled)).flatMap((s,i)=>[`조사 자료 ${i+1}. ${s.title||'자료 제목 미기록'}`,line('주소 또는 발행 기관',s.url),line('확인 날짜',s.date),line('대상과 지역 및 시기',s.scope),line('확인한 내용',s.claim),line('내 문제와의 관련',s.relevance)]);
    return [
      '개인 의견 마련하기 | 9~10차시',line('모둠',data.groupNumber?data.groupNumber+'모둠':''),line('이름',data.label),'',
      '1 듣고, 찾고, 알고 있던 것',line('듣고, 찾고, 알고 있던 것',data.experience),...perspectives,...sources,'',
      '2 집중할 문제',line('내가 집중할 문제',data.problem),...optional('누가',data.who),...optional('어디에서',data.where),...optional('어떤 어려움',data.difficulty),'',
      '3 아이디어',line('아이디어',data.ideas[0]),...optional('아이디어 2',data.ideas[1]),...optional('아이디어 3',data.ideas[2]),'',
      '4 내 의견 정하기',line('내 의견',data.proposal),line('이유나 근거',data.reason),...optional('연결한 자료와 근거',data.evidence),...optional('더 확인할 점',data.uncertainties),...optional('모둠에서 함께 살펴볼 점',data.handoff),
      '', '가상 인물의 이야기는 실제 지역 현황의 증거가 아닙니다.'
    ].join('\n');
  }
  return ['모둠 의견 나누기 모으기 결정하기 | 11~12차시',line('모둠',data.groupNumber?data.groupNumber+'모둠':data.label),'',
    '1 의견 나누기',...data.members.flatMap((m,i)=>[`${i+1}. ${m.name||'모둠원'}`,line('제안하는 의견',m.proposal),line('장점과 이유',m.strength),line('단점과 이유',m.concern),...optional('해결하려는 문제',m.problem),...optional('개인 의견의 이유·근거 (참고)',m.reason),...optional('근거와 출처',m.source)]),'',
    ...(data.focus||data.focusReason?['이전에 정리한 문제 기록',data.focus,data.focusReason,'']:[]),
    '2 의견 모으기 · 장단점 검토하기',`검토 기준: ${data.criteriaList.filter(value=>value.trim()).join(', ')||'(정한 기준 없음)'}`,line('함께 비교한 장단점과 그 이유',data.discussion),
    ...data.members.flatMap((m,i)=>{const notes=[...optional('더 물어보거나 확인할 점',m.question),...optional('고치거나 더할 점',m.revision)];return notes.length?[`${i+1}. ${m.name||'모둠원'}의 의견 더 살펴보기`,...notes]:[];}),'',
    '3 의견 결정하기',line('우리 모둠의 최종 의견',data.proposal),line('최종 의견의 근거',data.reason),line('남은 걱정과 다른 의견',data.remaining),...optional('근거와 출처 보충',data.evidence),...(data.changes?[line('이전에 기록한 의견 조정 내용',data.changes)]:[]),...optional('결정 방법과 협의 과정',data.method),...optional('전달을 위해 보완할 부분',data.clarity),...optional('다음에 확인하거나 할 일',data.next),
    `최종 내용 확인: ${data.members.map((m,i)=>`${m.name||`모둠원 ${i+1}`} ${m.checked?'확인함':'아직 확인 전'}`).join(' / ')}`,
    '', 'AI는 설명의 명확성을 점검할 수 있습니다. 제안과 근거는 모둠이 직접 결정합니다.'
  ].join('\n');
}
