/* dm.js — 대화 탭: 캐릭터×이야기마다 대화를 저장하고, 메신저처럼 목록에서 이어서 대화해요.
   대화방을 나가면 잠시 뒤 캐릭터가 먼저 메시지를 보내요 (안 읽은 수 표시). */
"use strict";
const FOLLOWUPS={
  doyun:["…아까 그 말, 무슨 뜻이야.","자?","밥은 먹고 다니냐.","신경 쓰여서 연락한 거 아니야. 그냥.","내일 얼굴 보고 얘기해."],
  jihu:["집엔 잘 들어갔어?","아까 얘기, 더 하고 싶었는데.","…보고 싶다는 말은 아니고.","내일도 연락해도 돼?","너 좋아하는 거 사 놨어. 언제 와?"],
  ijun:["저기요, 아까 계산이 아직 안 끝나서요.","혹시 지금 통화 가능한 확률은…?","방금 그거 다시 생각해 봤는데요.","주무세요? 아 아니면 말고요."],
  haram:["연습 끝났다! 오늘 하루 어땠어?","방금 안무 영상 찍었는데 보여 줄까?","너 생각나서 연락했어 ㅎㅎ","내일 응원하러 와 줄 거지?"],
  seoa:["살아 있지? 보고해.","오늘 일, 아무한테도 말하지 마.","…아까 고마웠다.","다음 작전, 너도 같이 가."],
  _:["뭐 해?","아까 대화 계속하고 싶어서.","자? …아니면 답장해 줘."]
};
function convKeyFor(char,story,custom){ return story==="custom"?`${char}|custom|${(custom&&custom.cid)||0}`:`${char}|${story}`; }
function convs(){ W.convs=W.convs||{}; return W.convs; }
function trimHist(h){return {role:h.role,text:h.text,narration:h.narration||"",motion:h.motion,emotion:h.emotion||"",w:h.w,t:h.t,dw:h.dw||0,dt:h.dt||0,key:!!h.key,keyTitle:h.keyTitle||"",turn:h.turn,fu:!!h.fu};}
function saveConv(){
  if(S.isSample||!S.convKey) return;
  const cv=convs(), old=cv[S.convKey];
  cv[S.convKey]={char:S.char,story:S.story,custom:S.story==="custom"?S.custom:null,hist:S.hist.slice(-80).map(trimHist),
    w:S.w,t:S.t,turn:S.turn,lastKeyTurn:S.lastKeyTurn,themeKeyUsed:!!S.themeKeyUsed,lastPeekTurn:S.lastPeekTurn,updated:Date.now(),unread:0,fuIdx:old?old.fuIdx||0:0};
  const keys=Object.keys(cv).sort((a,b)=>cv[b].updated-cv[a].updated); keys.slice(20).forEach(k=>delete cv[k]);
  save(); updateChatBadge();
}
function setupChatHeader(c,st){
  $("#chatAv").style.backgroundImage=`url('${c.card}')`;
  $("#chatName").textContent=c.name; $("#chatTitle").textContent=st.title;
  $("#chatEyebrow").textContent=`${st.genre} · ${c.name} (${c.arch})`;
  $("#drawer").hidden=true;
  $("#log").innerHTML=`<div class="chatintro"><div class="av big" style="background-image:url('${c.card}')"></div><b>${esc(c.name)}</b><small>${esc(c.arch)} · ${esc(st.genre)}</small><p class="note">결정적 순간엔 3D 모션이 바로 나와요 · 궁금한 순간엔 👀 모션 보기</p></div>`;
  $("#quick").innerHTML=(st.quick||[]).map(q=>`<button>${esc(q)}</button>`).join("");
}
function openConv(key){
  const r=convs()[key]; if(!r||!charObj(r.char)) return;
  Object.assign(S,{char:r.char,story:r.story,custom:r.custom,hist:r.hist.map(h=>Object.assign({},h)),w:r.w,t:r.t,turn:r.turn,lastKeyTurn:r.lastKeyTurn,
    themeKeyUsed:r.themeKeyUsed,lastPeekTurn:r.lastPeekTurn==null?-9:r.lastPeekTurn,peekOpen:{},isSample:false,replays:0,scriptIdx:0,laughs:0,lastMotion:null,convKey:key});
  recCache=null;
  const c=charObj(), st=storyObj()||STORIES[0];
  show("chat"); stage.setCharacter(dressed(c,st)); stage.setScene(st);
  setupChatHeader(c,st); $("#scripted").checked=false; $("#scripted").disabled=true;
  addNarr(st.setting); if(st.open) addNarr(st.open);
  S.hist.forEach(h=>{ if(h.role==="user") addMe(h.text); else { addChar(c,h.text,h.narration); if(h.key) addKey(h); } });
  r.unread=0; save(); updateChatBadge();
  renderMotionList(); updateMeters(); updateRecordBtn(); scrollLog();
}
/* 대화방을 나가면 잠시 뒤 캐릭터가 먼저 연락 */
const fuTimers={};
function onLeaveChat(){
  const key=S.convKey; if(!key||S.isSample||S.turn<1||fuTimers[key]) return;
  fuTimers[key]=setTimeout(()=>{ delete fuTimers[key]; addFollowup(key); },6000+Math.random()*6000);
}
function addFollowup(key){
  const r=convs()[key]; if(!r||(r.unread||0)>=2) return;
  const c=charObj(r.char); if(!c) return;
  const pool=(c.custom?null:FOLLOWUPS[c.id])||FOLLOWUPS._, line=pool[(r.fuIdx||0)%pool.length];
  const h={role:"char",text:line,fu:true,turn:r.turn,motion:"idle",w:r.w,t:r.t,dw:0,dt:0};
  r.fuIdx=(r.fuIdx||0)+1; r.hist.push(h); r.updated=Date.now();
  if(view==="chat"&&S.convKey===key){ S.hist.push(Object.assign({},h)); addChar(c,line,""); r.unread=0; }
  else { r.unread=(r.unread||0)+1; toast(`💬 ${c.name}: ${line}`); }
  save(); updateChatBadge(); if(view==="chats") renderChats();
}
function updateChatBadge(){
  const n=Object.values(convs()).reduce((a,r)=>a+(r.unread||0),0), b=$("#chatBadge");
  if(b){ b.hidden=!n; b.textContent=n>99?"99+":n; }
}
function timeText(ts){
  const d=new Date(ts), now=new Date();
  if(d.toDateString()===now.toDateString()){ const h=d.getHours(), m=String(d.getMinutes()).padStart(2,"0"); return `${h<12?"오전":"오후"} ${h%12||12}:${m}`; }
  return `${d.getMonth()+1}월 ${d.getDate()}일`;
}
function renderChats(){
  const cv=convs(), keys=Object.keys(cv).filter(k=>charObj(cv[k].char)).sort((a,b)=>cv[b].updated-cv[a].updated);
  $("#chatList").innerHTML=keys.length?keys.map(k=>{const r=cv[k], c=charObj(r.char), st=(r.story==="custom"?r.custom:allStories().find(x=>x.id===r.story))||{title:"",genre:""};
    const last=r.hist[r.hist.length-1]||{}, av=st.thumb||c.card;
    return `<button class="dmrow" data-conv="${esc(k)}"><span class="dmav" style="background-image:url('${av}')"></span>
      <span class="dmmid"><span class="dmtop"><b>${esc(c.name)}</b><span class="dmst">${esc(st.genre||"")}</span></span>
      <span class="dmlast">${last.role==="user"?"나: ":""}${esc(last.text||"")}</span></span>
      <span class="dmright"><small>${timeText(r.updated)}</small>${r.unread?`<span class="dmbadge">${r.unread}</span>`:""}</span></button>`;}).join("")
    :`<div class="empty"><p>아직 대화가 없어요.<br>캐릭터를 골라 첫 대화를 시작해 보세요.</p><button class="btn pri" data-goto="home">캐릭터 고르러 가기</button></div>`;
}
$("#chatList").addEventListener("click",e=>{const b=e.target.closest("[data-conv]"); if(b) openConv(b.dataset.conv);});
