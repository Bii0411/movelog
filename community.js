/* community.js — 커뮤니티: 모션 챌린지, 공유 피드, 캐릭터 팩 마켓, 굿즈 (예시 데이터) */
"use strict";
const FEED=[
 {c:"doyun",s:"office",type:"츤데레형",title:"내민 손",q:"…고마울 거 없어. 대신 내일 그 기획, 나랑 다시 보자.",m:"reach",likes:"2.4천",user:"야근요정"},
 {c:"haram",s:"campus",type:"데뷔 확정형",title:"하트 챌린지",q:"이 기분 그대로 하트 챌린지 간다! 잘 봐!",m:"heart",likes:"5.1천",user:"하람이응원단"},
 {c:"ijun",s:"zombie",type:"티키타카 장인형",title:"터져 버린 웃음",q:"좀비는 소리에 반응한다니까요! …지금 웃으면 안 돼요, 진짜로.",m:"fluster",likes:"1.8천",user:"생존왕"},
 {c:"jihu",s:"palace",type:"평생 내 편형",title:"기대도 돼",q:"힘들면 그냥 기대. 말 안 해도 돼.",m:"pat",likes:"3.0천",user:"달빛산책"}
];
const MARKET=[
 {n:"비 오는 날의 편의점",by:"새벽창작",price:"무료",desc:"편의점 야간 알바생 캐릭터 · 말투 설정 + XSTAGE 모션 6종(우산 건네기 등)",c:"#4a6a7a"},
 {n:"왕실 기사단장 세트",by:"검과장미",price:"점프 20",desc:"판타지 기사 캐릭터 · 무릎 꿇기·검 들기 등 XSTAGE 전투 모션 포함",c:"#6a5a3a"},
 {n:"고양이 카페 사장님",by:"말랑공방",price:"점프 15",desc:"힐링 캐릭터 · 쓰다듬기·하품 등 일상 모션 8종",c:"#8a6a5a"}
];
function feedList(){return (W.posts||[]).filter(p=>charObj(p.c)).map(p=>Object.assign({mine:true},p)).concat(FEED);}
function renderCommunity(){
  $("#feed").innerHTML=feedList().map((p,i)=>{const c=charObj(p.c);
    return `<div class="post"><div class="vis" style="background:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.85)),url('${p.img||c.card}') center 15% / cover"><span class="wm">Motion by XSTAGE · ${esc(MOTIONS[p.m].label)}</span><div style="font-size:12px;opacity:.85;margin-bottom:6px">${esc(c.name)} · ${esc(p.title)}</div><div class="q">“${esc(p.q)}”</div></div>
    <div class="meta"><div class="row" style="justify-content:space-between"><span class="tag acc">${esc(p.title)}</span><span class="note">${p.mine?'<b class="minetag">내 창작물</b>':`@${esc(p.user)} · 좋아요 ${p.likes} · 예시`}</span></div>
    <div class="row"><button class="btn sm" data-feedplay="${i}">장면 보기</button><button class="btn sm pri" data-feedgo="${i}">이어서 대화하기</button></div></div></div>`;}).join("");
  $("#packs").innerHTML=MARKET.map(m=>`<div class="card"><div class="swatch" style="background:linear-gradient(135deg,${m.c},#222)"><b>캐릭터 팩</b><span class="lock">${esc(m.price)}</span></div><h3>${esc(m.n)}</h3><p>${esc(m.desc)}</p><span class="note">창작자 @${esc(m.by)} · 예시</span></div>`).join("");
  $("#goods").innerHTML=[["아크릴 스탠드","결정적 순간 장면 그대로, 내 유형 카드와 함께"],["포토카드 세트","주요 장면 릴스 5컷을 카드로"],["캐릭터 키링","인기 캐릭터 · 창작자와 수익 분배"]].map(g=>`<div class="card"><h3>${g[0]}</h3><p>${g[1]}</p><span class="tag" style="align-self:flex-start">주문 제작 예정</span></div>`).join("");
}
document.addEventListener("click",e=>{
  const fp=e.target.closest("[data-feedplay]"); if(fp){const p=feedList()[+fp.dataset.feedplay];stage.setCharacter(charObj(p.c));stage.setScene(allStories().find(x=>x.id===p.s));stage.play(p.m,{sub:p.q,key:p.title,target:"Com",cam:true});$("#v-community .scroll").scrollTo({top:0,behavior:"smooth"});return;}
  const fg=e.target.closest("[data-feedgo]"); if(fg){const p=feedList()[+fg.dataset.feedgo];S.char=p.c;S.story=allStories().some(x=>x.id===p.s)?p.s:"office";startChat();addNarr(`공유된 장면 "${p.title}"에서 이어서 시작해요.`);return;}
});
$("#chalPreview").addEventListener("click",()=>{stage.setCharacter(charObj("haram"));stage.setScene(STORIES[2]);stage.play("heart",{sub:"이 기분 그대로 하트 챌린지 간다!",key:"하트 챌린지",target:"Com",cam:true});});
$("#chalGo").addEventListener("click",()=>{S.char="haram";S.story="campus";startChat();addNarr("챌린지: 하람이를 세 번 웃게 해 보세요. (ㅋㅋ, 웃기다, 춤 같은 말이 통해요)");});
