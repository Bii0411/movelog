/* studio.js — 2차 창작 스튜디오: 결정적 순간으로 릴스(9:16 영상) · 유형 카드 · 포토카드 만들기 → 저장 · 피드에 올리기 */
"use strict";
const ST={scenes:[],i:0,kind:"reel",cam:"close",bg:"base",busy:false,capNow:null};
const ST_SAMPLE=[
 {char:"doyun",story:"office",motion:"look_away",text:"…단 거 안 마시는데. 뭐, 이번만.",title:"처음 받아 든 커피",q:"B"},
 {char:"doyun",story:"t_doyun_vamp",motion:"step_in",text:"…쏘라고 했지, 맞으라고는 안 했어.",title:"대신 맞은 은화살",q:"A"},
 {char:"haram",story:"t_haram_final",motion:"heart",text:"이 하트, 카메라 거 아니야. 너 거야.",title:"카메라 대신 보낸 하트",q:"A"},
 {char:"seoa",story:"t_seoa_fight",motion:"punch",text:"지라고? 나 그런 거 못 배웠는데.",title:"무시한 신호",q:"B"}
];
function collectScenes(){
  const out=[];
  /* 장면 팩: 산 팩은 바로, 안 산 팩은 잠금으로 보여 줘요 */
  SCENE_PACKS.forEach(p=>{ if(charObj(p.char)) out.push({char:p.char,story:(themesOf(charObj(p.char))[0]||STORIES[0]).id,motion:p.seq[0],seq:p.seq,lines:p.lines,text:p.lines[p.lines.length-1],title:p.name.split(" · ")[1]||p.scene,pack:p.id,locked:!ownsPack(p.id)}); });
  const fromHist=(hist,char,story,q)=>hist.filter(h=>h.key).forEach(h=>out.push({char,story,motion:h.motion,text:h.text,title:h.keyTitle||"결정적 순간",q,mine:true}));
  if(S.hist.length&&!S.isSample) fromHist(S.hist,S.char,S.story,"A");
  (W.records||[]).forEach(r=>fromHist(r.hist,r.char,r.story,r.q));
  const seen=new Set(), uniq=out.filter(s=>{const k=s.char+s.text; if(seen.has(k)) return false; seen.add(k); return charObj(s.char);});
  const owned=uniq.filter(s=>s.pack&&!s.locked), mine=uniq.filter(s=>!s.pack), locked=uniq.filter(s=>s.locked);
  return owned.concat(mine.slice(0,12),ST_SAMPLE,locked);
}
function openStudio(fromRecord,packId){
  ST.scenes=collectScenes(); ST.i=0;
  if(fromRecord){ const k=ST.scenes.findIndex(s=>s.mine); if(k>=0) ST.i=k; }
  if(packId){ const k=ST.scenes.findIndex(s=>s.pack===packId); if(k>=0) ST.i=k; }
  show("studio"); renderStudio(); setTimeout(()=>studioPlay(),400);
}
function curScene(){return ST.scenes[ST.i]||ST.scenes[0];}
function renderStudio(){
  const sc=curScene(), c=charObj(sc.char);
  $("#stScenes").innerHTML=ST.scenes.map((s,i)=>{const ch=charObj(s.char);
    return `<button class="scene${i===ST.i?" on":""}${s.locked?" locked":""}" data-sc="${i}" style="background-image:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.85)),url('${ch.card}')"><span class="sn${s.pack?" pk":""}">${s.pack?(s.locked?"🔒 장면 팩":"장면 팩"):(s.mine?"내 대화":"예시")}</span><b>${esc(s.title)}</b><small>${esc(ch.name)} · ${s.seq?`모션 ${s.seq.length}개`:esc(MOTIONS[s.motion].label)}</small></button>`;}).join("");
  const pill=(grp,v,l)=>`<button class="pill${ST[grp]===v?" on":""}" data-st="${grp}" data-v="${v}">${l}</button>`;
  $("#stKinds").innerHTML=pill("kind","reel","릴스 9:16 영상")+pill("kind","photo","포토카드");
  $("#stCams").innerHTML=pill("cam","front","정면")+pill("cam","close","클로즈업")+pill("cam","orbit","회전");
  $("#stBgs").innerHTML=pill("bg","base","기본")+pill("bg","sunset","노을")+pill("bg","neon","네온");
  $("#stCaption").value=sc.text; $("#stTags").value=`#무브로그 #${c.name} #${sc.title.replace(/\s/g,"")}`;
  $("#stLock").hidden=!sc.locked;
  if(sc.locked){ const p=SCENE_PACKS.find(x=>x.id===sc.pack); $("#stLockTxt").textContent=`${p.name} · ${p.motions.map(m=>MOTIONS[m].label).join(", ")}`; $("#stLockBuy").textContent=`점프 ${p.cost}로 팩 사기`; }
  ["stSave","stPost"].forEach(id=>$("#"+id).disabled=!!sc.locked);
  applyKind(); drawOverlay();
}
function applyKind(){
  const reel=ST.kind==="reel";
  $("#stReelBox").hidden=!reel; $("#stCardBox").hidden=reel; $("#stDecor").hidden=!reel;
  $("#stPlay").hidden=!reel; $("#stSave").textContent=reel?"영상으로 저장":"이미지로 저장";
  if(!reel) drawCard().then(cv=>{ const box=$("#stCardBox"); box.innerHTML=""; cv.className="cardcanvas"; box.append(cv); });
}
function drawOverlay(){
  const sc=curScene(), c=charObj(sc.char);
  $("#stOvTitle").textContent=`결정적 순간 · ${sc.title}`;
  $("#stOvCap").textContent=ST.capNow||$("#stCaption").value;
  $("#stOvTags").textContent=$("#stTags").value;
  $("#stOvName").textContent=c.name;
}
$("#stScenes").addEventListener("click",e=>{const b=e.target.closest("[data-sc]");if(!b)return;ST.i=+b.dataset.sc;renderStudio();if(ST.kind==="reel")studioPlay();});
$("#v-studio").addEventListener("click",e=>{const b=e.target.closest("[data-st]");if(!b)return;
  ST[b.dataset.st]=b.dataset.v; document.querySelectorAll(`[data-st="${b.dataset.st}"]`).forEach(x=>x.classList.toggle("on",x===b));
  if(b.dataset.st==="kind") applyKind(); else studioPlay();});
$("#stCaption").addEventListener("input",()=>{drawOverlay(); if(ST.kind!=="reel") applyKind();});
$("#stTags").addEventListener("input",()=>{drawOverlay(); if(ST.kind!=="reel") applyKind();});
function studioPlay(){
  const sc=curScene(), c=charObj(sc.char), st=allStories().find(x=>x.id===sc.story)||STORIES[0];
  stage.setCharacter(c); stage.setScene(st); stage.decor({cam:ST.cam,bg:ST.bg},st);
  const cam=ST.cam==="close"?"close":(ST.cam==="front"?false:true);
  if(sc.seq) playSeq(sc.seq,sc.lines,"Studio",{cam,noSub:true},(i,line)=>{ ST.capNow=i<0?null:line; drawOverlay(); });
  else { ST.capNow=null; stage.play(sc.motion,{target:"Studio",cam}); drawOverlay(); }
}
function sceneDur(sc){return sc.seq?seqDur(sc.seq):stage.dur(sc.motion);}
$("#stLockBuy").addEventListener("click",()=>{const p=SCENE_PACKS.find(x=>x.id===curScene().pack); buyPack(p,()=>openStudio(false,p.id));});
$("#stPlay").addEventListener("click",()=>studioPlay());

/* ── 릴스: 3D 화면 + 자막을 한 캔버스에 그려서 실제 영상 파일로 녹화 ── */
function wrapText(g,text,maxW){const out=[];let line="";for(const ch of text){const t=line+ch;if(g.measureText(t).width>maxW&&line){out.push(line);line=ch;}else line=t;}if(line)out.push(line);return out;}
function paintFrame(g,Wd,H,src){
  g.fillStyle="#000"; g.fillRect(0,0,Wd,H);
  if(src&&src.width){ const s=Math.max(Wd/src.width,H/src.height), w=src.width*s, h=src.height*s; g.drawImage(src,(Wd-w)/2,(H-h)/2,w,h); }
  const gr=g.createLinearGradient(0,H*0.55,0,H); gr.addColorStop(0,"rgba(0,0,0,0)"); gr.addColorStop(1,"rgba(0,0,0,.85)"); g.fillStyle=gr; g.fillRect(0,H*0.55,Wd,H*0.45);
  const sc=curScene(), c=charObj(sc.char);
  g.fillStyle="#fff"; g.font="900 34px 'Noto Sans KR',sans-serif"; g.textBaseline="top";
  g.fillText(`결정적 순간 · ${sc.title}`,36,56);
  g.font="500 22px 'Noto Sans KR',sans-serif"; g.fillStyle="rgba(255,255,255,.8)"; g.fillText(c.name,36,104);
  g.font="700 32px 'Noto Sans KR',sans-serif"; g.fillStyle="#fff";
  const lines=wrapText(g,"“"+(ST.capNow||$("#stCaption").value)+"”",Wd-72).slice(0,4); lines.forEach((l,i)=>g.fillText(l,36,H-250+i*44));
  g.font="500 20px 'Noto Sans KR',sans-serif"; g.fillStyle="#c7b2ff"; g.fillText($("#stTags").value.slice(0,40),36,H-70);
  g.font="700 18px 'Noto Sans KR',sans-serif"; g.fillStyle="rgba(255,255,255,.75)"; g.textAlign="right"; g.fillText("Motion by XSTAGE · 무브로그",Wd-30,H-40); g.textAlign="left";
}
function pickMime(){for(const m of (ST.noMp4?[]:["video/mp4;codecs=avc1","video/mp4"]).concat(["video/webm;codecs=vp9","video/webm"])) if(window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m)) return m; return "";}
function recordReel(){
  const mime=pickMime(); if(!mime||!HTMLCanvasElement.prototype.captureStream){ toast("이 브라우저는 영상 저장을 지원하지 않아요. 크롬에서 해 보세요."); return; }
  const Wd=540,H=960, cv=document.createElement("canvas"); cv.width=Wd; cv.height=H; const g=cv.getContext("2d");
  const rec=new MediaRecorder(cv.captureStream(30),{mimeType:mime,videoBitsPerSecond:5e6}), chunks=[];
  rec.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
  rec.onstop=()=>{ ST.busy=false; $("#stSave").disabled=false; $("#stSave").textContent="영상으로 저장";
    const blob=new Blob(chunks,{type:mime.split(";")[0]}), ext=mime.includes("mp4")?"mp4":"webm";
    if(!blob.size){ if(!ST.noMp4&&ext==="mp4"){ ST.noMp4=true; toast("다른 형식으로 다시 녹화할게요"); setTimeout(recordReel,300); } else toast("영상 저장에 실패했어요. 크롬 최신 버전에서 해 보세요."); return; }
    dl(URL.createObjectURL(blob),`movelog_reel_${Date.now().toString(36)}.${ext}`); toast(ext==="mp4"?"릴스 영상(mp4)을 저장했어요":"릴스 영상(webm)을 저장했어요"); };
  ST.busy=true; $("#stSave").disabled=true; $("#stSave").textContent="녹화 중…";
  const sc=curScene(), src=stage.canvas(); let alive=true;
  (function tick(){ if(!alive) return; paintFrame(g,Wd,H,src); requestAnimationFrame(tick); })();
  rec.start(250); studioPlay();
  setTimeout(()=>{ alive=false; rec.stop(); },(sceneDur(sc)+0.8)*1000);
}
/* ── 유형 카드 · 포토카드: 그림으로 그려서 PNG 저장 ── */
function loadImg(src){return new Promise(r=>{const im=new Image(); im.onload=()=>r(im); im.onerror=()=>r(null); im.src=src;});}
async function drawCard(){
  const sc=curScene(), c=charObj(sc.char), photo=true;
  const Wd=photo?600:720, H=photo?900:1080, cv=document.createElement("canvas"); cv.width=Wd; cv.height=H; const g=cv.getContext("2d");
  const im=await loadImg(c.card);
  g.fillStyle="#111"; g.fillRect(0,0,Wd,H);
  if(im){ const ih=photo?H:H*0.66, s=Math.max(Wd/im.width,ih/im.height); g.drawImage(im,(Wd-im.width*s)/2,0,im.width*s,im.height*s); }
  const gr=g.createLinearGradient(0,H*0.35,0,H); gr.addColorStop(0,"rgba(11,11,15,0)"); gr.addColorStop(0.55,"rgba(11,11,15,.92)"); gr.addColorStop(1,"#0b0b0f"); g.fillStyle=gr; g.fillRect(0,H*0.35,Wd,H*0.65);
  g.textBaseline="top"; g.fillStyle="#fff";
  if(photo){
    g.font="900 34px 'Noto Sans KR',sans-serif"; g.fillText(sc.title,36,H-250);
    g.font="700 26px 'Noto Sans KR',sans-serif"; wrapText(g,"“"+$("#stCaption").value+"”",Wd-72).slice(0,3).forEach((l,i)=>g.fillText(l,36,H-196+i*36));
    g.font="500 18px 'Noto Sans KR',sans-serif"; g.fillStyle="rgba(255,255,255,.7)"; g.fillText(`${c.name} · Motion by XSTAGE · 무브로그`,36,H-60);
  } else {
    g.font="500 24px 'Noto Sans KR',sans-serif"; g.fillStyle="rgba(255,255,255,.8)"; g.fillText(`나와 ${c.name}의 관계 유형`,44,H-400);
    g.font="900 64px 'Noto Sans KR',sans-serif"; g.fillStyle="#fff"; g.fillText(ty[0],44,H-360);
    g.font="700 24px 'Noto Sans KR',sans-serif"; g.fillStyle="#c7b2ff"; g.fillText(`상위 ${RARITY[sc.q]}% · 결정적 순간 "${sc.title}"`,44,H-272);
    g.font="500 24px 'Noto Sans KR',sans-serif"; g.fillStyle="#ddd"; wrapText(g,ty[1],Wd-88).slice(0,2).forEach((l,i)=>g.fillText(l,44,H-222+i*34));
    g.font="700 26px 'Noto Sans KR',sans-serif"; g.fillStyle="#fff"; wrapText(g,"“"+$("#stCaption").value+"”",Wd-88).slice(0,2).forEach((l,i)=>g.fillText(l,44,H-142+i*36));
    g.font="500 18px 'Noto Sans KR',sans-serif"; g.fillStyle="rgba(255,255,255,.6)"; g.fillText($("#stTags").value.slice(0,44)+"  ·  무브로그",44,H-52);
  }
  return cv;
}
function dl(url,name){const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();}
$("#stSave").addEventListener("click",async()=>{
  if(ST.busy) return;
  if(ST.kind==="reel"){ recordReel(); return; }
  const cv=await drawCard(); dl(cv.toDataURL("image/png"),`movelog_${ST.kind}_${Date.now().toString(36)}.png`); toast("이미지를 저장했어요");
});
$("#stPost").addEventListener("click",()=>{
  const sc=curScene(), c=charObj(sc.char);
  W.posts=W.posts||[]; W.posts.unshift({c:sc.char,s:sc.story,title:sc.title,q:$("#stCaption").value.slice(0,80),m:sc.motion,kind:ST.kind,likes:"0",user:"나"});
  W.posts=W.posts.slice(0,20); save();
  if(!W.missions.share){W.missions.share=true;earnStep(5,"미션: 릴스 공유");} else toast("발견 피드에 올렸어요");
  setTimeout(()=>go("community"),500);
});
