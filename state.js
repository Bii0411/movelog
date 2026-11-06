/* state.js — 상태: 지갑(스텝·점프·PLUS), 현재 대화 상태(S). 브라우저에 저장 */
"use strict";
const SAVE_KEY="movelog:v2";
const W=Object.assign({step:12,stepExp:4,jump:0,plus:false,adsToday:0,checkin:false,missions:{key:false,share:false,chal:false},unlocked:[],packs:[],codex:{},myChars:[],records:[],posts:[],ownMotions:{},scenePacks:[],peekAds:0,convs:{}},(function(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||"{}")||{};}catch(e){return {};}})());
W.missions=Object.assign({key:false,share:false,chal:false},W.missions||{});
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(W));}catch(e){}}
function renderWallet(){
  $("#stepN").textContent=W.step; $("#jumpN").textContent=W.jump; document.querySelectorAll(".jumpMirror").forEach(e=>e.textContent=W.jump);
  $("#stepExp").textContent=W.stepExp?`· ${W.stepExp}개 7일 후 소멸`:"";
  $("#wPlus").classList.toggle("on",W.plus); $("#wPlus").textContent=W.plus?"PLUS 이용 중":"PLUS";
  document.querySelectorAll('[data-ad="banner"]').forEach(b=>b.hidden=W.plus);
}
function spend(cost,label){
  if(cost.step&&W.step>=cost.step){W.step-=cost.step;W.stepExp=Math.max(0,W.stepExp-cost.step);save();renderWallet();toast(`스텝 ${cost.step} 사용 · ${label}`);return true;}
  if(cost.jump&&W.jump>=cost.jump){W.jump-=cost.jump;save();renderWallet();toast(`점프 ${cost.jump} 사용 · ${label}`);return true;}
  openWallet(`재화가 부족해요. ${label}에는 ${cost.step?`스텝 ${cost.step} 또는 `:""}점프 ${cost.jump}이 필요해요.`);
  return false;
}
function earnStep(n,why){W.step+=n;save();renderWallet();toast(`스텝 +${n} · ${why}`);}

const S={story:"office",custom:null,char:"doyun",w:0,t:35,turn:0,hist:[],busy:false,isSample:false,lastMotion:null,lastKeyTurn:-9,replays:0,decor:{cam:"front",bg:"base",bgm:"none"},scriptIdx:0,laughs:0};
let recCache=null, view="home";
