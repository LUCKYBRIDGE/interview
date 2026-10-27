import {MAX_RECORD_BYTES,createData,blankMember,makeRecord,parseRecord,updateActivity,updateCriteria,importPersonalToMember,formatText,loadRecord,saveRecord,storageKey} from './workroom-state.mjs';
import {exportOpinionImage} from './opinion-image.mjs';

const $ = id => document.getElementById(id);
const form=$('activity');
let kind=location.hash==='#group'?'group':'personal';
let referenceRecord=null; let referenceSource=''; let referenceOpen=false; let opinionImageUrl=null;
let data; let storage; let blocked=false; let timer; let activityRevision=0;
try {storage=window.localStorage;}catch{storage=null;}
const cache=new Map();
const blockedKinds=new Map();
const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const at=path=>path.split('.').reduce((value,key)=>value[key],data);
function field(parent,path,title,{hint='',type='textarea',options=[],rows=3}={}) {
  const wrap=el('div',undefined,'field');const id='field-'+path.replaceAll('.','-');
  const label=el('label',title);label.htmlFor=id;
  const control=document.createElement(type==='textarea'?'textarea':type==='select'?'select':'input');
  control.id=id;control.dataset.field=path;
  if(type==='select')options.forEach(([value,text])=>{const option=el('option',text);option.value=value;control.append(option);});
  else if(type==='textarea'){control.rows=rows;control.maxLength=8000;}
  else {control.type=type;control.maxLength=8000;}
  control.value=at(path);
  const print=el('div',undefined,'print-value');print.dataset.printFor=path;
  wrap.append(label);if(hint){const note=el('small',hint);note.id=id+'-hint';control.setAttribute('aria-describedby',note.id);wrap.append(note);}
  wrap.append(control,print);parent.append(wrap);return control;
}
function check(parent,path,title) {
  const label=el('label',undefined,'check-label');const input=document.createElement('input');input.type='checkbox';input.id='field-'+path.replaceAll('.','-');input.dataset.field=path;input.checked=at(path);const text=el('span',title);const memberPath=/^members\.(\d+)\.checked$/.exec(path);if(memberPath)text.dataset.confirmationFor=memberPath[1];label.append(input,text);parent.append(label);
}
function section(id,number,title,note) {
  const root=el('section',undefined,'activity-section');root.id=id;root.append(el('span',number,'stage-label'),el('h2',title));if(note)root.append(el('p',note,'section-note'));$('activity-fields').append(root);
  const a=el('a',title);a.href='#'+id;a.addEventListener('click',event=>{event.preventDefault();root.scrollIntoView({behavior:'auto',block:'start'});root.querySelector('h2').tabIndex=-1;root.querySelector('h2').focus({preventScroll:true});});$('step-nav').append(a);return root;
}
function entry(parent,title) {const node=el('div',undefined,'entry');node.append(el('h3',title));parent.append(node);return node;}
function grid(parent){const node=el('div',undefined,'field-grid');parent.append(node);return node;}
function extra(parent,paths,title='더 기록하기') {
  const root=el('details',undefined,'extra-fields');
  const hasRecord=paths.some(path=>{const value=at(path);return typeof value==='string'&&value.trim().length>0;});
  root.append(el('summary',title+(hasRecord?' · 저장된 기록 있음':'')));
  parent.append(root);return root;
}
function renderPersonal(){
  const a=section('personal-perspectives','9~10차시','1 듣고, 찾고, 알고 있던 것','짧게 적어도 좋아요. 가상 인물의 말은 실제 사실과 구분하고, 알고 있던 내용도 확인해 보세요.');
  field(a,'perspectives.0.difficulty',data.perspectives[0].kind==='real'?'실제 주변 사람에게 들은 내용':'가상 인터뷰에서 들은 내용',{rows:2});
  if(data.perspectives[0].person||data.perspectives[0].kind==='real'){const legacy=extra(a,['perspectives.0.person'],'이전에 적은 인터뷰 정보');field(legacy,'perspectives.0.kind','이야기 구분',{type:'select',options:[['fictional','가상 인물'],['real','실제 주변 사람']]});if(data.perspectives[0].person)field(legacy,'perspectives.0.person','이전에 기록한 인물 정보',{type:'text'});}
  const source=el('div');source.id='personal-research';a.append(source);const row=grid(source);
  field(row,'sources.0.title','자료 제목',{type:'text'});field(row,'sources.0.url','출처 또는 주소',{type:'text'});field(source,'sources.0.claim','조사한 자료에서 찾은 내용',{rows:2});
  field(a,'experience','내가 알고 있던 사실',{rows:2,hint:'내 경험, 관찰한 모습, 전에 들은 내용 등을 적어요.'});
  const more=extra(a,['perspectives.0.value','perspectives.1.person','perspectives.1.difficulty','perspectives.1.value','sources.0.date','sources.0.scope','sources.0.relevance','sources.1.title','sources.1.url','sources.1.date','sources.1.claim','sources.1.relevance','sources.1.scope']);
  field(more,'perspectives.0.value','그 사람이 중요하게 여기는 것',{rows:2});
  const another=entry(more,'다른 인물');const anotherRow=grid(another);field(anotherRow,'perspectives.1.kind','이야기 구분',{type:'select',options:[['fictional','가상 인물'],['real','실제 주변 사람']]});if(data.perspectives[1].person)field(anotherRow,'perspectives.1.person','이전에 기록한 인물 정보',{type:'text'});field(another,'perspectives.1.difficulty','어려움',{rows:2});field(another,'perspectives.1.value','중요하게 여기는 것',{rows:2});
  field(more,'sources.0.date','자료를 확인한 날짜',{type:'date'});field(more,'sources.0.scope','자료의 지역·대상·시기',{type:'text'});field(more,'sources.0.relevance','내 문제와의 관련',{rows:2});
  const moreSource=entry(more,'추가 자료');field(moreSource,'sources.1.title','자료 제목',{type:'text'});field(moreSource,'sources.1.url','출처 또는 주소',{type:'text'});field(moreSource,'sources.1.date','확인 날짜',{type:'date'});field(moreSource,'sources.1.scope','지역·대상·시기',{type:'text'});field(moreSource,'sources.1.claim','알게 된 점',{rows:2});field(moreSource,'sources.1.relevance','내 문제와의 관련',{rows:2});
  const b=section('personal-problem','9~10차시','2 집중할 문제','누가, 어떤 곳에서, 어떤 어려움을 겪나요?');field(b,'problem','내가 집중할 문제',{rows:2});
  const problemMore=extra(b,['who','where','difficulty']);field(problemMore,'who','누가',{type:'text'});field(problemMore,'where','어떤 곳에서',{type:'text'});field(problemMore,'difficulty','어떤 어려움',{rows:2});
  const c=section('personal-ideas','10차시','3 아이디어','여러 방법을 짧게 적어 보세요. 아직 하나를 고르지 않아도 돼요.');field(c,'ideas.0','떠오른 아이디어',{rows:3});const ideasMore=extra(c,['ideas.1','ideas.2']);field(ideasMore,'ideas.1','다른 아이디어',{rows:2});field(ideasMore,'ideas.2','더 떠오른 아이디어',{rows:2});
  const d=section('personal-proposal','10차시','4 내 의견과 근거');field(d,'proposal','내가 제안하는 의견',{rows:2});field(d,'reason','이유와 근거',{rows:3,hint:'듣고 찾은 내용이나 알고 있던 사실과 연결해 적어요.'});const finalMore=extra(d,['evidence','uncertainties','handoff']);field(finalMore,'evidence','근거와 출처 보충',{rows:2});field(finalMore,'uncertainties','걱정되거나 더 확인할 점',{rows:2});field(finalMore,'handoff','모둠에서 함께 의논할 점',{rows:2});
  renderOpinionImage(d);
}
function renderOpinionImage(parent){
  const panel=el('div',undefined,'opinion-image-tools');panel.append(el('h3','의견과 근거 공유하기'));
  panel.append(el('p','의견과 근거만 큰 글씨의 16:9 이미지로 저장해요. 긴 글은 핵심만 정리해 주세요.','subtle'));
  const button=el('button','16:9 이미지 만들기');button.type='button';button.id='make-opinion-image';
  const status=el('p',undefined,'subtle');status.id='opinion-image-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const preview=el('div',undefined,'opinion-image-preview');preview.hidden=true;
  button.addEventListener('click',async()=>{
    const snapshot=structuredClone(data),revision=activityRevision,startedKind=kind;button.disabled=true;status.textContent='이미지를 만들고 있습니다…';preview.hidden=true;
    try{
      const result=await exportOpinionImage(snapshot);
      if(kind!==startedKind||revision!==activityRevision||JSON.stringify(snapshot)!==JSON.stringify(data))throw new Error('기록이 바뀌었습니다. 현재 의견으로 다시 만들어 주세요.');
      if(opinionImageUrl)URL.revokeObjectURL(opinionImageUrl);opinionImageUrl=URL.createObjectURL(result.blob);
      const image=el('img');image.src=opinionImageUrl;image.alt='의견과 근거 16:9 이미지 미리보기';image.width=result.width;image.height=result.height;
      const link=el('a','이미지 파일 저장하기','image-download');link.href=opinionImageUrl;link.download=startedKind==='personal'?'개인-의견과-근거-16대9.png':'모둠-의견과-근거-16대9.png';
      preview.replaceChildren(image,link);preview.hidden=false;status.textContent=`${result.width} × ${result.height} PNG입니다. 내용을 확인한 뒤 저장하세요.`;
    }catch(error){status.textContent=error.message||'이미지를 만들지 못했습니다. 다시 시도해 주세요.';}
    finally{button.disabled=false;}
  });
  panel.append(button,status,preview);parent.append(panel);
}
function referenceValues(parent,record){
  parent.replaceChildren();const personal=record.data;
  const values=[['집중할 문제',personal.problem||[personal.who,personal.where,personal.difficulty].filter(Boolean).join(' · ')],['의견',personal.proposal],['이유와 근거',[personal.reason,personal.evidence].filter(Boolean).join('\n')],[personal.perspectives[0].kind==='real'?'실제 주변 사람에게 들은 내용':'가상 인터뷰에서 들은 내용',personal.perspectives[0].difficulty],['내가 알고 있던 사실',personal.experience],['아이디어',personal.ideas.filter(Boolean).join('\n')],['남은 질문',personal.uncertainties],...personal.sources.flatMap((source,i)=>[[`조사 자료 ${i+1}`,[source.title,source.url,source.claim].filter(Boolean).join('\n')]])];
  const list=el('dl');values.forEach(([title,value])=>{if(!value?.trim())return;list.append(el('dt',title),el('dd',value));});
  if(!list.children.length)parent.append(el('p','아직 개인 활동에 적은 내용이 없습니다.','subtle'));else parent.append(list);
  const all=el('details',undefined,'reference-all');all.append(el('summary','개인 기록 전체 보기'),el('pre',formatText('personal',personal)));parent.append(all);
}
function renderPersonalReference(){
  const root=el('details',undefined,'personal-reference');root.id='personal-reference';root.open=referenceOpen;
  root.addEventListener('toggle',()=>{referenceOpen=root.open;});root.append(el('summary','개인 활동 기록 보며 토의하기'));
  root.append(el('p','모둠 기록을 작성하면서 개인의 의견과 근거를 조회해요. 조회한 내용은 모둠 기록에 자동으로 옮겨지지 않아요.','subtle'));
  const actions=el('div',undefined,'button-row');const local=el('button','이 브라우저의 개인 기록 보기');local.type='button';local.id='view-local-personal';
  const label=el('label','개인 기록 파일 열어 보기','file-button');label.htmlFor='view-personal-file';const input=el('input');input.type='file';input.id='view-personal-file';input.accept='.json,application/json';label.append(input);actions.append(local,label);root.append(actions);
  const status=el('p',undefined,'subtle');status.id='personal-reference-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');const content=el('div',undefined,'reference-content');root.append(status,content);
  const show=(record,source)=>{referenceRecord=record;referenceSource=source;status.textContent=source;referenceValues(content,record);};
  const showLocal=()=>{try{if(blockedKinds.has('personal'))throw new Error('다른 창에서 개인 기록이 바뀌었습니다. 개인 활동에서 최신 기록을 불러온 뒤 조회하세요.');const localData=cache.get('personal');const stored=localData?null:loadRecord(storage,'personal');if(stored?.status==='error')throw new Error(stored.message);const record=localData?makeRecord('personal',localData):stored?.record;if(!record)throw new Error('이 브라우저에 개인 기록이 없습니다. 개인 활동을 먼저 작성하거나 기록 파일을 열어 보세요.');show(record,'이 브라우저의 개인 활동 기록 · 읽기 전용');}catch(error){status.textContent=error.message;}};
  local.addEventListener('click',showLocal);
  input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;const revision=activityRevision;try{if(file.size>MAX_RECORD_BYTES)throw new Error('2MB 이하의 개인 기록 파일을 선택하세요.');const record=parseRecord(await file.text(),'personal');if(kind!=='group'||revision!==activityRevision)throw new Error('활동이 바뀌었습니다. 모둠 토의에서 다시 열어 주세요.');show(record,`개인 기록 파일: ${file.name} · 읽기 전용`);}catch(error){status.textContent=`조회하지 못했습니다. ${error.message}`;}finally{input.value='';}});
  if(referenceRecord&&referenceSource.startsWith('개인 기록 파일:'))show(referenceRecord,referenceSource);else showLocal();
  $('activity-fields').append(root);
}
function renderCriteria(parent){
  const root=el('fieldset',undefined,'criteria criteria-editor');root.append(el('legend','우리 모둠의 검토 기준'));
  const list=el('div');const status=el('p',undefined,'subtle');status.id='criteria-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const changeList=(next,focusIndex)=>{try{clearTimeout(timer);data=updateCriteria(data,next);cache.set(kind,data);render();save();const current=$('criteria-status');current.textContent='검토 기준을 바꿨습니다. 이 기준으로 의견을 다시 살펴보세요.';if(focusIndex!==undefined)$(`field-criteriaList-${focusIndex}`)?.focus();else $('add-criterion')?.focus();}catch(error){status.textContent=error.message;}};
  data.criteriaList.forEach((value,i)=>{const row=el('div',undefined,'criterion-row');const control=field(row,`criteriaList.${i}`,`검토 기준 ${i+1}`,{type:'text'});control.maxLength=200;const remove=el('button','삭제');remove.type='button';remove.setAttribute('aria-label',`검토 기준 ${i+1} 삭제`);remove.addEventListener('click',()=>changeList(data.criteriaList.filter((_,index)=>index!==i)));row.append(remove);list.append(row);});
  if(!data.criteriaList.length)list.append(el('p','검토 기준이 없습니다. 모둠에서 사용할 기준을 추가해 주세요.','subtle'));
  const add=el('button','검토 기준 추가');add.type='button';add.id='add-criterion';add.disabled=data.criteriaList.length>=12;add.addEventListener('click',()=>changeList([...data.criteriaList,''],data.criteriaList.length));
  root.append(list,add,status);if(data.criteria.extra&&!data.criteriaList.includes(data.criteria.extra)){const archive=el('details',undefined,'extra-fields');archive.append(el('summary','이전에 적은 추가 기준'),el('p',data.criteria.extra));root.append(archive);}parent.append(root);
}
function memberImport(parent,index){
  const label=el('label',undefined,'file-button');label.htmlFor=`import-personal-${index}`;
  label.append(el('span','개인 기록을 이 모둠원 칸에 불러오기'));
  const input=document.createElement('input');input.id=`import-personal-${index}`;input.setAttribute('aria-label',`모둠원 ${index+1} 개인 기록을 이 모둠원 칸에 불러오기`);input.type='file';input.accept='.json,application/json';label.append(input);
  const status=el('p',undefined,'subtle');status.id=`member-import-status-${index}`;status.setAttribute('role','status');status.setAttribute('aria-live','polite');input.setAttribute('aria-describedby',status.id);
  input.addEventListener('change',async()=>{
    const file=input.files?.[0];if(!file)return;const started=data;const startedMode=activityRevision;
    try{
      if(file.size>MAX_RECORD_BYTES)throw new Error('2MB 이하의 개인 기록 파일을 선택하세요.');
      const personal=parseRecord(await file.text(),'personal');
      if(kind!=='group'||data!==started||activityRevision!==startedMode)throw new Error('기록이나 활동이 바뀌었습니다. 현재 모둠원 칸에서 파일을 다시 선택하세요.');
      const next=importPersonalToMember(data,index,personal);
      if(!confirm(`${index+1}번 모둠원의 이름·문제·제안·이유·근거를 개인 기록으로 바꾸고 이 의견의 검토 기록을 비울까요? 다른 모둠원의 기록과 공동 제안은 유지하고 최종 확인은 모두 해제합니다.`)){status.textContent='불러오기를 취소했습니다. 현재 기록을 유지합니다.';return;}
      clearTimeout(timer);data=next;cache.set(kind,data);render();save();
      $(`member-import-status-${index}`).textContent='개인 의견과 출처를 불러왔습니다. 이 의견을 다시 검토하고 모둠원들이 최종 내용을 확인하세요.';
    }catch(error){const current=$(`member-import-status-${index}`);if(kind==='group'&&current)current.textContent=`불러오지 못했습니다. ${error.message}`;else $('tool-status').textContent=`개인 기록을 불러오지 못했습니다. ${error.message}`;}
    finally{input.value='';}
  });
  parent.append(label,status);
}
function renderMemberCount(parent){
  const count=el('div',undefined,'member-count');const label=el('label','모둠원 수');label.htmlFor='member-count';const select=document.createElement('select');select.id='member-count';
  [3,4,5].forEach(n=>{const option=el('option',`${n}명`);option.value=n;select.append(option);});select.value=data.members.length;
  select.addEventListener('change',()=>{const next=Number(select.value);if(next<data.members.length&&!confirm('마지막 모둠원 기록이 삭제됩니다. 기록 파일을 보관했나요? 모둠원 수를 줄일까요?')){select.value=data.members.length;return;}const members=next<data.members.length?data.members.slice(0,next):[...data.members,...Array.from({length:next-data.members.length},blankMember)];data={...data,members:members.map(member=>({...member,checked:false}))};cache.set(kind,data);render();save();});count.append(label,select);parent.append(count);
}
function renderGroup(){
  const a=section('group-sharing','11차시','1 의견 나누기','한 사람씩 설명하고 이름·의견·이유만 짧게 남겨요.');renderMemberCount(a);
  data.members.forEach((_,i)=>{
    const box=entry(a,`모둠원 ${i+1}`);const row=grid(box);row.classList.add('sharing-grid');field(row,`members.${i}.name`,'이름·별칭',{type:'text'});field(row,`members.${i}.proposal`,'의견',{rows:2});field(row,`members.${i}.reason`,'이유',{rows:2});
    const more=extra(box,[`members.${i}.problem`,`members.${i}.source`],'개인 기록 불러오기 · 더 기록하기');memberImport(more,i);field(more,`members.${i}.problem`,'해결하려는 문제',{rows:2});field(more,`members.${i}.source`,'근거와 출처',{rows:2});
  });
  const focus=el('div');focus.id='group-focus';a.append(focus);field(focus,'focus','함께 집중할 문제',{rows:2});const focusMore=extra(focus,['focusReason']);field(focusMore,'focusReason','이 문제를 정한 까닭',{rows:2});
  const b=section('group-gathering','11~12차시','2 의견 모으기','검토 기준으로 좋은 점과 걱정되는 점을 이야기해요. 기준은 모둠에 맞게 고치거나 더하고 지울 수 있어요.');
  renderCriteria(b);field(b,'discussion','함께 살펴본 좋은 점과 걱정',{rows:4});
  const reviewPaths=data.members.flatMap((_,i)=>['strength','concern','question','revision'].map(key=>`members.${i}.${key}`));const reviews=extra(b,reviewPaths,'의견별로 더 기록하기');
  data.members.forEach((m,i)=>{const box=entry(reviews,`${i+1}번 의견`);const note=el('p',`${m.name||`모둠원 ${i+1}`}의 제안: ${m.proposal||'앞에서 적어 주세요.'}`,'subtle');note.dataset.proposalFor=i;box.append(note);field(box,`members.${i}.strength`,'좋은 점과 이유',{rows:2});field(box,`members.${i}.concern`,'걱정과 이유',{rows:2});field(box,`members.${i}.question`,'확인할 점',{rows:2});field(box,`members.${i}.revision`,'고치거나 더할 점',{rows:2});});
  const c=section('group-decision','12차시','3 의견 결정하기','충분히 이야기한 뒤 공동 제안을 정해요.');field(c,'proposal','우리 모둠의 최종 제안',{rows:2});field(c,'reason','선택한 이유와 근거',{rows:3});field(c,'changes','친구 의견을 반영해 바뀐 점',{rows:2});field(c,'remaining','남은 걱정이나 확인할 점',{rows:2});
  const ready=extra(c,['evidence','method','clarity','next'],'발표 전에 더 살펴보기');ready.id='group-share-ready';field(ready,'evidence','근거와 출처 보충',{rows:2});field(ready,'method','결정 방법',{rows:2});field(ready,'clarity','설명을 더 분명히 할 부분',{rows:2});field(ready,'next','13차시 전에 더 알아볼 점',{rows:2});
  const conf=el('div',undefined,'confirmations');data.members.forEach((m,i)=>check(conf,`members.${i}.checked`,`${m.name||`모둠원 ${i+1}`} 최종 내용 확인`));ready.append(conf);
  renderOpinionImage(c);
}
function render(){
  $('mode-personal').setAttribute('aria-pressed',String(kind==='personal'));$('mode-group').setAttribute('aria-pressed',String(kind==='group'));
  $('activity-title').textContent=kind==='personal'?'의견 마련하기':'모둠 토의하기';
  if(opinionImageUrl){URL.revokeObjectURL(opinionImageUrl);opinionImageUrl=null;}
  $('activity-fields').replaceChildren();$('step-nav').replaceChildren();
  const identity=el('div',undefined,'identity');field(identity,'label',kind==='personal'?'기록 이름 또는 번호':'모둠 이름 또는 번호',{type:'text'});$('activity-fields').append(identity);
  if(kind==='personal')renderPersonal();else {renderPersonalReference();renderGroup();}
  updatePrint();
}
function warning(message){blockedKinds.set(kind,message);blocked=true;$('storage-warning').hidden=false;$('storage-warning-text').textContent=message;$('save-status').textContent='자동 저장을 멈췄습니다. 기록 파일을 먼저 보관하세요.';}
function load(){
  if(cache.has(kind)){data=cache.get(kind);blocked=false;$('storage-warning').hidden=true;$('save-status').textContent='작성 중인 기록입니다. 지금 저장하거나 파일로 보관할 수 있습니다.';if(blockedKinds.has(kind))warning(blockedKinds.get(kind));return;}
  const result=loadRecord(storage,kind);blockedKinds.delete(kind);blocked=false;$('storage-warning').hidden=true;
  data=result.record?.data||createData(kind);cache.set(kind,data);
  if(result.status==='error')warning(result.message);
  else $('save-status').textContent=result.status==='loaded'?`저장된 기록을 불러왔습니다 · ${new Date(result.record.updatedAt).toLocaleTimeString('ko-KR')}`:'새 활동입니다. 작성하면 이 브라우저에 자동 저장합니다.';
}
function save(){
  clearTimeout(timer);if(blocked)return false;
  const result=saveRecord(storage,makeRecord(kind,data));
  if(result.ok){$('save-status').textContent=`이 브라우저에 저장했습니다 · ${new Date().toLocaleTimeString('ko-KR')}`;return true;}
  warning(result.message);return false;
}
function updatePrint(){
  if(kind==='personal'){const label=document.querySelector('label[for="field-perspectives-0-difficulty"]');if(label)label.textContent=data.perspectives[0].kind==='real'?'실제 주변 사람에게 들은 내용':'가상 인터뷰에서 들은 내용';}
  document.querySelectorAll('input[type=checkbox][data-field]').forEach(input=>{input.checked=at(input.dataset.field);});
  document.querySelectorAll('[data-confirmation-for]').forEach(node=>{const i=Number(node.dataset.confirmationFor);node.textContent=`${data.members[i].name||`모둠원 ${i+1}`} 최종 내용 확인`;});
  document.querySelectorAll('[data-print-for]').forEach(node=>{const path=node.dataset.printFor;let value=at(path);const input=document.querySelector(`[data-field="${path}"]`);if(input?.tagName==='SELECT')value=input.selectedOptions[0]?.textContent;node.textContent=value||' ';});
  document.querySelectorAll('[data-proposal-for]').forEach(node=>{const i=Number(node.dataset.proposalFor),m=data.members[i];node.textContent=`${m.name||`모둠원 ${i+1}`}의 제안: ${m.proposal||'앞의 의견 나누기에 제안을 적어 주세요.'}`;});
}
form.addEventListener('submit',event=>event.preventDefault());
form.addEventListener('input',event=>{
  const target=event.target;if(!target.dataset.field)return;
  if(opinionImageUrl){URL.revokeObjectURL(opinionImageUrl);opinionImageUrl=null;const preview=document.querySelector('.opinion-image-preview');if(preview){preview.replaceChildren();preview.hidden=true;}if($('opinion-image-status'))$('opinion-image-status').textContent='내용이 바뀌었습니다. 현재 의견으로 이미지를 다시 만들어 주세요.';}
  const hadConfirmation=kind==='group'&&data.members.some(member=>member.checked);try{data=updateActivity(kind,data,target.dataset.field,target.type==='checkbox'?target.checked:target.value);}catch(error){$('tool-status').textContent=error.message;return;}if(hadConfirmation&&kind==='group'&&!data.members.some(member=>member.checked))$('tool-status').textContent='내용이 바뀌어 최종 확인 표시를 해제했습니다. 모둠원들이 다시 확인하세요.';cache.set(kind,data);updatePrint();
  if(!blocked){$('save-status').textContent='기록을 저장하고 있습니다…';clearTimeout(timer);timer=setTimeout(save,350);}
});
function switchMode(next){if(next===kind)return;activityRevision+=1;save();kind=next;load();render();$('tool-status').textContent='';$('copy-fallback').hidden=true;history.replaceState(null,'',`#${kind}`);$('activity-title').focus();}
$('mode-personal').addEventListener('click',()=>switchMode('personal'));$('mode-group').addEventListener('click',()=>switchMode('group'));
window.addEventListener('hashchange',()=>{if(['#personal','#group'].includes(location.hash))switchMode(location.hash.slice(1));});
$('save-now').addEventListener('click',()=>{if(blocked){$('storage-warning').scrollIntoView({block:'center'});$('resume-saving').focus();}else save();});
$('resume-saving').addEventListener('click',()=>{if(!confirm('현재 화면의 내용으로 이 활동의 저장 기록을 바꿀까요? 다른 기록이 있다면 먼저 파일로 보관하세요.'))return;blockedKinds.delete(kind);blocked=false;$('storage-warning').hidden=true;save();});
$('reload-record').addEventListener('click',()=>{if(!confirm('현재 화면의 저장되지 않은 내용 대신 브라우저에 저장된 기록을 읽을까요?'))return;clearTimeout(timer);cache.delete(kind);load();render();});
window.addEventListener('storage',event=>{
  const message='다른 창에서 이 활동의 저장 기록이 바뀌었습니다. 이 창의 내용으로 자동 덮어쓰지 않습니다. 파일로 보관하거나 저장된 기록을 다시 읽으세요.';
  for(const targetKind of ['personal','group']) {
    if(event.key!==null&&event.key!==storageKey(targetKind)&&event.key!==storageKey(targetKind,1)&&event.key!==storageKey(targetKind,2))continue;
    if(targetKind===kind){clearTimeout(timer);warning(message);}
    else if(cache.has(targetKind))blockedKinds.set(targetKind,message);
  }
});
window.addEventListener('pagehide',()=>save());
window.addEventListener('beforeprint',()=>{updatePrint();$('print-summary').textContent=formatText(kind,data);});
function download(text,extension,mime){
  const blob=new Blob([text],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${kind==='personal'?'개인의견-9-10차시':'모둠토의-11-12차시'}.${extension}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('tool-status').textContent='내려받기를 요청했습니다. 다운로드 폴더에서 파일을 확인하세요.';
}
$('export-json').addEventListener('click',()=>download(JSON.stringify(makeRecord(kind,data),null,2),'json','application/json'));
$('export-text').addEventListener('click',()=>download(formatText(kind,data),'txt','text/plain;charset=utf-8'));
$('copy-text').addEventListener('click',async()=>{const text=formatText(kind,data);try{await navigator.clipboard.writeText(text);$('tool-status').textContent='현재 활동 기록을 복사했습니다.';$('copy-fallback').hidden=true;}catch{$('copy-fallback').hidden=false;$('copy-content').value=text;$('copy-content').focus();$('copy-content').select();$('tool-status').textContent='아래 글을 직접 복사할 수 있습니다.';}});
$('print-record').addEventListener('click',()=>{updatePrint();$('print-summary').textContent=formatText(kind,data);window.print();});
$('import-json').addEventListener('change',async event=>{
  const input=event.target;const file=input.files?.[0];const importKind=kind;const started=data;const startedMode=activityRevision;if(!file)return;
  try{if(file.size>MAX_RECORD_BYTES)throw new Error('2MB 이하의 기록 파일을 선택하세요.');const record=parseRecord(await file.text(),importKind);if(kind!==importKind||data!==started||activityRevision!==startedMode)throw new Error('활동이나 기록이 바뀌었습니다. 불러올 활동에서 파일을 다시 선택하세요.');if(!confirm('현재 활동 내용을 이 파일의 기록으로 바꿀까요? 필요한 현재 기록은 먼저 내려받아 보관하세요.')){$('tool-status').textContent='불러오기를 취소했습니다.';return;}clearTimeout(timer);data=record.data;cache.set(kind,data);blockedKinds.delete(kind);blocked=false;$('storage-warning').hidden=true;render();save();$('tool-status').textContent='기록 파일을 불러왔습니다. 저장 상태도 확인하세요.';}
  catch(error){$('tool-status').textContent=`불러오지 못했습니다. ${error.message}`;}
  finally{input.value='';}
});
load();render();
