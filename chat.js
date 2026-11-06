/* chat.js — 대화 화면: 검정 바탕 채팅, 온도·긴장 게이지, 결정적 순간 3D 오버레이 */
"use strict";
/* ───────── 대화 ───────── */
function startChat(fresh){
  const key=convKeyFor(S.char,S.story,S.custom);
  if(!fresh&&convs()[key]){ openConv(key); return; }   /* 이미 하던 대화면 이어서 */
  const st=storyObj(), c=charObj();
  Object.assign(S,{convKey:key,isSample:false,themeKeyUsed:false,lastPeekTurn:-9,peekOpen:{},w:c.id==="jihu"?20:0,t:c.id==="doyun"?35:20,turn:0,hist:[],lastMotion:null,lastKeyTurn:-9,replays:0,scriptIdx:0,laughs:0});recCache=null;
  show("chat"); stage.setCharacter(dressed(c,st)); stage.setScene(st);
  setupChatHeader(c,st);
  const demo=st.id==="office"&&c.id==="doyun"; $("#scripted").checked=demo; $("#scripted").disabled=!demo;
  addNarr(st.setting); if(st.open) addNarr(st.open);
  const first=(c.open&&c.open[st.id])||st.first||c.first||"…처음 보는 얼굴이네. 여기서 뭐 해?";
  addChar(c,first,"");
  S.hist.push({role:"char",text:first,motion:c.sig,w:S.w,t:S.t,dw:0,dt:0,turn:0});
  renderMotionList(); updateMeters(); updateRecordBtn(); saveConv();
}
function availMotions(c){return ownedMotions(c);}
function renderMotionList(){$("#motionList").innerHTML=availMotions(charObj()).map(m=>`<span class="tag">${esc(MOTIONS[m].cat)} › ${esc(MOTIONS[m].label)}</span>`).join("");}
$("#quick").addEventListener("click",e=>{const b=e.target.closest("button"); if(b){$("#input").value=b.textContent;send();}});
function addNarr(t){const d=document.createElement("div");d.className="narr";d.textContent=t;$("#log").append(d);scrollLog();}
function addMe(t){const d=document.createElement("div");d.className="msg me";d.innerHTML=`<div class="bub"></div>`;d.firstChild.textContent=t;$("#log").append(d);scrollLog();}
function addChar(c,text,nar){const d=document.createElement("div");d.className="msg";
  d.innerHTML=`<div class="av" style="background-image:url('${c.card}')"></div><div class="mcol"><div class="who">${esc(c.name)}</div><div class="bub">${nar?`<span class="nar"></span>`:""}<span class="tx"></span></div></div>`;
  if(nar) d.querySelector(".nar").textContent=nar; d.querySelector(".tx").textContent=text; $("#log").append(d);scrollLog();}
function addKey(h){const d=document.createElement("button");d.className="keyline";
  d.innerHTML=`<span class="kl">결정적 순간</span><b>${esc(h.keyTitle||"관계가 바뀐 순간")}</b><small>XSTAGE · ${esc(MOTIONS[h.motion].label)} · 다시 보기 ▶</small>`;
  d.addEventListener("click",()=>keyMoment(h,true)); $("#log").append(d);scrollLog();}
function scrollLog(){const l=$("#log");l.scrollTop=l.scrollHeight;}
function keyCount(){return S.hist.filter(h=>h.key).length;}
function typeKey(w,t,keys){ if(w>=75&&keys>=3) return "H"; if(w>=40) return t<50?"A":"B"; return t>=50?"C":"D"; }
function updateMeters(){
  const w=S.w,t=S.t,wb=$("#wBar"),half=Math.abs(w)/2;
  wb.style.left=(w>=0?50:50-half)+"%"; wb.style.width=half+"%"; wb.style.background=w>=0?"var(--accent)":"var(--cool)";
  $("#wNum").textContent=(w>0?"+":"")+w;
  const tb=$("#tBar"); tb.style.left="0"; tb.style.width=t+"%"; tb.style.background="var(--cool)"; $("#tNum").textContent=t;
  $("#keyCount").textContent=`결정적 순간 ${keyCount()}번 · 대화당 2~4번 나오도록 조정`;
}
function updateRecordBtn(){const b=$("#toRecord");b.disabled=S.turn<3;b.textContent=S.turn<3?`릴스 ${3-S.turn}`:"릴스";b.classList.toggle("pri",S.turn>=3);
  const bar=$("#endBar"); bar.hidden=S.turn<3;
  if(S.turn>=3) $("#endBarTxt").innerHTML=`결정적 순간 <b>${keyCount()}번</b> · 이 이야기로 릴스 만들기`; }
$("#endBarBtn").addEventListener("click",e=>gateRecord(e));
$("#chatMenu").addEventListener("click",()=>{$("#drawer").hidden=!$("#drawer").hidden;});
$("#chatBack").addEventListener("click",()=>go("chats"));   /* 메신저처럼 대화 목록으로 */

$("#sendBtn").addEventListener("click",e=>send(e));
$("#input").addEventListener("keydown",e=>{ if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();send();} });
$("#input").addEventListener("input",e=>{const t=e.target;t.style.height="auto";t.style.height=Math.min(120,t.scrollHeight)+"px";});
async function send(){
  if(S.busy) return; const msg=$("#input").value.trim(); if(!msg) return;
  $("#input").value=""; $("#input").style.height=""; S.busy=true; $("#sendBtn").disabled=true;
  addMe(msg); S.hist.push({role:"user",text:msg,turn:S.turn+1});
  const c=charObj(), typing=document.createElement("div");typing.className="msg typing";
  typing.innerHTML=`<div class="av" style="background-image:url('${c.card}')"></div><div class="bub"><i></i><i></i><i></i></div>`;
  $("#log").append(typing);scrollLog();
  const r=await getReply(msg);   /* api.js: 시연 시나리오 → 백엔드 → 규칙 기반 순서로 답을 받아옴 */
  typing.remove(); applyTurn(r);
  S.busy=false; $("#sendBtn").disabled=false; $("#input").focus({preventScroll:true});
}
function applyTurn(r){
  const c=charObj(); S.turn++;
  S.w=clamp(S.w+r.dw,-100,100); S.t=clamp(S.t+r.dt,0,100);
  /* 규칙 검사: AI 후보 + 직전 연출과 2턴 이상 간격 + 세션당 최대 4번 (시연·챌린지는 예외) */
  const key=r.key&&keyCount()<4&&(r.forced||S.turn-S.lastKeyTurn>=2);
  let motion=r.motion; if(!key&&motion===S.lastMotion) motion=c.motions.find(m=>m!==motion)||motion;
  let keyTitle=r.keyTitle;
  const st=storyObj();   /* 전용 테마: 첫 결정적 순간은 테마가 정한 XSTAGE 모션으로 */
  if(key&&st&&st.keyMotion&&!S.themeKeyUsed&&!r.forced){ motion=st.keyMotion; keyTitle=st.keyTitle; S.themeKeyUsed=true; }
  S.lastMotion=motion; if(key) S.lastKeyTurn=S.turn;
  addChar(c,r.reply,r.narration);
  const h={role:"char",text:r.reply,narration:r.narration,emotion:r.emotion,motion,w:S.w,t:S.t,dw:r.dw,dt:r.dt,key,keyTitle,turn:S.turn};
  S.hist.push(h);
  if(key){ addKey(h); if(!W.missions.key){W.missions.key=true;earnStep(3,"미션: 결정적 순간 만나기");} if(motion==="heart"&&!W.missions.chal){W.missions.chal=true;earnStep(5,"모션 챌린지 참여");} keyMoment(h,false); }
  else { $("#hudMini").innerHTML=`최근 감정 "${esc(r.emotion||"기본")}" · 평소에는 글로만 대화해요`;
    /* 흐름을 깨지 않는 '궁금한 순간'에만 모션 보기 카드 (결정적 순간과는 겹치지 않게) */
    if(S.turn>=2&&S.turn-S.lastPeekTurn>=2&&((r.emotion&&r.emotion!=="기본")||Math.abs(r.dw)+Math.abs(r.dt)>=5)) addPeek(c,h); }
  updateMeters(); updateRecordBtn(); saveConv();
}
/* ───────── 결정적 순간: 3D 오버레이 ───────── */
let ovTimer=null,ovHist=null;
function openOv(motion,sub,title,hud){
  const ov=$("#ov"); ov.hidden=false; requestAnimationFrame(()=>ov.classList.add("on"));
  stage.mount($("#stageOv"));
  $("#hudOv").innerHTML=hud;
  setTimeout(()=>stage.play(motion,{sub,key:title,target:"Ov",cam:true}),250);
  clearTimeout(ovTimer); ovTimer=setTimeout(closeOv,(stage.dur(motion)+1.6)*1000);
}
/* ───────── 👀 모션 보기: 3개 중 골라 보기 (광고 하루 3번 무료 → 그다음 점프) ───────── */
function peekOptions(c,h){   /* 3개 중 1개는 지금 반응(보유 모션), 2개는 아직 없는 모션 → 궁금하게 */
  const own=ownedMotions(c), seed=S.turn;
  const notOwn=Object.keys(MOTIONS).filter(m=>m!=="idle"&&!own.includes(m)).sort((a,b)=>(!!MOTION_FILES[b]-!!MOTION_FILES[a])||((a.length*7+seed)%5-(b.length*7+seed)%5));
  const first=[h.motion].concat(EMO_MOTION[h.emotion]||[],own).find(m=>m&&m!=="idle"&&MOTIONS[m]);
  const out=[first]; for(const m of notOwn.concat(own)){ if(!out.includes(m)) out.push(m); if(out.length===3) break; }
  return out;
}
function addPeek(c,h){
  S.lastPeekTurn=S.turn; const id="pk"+S.turn, opts=peekOptions(c,h);
  const last=(S.hist.filter(x=>x.role==="user").slice(-1)[0]||{}).text||"";
  const d=document.createElement("div"); d.className="peek"; d.id=id;
  d.innerHTML=`<div class="pq">👀 방금 ${last?`“${esc(last.slice(0,16))}${last.length>16?"…":""}”에`:"그 순간"} <b>${esc(c.name)}</b>의 반응, 모션으로 볼까요?</div>
    <div class="popts">${opts.map((m,i)=>`<button data-peek="${id}" data-m="${m}"><span class="pl">${"ABC"[i]}</span><b>${esc(MOTIONS[m].label)}</b><small class="pc"></small></button>`).join("")}</div>
    <div class="note pn"></div>`;
  $("#log").append(d); refreshPeek(d); scrollLog();
}
function peekState(c,m,id){
  if(W.plus) return "free"; if(ownsMotion(c,m)) return "own"; if(S.peekOpen[id+m]) return "open";
  return (W.peekAds||0)<PEEK.adPerDay?"ad":"jump";
}
function refreshPeek(d){
  const c=charObj();
  d.querySelectorAll("[data-peek]").forEach(b=>{const st=peekState(c,b.dataset.m,b.dataset.peek);
    b.querySelector(".pc").textContent={free:"PLUS 무료",own:"보유 모션 · 무료",open:"다시 보기",ad:"광고 보고 보기",jump:`점프 ${PEEK.jump}`}[st];
    b.classList.toggle("lock",st==="ad"||st==="jump");});
  d.querySelector(".pn").textContent=W.plus?"PLUS는 광고 없이 바로 볼 수 있어요":`오늘 광고로 무료 보기 ${Math.max(0,PEEK.adPerDay-(W.peekAds||0))}/${PEEK.adPerDay}번 남음 · 모션을 사면 언제든 무료`;
}
function peekPlay(c,m,id){
  S.peekOpen[id+m]=true; document.querySelectorAll(".peek").forEach(refreshPeek);
  $("#ovSkip").textContent="대화로 돌아가기"; ovHist={motion:m,text:"",keyTitle:null,peek:true};
  openOv(m,null,null,`👀 모션 보기 · <b>${esc(c.name)} › ${esc(MOTIONS[m].label)}</b>`);
}
$("#log").addEventListener("click",e=>{
  const b=e.target.closest("[data-peek]"); if(!b) return;
  const c=charObj(), m=b.dataset.m, id=b.dataset.peek, st=peekState(c,m,id);
  if(st==="free"||st==="own"||st==="open"){ peekPlay(c,m,id); return; }
  if(st==="ad"){ peekAd(()=>{ W.peekAds=(W.peekAds||0)+1; save(); peekPlay(c,m,id); }); return; }
  buyWithJump(PEEK.jump,`모션 보기 · ${MOTIONS[m].label}`,()=>peekPlay(c,m,id));
});
function peekAd(done){
  modal(`<h2>광고 보고 모션 보기</h2><div class="adfake">광고 영역 (시연용)<br><small>끝까지 보면 모션을 볼 수 있어요 · 오늘 ${PEEK.adPerDay-(W.peekAds||0)}번 남음</small></div>
   <div class="row" style="justify-content:space-between"><button class="btn gold sm" data-open="plus">PLUS면 광고 없이</button><button class="btn pri" id="pkAdDone" disabled>5초 남음</button></div>`);
  let n=5; const b=$("#pkAdDone"); const iv=setInterval(()=>{n--; if(n<=0){clearInterval(iv);b.disabled=false;b.textContent="모션 보기";} else b.textContent=`${n}초 남음`;},1000);
  b.addEventListener("click",()=>{closeModal();done();});
}
function keyMoment(h,isReplay){
  if(!$("#fx3d").checked&&!isReplay){ $("#hudMini").innerHTML=`3D 연출 꺼짐 · ${esc(MOTIONS[h.motion].label)} 생략`; return; }
  ovHist=h; $("#ovSkip").textContent=view==="chat"?"건너뛰고 대화로":"닫기";
  openOv(h.motion,h.text,h.keyTitle||"결정적 순간",`XSTAGE 태그 매칭 · <b>${esc(MOTIONS[h.motion].cat)} › ${esc(MOTIONS[h.motion].label)}</b>`);
}
function previewMotion(c,motion,sub){
  stage.setCharacter(dressed(c,storyObj())); stage.setScene(storyObj()||STORIES[0]);
  ovHist={motion,text:sub,keyTitle:c.name+" 대표 모션"}; $("#ovSkip").textContent="닫기";
  openOv(motion,sub,c.name+" 대표 모션",`XSTAGE 모션 · <b>${esc(MOTIONS[motion].label)}</b>`);
}
function closeOv(){const ov=$("#ov");ov.classList.remove("on");clearTimeout(ovTimer);setTimeout(()=>{ov.hidden=true;const mt={record:"#stageRec",community:"#stageCom"}[view];if(mt)stage.mount($(mt));},350);}
$("#ovSkip").addEventListener("click",e=>closeOv(e));
$("#ovReplay").addEventListener("click",()=>{ if(ovHist) openOv(ovHist.motion,ovHist.text||null,ovHist.peek?null:(ovHist.keyTitle||"결정적 순간"),$("#hudOv").innerHTML); });
$("#toRecord").addEventListener("click",e=>gateRecord(e));
