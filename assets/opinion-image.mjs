const WIDTH=1920, HEIGHT=1080;
function wrap(text,size,width,measure){
 const lines=[];
 for(const paragraph of text.split('\n')){
  let line='';
  for(const char of Array.from(paragraph)){
   if(line&&measure(line+char,size)>width){lines.push(line);line='';}
   line+=char;
  }
  lines.push(line);
 }
 return lines;
}
function fit(text,region,measure,min,max){
 for(let size=max;size>=min;size-=2){
  const lines=wrap(text,size,region.width,measure),lineHeight=Math.ceil(size*1.38);
  if(lines.length*lineHeight<=region.height)return {...region,size,lines,lineHeight};
 }
 throw new Error('큰 글씨로 한 장에 담기에는 내용이 많아요. 의견이나 이유·근거를 짧게 줄여 주세요. 원래 기록은 그대로 있습니다.');
}
export function layoutOpinion(data,measure){
 const proposal=data.proposal?.trim(),reason=[data.reason?.trim(),data.evidence?.trim()].filter(Boolean).join('\n');
 if(!proposal)throw new Error('이미지로 저장할 의견을 먼저 적어 주세요.');
 if(!reason)throw new Error('이유와 근거를 먼저 적어 주세요.');
 return {width:WIDTH,height:HEIGHT,
  proposal:fit(proposal,{x:112,y:150,width:1696,height:310},measure,44,72),
  reason:fit(reason,{x:112,y:600,width:1696,height:360},measure,36,52)};
}
export async function exportOpinionImage(data){
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('이 브라우저에서 이미지 저장을 사용할 수 없습니다.');
 const family='"Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
 const measure=(text,size)=>{ctx.font=`bold ${size}px ${family}`;return ctx.measureText(text).width;};
 const layout=layoutOpinion(data,measure);
 ctx.fillStyle='#f4f6f8';ctx.fillRect(0,0,WIDTH,HEIGHT);
 ctx.fillStyle='#ffffff';ctx.fillRect(64,64,1792,432);ctx.fillRect(64,528,1792,488);
 ctx.textBaseline='top';ctx.fillStyle='#263f50';ctx.font=`bold 30px ${family}`;
 ctx.font=`bold 28px ${family}`;ctx.fillText('의견',112,92);ctx.fillText('근거',112,550);
 ctx.fillStyle='#172431';
 for(const part of [layout.proposal,layout.reason]){
  ctx.font=`${part===layout.proposal?'bold ':''}${part.size}px ${family}`;
  part.lines.forEach((line,i)=>ctx.fillText(line,part.x,part.y+i*part.lineHeight));
 }
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
 if(!blob)throw new Error('이미지를 만들지 못했습니다. 다시 시도해 주세요.');
 return {blob,width:WIDTH,height:HEIGHT};
}
