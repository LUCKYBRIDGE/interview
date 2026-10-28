const WIDTH=1920, HEIGHT=1080;
export function opinionImageFilename(kind,data){
 if(!['personal','group'].includes(kind))throw new Error('활동 종류를 확인하세요.');
 const group=data.groupNumber??'';
 if(group!==''&&!['1','2','3','4','5','6'].includes(group))throw new Error('모둠은 1~6모둠 중에서 선택하세요.');
 const prefix=group?`${group}모둠_`:'';
 if(kind==='group')return `${prefix}모둠의견-근거.png`;
 const name=Array.from((data.label||'').trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').replace(/[. ]+$/g,'')).slice(0,60).join('');
 return `${prefix}${name?name+'_':''}개인의견-근거.png`;
}
function wrap(text,size,width,measure){
 const lines=[];
 for(const paragraph of text.split('\n')){
  let line='';
  // Prefer spaces between words; split only a word wider than the whole card.
  for(const word of paragraph.match(/\S+/gu)||[]){
   const candidate=line?`${line} ${word}`:word;
   if(measure(candidate,size)<=width){line=candidate;continue;}
   if(line){lines.push(line);line='';}
   if(measure(word,size)<=width){line=word;continue;}
   const chars=typeof Intl.Segmenter==='function'
    ? Array.from(new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(word),part=>part.segment)
    : Array.from(word);
   for(const char of chars){
    if(line&&measure(line+char,size)>width){lines.push(line);line='';}
    line+=char;
   }
  }
  lines.push(line);
 }
 return lines;
}
function fit(text,region,measure,min,max){
 for(let size=max;size>=min;size-=2){
  const lines=wrap(text,size,region.width,measure),lineHeight=Math.ceil(size*1.28);
  if(lines.length*lineHeight<=region.height)return {...region,size,lines,lineHeight};
 }
 throw new Error('큰 글씨로 한 장에 담기에는 내용이 많아요. 의견이나 이유·근거를 짧게 줄여 주세요. 원래 기록은 그대로 있습니다.');
}
export function layoutOpinion(data,measure){
 const proposal=data.proposal?.trim(),reason=[data.reason?.trim(),data.evidence?.trim()].filter(Boolean).join('\n');
 if(!proposal)throw new Error('이미지로 저장할 의견을 먼저 적어 주세요.');
 if(!reason)throw new Error('이유와 근거를 먼저 적어 주세요.');
 return {width:WIDTH,height:HEIGHT,
  proposal:fit(proposal,{x:112,y:150,width:1696,height:310},measure,44,180),
  reason:fit(reason,{x:112,y:600,width:1696,height:360},measure,40,140)};
}
export async function exportOpinionImage(data){
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('이 브라우저에서 이미지 저장을 사용할 수 없습니다.');
 const family='"Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
 const measure=(text,size)=>{ctx.font=`bold ${size}px ${family}`;return ctx.measureText(text).width;};
 const layout=layoutOpinion(data,measure);
 ctx.fillStyle='#edf8f2';ctx.fillRect(0,0,WIDTH,HEIGHT);
 ctx.fillStyle='#ffffff';ctx.fillRect(64,64,1792,432);ctx.fillRect(64,528,1792,488);
 ctx.textBaseline='top';ctx.fillStyle='#21664b';ctx.font=`bold 30px ${family}`;
 ctx.font=`bold 28px ${family}`;ctx.fillText('의견',112,92);ctx.fillText('근거',112,550);
 ctx.fillStyle='#182632';
 for(const part of [layout.proposal,layout.reason]){
  ctx.font=`bold ${part.size}px ${family}`;
  part.lines.forEach((line,i)=>ctx.fillText(line,part.x,part.y+i*part.lineHeight));
 }
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
 if(!blob)throw new Error('이미지를 만들지 못했습니다. 다시 시도해 주세요.');
 return {blob,width:WIDTH,height:HEIGHT};
}
