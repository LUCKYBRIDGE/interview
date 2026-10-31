// 자료 페이지(index.html)의 화면 동작. 2026-11-01에 index.html 본문 끝의 인라인 스크립트 세 개를 순서 그대로 옮겼다.
// 예전처럼 한 부분이 실패해도 다음 부분이 돌도록 부분마다 try로 감쌌다. 실패는 reportError로 알려 페이지 오류로 잡히게 한다.
// 일반 스크립트라 문서를 읽는 자리에서 바로 돈다.
// 입력 자동 저장과 위험 상황 묶음 접기는 explore-page.mjs(모듈, 이 파일 다음에 돈다)가 맡는다.

// 1. 사례 검색, 탭, 인물 카드와 방문 표시, 사이트 QR, 위험 상황 대화상자, 통계 필터, 소음 정리
try {
document.querySelectorAll(".case-search").forEach(btn=>{const query=encodeURIComponent(btn.dataset.query);const area=document.createElement("div");area.className="case-search-links";[["네이버","https://search.naver.com/search.naver?query="+query],["구글","https://www.google.com/search?q="+query]].forEach(([label,url])=>{const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=label+" 검색 ↗";area.append(a)});btn.replaceWith(area)});
const shareDialog=document.getElementById("share-qr-dialog"),shareTrigger=document.getElementById("share-qr-open"),shareClose=document.getElementById("share-qr-close");let shareFocusBefore=null,shareOverflow="";
function dismissShareQR(){if(shareDialog.hidden)return;shareDialog.hidden=true;document.body.style.overflow=shareOverflow;shareFocusBefore?.focus({preventScroll:true})}
shareTrigger.addEventListener("click",()=>{shareFocusBefore=document.activeElement;shareOverflow=document.body.style.overflow;shareDialog.hidden=false;document.body.style.overflow="hidden";shareClose.focus()});
shareClose.addEventListener("click",dismissShareQR);const shareSize=document.getElementById("share-qr-size"),shareSizeLabel=document.getElementById("share-qr-size-label"),sharePosition=document.getElementById("share-qr-position");shareSize.addEventListener("input",()=>{shareDialog.style.setProperty("--qr-display-size",shareSize.value+"px");shareSizeLabel.textContent=shareSize.value+"px"});sharePosition.addEventListener("change",()=>{shareDialog.dataset.position=sharePosition.value});shareDialog.dataset.position="center";
shareDialog.addEventListener("click",e=>{if(e.target===shareDialog)dismissShareQR()});
shareDialog.addEventListener("keydown",e=>{if(e.key==="Escape")dismissShareQR();if(e.key==="Tab"){const list=[...shareDialog.querySelectorAll("button,a[href]")];if(!list.length)return;const a=list[0],b=list[list.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}}});
document.getElementById("share-url-copy").addEventListener("click",async()=>{const result=document.getElementById("share-qr-feedback");try{await navigator.clipboard.writeText("https://luckybridge.github.io/interview/");result.textContent="사이트 주소를 복사했습니다."}catch(e){result.textContent="주소 복사가 제한되었습니다. 위 링크를 이용해 주세요."}});
/* Move QR dialog by dragging its title bar; mouse, pen and touch supported. */
(()=>{const overlay=document.getElementById("share-qr-dialog"),box=overlay?.querySelector(".share-qr-box"),handle=overlay?.querySelector(".share-qr-head"),select=document.getElementById("share-qr-position");if(!overlay||!box||!handle)return;
let drag=null;
const clamp=(n,min,max)=>Math.min(Math.max(n,min),Math.max(min,max));
function move(x,y){const w=box.offsetWidth,h=box.offsetHeight;box.style.left=clamp(x,8,innerWidth-w-8)+"px";box.style.top=clamp(y,8,innerHeight-Math.min(h,innerHeight-16)-8)+"px";}
function reset(){box.classList.remove("qr-floating");box.style.left="";box.style.top="";select.value="center";overlay.dataset.position="center";}
handle.addEventListener("pointerdown",e=>{if(e.button!==0||e.target.closest("button,a,input,select"))return;if(innerWidth<450&&box.offsetHeight>innerHeight-20)return;const rect=box.getBoundingClientRect();box.classList.add("qr-floating");box.style.left=rect.left+"px";box.style.top=rect.top+"px";drag={id:e.pointerId,dx:e.clientX-rect.left,dy:e.clientY-rect.top};handle.setPointerCapture(e.pointerId);e.preventDefault();});
handle.addEventListener("pointermove",e=>{if(!drag||drag.id!==e.pointerId)return;move(e.clientX-drag.dx,e.clientY-drag.dy);});
const stop=e=>{if(drag&&drag.id===e.pointerId)drag=null;};handle.addEventListener("pointerup",stop);handle.addEventListener("pointercancel",stop);
select.addEventListener("change",()=>{box.classList.remove("qr-floating");box.style.left="";box.style.top="";});
window.addEventListener("resize",()=>{if(box.classList.contains("qr-floating"))move(parseFloat(box.style.left)||8,parseFloat(box.style.top)||8)});
document.getElementById("share-qr-open")?.addEventListener("click",reset);
})();
const links=["https://gemini.google.com/gem/1cn_Gxn3kgyrSoc-jeCmyoFYBppcX2gQh?usp=sharing","https://gemini.google.com/gem/1F9p4GrUr8fHR1Jq7NAMZIm1ZQtWw1VRF?usp=sharing","https://gemini.google.com/gem/1vby9qDGjTIOWfjBDAwjRSOhPNJC-Zhtx?usp=sharing","https://gemini.google.com/gem/1tVpsqcRptHQb2jbww2PN5eJq2nSooAA4?usp=sharing","https://gemini.google.com/gem/1BJp1EIXAKw_0HMfXZNcKx2oK0yeSLRDj?usp=sharing","https://gemini.google.com/gem/1bYP7xbWjrHzDsH-EmacqlGxUfq7zxltC?usp=sharing","https://gemini.google.com/gem/1r_6iO63PgKLnxPPitxTc_ESAf0mY1gMz?usp=sharing","https://gemini.google.com/gem/1jtpSogrl48TmEKXWUXaJ2neLjR_p2POn?usp=sharing","https://gemini.google.com/gem/17FvtC1m6ALNhEYD8S0ECm_NqOVoPkqaj?usp=sharing","https://gemini.google.com/gem/1w9gHHfUcOIRhMqnx_wkBwid4TZuG0hJt?usp=sharing","https://gemini.google.com/gem/1s25zGceTVRwAZOkfwEz7oE0E11mwl_d6?usp=sharing","https://gemini.google.com/gem/1NtxiCNROwVjyY6iwK2r_pYofrawhgpJI?usp=sharing","https://gemini.google.com/gem/1hM4m0DdXB7tHwo2wieEzD_bglUTnE6FX?usp=sharing","https://gemini.google.com/gem/1iTFJP2Nwt55FoXY_Phr4qGMDb74KimV_?usp=sharing","https://gemini.google.com/gem/1tbLz0gRNHc5CrVqjZcK7-IDSEI1qWOcB?usp=sharing","https://gemini.google.com/gem/1FVJW5G85ARseaV5juCquuonEC3_i5abf?usp=sharing","https://gemini.google.com/gem/1hsygVLJStlRM8o202XwWpAOYtT4EEvWB?usp=sharing","https://gemini.google.com/gem/1yVU8h6kDZu3MaJvZg8jHM5PrcufsKyIn?usp=sharing","https://gemini.google.com/gem/1t_WY2sNhX29WhunH0FYzeR5GJe-c78br?usp=sharing","https://gemini.google.com/gem/140oaMIkIGfjOFzAfYxTB0Zdi9f8Xj5CS?usp=sharing","https://gemini.google.com/gem/1uG9C2_gc-pwY73bKOXQSkWOFUBOZ0cNB?usp=sharing","https://gemini.google.com/gem/1LJV3q57KuX7roK0L1kKiRVTkxt73e6GS?usp=sharing","https://gemini.google.com/gem/1GNZB_-ZCFg-BRNXAU1GmZu6ePlV5va-Q?usp=sharing","https://gemini.google.com/gem/12qnH5Z7WlkvbjOJiojz3IC3Cs_vIX8VV?usp=sharing","https://gemini.google.com/gem/1I_SjSwl-WapnsizTOdS7-E_nUlzFbbgc?usp=sharing","https://gemini.google.com/gem/1GdrT4omzYWeJ67eKQwJUVCimWoJXmh7D?usp=sharing","https://gemini.google.com/gem/1RcXk870tTe1DSnOy6tvBZn4nP24ju4Fo?usp=sharing","https://gemini.google.com/gem/1dNmOUpIcn1EthR2-3skBHshDi2siH9Yx?usp=sharing","https://gemini.google.com/gem/1miLnVys_hUwcyQ8uQgD5MnWWwH25ji99?usp=sharing","https://gemini.google.com/gem/1yYr7rkzVFDNyHO5ScnGFlq6NA2hc-ZgK?usp=sharing","https://gemini.google.com/gem/1yBfH9All6h4kf_DLPoRWhuSWsMahM0bf?usp=sharing","https://gemini.google.com/gem/1vk_Cp4bjXWL8v2wmHyUB2bWeiLX2JZLK?usp=sharing"];
const people=[["김하늘",38,"어린 자녀를 키우며 밤에는 아이의 잠자리를 챙기는 주택가 주민"],["박정호",67,"한 동네에서 오래 살아온 은퇴 주민 · 동네 산책을 즐김"],["이수진",31,"낮과 밤이 바뀌는 교대근무 직장인 · 쉬는 시간이 불규칙함"],["오세훈",45,"생활비와 집 관리 비용을 꼼꼼하게 생각하는 지역 주민"],["한유진",29,"원룸에 혼자 사는 직장인 · 조용한 휴식 시간을 중요하게 여김"],["최서연",43,"오래된 공동주택에 사는 보호자 · 청소년 자녀와 생활함"],["최민석",42,"저녁 손님이 많은 작은 음식점을 운영하는 사장"],["정은지",35,"주택가에서 디저트·음료 가게를 운영하는 사장"],["김도현",51,"지역 상가에서 오랫동안 일해 온 가게 운영자"],["윤지혜",27,"늦은 시간까지 매장에서 근무하는 직원"],["강도윤",24,"오토바이로 출퇴근하는 직장인 · 이동의 편리함을 중시함"],["이준호",39,"밤에도 물건을 배송하는 배송 종사자"],["배지훈",76,"차량 통행이 많은 도로 근처에서 오래 살아온 주민"],["정다은",14,"가족과 강릉을 여행 중인 중학생"],["박소영",48,"가족과 강릉을 찾아온 관광객 · 여행 중 휴식을 즐김"],["남현우",68,"은퇴 후 공연과 축제를 즐기며 강릉을 방문한 관광객"],["송미란",64,"저녁에 동네 공원을 산책하며 운동하는 주민"],["임태호",17,"친구들과 악기 연습을 즐기는 고등학생"],["조현숙",72,"강릉 주택가에서 오랫동안 생활한 어르신"],["신재원",36,"다가구주택에서 어린 자녀 둘을 돌보며 사는 보호자"],["서민아",44,"숙박업소를 운영하며 야간 전화와 손님 응대를 맡는 사장"],["문태식",59,"밤에 건물 주변을 순찰하고 출입을 살피는 경비원"],["유채린",16,"강릉에서 가족과 사는 고등학생 · 학교와 학원을 오감"],["이보람",36,"아파트 중간층에 사는 보호자 · 초등학생 자녀를 키움"],["정영택",74,"오래된 아파트에 20년 넘게 거주한 어르신"],["고은솔",20,"빌라 원룸에 자취하며 공부하는 대학생"],["장미경",58,"다세대 빌라에 살며 가게를 운영하는 자영업자 · 늦은 귀가가 잦음"],["조아름",34,"아파트에서 소형견을 키우는 재택근무 디자이너 · 반려견 짖음에 신경 씀"],["황민재",46,"빌라에서 중형견을 키우는 택배기사 · 밤늦게 귀가할 때가 많음"],["백지수",63,"단독주택에서 반려견 두 마리와 사는 은퇴 주민 · 오랜 반려동물 보호자"],["차은비",27,"반려묘를 키우는 원룸 거주 간호사 · 야간근무 후 낮에 잠"],["한성필",55,"아파트에 사는 학원 차량 운전기사 · 반려견 짖음에 예민한 이웃"]];
const icons=["💬","🔎","💡","🌱","🌏","📚","🗣️","🤝","🎯","🧭","📌","📝","🧠","✨","🏫","🌿","📰","💭","🔭","🌊","🧩","📖","🎤","🏢","🏠","🏡","🏘️"];
const palette=[["#e7ebff","#5865d9"],["#ddf6ee","#21876c"],["#fff0df","#b87529"],["#fbe5ef","#bf5781"],["#e5f3fc","#427cb4"]];
const storeKey="interview-visited-v1";
let visited=new Set();
try{visited=new Set(JSON.parse(localStorage.getItem(storeKey)||"[]"))}catch(e){}
const list=document.getElementById("cards"),search=document.getElementById("search"),count=document.getElementById("counter");
function render(){
 const query=search.value.trim().toLowerCase();
 const matches=links.map((url,i)=>({url,n:i+1,person:people[i]})).filter(({n,person})=>!query||String(n).includes(query.replace(/^0+/,""))||person.join(" ").toLowerCase().includes(query));
 count.textContent="32명 중 "+matches.length+"명 · 방문 "+visited.size+"명";
 list.replaceChildren();
 if(!matches.length){const empty=document.createElement("div");empty.className="empty";empty.textContent="검색 결과가 없습니다.";list.append(empty);return}
 for(const {url,n,person} of matches){
  const [name,age,occupation]=person;
  const label=String(n).padStart(2,"0");
  const card=document.createElement("article");card.className="card";
  const portrait=document.createElement(url?"a":"div");portrait.className="portrait-link";if(url){portrait.href=url;portrait.target="_blank";portrait.rel="noopener noreferrer";portrait.setAttribute("aria-label",name+" 인터뷰 시작")}
  const img=document.createElement("img");img.className="profile";img.src="profiles/"+label+".webp";img.alt=name+" 가상 시민 프로필";img.loading=n<=4?"eager":"lazy";img.decoding="async";if(n<=4)img.fetchPriority="high";
  const fallback=document.createElement("span");fallback.className="image-fallback";fallback.textContent="👤";fallback.setAttribute("aria-hidden","true");
  img.addEventListener("error",()=>{img.style.display="none";fallback.style.display="grid"});
  const number=document.createElement("span");number.className="index";number.textContent="NO. "+label;
  portrait.append(img,fallback,number);
  const content=document.createElement("div");content.className="content";
  const nameLine=document.createElement("div");nameLine.className="name-line";
  const heading=document.createElement("h2");heading.textContent=name;
  const years=document.createElement("span");years.className="age";years.textContent=age+"세";nameLine.append(heading,years);
  const role=document.createElement("p");role.className="occupation";role.textContent=occupation;
  const foot=document.createElement("div");foot.className="card-foot";
  const status=document.createElement("span");status.className="visited"+(visited.has(n)?" yes":"");status.textContent=visited.has(n)?"✓ 방문한 인터뷰":"";
  const open=document.createElement(url?"a":"span");open.className="open"+(url?"":" pending");if(url){open.href=url;open.target="_blank";open.rel="noopener noreferrer";open.setAttribute("aria-label",name+"님과 인터뷰하기")}open.textContent=url?"인터뷰하기 ↗":"Gem 준비 중";
  const mark=()=>{visited.add(n);try{localStorage.setItem(storeKey,JSON.stringify([...visited]))}catch(e){}render()};
  if(url){portrait.addEventListener("click",mark);open.addEventListener("click",mark)}
  foot.append(status,open);content.append(nameLine,role,foot);card.append(portrait,content);list.append(card);
 }
}
search.addEventListener("input",render);document.getElementById("random").addEventListener("click",()=>{const available=links.map((url,i)=>url?i+1:null).filter(Boolean);const pool=available.filter(n=>!visited.has(n));const candidates=pool.length?pool:available;const target=candidates[Math.floor(Math.random()*candidates.length)];search.value=String(target);render();document.getElementById("cards").scrollIntoView({behavior:"smooth",block:"center"})});document.getElementById("reset").addEventListener("click",()=>{if(!confirm("이 기기에 저장된 방문 기록을 초기화할까요?"))return;visited.clear();try{localStorage.removeItem(storeKey)}catch(e){}render()});render();

(function(){
 const ids=["home","walking","discussion","resources","noise","interview","downloads"],hashes=["#home","#walking","#discussion","#study","#noise","#interview","#downloads"];
 const tabs=ids.map(id=>document.getElementById("tab-"+id)),panels=ids.map(id=>document.getElementById("panel-"+id));
 const topicPed=document.getElementById("topic-ped"),topicNoise=document.getElementById("topic-noise"),topicCommon=document.getElementById("topic-common"),topicDownloads=document.getElementById("topic-downloads");
 function setTopicForTab(id){const current=id==="noise"||id==="interview"?"noise":id==="resources"?"common":id==="downloads"?"downloads":"ped";document.querySelectorAll("[data-topic-group]").forEach(el=>el.hidden=(el.dataset.topicGroup==="noise")!==(current==="noise"));topicPed?.setAttribute("aria-pressed",String(current==="ped"));topicNoise?.setAttribute("aria-pressed",String(current==="noise"));topicCommon?.setAttribute("aria-pressed",String(current==="common"));topicDownloads?.setAttribute("aria-pressed",String(current==="downloads"))}
 topicDownloads?.addEventListener("click",()=>setTab(ids.indexOf("downloads")));
 topicPed?.addEventListener("click",()=>setTab(ids.indexOf("home")));topicNoise?.addEventListener("click",()=>setTab(ids.indexOf("noise")));topicCommon?.addEventListener("click",()=>setTab(ids.indexOf("resources")));
 function setTab(index,writeHash=true,scroll=true){const pending=ids[index]==="noise"||ids[index]==="interview";if(pending)index=0;const pendingNote=document.getElementById("noise-pending-note");if(pendingNote)pendingNote.textContent=pending?"늦은 시각 소음 자료는 준비 중이에요. 지금은 보행자 안전 자료를 살펴보세요.":"";setTopicForTab(ids[index]);tabs.forEach((t,i)=>{const active=index===i;t.setAttribute("aria-selected",String(active));t.tabIndex=active?0:-1;panels[i].hidden=!active});if(writeHash||pending)history.replaceState(null,"",hashes[index]);if(scroll)window.scrollTo({top:0,behavior:"instant"})}
 window.knolShowNoisePending=()=>setTab(ids.indexOf("noise"));tabs.forEach((tab,i)=>{tab.addEventListener("click",()=>setTab(i));tab.addEventListener("keydown",e=>{if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;e.preventDefault();const j=window.knolNextTabIndex?window.knolNextTabIndex(tabs.map(t=>!t.closest("[hidden]")&&t.getAttribute("aria-disabled")!=="true"),i,e.key):(e.key==="Home"?0:e.key==="End"?tabs.length-1:(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length);setTab(j);tabs[j].focus()})});
 document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>setTab(ids.indexOf(b.dataset.go))));
 function fromHash(){const index=hashes.indexOf(location.hash);if(index>=0){setTab(index,false);return}const target=location.hash.length>1?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;const panel=target?target.closest('[role="tabpanel"]'):null;if(target&&panel&&panels.includes(panel)){setTab(panels.indexOf(panel),false,false);target.scrollIntoView({block:"start"});return}setTab(0,false)}window.addEventListener("hashchange",fromHash);fromHash();
 const checks=[...document.querySelectorAll(".noise-check")],inputs=["more-noise","noise-example","noise-thought"].map(id=>document.getElementById(id)),preview=document.getElementById("worksheet-preview"),status=document.getElementById("worksheet-status");
 function buildText(){const chosen=checks.filter(c=>c.checked).map(c=>"• "+c.value+" ("+c.closest(".noise-choice").querySelector("select").value+")");
 return ["[우리 동네 소음 탐구 활동지]","1. 내가 알고 있는 소음의 종류",chosen.length?chosen.join("\n"):"(아직 선택하지 않음)",inputs[0].value.trim()?"기타: "+inputs[0].value.trim():"","2. 기억에 남는 사례 및 출처",inputs[1].value.trim()||"(직접 적기)","3. 누가, 언제, 왜 불편할까?",inputs[2].value.trim()||"(직접 적기)","4. 더 알아보고 싶은 점: ____________________"].filter(Boolean).join("\n")}
 function update(){preview.textContent=buildText();status.textContent=""}
 [...checks,...document.querySelectorAll(".noise-source"),...inputs].forEach(el=>el.addEventListener("input",update));update();
 document.getElementById("copy-worksheet").addEventListener("click",async()=>{const value=buildText();try{await navigator.clipboard.writeText(value);status.textContent="내용을 복사했습니다. 활동지에 붙여 넣으세요."}catch(e){const ta=document.createElement("textarea");ta.value=value;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");status.textContent="내용을 복사했습니다."}catch(err){status.textContent="자동 복사가 되지 않습니다. 위 내용을 직접 옮겨 적어 주세요."}ta.remove()}});
 document.querySelectorAll(".data-filter").forEach(btn=>btn.addEventListener("click",()=>{const value=btn.dataset.filter;document.querySelectorAll(".data-filter").forEach(x=>x.setAttribute("aria-pressed",String(x===btn)));document.querySelectorAll(".data-tile").forEach(tile=>tile.hidden=value!=="전체"&&tile.dataset.kind!==value)}));
 const riskPeople=[...document.querySelectorAll(".walk-card")].map((card,i)=>({number:i+1,name:card.querySelector("h2").textContent,role:card.querySelector(".walk-role")?.textContent||"",intro:card.querySelector(".walk-intro")?.textContent||"",url:card.querySelector("a").href}));
const riskGroups={"차량과 교통":[1,10,14],"보행로와 장애물":[3,7,17],"야간과 시야":[11,21,24],"범죄·신변 안전":[21,24,14],"날씨와 주변 환경":[23,2,22],"보행 중 행동과 갈등":[6,8,19],"이동 약자·접근성":[3,7,4],"안심하고 걷는 환경":[21,9,24]};
const riskKeywords=[[/어린이|학교/,[8,9,1]],[/횡단보도|보행신호/,[2,10,14]],[/주정차/,[3,5,12]],[/점자블록|시각/,[7,22,3]],[/휠체어|높은 턱/,[3,22,4]],[/유모차|계단/,[4,3,9]],[/조명|어두|야간|가로등/,[11,21,22]],[/위협|따라옴|도움|사각지대/,[21,24,14]],[/눈|얼음|미끄러/,[23,2,22]],[/공사|시설물|고장/,[22,3,14]],[/입간판|상점/,[17,13,7]],[/자전거|킥보드/,[6,2,1]],[/오토바이/,[19,1,14]],[/관광|혼잡/,[15,13,1]],[/혼자|귀가/,[21,11,24]]];
const riskModal=document.getElementById("risk-modal"),riskDialog=riskModal.querySelector(".risk-dialog"),riskResult=document.getElementById("risk-modal-results");const riskModalDescription=riskDialog.querySelector(".risk-dialog-head+p");let previousRiskFocus;let riskScrollLock="";
function riskElement(tag,cls,content){const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e}
function relatedRiskPeople(c){let ids=riskGroups[c.dataset.group]||[1,3,14];for(const [term,values] of riskKeywords){if(term.test(c.value)){ids=values;break}}return ids.slice(0,3).map(id=>riskPeople[id-1]).filter(Boolean)}
function showRiskModal(target){previousRiskFocus=document.activeElement;riskResult.replaceChildren();const chosen=target?[target]:[];if(!chosen.length){riskResult.append(riskElement("p","","각 위험 상황 옆의 '인물 만나기' 버튼을 눌러 보세요."))}chosen.forEach(c=>{const topic=riskElement("section","risk-topic");topic.append(riskElement("h3","",c.value));const group=riskElement("div","risk-recommendations");relatedRiskPeople(c).forEach(p=>{const card=riskElement("div","risk-recommendation");card.append(riskElement("strong","",p.name),riskElement("small","",p.role),riskElement("small","",p.intro));const a=riskElement("a","","인터뷰 열기 ↗");a.href=p.url;a.target="_blank";a.rel="noopener noreferrer";card.append(a);group.append(card)});topic.append(group);riskResult.append(topic)});document.getElementById("risk-dialog-title").textContent="이 상황에 관한 인터뷰";riskModalDescription.textContent="이 상황을 다양한 입장에서 경험할 수 있는 인물들이에요. 직접 질문해 보세요.";openRiskDialog()}
function openRiskDialog(){riskScrollLock=document.body.style.overflow;document.body.style.overflow="hidden";riskModal.hidden=false;riskDialog.focus({preventScroll:true})}
function closeRiskModal(){if(riskModal.hidden)return;riskModal.hidden=true;document.body.style.overflow=riskScrollLock;if(previousRiskFocus&&previousRiskFocus.isConnected&&typeof previousRiskFocus.focus==="function")previousRiskFocus.focus({preventScroll:true})}
const researchSources=[...document.querySelectorAll(".data-tile")].map(x=>({name:x.querySelector("h3")?.textContent||"",scope:x.querySelector(".data-meta")?.textContent||"",value:x.querySelector(".data-number")?.textContent.trim().replace(/\s+/g," ")||"",summary:x.querySelector("p")?.textContent.trim()||"",url:x.querySelector("a")?.href||""})).filter(x=>x.url);
const queryTopics=[["교통사고","사고","횡단보도","차량","우회전","과속","어린이보호"],["이동","보행로","인도","보도","계단","경사","휠체어","유모차","점자블록","장애물"],["밤길","조명","가로등","어두운","야간","사각지대","귀가"],["환경","비","눈","얼음","미끄러운","폭우","폭염","공사"]];
function researchFor(check){const word=check.value,group=check.dataset.group;let found=[];if(group==="차량과 교통"||/차량|횡단보도|교통|과속|어린이보호/.test(word))found=researchSources.filter(x=>/교통사고|횡단보도|어린이보호구역/.test(x.name)).slice(0,3);
else if(group==="이동 약자·접근성"||/휠체어|유모차|점자블록|높은 턱|급경사/.test(word))found=researchSources.filter(x=>/이동할 때|이동하기 편한/.test(x.name)).slice(0,3);
else if(/보행로와 장애물|야간과 시야|범죄·신변 안전|날씨와 주변 환경|안심하고 걷는 환경/.test(group))found=[];
return found}
function showResearchModal(check){previousRiskFocus=document.activeElement;riskResult.replaceChildren();document.getElementById("risk-dialog-title").textContent="이 상황의 조사 자료";riskModalDescription.textContent="먼저 핵심 수치와 출처를 살펴보고, 필요하면 원문이나 네이버·구글 검색으로 더 알아보세요.";const heading=riskElement("h3","",check.value);riskResult.append(heading);const found=researchFor(check);const info=riskElement("p","",found.length? "연결된 참고 자료 "+found.length+"개를 간단히 살펴보세요. 자료의 범위와 출처를 비교하고, 필요한 내용을 원문에서 확인하세요.":"현재 이 상황에 연결된 참고 자료는 없습니다. 아래 네이버·구글 검색으로 직접 찾아볼 수 있어요.");riskResult.append(info);
found.forEach(item=>{const card=riskElement("section","risk-topic");const host=new URL(item.url).hostname;const org=host.includes("taas.koroad.or.kr")?"한국도로교통공단 · TAAS":host.includes("yna.co.kr")?"연합뉴스 보도자료":host.includes("news1.kr")?"뉴스1 보도자료":host.includes("bdi.re.kr")?"부산연구원 자료":host.includes("ii.re.kr")?"인천연구원 자료":host.includes("itskorea.kr")?"ITS Korea 자료 연결":"연결된 원문";card.append(riskElement("strong","",item.name),riskElement("p","risk-source-meta","출처: "+org+" | 범위: "+item.scope));if(item.value)card.append(riskElement("p","risk-source-value","핵심 수치: "+item.value));if(item.summary)card.append(riskElement("p","risk-source-summary","무엇을 알 수 있나요? "+item.summary));card.append(riskElement("p","risk-source-caveat","이 자료는 넓은 범위의 참고 자료일 수 있어요. 선택한 상황과 직접 연결되는지는 원문에서 확인하세요."));const a=riskElement("a","","원문·자료 확인 ↗");a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";card.append(a);riskResult.append(card)});
const q=encodeURIComponent("보행 안전 "+check.value+" 조사 연구 통계");const foot=riskElement("section","risk-topic");foot.append(riskElement("strong","","더 찾아보기"));const links=riskElement("div","risk-search-links");[["네이버에서 검색","https://search.naver.com/search.naver?query="+q],["구글에서 검색","https://www.google.com/search?q="+q]].forEach(([label,url])=>{const link=riskElement("a","",label+" ↗");link.href=url;link.target="_blank";link.rel="noopener noreferrer";links.append(link)});foot.append(links,riskElement("p","","검색 결과는 아직 확인된 조사 자료가 아닙니다. 출처와 조사 시기를 살펴보세요."));riskResult.append(foot);openRiskDialog()}
document.querySelectorAll(".risk-item-interview").forEach(btn=>btn.addEventListener("click",()=>showRiskModal(btn.closest(".risk-item").querySelector(".risk-check"))));
document.querySelectorAll(".risk-item-research").forEach(btn=>btn.addEventListener("click",()=>showResearchModal(btn.closest(".risk-item").querySelector(".risk-check"))));
document.getElementById("risk-modal-close").addEventListener("click",e=>{e.preventDefault();e.stopPropagation();closeRiskModal()});
riskModal.addEventListener("click",e=>{if(e.target===riskModal)closeRiskModal()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!riskModal.hidden){e.preventDefault();closeRiskModal()}});
riskModal.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();closeRiskModal()}else if(e.key==="Tab"){const focusable=[...riskDialog.querySelectorAll("a[href],button:not([disabled])")];if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===riskDialog)){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===riskDialog)){e.preventDefault();first.focus()}}});
document.getElementById("risk-modal-all").addEventListener("click",()=>{closeRiskModal();const tab=document.getElementById("tab-walking");tab.click();if(tab.getClientRects().length){tab.focus()}else{/* 기록장 패널 안(?embed=1)에서는 탭이 숨어 있어 패널로 초점을 옮긴다. */const panel=document.getElementById("panel-walking");panel.setAttribute("tabindex","-1");panel.focus()}});
 document.getElementById("clear-worksheet").addEventListener("click",()=>{checks.forEach(c=>c.checked=false);document.querySelectorAll(".noise-source").forEach(sel=>sel.selectedIndex=0);inputs.forEach(el=>el.value="");update()});
})();;;
} catch (error) {
  if (typeof reportError === 'function') reportError(error); else console.error(error);
}

// 2. 대화상자 닫기 안전장치: 다른 동작이 실패해도 위험 상황·QR 대화상자가 닫힌다
try {
/* Independent modal dismissal safety-net: works even if other page features fail. */
(()=>{
 const dialogs=[document.getElementById('risk-modal'),document.getElementById('share-qr-dialog')].filter(Boolean);
 let previousScroll='';
 // 닫은 뒤 대화상자를 연 버튼으로 초점을 돌려주려고, 대화상자 밖에서 누른 마지막 버튼·링크를 기억한다.
 let lastOpener=null;
 function dismiss(panel){if(!panel||panel.hidden)return;panel.hidden=true;panel.setAttribute('hidden','');if(dialogs.every(d=>d.hidden)){document.body.style.overflow=previousScroll||'';document.documentElement.style.overflow='';}const opener=lastOpener&&lastOpener.isConnected?lastOpener:(panel.id==='share-qr-dialog'?document.getElementById('share-qr-open'):null);if(opener&&opener.offsetParent!==null)opener.focus({preventScroll:true});}
 document.addEventListener('click',event=>{const control=event.target.closest?.('button,a[href],summary');if(control&&!control.closest('#risk-modal,#share-qr-dialog'))lastOpener=control;const close=event.target.closest?.('#risk-modal-close,#share-qr-close');if(close){event.preventDefault();event.stopImmediatePropagation();dismiss(close.closest('#risk-modal,#share-qr-dialog'));return;}const panel=event.target.closest?.('#risk-modal,#share-qr-dialog');if(panel&&event.target===panel){event.preventDefault();event.stopImmediatePropagation();dismiss(panel);}},true);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){const shown=dialogs.filter(d=>!d.hidden);if(shown.length){event.preventDefault();event.stopImmediatePropagation();dismiss(shown[shown.length-1]);}}},true);
 document.querySelectorAll('#risk-modal-close,#share-qr-close').forEach(button=>{button.type='button';button.style.pointerEvents='auto';});
})();
} catch (error) {
  if (typeof reportError === 'function') reportError(error); else console.error(error);
}

// 3. 소음 주제(준비 중)로 가는 버튼과 링크는 안내만 보인다
try {
(()=>{const pending=()=>window.knolShowNoisePending?.();document.querySelectorAll(".noise-coming-soon").forEach(b=>b.addEventListener("click",pending));document.querySelectorAll('a[href*="#noise"],a[href*="#interview"]').forEach(a=>a.addEventListener("click",e=>{e.preventDefault();pending()},true));})();
} catch (error) {
  if (typeof reportError === 'function') reportError(error); else console.error(error);
}
