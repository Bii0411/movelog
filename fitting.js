/* fitting.js — 모션 피팅룸 + 모션 보유/구매 공통 기능
   · 캐릭터에 모션을 옷 입히듯 입혀 보기 (미리보기는 무료)
   · 낱개 모션 구매, 장면 팩(고백 장면 팩 등) 구매
   · 다른 화면(채팅 '모션 보기', 스튜디오)에서도 여기 함수를 씀 */
"use strict";
function packsOf(c){return SCENE_PACKS.filter(p=>p.char===c.id);}
function ownsPack(id){return (W.scenePacks||[]).includes(id);}
function ownedMotions(c){
  const s=new Set(c.motions);
  ((W.ownMotions||{})[c.id]||[]).forEach(m=>s.add(m));
  packsOf(c).filter(p=>ownsPack(p.id)).forEach(p=>p.motions.forEach(m=>s.add(m)));
  return Array.from(s);
}
function ownsMotion(c,m){return ownedMotions(c).includes(m);}
function packWith(c,m){return packsOf(c).find(p=>p.motions.includes(m));}

/* 점프로 사기: 점프가 충분하면 "구매하시겠습니까?" 확인, 모자라면 충전(결제) 창으로 */
function buyWithJump(cost,label,onOk){
  if(W.jump<cost){ openWallet(`점프가 ${cost-W.jump}개 모자라요. ${label}에는 점프 ${cost}이 필요해요.`); return; }
  modal(`<h2>구매하시겠습니까?</h2>
   <div class="buybox"><b>${esc(label)}</b><span>점프 ${cost}</span></div>
   <p class="note" style="margin:0">보유 점프 ${W.jump} → 구매 후 ${W.jump-cost}</p>
   <div class="row" style="justify-content:flex-end"><button class="btn" id="buyNo">취소</button><button class="btn pri" id="buyYes">점프 ${cost}로 구매</button></div>`);
  $("#buyNo").addEventListener("click",()=>closeModal());
  $("#buyYes").addEventListener("click",()=>{ W.jump-=cost; save(); renderWallet(); closeModal(); toast(`점프 ${cost} 사용 · ${label}`); onOk(); });
}
function buyMotion(c,m,after){
  buyWithJump(motionPrice(m),`${c.name} · ${MOTIONS[m].label} 모션`,()=>{
    W.ownMotions=W.ownMotions||{}; (W.ownMotions[c.id]=W.ownMotions[c.id]||[]).push(m); save(); if(after) after(); });
}
function buyPack(p,after){
  buyWithJump(p.cost,p.name,()=>{ W.scenePacks=W.scenePacks||[]; W.scenePacks.push(p.id); save(); toast(`${p.name} 구매 완료 · 스튜디오에서 릴스를 만들 수 있어요`); if(after) after(); });
}

/* 모션 여러 개를 차례로 재생 (장면 팩 미리보기 · 릴스) */
let seqTimer=null;
function playSeq(seq,lines,target,opt,onStep){
  clearTimeout(seqTimer); let i=0;
  const step=()=>{ if(i>=seq.length){ if(onStep) onStep(-1); return; }
    const m=seq[i], line=lines?lines[i]:null;
    stage.play(m,Object.assign({target,sub:opt&&opt.noSub?null:line},opt||{}));
    if(onStep) onStep(i,line,m);
    i++; seqTimer=setTimeout(step,(stage.dur(m)+0.3)*1000); };
  step();
}
function seqDur(seq){return seq.reduce((a,m)=>a+stage.dur(m)+0.3,0);}

/* ───────── 모션 피팅룸 화면 ───────── */
const FIT={char:"doyun",cat:"전체",sel:null};
const FIT_CATS=["전체","감정표현","사회적 상호작용","춤","전투","일상"];
function openFitting(charId){
  if(charId) FIT.char=charId;
  if(!charObj(FIT.char)) FIT.char="doyun";
  show("motion"); const c=charObj(FIT.char);
  stage.setCharacter(c); stage.setScene(themesOf(c)[0]||STORIES[0]);
  FIT.sel=null; renderFitting();
}
function renderFitting(){
  const c=charObj(FIT.char);
  $("#fitChars").innerHTML=CHARS.map(x=>`<button class="avopt${x.id===c.id?" on":""}" data-fitc="${x.id}">${face(x)}<small>${esc(x.name)}</small></button>`).join("");
  $("#fitCats").innerHTML=FIT_CATS.map(k=>`<button class="pill${FIT.cat===k?" on":""}" data-fitcat="${k}">${k}</button>`).join("");
  const own=ownedMotions(c);
  const list=Object.keys(MOTIONS).filter(m=>m!=="idle"&&(FIT.cat==="전체"||MOTIONS[m].cat===FIT.cat))
    .sort((a,b)=>(own.includes(b)-own.includes(a))||(!!MOTION_FILES[b]-!!MOTION_FILES[a]));
  $("#fitGrid").innerHTML=list.map(m=>{const has=own.includes(m), base=c.motions.includes(m), pk=!has&&packWith(c,m);
    return `<button class="fitm${FIT.sel===m?" on":""}${has?" own":""}" data-fitm="${m}">
      ${MOTION_FILES[m]?'<span class="xs">XSTAGE</span>':'<span class="xs basic">기본</span>'}
      <b>${esc(MOTIONS[m].label)}</b><small>${esc(MOTIONS[m].cat)}</small>
      <span class="st">${has?(base?"기본 보유":"보유 중"):(pk?`팩 포함 · 점프 ${motionPrice(m)}`:`점프 ${motionPrice(m)}`)}</span></button>`;}).join("");
  renderFitBar();
  $("#fitPacks").innerHTML=packsOf(c).length?packsOf(c).map(p=>{const has=ownsPack(p.id);
    return `<div class="packcard"><div class="pkimg" style="background-image:linear-gradient(90deg,rgba(0,0,0,.85) 40%,rgba(0,0,0,.1)),url('${c.card}')"><span class="tag hot">${esc(p.scene)} 장면</span><b>${esc(p.name)}</b><small>${p.motions.map(m=>esc(MOTIONS[m].label)).join(" · ")}</small></div>
      <div class="row"><button class="btn sm" data-pkprev="${p.id}">▶ 장면 미리보기</button>${has?`<button class="btn sm pri" data-pkreel="${p.id}">릴스 만들기</button>`:`<button class="btn sm gold" data-pkbuy="${p.id}">점프 ${p.cost} · 릴스 장면 포함</button>`}</div></div>`;}).join(""):`<p class="note">이 캐릭터는 아직 장면 팩이 없어요. 낱개 모션을 입혀 보세요.</p>`;
}
function renderFitBar(){
  const c=charObj(FIT.char), m=FIT.sel, bar=$("#fitBar");
  if(!m){ bar.innerHTML=`<span class="note">모션을 누르면 ${esc(c.name)}에게 입혀 볼 수 있어요 · 미리보기는 무료</span>`; return; }
  const has=ownsMotion(c,m), pk=!has&&packWith(c,m);
  bar.innerHTML=`<span><b>${esc(MOTIONS[m].label)}</b><small>${has?"보유 중 · 채팅 '모션 보기'와 릴스에 나와요":(pk?`${esc(pk.name)}에도 들어 있어요`:"입혀 보는 중")}</small></span>`+
    (has?`<span class="tag acc">보유</span>`:`<button class="btn sm pri" id="fitBuy">점프 ${motionPrice(m)} 구매</button>`);
  const b=$("#fitBuy"); if(b) b.addEventListener("click",()=>buyMotion(c,m,()=>renderFitting()));
}
function fitPlay(m){ const c=charObj(FIT.char); stage.play(m,{target:"Fit",cam:true}); $("#hudFit").innerHTML=`입혀 보는 중 · <b>${esc(MOTIONS[m].label)}</b>`; }
$("#v-motion").addEventListener("click",e=>{
  const fc=e.target.closest("[data-fitc]"); if(fc){ FIT.char=fc.dataset.fitc; FIT.sel=null; const c=charObj(FIT.char); stage.setCharacter(c); stage.setScene(themesOf(c)[0]||STORIES[0]); renderFitting(); return; }
  const ct=e.target.closest("[data-fitcat]"); if(ct){ FIT.cat=ct.dataset.fitcat; renderFitting(); return; }
  const fm=e.target.closest("[data-fitm]"); if(fm){ FIT.sel=fm.dataset.fitm; document.querySelectorAll("#fitGrid .fitm").forEach(x=>x.classList.toggle("on",x===fm)); renderFitBar(); fitPlay(FIT.sel); $("#v-motion .scroll").scrollTo({top:0,behavior:"smooth"}); return; }
  const pv=e.target.closest("[data-pkprev]"); if(pv){ const p=SCENE_PACKS.find(x=>x.id===pv.dataset.pkprev); $("#hudFit").innerHTML=`장면 미리보기 · <b>${esc(p.scene)}</b>`; playSeq(p.seq,p.lines,"Fit",{cam:true}); $("#v-motion .scroll").scrollTo({top:0,behavior:"smooth"}); return; }
  const pb=e.target.closest("[data-pkbuy]"); if(pb){ const p=SCENE_PACKS.find(x=>x.id===pb.dataset.pkbuy); buyPack(p,()=>renderFitting()); return; }
  const pr=e.target.closest("[data-pkreel]"); if(pr){ openStudio(false,pr.dataset.pkreel); return; }
});
