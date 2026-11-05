"use strict";
/* ───────── api.js : 백엔드와 통신하는 곳 ─────────
   API_URL이 비어 있으면 백엔드 없이 "시연 시나리오 → 규칙 기반 응답"으로 동작해요.
   백엔드를 만들면 주소만 넣으면 돼요. 주고받는 형식은 backend-contract.md 참고. */
const API_URL = "";   // 예: "https://movelog-api.vercel.app"

function setAiNote(){ $("#aiNote").textContent = API_URL ? "AI 대화 연결됨 (백엔드)" : "백엔드 미연결 · 규칙 기반 응답"; }

/* 대화 한 턴: 결과는 항상 {reply, narration, emotion, motion, dw, dt, key, keyTitle} 형식 */
async function getReply(msg){
  if($("#scripted").checked){
    const s = scriptTurn();
    if(s){ await new Promise(z=>setTimeout(z,450)); return s; }
  }
  if(API_URL){
    try{ return await backendTurn(msg); }
    catch(e){ $("#aiNote").textContent = "백엔드 응답 실패 · 이번 턴은 규칙 기반"; }
  }
  return ruleTurn(msg);
}

async function backendTurn(msg){
  const c=charObj(), st=storyObj(), ml=availMotions(c);
  const res = await fetch(API_URL + "/api/chat", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      characterId: c.id, storyId: st.id,
      storySetting: st.setting,
      state: {warmth: S.w, tension: S.t, turn: S.turn + 1, keyCount: keyCount()},
      history: S.hist.slice(-8).map(h => ({role: h.role, text: h.text})),
      message: msg,
      allowedMotions: ml
    })
  });
  if(!res.ok) throw new Error("HTTP " + res.status);
  const j = await res.json();
  const emo = EMO_MOTION[j.emotion] ? j.emotion : "기본";
  const motion = ml.includes(j.motion) ? j.motion : (EMO_MOTION[emo].find(m => ml.includes(m)) || c.sig);
  return {reply: String(j.reply||"…").slice(0,300), narration: String(j.narration||"").slice(0,60), emotion: emo, motion,
    dw: clamp(Math.round(+j.warmth||0),-15,15), dt: clamp(Math.round(+j.tension||0),-15,15),
    key: !!j.key, keyTitle: String(j.keyTitle||"").slice(0,20)};
}

/* 변화 기록의 "캐릭터의 한마디 + 다른 캐릭터 반응". 백엔드가 없으면 null → record.js가 기본 문구를 씀 */
async function getEnding(c, typeName, others){
  if(!API_URL) return null;
  try{
    const res = await fetch(API_URL + "/api/ending", {method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({characterId: c.id, typeName, history: S.hist.slice(-10).map(h=>({role:h.role,text:h.text})), others: others.map(o=>o.id)})});
    if(!res.ok) return null;
    return await res.json();   // {ending: "...", reactions: {jihu: "...", ...}}
  }catch(e){ return null; }
}

/* ───────── 백엔드 없을 때 쓰는 가짜 응답 (시연 시나리오 + 규칙 기반) ───────── */
const SCRIPT=[
 {narration:"한숨을 쉬며 다가와 프린터 덮개를 연다",reply:"…또 그거야. 비켜 봐. 롤러에 종이 끼었네.",emotion:"짜증",motion:"step_in",dw:8,dt:-2,key:false},
 {narration:"커피를 받아 들고 시선을 피한다",reply:"…단 거 안 마시는데. 뭐, 이번만.",emotion:"수줍음",motion:"look_away",dw:14,dt:-2,key:true,keyTitle:"처음 받아 든 커피"},
 {narration:"팔짱을 낀다",reply:"편 들어주는 게 일이야? 네 기획이 약했던 거야. …틀린 말은 안 했어.",emotion:"냉담",motion:"cross",dw:-2,dt:16,key:true,keyTitle:"부딪힌 회의실"},
 {narration:"잠시 멈췄다가 손을 내민다",reply:"…고마울 거 없어. 대신 내일 그 기획, 나랑 다시 보자.",emotion:"설렘",motion:"reach",dw:22,dt:4,key:true,keyTitle:"내민 손"}
];
function scriptTurn(){const s=SCRIPT[S.scriptIdx++]; if(!s){$("#scripted").checked=false;return null;} return Object.assign({forced:true},s);}
function recentText(n){return S.hist.slice(-n).map(h=>h.role==="user"?`사용자: ${h.text}`:`${charObj().name}: ${h.text}`).join("\n");}
const WARM=/(고마|괜찮|믿|좋아|걱정|미안|덕분|다행|같이|함께|소중|보고\s?싶|예쁘|멋|응원|할 수 있|잘했|최고|도와)/;
const HOT=/(싫|짜증|꺼져|바보|멍청|됐거든|상관\s?마|귀찮|뭐래|흥|그만|화나|왜\s?그래|왜.*안|이기|내기)/;
const FUN=/(ㅋㅋ|ㅎㅎ|웃기|장난|재밌|웃어|춤)/;
const LINES={
 doyun:{warm:["…그런 말 하지 마. 익숙하지 않으니까.","별거 아니야. 그냥 눈에 밟혀서.","…다음에도 내가 있을 테니까, 무리하지 마."],cold:["관심 없어.","네 일은 네가 알아서 해.","…그래서, 할 말 끝났어?"],hot:["시끄러워.","말 다 했어? …그럼 이제 내 말 들어.","하. 너 진짜 겁이 없구나."]},
 jihu:{warm:["그 말 들으니까 나도 하루가 다 괜찮아졌어.","힘들면 그냥 기대. 말 안 해도 돼.","무슨 일 있으면 제일 먼저 나한테 말해 줘."],cold:["…응, 알겠어. 괜찮아.","내가 너무 참견했나 봐. 미안.","그래도 난 여기 있을게."],hot:["그런 말은… 조금 아프다.","화난 거 알아. 그래도 혼자 두진 않을 거야.","내가 뭘 놓쳤는지 말해 줄래?"]},
 ijun:{warm:["어, 그, 그건 통계적으로도 아주 기쁜 말이에요.","저도 같은 결론이에요. 세 번 검산했어요.","이런 기분은 데이터가 없어서… 일단 기록해 둘게요."],cold:["아, 네. 이해했어요.","예상 범위 안의 반응이에요. 괜찮아요.","…일단 하던 거 마저 할게요."],hot:["잠, 잠깐만요. 논리적으로 따지면 그건…!","반박할 근거가 너무 많은데요?","지금 심박수가 이상해요. 화나서인지는 모르겠지만."],fun:["방금 그거 웃으라고 한 거죠? 계산해 보니까 웃겨요.","하하, 아니 잠깐, 이게 왜 웃기지? 아무튼 웃겨요."]},
 haram:{warm:["진짜? 너한테 그 말 들으니까 힘이 막 나!","나 오늘 연습 열 번 더 할 수 있을 것 같아.","고마워… 데뷔하면 제일 먼저 너한테 보여줄게."],cold:["아… 응, 바쁘구나.","괜찮아! 나 혼자서도 잘해. …아마도.","다음에 또 얘기하자."],hot:["그렇게 말하면 나도 지기 싫어지는데?","좋아, 다음 평가에서 보여줄게!","흥, 두고 봐!"],fun:["아하하! 너 진짜 웃겨!","ㅋㅋㅋ 너 때문에 배 아파!","이 기분 그대로 하트 챌린지 간다!"]},
 seoa:{warm:["뭐야, 오글거리게. …근데 나쁘진 않네.","네 편 들어주는 건 내 맘이야.","다음에도 불러. 바로 갈게."],cold:["그래, 알아서 해.","난 필요한 말만 할게.","…그럼 각자 하자."],hot:["오, 붙어 보자는 거야?","말 다 했냐? 이제 내 차례.","좋아, 지는 사람이 밥 사."]}
};
let lineIdx=0;
function ruleTurn(msg){
  const c=charObj(),ml=availMotions(c); let dw=0,dt=0,emo="기본";
  if(WARM.test(msg)){dw+=9;dt-=3;emo=c.hot||c.id==="seoa"?"수줍음":"기쁨";}
  if(HOT.test(msg)){dw-=6;dt+=11;emo="짜증";}
  const fun=FUN.test(msg); if(fun){dw+=5;dt-=1;emo="장난";}
  if(!dw&&!dt) dw+=3;
  const L=LINES[c.id]||LINES[c.base]||LINES.jihu;
  const mood=dt>=8?"hot":(fun&&L.fun?"fun":(dw>=6?"warm":(S.w<0?"cold":"warm")));
  const pool=L[mood]; let reply=pool[(lineIdx++)%pool.length];
  let motion=(EMO_MOTION[emo]||[]).concat(ml).find(m=>ml.includes(m)&&m!==S.lastMotion)||c.sig;
  let key=Math.abs(dw)+Math.abs(dt)>=12, forced=false;
  let keyTitle={warm:"처음 보인 진심",hot:"부딪힌 마음",cold:"멀어진 거리",fun:"터져 버린 웃음"}[mood];
  if(c.dancer&&fun){S.laughs++; if(S.laughs>=3||/춤|챌린지/.test(msg)){motion="heart";key=true;forced=true;keyTitle="하트 챌린지";reply="이 기분 그대로 하트 챌린지 간다! 잘 봐!";}}
  return {reply,narration:"",emotion:emo,motion,dw,dt,key,keyTitle,forced};
}
