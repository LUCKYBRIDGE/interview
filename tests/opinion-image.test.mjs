import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutOpinion,exportOpinionImage,opinionImageFilename} from '../assets/opinion-image.mjs';
const measure=(text,size)=>Array.from(text).length*size;
test('opinion card is 1920 by 1080 and keeps large text within both regions',()=>{
 const result=layoutOpinion({proposal:'학교 앞 통로를 확보하자',reason:'학생과 주민이 안전하게 지나다닐 수 있기 때문이다.'},measure);
 assert.equal(result.width,1920);assert.equal(result.height,1080);
 assert.ok(result.proposal.size>=44);assert.ok(result.reason.size>=36);
 for(const part of [result.proposal,result.reason])assert.ok(part.lines.length*part.lineHeight<=part.height);
});
test('explicit line breaks and additional evidence are preserved',()=>{
 const r=layoutOpinion({proposal:'첫 줄\n둘째 줄',reason:'이유',evidence:'확인한 근거'},measure);
 assert.deepEqual(r.proposal.lines,['첫 줄','둘째 줄']);assert.match(r.reason.lines.join(''),/이유.*확인한 근거/);
});

test('short opinions use larger type and words wrap only at spaces when they fit',()=>{
 const short=layoutOpinion({proposal:'안전한 통학로',reason:'사고를 예방해요'},measure);
 assert.equal(short.proposal.size,180);assert.equal(short.reason.size,140);
 const words=['어린이보호구역','불법주정차를','줄이기위하여','안전시설을','설치합시다'];
 const result=layoutOpinion({proposal:words.join(' '),reason:words.join(' ')},measure);
 for(const part of [result.proposal,result.reason]){
  assert.deepEqual(part.lines.flatMap(line=>line.split(' ')),words);
  assert.ok(part.lines.every(line=>measure(line,part.size)<=part.width));
 }
});

test('unbroken long words retain every character and never overflow',()=>{
 const text='가'.repeat(70);
 const result=layoutOpinion({proposal:text,reason:'첫 번째 근거\n\n두 번째 근거'},measure);
 assert.equal(result.proposal.lines.join(''),text);
 assert.ok(result.proposal.lines.every(line=>measure(line,result.proposal.size)<=result.proposal.width));
 assert.ok(result.reason.lines.includes(''));
});
test('empty or excessive writing is rejected without silently clipping it',()=>{
 assert.throws(()=>layoutOpinion({proposal:'',reason:'이유'},measure),/의견/);
 assert.throws(()=>layoutOpinion({proposal:'의견',reason:''},measure),/근거/);
 assert.throws(()=>layoutOpinion({proposal:'가'.repeat(8000),reason:'이유'},measure),/줄여/);
});
test('PNG drawing contains only opinion and grounds, never identity or research notes',async()=>{
 const previous=globalThis.document,drawn=[];
 const context={fillRect(){},fillText(text){drawn.push(text);},measureText:text=>({width:Array.from(text).length*30})};
 const canvas={getContext:()=>context,toBlob:callback=>callback(new Blob(['png'],{type:'image/png'}))};
 globalThis.document={fonts:{ready:Promise.resolve()},createElement:()=>canvas};
 try{
  const result=await exportOpinionImage({label:'비공개 이름',proposal:'공유할 의견',reason:'공유할 이유',evidence:'공유할 근거',experience:'이미지에 넣지 않을 조사 과정'});
  assert.equal(result.width,1920);assert.equal(result.height,1080);assert.equal(result.blob.type,'image/png');
  assert.deepEqual(drawn,['의견','근거','공유할 의견','공유할 이유','공유할 근거']);
  canvas.getContext=()=>null;await assert.rejects(exportOpinionImage({}),/사용할 수 없습니다/);
  canvas.getContext=()=>context;canvas.toBlob=callback=>callback(null);
  await assert.rejects(exportOpinionImage({proposal:'의견',reason:'근거'}),/만들지 못했습니다/);
 }finally{globalThis.document=previous;}
});

test('image filenames accept an omitted group and retain personal name validation',()=>{
 assert.equal(opinionImageFilename('personal',{groupNumber:'3',label:'김학생'}),'3모둠_김학생_개인의견-근거.png');
 assert.equal(opinionImageFilename('group',{groupNumber:'6',label:'옛 이름'}),'6모둠_모둠의견-근거.png');
 assert.equal(opinionImageFilename('personal',{groupNumber:'1',label:' 가/나:다? '}),'1모둠_가_나_다__개인의견-근거.png');
 assert.equal(opinionImageFilename('personal',{groupNumber:'',label:'이름'}),'이름_개인의견-근거.png');
 assert.equal(opinionImageFilename('group',{groupNumber:''}),'모둠의견-근거.png');
 assert.equal(opinionImageFilename('group',{}),'모둠의견-근거.png');
 assert.throws(()=>opinionImageFilename('personal',{groupNumber:'1',label:'   '}),/이름/);
 assert.throws(()=>opinionImageFilename('group',{groupNumber:'9'}),/모둠/);
});
