/* home.js — 화면 이동 + 홈 + 캐릭터 상세(전용 테마·결말 유형) + 만들기(캐릭터·이야기·2차 창작) + 대화 목록 + 마이페이지 */
"use strict";
const TAB_VIEWS=["home","community","make","chats","motion","my"];
const TAB_OF={make:"community"};   /* 만들기는 발견 탭 안에 있어요 */
const ALL_VIEWS=["home","detail","chat","chats","record","community","make","create","studio","motion","my"];
function show(v){
  const prev=view; view=v;
  if(prev==="chat"&&v!=="chat") onLeaveChat();
  for(const k of ALL_VIEWS) $("#v-"+k).hidden=k!==v;
  $("#tabs").hidden=!TAB_VIEWS.includes(v);
  document.querySelectorAll("#tabs button").forEach(b=>b.classList.toggle("on",b.dataset.tab===(TAB_OF[v]||v)));
  document.querySelectorAll("[data-dseg]").forEach(b=>b.classList.toggle("on",b.dataset.dseg===v));
  const mt={record:"#stageRec",community:"#stageCom",studio:"#stageStudio",motion:"#stageFit"}[v]; if(mt) stage.mount($(mt));
  if(v==="community"){stage.setCharacter(charObj("haram"));stage.setScene(STORIES[2]);}
  const sc=$("#v-"+v+" .scroll"); if(sc) sc.scrollTop=0;
  window.scrollTo(0,0);
}
function go(v){
  if(v==="home"){show("home");renderHome();}
  else if(v==="community"){show("community");renderCommunity();}
  else if(v==="make"){show("make");renderMake();}
  else if(v==="create"){openCreate();}
  else if(v==="studio"){openStudio();}
  else if(v==="motion"){openFitting();}
  else if(v==="chats"){show("chats");renderChats();}
  else if(v==="list"){show("my");renderMy();setTimeout(()=>{const r=$("#myRecs");if(r)r.scrollIntoView({behavior:"smooth"});},50);}
  else if(v==="market"){show("community");renderCommunity();setTimeout(()=>$("#marketSec").scrollIntoView({behavior:"smooth"}),50);}
  else {show("my");renderMy();}
}
$("#tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(b)go(b.dataset.tab);});

function allStories(){return STORIES.concat(SPECIALS,THEMES);}
function storyObj(){ if(S.story==="custom") return S.custom; return allStories().find(s=>s.id===S.story); }
function charObj(id){return CHARS.find(c=>c.id===(id||S.char));}
function themesOf(c){return THEMES.filter(t=>t.char===c.id);}
/* 이야기 전용 의상: 테마에 vrm이 있으면 그 옷을 입은 모델로 (서아·지후) */
function dressed(c,st){ return st&&st.vrm&&st.char===c.id ? Object.assign({},c,{id:c.id+"@"+st.vrm.replace(".vrm",""),vrm:st.vrm}) : c; }
function face(c){return `<div class="face" style="background-image:url('${c.card}')" role="img" aria-label="${esc(c.name)}"></div>`;}
const BUBBLE=`<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M8 2C4.1 2 1 4.5 1 7.6c0 1.7.9 3.2 2.4 4.2L3 14.5l3-1.6c.6.1 1.3.2 2 .2 3.9 0 7-2.5 7-5.6S11.9 2 8 2z" fill="currentColor"/></svg>`;
function costText(s){return [s.cost.step?`스텝 ${s.cost.step}`:"",s.cost.jump?`점프 ${s.cost.jump}`:""].filter(Boolean).join(" / ");}

/* ───────── 직접 만든 캐릭터를 CHARS에 합치기 ───────── */
function buildChar(u){
  const base=CHARS.find(c=>c.id===u.base&&!c.custom)||CHARS[0];
  return Object.assign({},base,{id:u.id,custom:true,base:base.id,name:u.name,arch:u.arch||"내가 만든 캐릭터",mood:u.mood||"나만의 캐릭터",hot:false,
    persona:u.persona||"",speech:u.speech||"",sig:u.sig||base.sig,motions:Array.from(new Set([u.sig||base.sig].concat(base.motions))),
    open:{},first:u.first||"…처음 보는 얼굴이네.",types:GENERIC_TYPES,card:u.img||base.card,chats:"새 캐릭터",hook:u.hook||u.first||u.name,
    desc:(u.persona||"").slice(0,60),tags:u.tags&&u.tags.length?u.tags:["내가만든캐릭터"]});
}
function loadMyChars(){ for(const u of (W.myChars||[])){ if(!CHARS.some(c=>c.id===u.id)) CHARS.push(buildChar(u)); } }
loadMyChars();

/* ───────── 홈 ───────── */
let homeSeg="home", bIdx=0, bTimer=null;
function chatNum(c){return parseFloat(c.chats)||0;}
function cardHTML(c,i){return `<button class="ccard" data-char="${c.id}">
    <div class="cimg" style="background-image:url('${c.card}')">
      <span class="chats">${BUBBLE}${esc(c.chats)}</span>${homeSeg==="rank"&&i!=null?`<span class="rankno">${i+1}</span>`:""}
      ${c.hot?'<span class="hotbadge">강한 맛</span>':""}${c.custom?'<span class="hotbadge mine">내 캐릭터</span>':""}
    </div>
    <div class="cinfo"><b class="hook">${esc(c.hook)}</b><p>${esc(c.desc)}</p><span class="tags">${c.tags.map(t=>"#"+esc(t)).join(" ")}</span></div>
  </button>`;}
function renderHome(){
  const base=CHARS.filter(c=>!c.custom), mine=CHARS.filter(c=>c.custom);
  const list=homeSeg==="rank"?base.slice().sort((a,b)=>chatNum(b)-chatNum(a)):base;
  $("#charGrid").innerHTML=list.map((c,i)=>cardHTML(c,i)).join("");
  $("#mineSec").hidden=!mine.length; $("#mineGrid").innerHTML=mine.map(c=>cardHTML(c,null)).join("");
  $("#themeRail").innerHTML=THEMES.filter(t=>t.vrm).concat(THEMES.filter(t=>!t.vrm&&THEMES.indexOf(t)%3===0)).slice(0,9).map(t=>{const c=charObj(t.char);
    return `<button class="spcard wide" data-theme="${t.id}"><div class="spimg" style="background-image:linear-gradient(180deg,rgba(0,0,0,0) 20%,rgba(0,0,0,.9)),url('${c.card}')"><span class="lock">${esc(t.genre)}</span>${t.thumb?`<span class="outfit" style="background-image:url('${t.thumb}')" title="전용 의상"></span>`:""}<span class="tq">${esc(t.title)}</span></div><small>${esc(c.name)} · 결정적 순간 "${esc(t.keyTitle)}"</small></button>`;}).join("");
  $("#specialGrid").innerHTML=SPECIALS.map(s=>{const c=charObj(s.char),open=W.unlocked.includes(s.id);
    return `<button class="spcard" data-special="${s.id}"><div class="spimg" style="background-image:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.85)),url('${c.card}')"><span class="lock">${open?"열림":costText(s)}</span>${s.dance?'<span class="tag gold">XSTAGE 댄스</span>':""}</div><b>${esc(s.title)}</b><small>${esc(c.name)} 전용 에피소드</small></button>`;}).join("");
  renderBanner();
}
function renderBanner(){
  $("#btrack").innerHTML=BANNERS.map((b,i)=>`<button class="bslide" data-banner="${i}" style="background:linear-gradient(100deg,${b.c1} 35%,transparent 75%),url('${b.img}') right 12% top 18% / 44% auto no-repeat,${b.c1}">
    <span class="be">${esc(b.eyebrow)}</span><b class="bt">${esc(b.title)}</b><span class="bs" style="color:${b.c2}">${esc(b.sub)}</span></button>`).join("");
  setBanner(bIdx);
  clearInterval(bTimer); bTimer=setInterval(()=>{ if(view==="home") setBanner((bIdx+1)%BANNERS.length); },4500);
}
function setBanner(i){bIdx=i;$("#btrack").style.transform=`translateX(${-100*i}%)`;$("#bcount").textContent=`${i+1}/${BANNERS.length}`;}
let bx=null, bannerSwiped=false;
$("#banner").addEventListener("pointerdown",e=>{bx=e.clientX;});
$("#banner").addEventListener("pointerup",e=>{ if(bx===null) return; const dx=e.clientX-bx; bx=null;
  if(Math.abs(dx)>40){ setBanner((bIdx+(dx<0?1:BANNERS.length-1))%BANNERS.length); bannerSwiped=true; setTimeout(()=>bannerSwiped=false,50); } });
$("#btrack").addEventListener("click",e=>{ const b=e.target.closest("[data-banner]"); if(!b||bannerSwiped) return;
  const g=BANNERS[+b.dataset.banner].go;
  if(g==="challenge") go("community"); else if(g==="sample") loadSample(); else if(g==="plus") openPlus(); else go(g);
});
$("#homeSeg").addEventListener("click",e=>{const b=e.target.closest("[data-hseg]");if(!b)return;homeSeg=b.dataset.hseg;
  document.querySelectorAll("#homeSeg button").forEach(x=>x.classList.toggle("on",x===b)); renderHome();});

/* ───────── 캐릭터 상세: 전용 테마 + 결말 유형 + 이야기 고르기 ───────── */
function openDetail(id,storyId){
  S.char=id; const c=charObj(), th=themesOf(c);
  const valid=s=>s&&(STORIES.some(x=>x.id===s)||THEMES.some(x=>x.id===s&&x.char===id)||SPECIALS.some(x=>x.id===s&&x.char===id));
  S.story=valid(storyId)?storyId:(valid(S.story)&&!STORIES.some(x=>x.id===S.story)?S.story:(th[0]?th[0].id:"office"));
  show("detail");
  $("#dHero").style.backgroundImage=`linear-gradient(180deg,rgba(11,11,15,0) 45%,rgba(11,11,15,.96) 94%),url('${c.card}')`;
  $("#dChats").innerHTML=`${BUBBLE}${esc(c.chats)}`;
  $("#dName").textContent=c.name;
  $("#dHook").textContent=c.hook;
  $("#dTags").innerHTML=`<span class="tag ${c.hot?"hot":"acc"}">${esc(c.arch)}</span><span class="tag">${esc(c.mood)}</span>`+c.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join("");
  $("#dPersona").textContent=c.persona;
  $("#dSig").textContent=MOTIONS[c.sig].label;
  const own=ownedMotions(c), pk=packsOf(c);
  $("#dMotions").innerHTML=own.slice(0,8).map(m=>`<span class="tag${MOTION_FILES[m]?" acc":""}">${esc(MOTIONS[m].label)}</span>`).join("")+(own.length>8?`<span class="tag">+${own.length-8}</span>`:"");
  $("#dPacks").innerHTML=pk.map(p=>`<button class="mrow pkline" data-fitgo="${c.id}"><span><b>${esc(p.name)}</b><small>${p.motions.map(m=>esc(MOTIONS[m].label)).join(" · ")}</small></span><span class="tag ${ownsPack(p.id)?"acc":"gold"}">${ownsPack(p.id)?"보유":"점프 "+p.cost}</span></button>`).join("")+`<button class="btn sm" data-fitgo="${c.id}">모션 피팅룸에서 입혀 보기</button>`;
  stage.setCharacter(dressed(c,storyObj()));   /* 3D 캐릭터를 미리 불러 두면 결정적 순간에 바로 나와요 */
  renderStories();
}
function srowHTML(s,extra){return `<button class="srow${S.story===s.id?" sel":""}" data-story="${s.id}"><span class="sw" style="background:${s.sw}"></span><span class="st"><b>${extra&&extra.b?extra.b:esc(s.title)}</b><small>${extra&&extra.small?extra.small:esc(s.genre)+" · "+esc(s.open)}</small></span><span class="rd"></span></button>`;}
function renderStories(){
  const c=charObj(), th=themesOf(c), sp=SPECIALS.filter(s=>s.char===c.id);
  $("#themeList").innerHTML=th.length?th.map(t=>srowHTML(t,{b:`<span class="tag hot">${esc(t.genre)}</span> ${esc(t.title)}`,small:`${t.vrm?"👗 전용 의상 · ":""}결정적 순간 "${esc(t.keyTitle)}" · XSTAGE ${esc(MOTIONS[t.keyMotion].label)}`})).join(""):`<p class="note">직접 만든 캐릭터는 아래 공통 이야기나 직접 쓴 이야기로 시작해요.</p>`;
  $("#storyGrid").innerHTML=STORIES.map(s=>srowHTML(s)).join("")+
    sp.map(s=>{const open=W.unlocked.includes(s.id);return srowHTML(s,{b:`${esc(s.title)} <span class="tag gold">특별</span>`,small:`${open?"열림":costText(s)} · ${esc(s.open)}`});}).join("")+
    `<button class="srow" data-goto="make"><span class="sw dashed">＋</span><span class="st"><b>직접 쓰기</b><small>배경과 첫 장면을 내가 써서 시작해요</small></span></button>`;
  const st=storyObj(), ex=convs()[convKeyFor(c.id,S.story,S.custom)];
  $("#startBtn").textContent=ex?"이어서 대화하기":"대화 시작하기"; $("#restartBtn").hidden=!ex;
  $("#pickNote").textContent=st?`${c.name} × ${st.title}${st.vrm?" · 이 이야기 전용 의상":""}`:"";
}
$("#dMotion").addEventListener("click",()=>{const c=charObj(),st=storyObj();previewMotion(c,c.sig,(c.open&&c.open[S.story])||(st&&st.first)||c.first||c.hook);});
$("#startBtn").addEventListener("click",()=>{
  const s=SPECIALS.find(x=>x.id===S.story);
  if(s&&!W.unlocked.includes(s.id)){ if(!spend(s.cost,s.title)) return; W.unlocked.push(s.id); save(); }
  startChat();
});
$("#restartBtn").addEventListener("click",()=>startChat(true));
document.addEventListener("click",e=>{const b=e.target.closest("[data-dseg]"); if(b) go(b.dataset.dseg);});

document.addEventListener("click",e=>{
  const bk=e.target.closest("[data-back]"); if(bk){go(bk.dataset.back);return;}
  const gt=e.target.closest("[data-goto]"); if(gt){go(gt.dataset.goto);return;}
  const st=e.target.closest("[data-story]"); if(st){S.story=st.dataset.story;renderStories();stage.setCharacter(dressed(charObj(),storyObj()));return;}
  const th=e.target.closest("[data-theme]"); if(th){const t=THEMES.find(x=>x.id===th.dataset.theme);openDetail(t.char,t.id);return;}
  const ch=e.target.closest("[data-char]"); if(ch){openDetail(ch.dataset.char);return;}
  const sp=e.target.closest("[data-special]"); if(sp){const s=SPECIALS.find(x=>x.id===sp.dataset.special);openDetail(s.char,s.id);return;}
  const rc=e.target.closest("[data-rec]"); if(rc){openSavedRecord(+rc.dataset.rec);return;}
  const fg=e.target.closest("[data-fitgo]"); if(fg){openFitting(fg.dataset.fitgo);return;}
  const op=e.target.closest("[data-open]"); if(op){ openPlus(); return; }
});

/* ───────── 만들기: 캐릭터 · 2차 창작 · 이야기 ───────── */
function renderMake(){
  $("#mkChars").innerHTML=CHARS.map(c=>`<button class="avopt${S.char===c.id?" on":""}" data-mkchar="${c.id}">${face(c)}<small>${esc(c.name)}</small></button>`).join("");
  $("#mkStart").disabled=$("#cSet").value.trim().length<5;
  const mine=CHARS.filter(c=>c.custom);
  $("#myCharList").innerHTML=mine.length?mine.map(c=>`<div class="mcrow">${face(c)}<span class="st"><b>${esc(c.name)}</b><small>${esc(c.hook)}</small></span><button class="btn sm" data-char="${c.id}">대화</button><button class="btn sm ghost" data-delchar="${c.id}">삭제</button></div>`).join(""):`<p class="note">아직 만든 캐릭터가 없어요.</p>`;
}
$("#mkChars").addEventListener("click",e=>{const b=e.target.closest("[data-mkchar]");if(!b)return;S.char=b.dataset.mkchar;renderMake();});
$("#cSet").addEventListener("input",()=>renderMake());
$("#myCharList").addEventListener("click",e=>{const b=e.target.closest("[data-delchar]");if(!b)return;const id=b.dataset.delchar;
  W.myChars=(W.myChars||[]).filter(u=>u.id!==id); const i=CHARS.findIndex(c=>c.id===id); if(i>=0) CHARS.splice(i,1); if(S.char===id) S.char="doyun"; save(); renderMake(); toast("캐릭터를 삭제했어요");});
$("#mkStart").addEventListener("click",()=>{
  S.story="custom";
  S.custom={id:"custom",cid:Date.now(),title:$("#cTitle").value.trim()||"나만의 이야기",genre:"직접 쓴 이야기",setting:$("#cSet").value.trim(),open:"",bg:0x262330,fog:0x302c3c,sw:"linear-gradient(135deg,#302c3c,#6b5a8a)",quick:["여긴 어디야?","너는 누구야?","같이 있어도 돼?"]};
  stage.setCharacter(charObj()); startChat();
});

/* ── 캐릭터 만들기 ── */
let crImg=null, crBase="doyun", crSig="proud";
function openCreate(){
  show("create"); crImg=null; crBase="doyun"; crSig=charObj("doyun").sig;
  ["crName","crHook","crArch","crPersona","crSpeech","crFirst","crTags"].forEach(id=>$("#"+id).value="");
  renderCreate();
}
function renderCreate(){
  const base=CHARS.find(c=>c.id===crBase);
  $("#crBases").innerHTML=CHARS.filter(c=>!c.custom).map(c=>`<button class="avopt${crBase===c.id?" on":""}" data-crbase="${c.id}">${face(c)}<small>${esc(c.name)} 모델</small></button>`).join("");
  const sigs=Object.keys(MOTION_FILES);
  $("#crSigs").innerHTML=sigs.map(m=>`<button class="pill${crSig===m?" on":""}" data-crsig="${m}">${esc(MOTIONS[m].label)}</button>`).join("");
  $("#crPreview").style.backgroundImage=`linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.85)),url('${crImg||base.card}')`;
  $("#crPrevName").textContent=$("#crName").value.trim()||"이름";
  $("#crPrevHook").textContent=$("#crHook").value.trim()||"한 줄 소개가 여기에 보여요";
  $("#crSave").disabled=!($("#crName").value.trim()&&$("#crFirst").value.trim());
}
$("#crBases").addEventListener("click",e=>{const b=e.target.closest("[data-crbase]");if(!b)return;crBase=b.dataset.crbase;renderCreate();});
$("#crSigs").addEventListener("click",e=>{const b=e.target.closest("[data-crsig]");if(!b)return;crSig=b.dataset.crsig;renderCreate();});
["crName","crHook","crFirst"].forEach(id=>$("#"+id).addEventListener("input",()=>renderCreate()));
$("#crSigPlay").addEventListener("click",()=>{const base=CHARS.find(c=>c.id===crBase);previewMotion(base,crSig,$("#crFirst").value.trim()||"대표 모션 미리보기");});
$("#crImg").addEventListener("change",e=>{const f=e.target.files&&e.target.files[0]; if(!f) return;
  const fr=new FileReader(); fr.onload=()=>{const im=new Image(); im.onload=()=>{
    const cv=document.createElement("canvas"); cv.width=600; cv.height=800; const g=cv.getContext("2d");
    const s=Math.max(600/im.width,800/im.height), w=im.width*s, h=im.height*s; g.drawImage(im,(600-w)/2,(800-h)/2,w,h);
    crImg=cv.toDataURL("image/jpeg",0.8); renderCreate(); }; im.src=fr.result; }; fr.readAsDataURL(f); });
$("#crSave").addEventListener("click",()=>{
  const u={id:"u_"+Date.now().toString(36),base:crBase,sig:crSig,img:crImg,name:$("#crName").value.trim().slice(0,12),hook:$("#crHook").value.trim().slice(0,40),
    arch:$("#crArch").value.trim().slice(0,12),persona:$("#crPersona").value.trim().slice(0,300),speech:$("#crSpeech").value.trim().slice(0,80),
    first:$("#crFirst").value.trim().slice(0,120),tags:$("#crTags").value.split(/[#,\s]+/).map(x=>x.trim()).filter(Boolean).slice(0,5)};
  W.myChars=W.myChars||[]; W.myChars.push(u);
  try{ save(); }catch(e){}
  CHARS.push(buildChar(u)); toast(`${u.name} 캐릭터를 만들었어요`); openDetail(u.id);
});

/* ───────── 대화 목록: 진행 중 대화 + 내 변화 기록 ───────── */
function recRow(r,i){const c=charObj(r.char)||CHARS[0];
  return `<button class="convrow" data-rec="${i}">${face(c)}<span class="st"><b>${esc(c.name)} · <span class="tn">${esc(r.title)}</span></b><small>대화 ${r.turn}번 · 결정적 순간 ${r.keys}번</small></span><span class="note">${esc(r.date)}</span></button>`;}
/* ───────── 마이페이지 ───────── */
function renderMy(){
  const ms=[["출석 체크",W.checkin],["결정적 순간 만나기",W.missions.key],["릴스 공유하기",W.missions.share],["이번 주 모션 챌린지",W.missions.chal]];
  $("#myBody").innerHTML=`
   <div class="panel"><h3>내 지갑</h3>
     <div class="row"><span class="coin"><i class="dot step"></i>스텝 <b>${W.step}</b></span><span class="coin"><i class="dot jump"></i>점프 <b>${W.jump}</b></span></div>
     <div class="row" style="margin-top:10px"><button class="btn sm" id="myWallet">스텝 받기 · 점프 충전</button></div></div>
   <div class="panel plusrow"><div><h3>무브로그 PLUS</h3><p class="note">${W.plus?"이용 중이에요":"광고 없이 · 고급 AI + 장기 기억 · 매월 점프 30"}</p></div><button class="btn ${W.plus?"":"gold"} sm" id="myPlus">${W.plus?"관리":"월 13,000원"}</button></div>
   <div class="row stats"><button class="stat" data-goto="list"><b>${(W.records||[]).length}</b><small>변화 기록</small></button><button class="stat" data-goto="studio"><b>${(W.posts||[]).length}</b><small>내 창작물</small></button><button class="stat" data-goto="make"><b>${(W.myChars||[]).length}</b><small>만든 캐릭터</small></button></div>
   <div class="panel" id="myRecs"><h3>내 이야기 기록</h3>${(W.records||[]).length?(W.records||[]).map(recRow).join(""):`<p class="note">대화를 3번 이상 하고 "릴스"를 누르면 주요 장면 릴스와 그래프가 여기에 쌓여요.</p>`}<button class="btn sm" id="demoRecBtn2" style="margin-top:8px">예시 기록 보기</button></div>
   <div class="panel"><h3>내 모션</h3><p class="note" style="margin:-4px 0 8px">산 모션과 장면 팩은 채팅의 👀 모션 보기와 릴스에 바로 나와요.</p>
     ${CHARS.map(c=>{const extra=ownedMotions(c).filter(m=>!c.motions.includes(m)), pk=packsOf(c).filter(p=>ownsPack(p.id));return `<div class="cxrow">${face(c)}<div class="cxl"><b>${esc(c.name)} <small>모션 ${ownedMotions(c).length}개${pk.length?` · 장면 팩 ${pk.length}`:""}</small></b><div class="cxchips">${pk.map(p=>`<span class="on">${esc(p.scene)} 팩</span>`).join("")}${extra.map(m=>`<span class="on">${esc(MOTIONS[m].label)}</span>`).join("")}${!pk.length&&!extra.length?`<span>기본 모션만</span>`:""}</div></div></div>`;}).join("")}
     <button class="btn sm" data-goto="motion" style="margin-top:8px">모션 피팅룸 가기</button></div>
   <div class="panel"><h3>미션</h3>${ms.map(m=>`<div class="mrow"><span>${m[0]}</span>${m[1]?'<span class="tag acc">완료</span>':'<span class="tag">진행 전</span>'}</div>`).join("")}</div>
   <div class="adbanner" data-ad="banner"${W.plus?" hidden":""}><span>광고 배너 영역 · 유형 도감 하단</span><button class="btn sm ghost" data-open="plus">PLUS면 광고 없음</button></div>`;
  $("#myWallet").addEventListener("click",()=>openWallet());
  $("#demoRecBtn2").addEventListener("click",()=>loadSample());

  $("#myPlus").addEventListener("click",()=>openPlus());
}
$("#recHome").addEventListener("click",()=>go("home"));
