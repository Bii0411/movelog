/* record.js — 변화 기록: 유형 카드, 그래프, 릴스, 꾸미기, 도감, 모션팩, 한마디·반응 */
"use strict";
function loadSample(){
  S.story="office";S.char="doyun";S.custom=null;
  const seq=[
   ["그거 그렇게 넣으면 또 씹혀. 비켜 봐.","cross",0,35,0,0,false,"",""],
   ["…또 그거야. 비켜 봐. 롤러에 종이 끼었네.","step_in",8,33,8,-2,false,"","프린터 또 고장 났어요… 도와줄 수 있어요?"],
   ["…단 거 안 마시는데. 뭐, 이번만.","look_away",22,31,14,-2,true,"처음 받아 든 커피","커피 사 왔는데 같이 마실래요?"],
   ["편 들어주는 게 일이야? 네 기획이 약했던 거야.","cross",20,47,-2,16,true,"부딪힌 회의실","아까 회의 때 왜 제 편 안 들어줬어요?"],
   ["…틀린 말은 안 했어. 근데 말이 좀 셌다.","sigh",28,44,8,-3,false,"","저도 서운했어요"],
   ["…고마울 거 없어. 대신 내일 그 기획, 나랑 다시 보자.","reach",50,48,22,4,true,"내민 손","그래도… 오늘 고마웠어요."],
   ["…택시 잡아 줄게. 늦었잖아.","toss",58,52,8,4,false,"","같이 나가요"]
  ];
  S.hist=[];
  seq.forEach((s,i)=>{ if(s[8]) S.hist.push({role:"user",text:s[8],turn:i}); S.hist.push({role:"char",text:s[0],motion:s[1],w:s[2],t:s[3],dw:s[4],dt:s[5],key:s[6],keyTitle:s[7],turn:i}); });
  S.w=58;S.t=52;S.turn=seq.length-1;S.replays=0;recCache=null;
  openRecord(true);
}

function openRecord(isSample,fromSaved){
  S.isSample=!!isSample;
  const c=charObj(), st=storyObj();
  show("record"); stage.setCharacter(c); stage.setScene(st);
  $("#sampleFlag").hidden=!S.isSample;
  const keys=keyCount(),q=typeKey(S.w,S.t,keys),ty=c.types[q]||GENERIC_TYPES[q];
  $("#recEyebrow").textContent=`${st.genre} · ${st.title}`;
  $("#recTitle").textContent=`${c.name} 이야기 기록`;
  const rf=$("#recFace"); rf.style.backgroundImage=`url('${c.card}')`;
  $("#recSumName").textContent=st.title;
  $("#recSumStat").textContent=`대화 ${S.turn}번 · 결정적 순간 ${keys}번 · XSTAGE 모션 ${new Set(S.hist.filter(h=>h.key).map(h=>h.motion)).size}종`;
  if(!isSample&&!fromSaved) saveRecord(c,st,q,keys);
  drawGraph(); drawReels(c); drawDecor(); drawPack(c); renderEnding(c,q,ty); updateReplayLeft();
  const pick=S.hist.find(h=>h.key)||S.hist.filter(h=>h.role==="char").slice(-1)[0];
  if(pick) setTimeout(()=>replay(pick,true),350);
}
function updateReplayLeft(){$("#replayLeft").textContent=W.plus?"다시 보기 무제한 (PLUS)":`무료 다시 보기 ${Math.max(0,5-S.replays)}회 남음`;}
function replay(h,free){
  if(!free&&!W.plus){ if(S.replays>=5){openPlus("무료 다시 보기 5회를 모두 썼어요. PLUS는 무제한이에요.");return;} S.replays++; updateReplayLeft(); }
  const txt=$("#recText");
  if($("#cmpText").checked){ txt.hidden=false; txt.textContent=(h.narration?`(${h.narration})\n`:"")+"“"+h.text+"”"; }
  else { txt.hidden=true; stage.play(h.motion,{sub:h.text,key:h.key?(h.keyTitle||"결정적 순간"):null,target:"Rec",cam:S.decor.cam==="close"?"close":(h.key?true:false)}); }
  $("#hudRec").innerHTML=`${h.turn}번째 대화 · <b>${esc(MOTIONS[h.motion].label)}</b>`;
}
$("#cmpText").addEventListener("change",()=>{ if(!$("#cmpText").checked) $("#recText").hidden=true; });
function drawGraph(){
  const pts=S.hist.filter(h=>h.role==="char");
  const Wd=560,H=220,pl=34,pr=16,pt=16,pb=26,n=Math.max(1,pts.length-1);
  const x=i=>pl+(Wd-pl-pr)*i/n, y=v=>pt+(H-pt-pb)*(1-(v+100)/200);
  const lw=pts.map((p,i)=>`${x(i).toFixed(1)},${y(p.w).toFixed(1)}`).join(" ");
  const lt=pts.map((p,i)=>`${x(i).toFixed(1)},${y(p.t).toFixed(1)}`).join(" ");
  let g=`<svg viewBox="0 0 ${Wd} ${H}" role="img" aria-label="성향 변화 그래프">`;
  for(const v of [-100,-50,0,50,100]) g+=`<line x1="${pl}" x2="${Wd-pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v===0?"":'stroke-dasharray="3 4"'}/><text x="${pl-6}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="var(--muted)">${v}</text>`;
  pts.forEach((p,i)=>{ g+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--muted)">${p.turn}</text>`; });
  g+=`<polygon points="${pl},${y(0)} ${lw} ${x(pts.length-1)},${y(0)}" fill="var(--accent)" fill-opacity=".12"/>`;
  g+=`<polyline points="${lt}" fill="none" stroke="var(--cool)" stroke-width="2" stroke-dasharray="5 4"/>`;
  g+=`<polyline points="${lw}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>`;
  pts.forEach((p,i)=>{const anc=i===pts.length-1&&pts.length>1?"end":(i===0?"start":"middle");
    if(p.key) g+=`<g class="dot" data-i="${S.hist.indexOf(p)}" tabindex="0"><circle cx="${x(i)}" cy="${y(p.w)}" r="7" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/><text x="${x(i)}" y="${y(p.w)-12}" text-anchor="${anc}" font-size="11" fill="var(--ink)">${esc(p.keyTitle||"결정적 순간")}</text></g>`;
    else g+=`<circle cx="${x(i)}" cy="${y(p.w)}" r="2.5" fill="var(--accent)"/>`;});
  $("#graph").innerHTML=g+"</svg>";
  $("#graph").querySelectorAll(".dot").forEach(d=>{const go=()=>replay(S.hist[+d.dataset.i]);d.addEventListener("click",e=>go(e));d.addEventListener("keydown",e=>{if(e.key==="Enter")go();});});
}
function reelPicks(){
  const chars=S.hist.filter(h=>h.role==="char");
  let picks=chars.filter(h=>h.key).concat(chars.filter(h=>!h.key).sort((a,b)=>(Math.abs(b.dw)+Math.abs(b.dt))-(Math.abs(a.dw)+Math.abs(a.dt)))).slice(0,4);
  if(chars[0]&&!picks.includes(chars[0])) picks.unshift(chars[0]);
  return picks.slice(0,5).sort((a,b)=>a.turn-b.turn);
}
function drawReels(c){
  const st=storyObj();
  $("#reels").innerHTML=reelPicks().map((h,i)=>`<button class="reel" data-r="${S.hist.indexOf(h)}" style="background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.8)),url('${c.card}') center 15% / cover"><span class="n">#${i+1} · ${h.turn}번째</span><span class="wm">재생</span><span class="t">${esc(h.key?(h.keyTitle||"결정적 순간"):(h.turn===0?"첫 만남":MOTIONS[h.motion].label))}</span><span class="q">“${esc(h.text)}”</span></button>`).join("");
  $("#reels").querySelectorAll(".reel").forEach(b=>b.addEventListener("click",()=>replay(S.hist[+b.dataset.r])));
}
const DECOR={cam:[["front","정면",0],["close","클로즈업",5],["orbit","회전",5]],bg:[["base","기본",0],["sunset","노을",5],["neon","네온",5]],bgm:[["none","없음",0],["calm","잔잔",3],["tense","긴장",3]]};
function drawDecor(){
  const lbl={cam:"카메라",bg:"배경",bgm:"BGM"};
  $("#decor").innerHTML=Object.keys(DECOR).map(k=>`<div class="optrow"><span class="l">${lbl[k]}</span>${DECOR[k].map(o=>`<button data-dk="${k}" data-dv="${o[0]}" class="${S.decor[k]===o[0]?"on":""}">${o[1]}${o[2]&&!W.plus?`<span class="p">점프 ${o[2]}</span>`:""}</button>`).join("")}</div>`).join("")+
   `<div class="optrow"><span class="l">저장</span><button data-save="720">720p 저장</button><button data-save="1080">1080p 고화질${W.plus?"":'<span class="p">PLUS</span>'}</button></div>`;
}
$("#decor").addEventListener("click",e=>{
  const b=e.target.closest("[data-dk]");
  if(b){const k=b.dataset.dk,o=DECOR[k].find(x=>x[0]===b.dataset.dv);
    if(S.decor[k]===o[0]) return;
    if(o[2]&&!W.plus&&!spend({jump:o[2]},`릴스 꾸미기 · ${o[1]}`)) return;
    S.decor[k]=o[0]; drawDecor(); stage.decor(S.decor,storyObj());
    const h=S.hist.find(x=>x.key)||S.hist[S.hist.length-1]; if(h) replay(h,true); return;}
  const s=e.target.closest("[data-save]");
  if(s){ if(s.dataset.save==="1080"&&!W.plus){openPlus("고화질 저장은 PLUS 혜택이에요.");return;} toast(`${s.dataset.save}p 9:16 릴스 저장 (시연용 · 실제 파일 저장은 브라우저 녹화로 구현 예정)`); }
});
const TYPE_HINT={
  A:"마음 온도 40 이상, 긴장 50 미만으로 대화를 끝내면 열려요. 다정하게, 편안하게 다가가 보세요.",
  B:"마음 온도 40 이상, 긴장 50 이상으로 끝내면 열려요. 티격태격하면서도 마음을 열게 해 보세요.",
  C:"마음 온도 40 미만, 긴장 50 이상으로 끝내면 열려요. 계속 부딪히면 이 결말로 가요.",
  D:"마음 온도 40 미만, 긴장 50 미만으로 끝내면 열려요. 거리를 두면 이 결말로 가요.",
  H:"마음 온도 75 이상 + 결정적 순간 3번 이상으로 대화를 끝내면 열려요."
};
function drawCodex(c,q){
  W.codex[c.id]=W.codex[c.id]||[]; if(!W.codex[c.id].includes(q)) W.codex[c.id].push(q);
  W.hints=W.hints||[]; save();
  const got=W.codex[c.id];
  $("#codex").innerHTML=["A","B","C","D","H"].map(k=>{
    const has=got.includes(k), hid=k==="H", hintOpen=W.hints.includes(c.id+k);
    if(has) return `<button class="cx got" data-cx="${k}"><span class="tag acc">${hid?"히든":"도달"}</span><b>${esc(c.types[k][0])}</b><span class="note">눌러서 설명 보기</span></button>`;
    if(hid) return `<button class="cx lock" data-cx="H"><span class="tag">히든</span><b>???</b><span class="note">${hintOpen?"힌트 열림":"스텝 5로 힌트 보기"}</span></button>`;
    return `<button class="cx lock" data-cx="${k}"><span class="tag">미도달</span><b>${esc(c.types[k][0])}</b><span class="note">눌러서 조건 보기</span></button>`;
  }).join("");
  $("#codexTitle").textContent=`유형 도감 ${got.filter(k=>k!=="H").length}/4 · 히든 ${got.includes("H")?"발견":"?"}`;
  $("#codex").querySelectorAll("[data-cx]").forEach(b=>b.addEventListener("click",()=>{
    const k=b.dataset.cx;
    if(got.includes(k)){ toast(`${c.types[k][0]} · ${c.types[k][1]}`); return; }
    if(k==="H"&&!W.hints.includes(c.id+"H")){
      if(!spend({step:5,jump:3},"히든 유형 힌트")) return;
      W.hints.push(c.id+"H"); save(); drawCodex(c,q);
    }
    toast(TYPE_HINT[k]);
  }));
}
function drawPack(c){   /* 이 캐릭터의 장면 팩 홍보: 사면 이 장면으로 릴스를 만들 수 있어요 */
  const ps=packsOf(c);
  $("#packRow").innerHTML=ps.length?ps.map(p=>`<div class="mrow"><div><div class="t">${esc(p.name)}</div><div class="d">${p.motions.map(m=>esc(MOTIONS[m].label)).join(" · ")} · 이 장면으로 릴스 만들기</div></div>${ownsPack(p.id)?`<button class="btn sm pri" data-pkreel2="${p.id}">릴스 만들기</button>`:`<button class="btn sm gold" data-pkgo="${c.id}">피팅룸에서 보기</button>`}</div>`).join(""):`<div class="mrow"><div><div class="t">모션 피팅룸</div><div class="d">낱개 모션을 입혀 보고 살 수 있어요</div></div><button class="btn sm" data-pkgo="${c.id}">가 보기</button></div>`;
}
$("#packRow").addEventListener("click",e=>{const g=e.target.closest("[data-pkgo]"); if(g){openFitting(g.dataset.pkgo);return;} const r2=e.target.closest("[data-pkreel2]"); if(r2) openStudio(false,r2.dataset.pkreel2);});
const ENDINGS={
 A:{doyun:"처음엔 귀찮기만 했는데. …이제 네가 없으면 좀 허전하네. 말 시키지 마.",jihu:"어떤 날이든 제일 먼저 달려갈게. 그게 나야.",ijun:"계산은 그만할게요. 그냥… 당신이랑 있는 게 좋아요.",haram:"무대에 서는 순간, 객석에서 너부터 찾을 거야.",seoa:"오글거리는 말은 한 번만 할게. 넌 내 사람이야."},
 B:{doyun:"착각하지 마. 네가 곤란하면 내가 귀찮아지니까 챙기는 거야.",jihu:"친구 맞아. …근데 가끔은 그 말이 조금 아쉬워.",ijun:"방금 그 대화, 녹음해 둘걸 그랬어요. 너무 웃겨서요.",haram:"너랑 투닥거리다 보니까 실력이 늘었어. 다음엔 내가 이겨!",seoa:"내일도 붙자. 대신 지면 진짜 밥 사."},
 C:{doyun:"…어디 가지 마. 네가 안 보이면 불안해져.",jihu:"괜찮아, 나 원래 잘 웃잖아. …오늘만 조금 쉬고 싶어.",ijun:"당신 마음을 계산하는 게 제일 어려운 문제였어요.",haram:"나 조금만 쉬어도 될까? 그래도 너는 옆에 있어 줘.",seoa:"인정은 해. 근데 지고 싶진 않아."},
 D:{doyun:"…잘 지내. 다치지 말고.",jihu:"조금 떨어져 있어도 응원할게. 늘.",ijun:"좋은 동료였어요. 진심으로요.",haram:"꿈은 잠깐 미뤄도, 춤은 계속 출 거야.",seoa:"필요하면 불러. 딱 거기까지만."},
 H:{doyun:"구해준 건 나라고 생각했는데. 사실은 네가 날 구한 거였어.",jihu:"몇 번을 다시 만나도, 난 너랑 친구가 될 거야.",ijun:"어떤 데이터로도 설명 못 해요. 그래서 더 확실해요.",haram:"센터에 서서 제일 먼저 하고 싶은 말이 있었어. 고마워.",seoa:"내 등은 네가 맡아. 네 등은 내가 맡을게."}
};
function reactFallback(o,me,q){
  const nm=me.name.slice(-2);
  const M={
   doyun:{A:`${nm} 저렇게 웃는 건 처음 보네.`,B:"…잘 맞나 보네.",C:"적당히 해. 둘 다 다친다.",D:"뭐, 그럴 수도 있지.",H:"…부럽다는 말은 안 해."},
   jihu:{A:`${nm} 표정이 정말 편해 보여. 다행이다.`,B:"투닥거리는 것도 둘이 하면 귀엽네.",C:"괜찮은 거지? 무슨 일 있으면 말해 줘.",D:"또 좋은 날이 올 거야.",H:"이런 결말도 있구나. 울컥했어."},
   ijun:{A:`통계적으로 이 결말은 ${RARITY.A}%인데, 대단하네요.`,B:"대화 패턴이 아주 흥미로워요.",C:"긴장 수치가 너무 높아요. 휴식 권장.",D:"가장 흔한 결과지만 나쁘진 않아요.",H:"히든 유형이요? 관측 사례가 거의 없는데…!"},
   haram:{A:"와, 완전 드라마 엔딩이다! 나 박수 칠래!",B:"둘이 라이벌이야? 나도 끼워 줘!",C:"힘들 땐 같이 춤추면 좀 나아져!",D:"그래도 둘 다 멋있었어!",H:"이건 센터 감이다… 진짜로."},
   seoa:{A:"잘했네. 진작 그렇게 말하지.",B:"보니까 나도 붙고 싶어지네.",C:"선은 넘지 마. 지켜보고 있어.",D:"깔끔해서 좋네.",H:"인정. 이건 진짜 인정."}
  };
  return M[o.id][q];
}
async function renderEnding(c,q,ty){
  const others=CHARS.filter(x=>x.id!==c.id&&!x.custom).slice(0,4);
  const fill=(ending,rs)=>{
    $("#ending").textContent="“"+ending+"”";
    $("#reacts").innerHTML=others.map(o=>`<div class="react">${face(o)}<div><small>${esc(o.name)} · ${esc(o.arch)}</small><p></p></div></div>`).join("");
    $("#reacts").querySelectorAll(".react p").forEach((p,i)=>{p.textContent=rs[others[i].id]||reactFallback(others[i],c,q);});
  };
  fill(ENDINGS[q][c.id]||GENERIC_ENDINGS[q],{});
  if(S.isSample||S.scriptIdx>0) return;
  if(recCache&&recCache.key===q+S.turn){fill(recCache.ending,recCache.rs);return;}
  const j=await getEnding(c,ty[0],others);
  if(!j) return;
  const ending=typeof j.ending==="string"&&j.ending.trim()?j.ending.trim().slice(0,200):(ENDINGS[q][c.id]||GENERIC_ENDINGS[q]);
  const rs={}; for(const o of others){const v=j.reactions&&j.reactions[o.id]; if(typeof v==="string"&&v.trim()) rs[o.id]=v.trim().slice(0,90);}
  recCache={key:q+S.turn,ending,rs}; fill(ending,rs);
}

/* ───────── 변화 기록 저장 · 다시 열기 (대화 탭 / 마이페이지에서) ───────── */
function saveRecord(c,st,q,keys){
  W.records=W.records||[];
  const d=new Date(), date=`${d.getMonth()+1}.${d.getDate()}`;
  W.records.unshift({char:c.id,story:S.story,custom:S.story==="custom"?S.custom:null,title:st.title,q,keys,w:S.w,t:S.t,turn:S.turn,date,
    hist:S.hist.map(h=>({role:h.role,text:h.text,narration:h.narration||"",motion:h.motion,w:h.w,t:h.t,dw:h.dw||0,dt:h.dt||0,key:!!h.key,keyTitle:h.keyTitle||"",turn:h.turn}))});
  W.records=W.records.slice(0,15); save();
}
function openSavedRecord(i){
  const r=(W.records||[])[i]; if(!r) return;
  Object.assign(S,{char:r.char,story:r.story,custom:r.custom,hist:r.hist.map(h=>Object.assign({},h)),w:r.w,t:r.t,turn:r.turn,replays:0,scriptIdx:1});
  recCache=null; openRecord(false,true);
}
$("#toStudio").addEventListener("click",()=>openStudio(true));
