/* shop.js — 수익화: 변화 기록 전 광고, 공유, 지갑, 보상형 광고, PLUS */
"use strict";
function gateRecord(){
  if(W.plus){openRecord(false);return;}
  modal(`<h2>광고</h2><div class="adfake">광고 영역 (시연용)<br><small>대화가 끝난 뒤, 변화 기록 진입 직전에만 1회 노출</small></div>
   <div class="row" style="justify-content:space-between"><button class="btn gold sm" data-open="plus">PLUS면 광고 없이 바로</button><button class="btn pri" id="adSkip" disabled>5초 후 건너뛰기</button></div>`);
  let n=5; const b=$("#adSkip"); const iv=setInterval(()=>{n--; if(n<=0){clearInterval(iv);b.disabled=false;b.textContent="변화 기록 보기";} else b.textContent=`${n}초 후 건너뛰기`;},1000);
  b.addEventListener("click",()=>{closeModal();openRecord(false);});
}


$("#shareBtn").addEventListener("click",()=>{
  const c=charObj(),st=storyObj(),q=typeKey(S.w,S.t,keyCount()),h=S.hist.find(x=>x.key)||S.hist[S.hist.length-1];
  const link=`movelog.app/s/${Math.random().toString(36).slice(2,8)}`;
  modal(`<h2>릴스로 공유</h2>
   <div class="sharecard" style="background:linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.8)),url('${c.card}') center 15% / cover">
     <div class="row" style="justify-content:space-between"><span class="tag" style="background:rgba(255,255,255,.18);color:#fff">${esc(st.genre)}</span><span style="font-size:10.5px;opacity:.85">무브로그</span></div>
     <div><div style="font-size:12px;opacity:.85;margin-bottom:6px">결정적 순간 · ${esc(h.keyTitle||"첫 만남")}</div><div class="q">“${esc(h.text)}”</div>
     <div style="font-size:11px;opacity:.8;margin-top:10px">Motion by XSTAGE · ${esc(MOTIONS[h.motion].label)}</div>
     <div style="font-size:12px;margin-top:8px;font-weight:600">이 장면에서 이어서 대화하기 →</div></div>
   </div>
   <p class="note" style="margin:0">9:16 영상에 워터마크와 "이어서 대화하기" 링크가 붙어요. 링크를 연 사람은 같은 이야기·같은 캐릭터의 이 장면부터 바로 시작해요.</p>
   <div class="linkbox"><input id="shareLink" value="${link}" readonly aria-label="공유 링크"><button class="btn sm" id="copyLink">링크 복사</button></div>
   <div class="row"><span class="tag">인스타그램 릴스</span><span class="tag">틱톡</span><span class="tag">유튜브 쇼츠</span><span class="tag">커뮤니티 피드</span></div>
   <div class="row" style="justify-content:flex-end"><button class="btn pri" id="doShare">공유하기 (시연용)</button></div>`);
  $("#copyLink").addEventListener("click",()=>{const v=$("#shareLink").value;try{navigator.clipboard.writeText(v).then(()=>toast("링크를 복사했어요"),()=>$("#shareLink").select());}catch(e){$("#shareLink").select();}});
  $("#doShare").addEventListener("click",()=>{closeModal(); if(!W.missions.share){W.missions.share=true;earnStep(5,"미션: 릴스 공유");} else toast("공유했어요 (시연용)");});
});

function modal(html){$("#mbox").innerHTML=html+`<button class="btn ghost sm" id="mClose" style="align-self:flex-end">닫기</button>`;$("#modal").hidden=false;$("#mClose").addEventListener("click",e=>closeModal(e));}
function closeModal(){$("#modal").hidden=true;}
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){ if(!$("#modal").hidden) closeModal(); else if(!$("#ov").hidden) closeOv(); }});
$("#wStep").addEventListener("click",()=>openWallet());
document.addEventListener("click",e=>{ if(e.target.closest("[data-open-wallet]")) openWallet(); });
$("#wJump").addEventListener("click",()=>openWallet());
$("#wPlus").addEventListener("click",()=>openPlus());
function openWallet(msg){
  const ms=[["checkin","출석 체크",2,W.checkin],["key","결정적 순간 만나기",3,W.missions.key],["share","릴스 공유하기",5,W.missions.share],["chal","이번 주 모션 챌린지 참여",5,W.missions.chal]];
  modal(`<h2>내 지갑</h2>${msg?`<p class="flag" style="margin:0;font-size:13px">${esc(msg)}</p>`:""}
   <div class="row"><span class="coin"><i style="background:var(--step)"></i>스텝 <b>${W.step}</b></span><span class="coin"><i style="background:var(--jump)"></i>점프 <b>${W.jump}</b></span></div>
   <div class="note">스텝: 출석·미션·보상형 광고로 받는 무료 재화(유효기간 있음) · 점프: 결제로 사는 유료 재화(사용처가 더 넓고 커뮤니티 거래에도 사용)</div>
   <h3 style="font-size:16px">스텝 받기</h3>
   <div class="mrow"><div><div class="t">보상형 광고 보기</div><div class="d">원할 때만 시청 · 하루 3번 · 오늘 ${W.adsToday}/3</div></div><button class="btn sm" id="rwAd" ${W.adsToday>=3?"disabled":""}>광고 보고 스텝 3</button></div>
   ${ms.map(m=>`<div class="mrow"><div><div class="t">${m[1]}</div><div class="d">스텝 ${m[2]}</div></div>${m[3]?'<span class="tag acc">완료</span>':(m[0]==="checkin"?`<button class="btn sm" id="doCheck">받기</button>`:'<span class="tag">진행 전</span>')}</div>`).join("")}
   <h3 style="font-size:16px">점프 충전</h3>
   ${[[30,""],[80,"보너스 +5"],[200,"보너스 +20"]].map(p=>`<div class="mrow"><div><div class="t">점프 ${p[0]}</div><div class="d">${p[1]||"기본"} · 가격 책정 보류 (활동지 기준)</div></div><button class="btn sm" data-buy="${p[0]}">시연용 충전</button></div>`).join("")}
   <p class="note" style="margin:0">모든 결제는 시연용이며 실제 결제가 일어나지 않아요.</p>`);
  const ra=$("#rwAd"); if(ra) ra.addEventListener("click",()=>{closeModal();rewardAd();});
  const dc=$("#doCheck"); if(dc) dc.addEventListener("click",()=>{W.checkin=true;earnStep(2,"출석 체크");openWallet();});
  document.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>{const n=+b.dataset.buy;W.jump+=n+(n===80?5:n===200?20:0);save();renderWallet();toast("점프 충전 (시연용)");openWallet();}));
}
function rewardAd(){
  modal(`<h2>보상형 광고</h2><div class="adfake">광고 영역 (시연용)<br><small>끝까지 보면 스텝 3을 받아요</small></div><div class="row" style="justify-content:flex-end"><button class="btn pri" id="rwDone" disabled>5초 남음</button></div>`);
  let n=5;const b=$("#rwDone");const iv=setInterval(()=>{n--; if(n<=0){clearInterval(iv);b.disabled=false;b.textContent="스텝 받기";} else b.textContent=`${n}초 남음`;},1000);
  b.addEventListener("click",()=>{W.adsToday++;closeModal();earnStep(3,"보상형 광고");});
}
function openPlus(msg){
  modal(`<h2>무브로그 PLUS</h2>${msg?`<p class="flag" style="margin:0;font-size:13px">${esc(msg)}</p>`:""}
   <div class="row" style="align-items:baseline"><span style="font-family:var(--display);font-size:30px;font-weight:700">월 13,000원</span><span class="note">웹 결제 기준 · 앱 결제가는 마켓 수수료 때문에 별도</span></div>
   <div class="mrow"><div class="t">광고 전면 제거</div><span class="note">배너·변화 기록 전 광고</span></div>
   <div class="mrow"><div class="t">고급 AI 모델 + 장기 기억</div><span class="note">이전 사건과 선택을 더 오래 기억</span></div>
   <div class="mrow"><div class="t">매월 점프 30 지급</div><span class="note">구독 시작 시 바로 지급</span></div>
   <div class="mrow"><div class="t">결정적 순간 다시 보기 무제한</div><span class="note">무료는 기록당 5회</span></div>
   <div class="mrow"><div class="t">릴스 고화질 저장 · 꾸미기 무료</div><span class="note">1080p, 카메라·배경·BGM</span></div>
   <p class="note" style="margin:0">비교: 제타 14,900원 · 크랙 19,900원 · 캐릭터 AI 13,400원 · 케이브덕 25,000원 (활동지 조사 기준). 시연용이라 실제 결제는 없어요.</p>
   <div class="row" style="justify-content:flex-end"><button class="btn ${W.plus?"":"gold"}" id="plusToggle">${W.plus?"구독 해지 (시연용)":"구독하기 (시연용)"}</button></div>`);
  $("#plusToggle").addEventListener("click",()=>{W.plus=!W.plus; if(W.plus){W.jump+=30;toast("PLUS 시작 · 점프 30 지급");} else toast("PLUS를 해지했어요"); save(); renderWallet(); closeModal(); if(view==="record"){drawDecor();updateReplayLeft();}});
}
