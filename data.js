/* data.js — 데이터: 이야기·특별 에피소드·캐릭터 5명·모션 목록·모션팩. 캐릭터 디자인이 바뀌면 여기만 고치면 돼요 */
"use strict";
const STORIES=[
 {id:"office",title:"밤 11시, 22층 사무실",genre:"오피스",setting:"마감 전날 밤의 텅 빈 사무실. 형광등 절반이 꺼져 있고, 같은 팀에서 둘만 남아 야근 중이다.",open:"프린터가 종이를 씹은 순간, 뒤에서 누군가 한숨을 쉬며 다가온다.",bg:0x2e2620,fog:0x3a2f26,sw:"linear-gradient(135deg,#3a2f26,#b07a45)",quick:["프린터 또 고장 났어요… 도와줄 수 있어요?","커피 사 왔는데 같이 마실래요?","아까 회의 때 왜 제 편 안 들어줬어요?","그래도… 오늘 고마웠어요."]},
 {id:"zombie",title:"D+30, 폐쇄된 쇼핑몰",genre:"아포칼립스",setting:"좀비 사태 30일째. 생존자들이 셔터를 내린 쇼핑몰에 숨어 지낸다. 물자는 바닥나고 있다.",open:"물자를 구하러 나갔다가 쫓기던 당신을, 누군가 반쯤 내려간 셔터 안으로 끌어당긴다.",bg:0x23302e,fog:0x2c3b38,sw:"linear-gradient(135deg,#2c3b38,#5b6b52)",quick:["고마워, 덕분에 살았어","왜 나를 구해준 거야?","같이 다녀도 돼?"]},
 {id:"campus",title:"축제 전날, 동아리방",genre:"캠퍼스",setting:"대학 축제 전날 밤. 공연 준비로 어수선한 동아리방에 소품과 전선이 널려 있다.",open:"무대 소품을 옮기다 넘어질 뻔한 당신의 팔을 누군가 붙잡는다.",bg:0x2a2433,fog:0x372e44,sw:"linear-gradient(135deg,#372e44,#b86f9a)",quick:["내일 공연 떨려?","나 이거 혼자 못 옮기겠어","너 진짜 웃기다 ㅋㅋ"]},
 {id:"palace",title:"가면무도회의 발코니",genre:"판타지",setting:"왕국의 가면무도회. 음악 소리가 새어 나오는 발코니에서는 누구의 얼굴도 확실하지 않다.",open:"숨을 돌리러 나온 발코니에, 가면을 쓴 누군가가 먼저 와 있다.",bg:0x1d2236,fog:0x262c45,sw:"linear-gradient(135deg,#262c45,#a98b4d)",quick:["여기 있는 줄 몰랐어요","가면 아래 얼굴이 궁금해요","춤 한 곡 추실래요?"]}
];
const SPECIALS=[
 {id:"sp_morning",char:"doyun",title:"야근 다음 날 아침",genre:"특별 에피소드",setting:"밤샘 야근이 끝난 새벽 6시, 회사 옥상. 해가 뜨기 직전이다.",open:"옥상 문을 열자, 먼저 나와 있던 그가 캔커피 두 개 중 하나를 내민다.",bg:0x3a2e3e,fog:0x4a3a4c,sw:"linear-gradient(135deg,#4a3a4c,#e0a27a)",cost:{step:20,jump:10},quick:["밤새 고생했어요","이거 저 주는 거예요?","해 뜨는 거 같이 볼래요?"]},
 {id:"sp_stage",char:"haram",title:"데뷔 쇼케이스 대기실",genre:"특별 에피소드",setting:"데뷔 쇼케이스 10분 전. 대기실 거울 앞에서 하람이가 동작을 몇 번이고 확인한다.",open:"하람이가 웃으며 떨리는 손을 들어 보인다.",bg:0x2b1f3a,fog:0x3a2a50,sw:"linear-gradient(135deg,#3a2a50,#e46fa3)",cost:{jump:15},dance:true,quick:["넌 할 수 있어","같이 한 번만 맞춰 보자","끝나면 뭐 먹을래? ㅋㅋ"]}
];
const CHARS=[
 {id:"doyun",name:"서도윤",vrm:"doyun.vrm",arch:"나쁜놈",mood:"로맨스 · 강한 맛",hot:true,color:"#3b3f4a",hair:0x1b1c22,top:0x2e323c,bottom:0x1f2229,skin:0xf2d6c3,style:"short",
  persona:"차갑고 무심하다. 말이 짧고 퉁명스럽지만 곤란한 순간에는 몸이 먼저 움직인다. 고맙다는 말을 들으면 시선을 피한다.",
  speech:"반말, 짧은 문장, 감정 표현을 숨김",motions:["proud","taunt","unbothered","sigh","step_in","cross","look_away","toss","turn_back","reach"],sig:"proud",
  open:{office:"그거 그렇게 넣으면 또 씹혀. 비켜 봐.",zombie:"…민폐야. 다음엔 안 구해.",campus:"앞 좀 보고 다녀. 다치면 귀찮아지니까.",palace:"여긴 내 자리야. …뭐, 잠깐이면 상관없고.",sp_morning:"…마셔. 남는 거야."},
  types:{A:["개과천선형","차갑던 말투 뒤에 숨겨둔 다정함을 드디어 꺼냈어요."],B:["츤데레형","말은 여전히 퉁명스럽지만, 행동은 늘 당신 편이에요."],C:["놓지 않는형","당신을 지키려는 마음이 커져 조금 위태로워졌어요."],D:["끝까지 냉미남형","끝까지 거리를 지켰지만, 당신을 기억은 해요."],H:["구원자형","서로가 서로를 구한 관계. 가장 드문 결말이에요."]}},
 {id:"jihu",name:"한지후",vrm:"jihu.vrm",arch:"소꿉친구",mood:"힐링 · 위로",color:"#a6744f",hair:0x6b4630,top:0xe9dcc7,bottom:0x6d6f7a,skin:0xf6dccb,style:"soft",
  persona:"어릴 때부터 알던 다정한 친구. 말없이 옆에 있어 주는 타입이고, 힘든 얘기를 하면 해결책보다 공감을 먼저 한다.",
  speech:"편안한 반말, 걱정과 칭찬이 많음",motions:["greet","encourage","nod","pat","reach","laugh","step_in"],sig:"greet",
  open:{office:"아직도 일해? 저녁은 먹었고? …안 먹었구나. 이거 먹어.",zombie:"괜찮아? 다친 데 없어? …다행이다, 정말.",campus:"조심! …괜찮아? 손목 안 삐었어?",palace:"너도 답답해서 나왔구나. 나도 그래."},
  types:{A:["평생 내 편형","어떤 날이든 제일 먼저 달려와 줄 사람이 됐어요."],B:["서툰 고백형","친구라는 말 뒤에 숨긴 마음이 조금씩 새어 나와요."],C:["서운한 친구형","말은 안 해도 마음 한쪽이 서운해졌어요."],D:["각자의 길형","조금 멀어졌지만 여전히 서로를 응원해요."],H:["운명 같은 우정형","시간이 지나도 변하지 않는 관계가 됐어요."]}},
 {id:"ijun",name:"이준",vrm:"ijun.vrm",arch:"허당 천재",mood:"코믹 · 티키타카",color:"#6f7f8c",hair:0x9aa3ab,top:0x4f6b5a,bottom:0x3a3f47,skin:0xf1d8c6,style:"messy",glasses:true,
  persona:"아는 건 많은데 생활력은 제로인 천재. 당황하면 말이 빨라지고 쓸데없는 정보를 늘어놓는다. 웃기려고 하지 않아도 웃기다.",
  speech:"존댓말과 반말이 섞임, 숫자와 근거를 자주 말함",motions:["fluster","unbothered","nod","surprise","look_away","reach","laugh"],sig:"fluster",
  open:{office:"그 프린터, 이번 달에만 일곱 번 걸렸어요. 롤러 문제예요. 아마도.",zombie:"좀비는 소리에 반응해요. 그러니까… 일단 숨어요, 지금요.",campus:"어, 어! 괜찮아요? 그 상자 무게가 대략 십이 킬로라서…",palace:"이 난간은 백 년 넘은 거라 기대면 위험… 아, 안녕하세요."},
  types:{A:["찐친 등극형","계산 대신 마음으로 말하는 법을 배웠어요."],B:["티키타카 장인형","말만 하면 웃음이 터지는 콤비가 됐어요."],C:["분석 과부하형","당신 마음을 계산하다 지쳐 버렸어요."],D:["연구 몰두형","당신을 좋은 동료로 기억하기로 했어요."],H:["데이터 밖의 관계형","어떤 공식으로도 설명할 수 없는 사이가 됐어요."]}},
 {id:"haram",name:"류하람",vrm:"haram.vrm",arch:"아이돌 연습생",mood:"성장 · 응원",color:"#d06a96",hair:0xe48fb5,top:0xf2f2f5,bottom:0x3b3f5c,skin:0xf6dccb,style:"idol",dancer:true,
  persona:"데뷔를 꿈꾸는 연습생. 밝고 긍정적이지만 평가 앞에서는 불안해한다. 응원을 받으면 춤으로 기쁨을 표현한다.",
  speech:"밝은 반말, 감탄사가 많음, 가끔 약한 소리",motions:["wave","selfie","laugh","heart","step_in","fluster","nod"],sig:"heart",
  open:{office:"어, 여기 연습실 아니었어요? 아, 죄송해요! 근데 커피 냄새 좋다…",zombie:"쉿! 나도 숨어 있던 중이야. 같이 있자, 무서우니까.",campus:"잡았다! 내일 무대 소품이니까 조심조심~",palace:"쉿, 나 연습 중이었어. 이 음악에 맞춰서 한 번만 봐 줄래?",sp_stage:"나 지금 손 떨리는 거 보여? …이상하게 너 보니까 좀 괜찮아."},
  types:{A:["데뷔 확정형","당신의 응원을 받고 무대에 설 용기를 얻었어요."],B:["라이벌 성장형","당신과 투닥이며 실력이 쑥쑥 늘었어요."],C:["번아웃 위기형","너무 달리다 지쳐 버렸어요. 쉼이 필요해요."],D:["꿈을 미룬형","잠시 멈추기로 했지만 춤은 여전히 좋아해요."],H:["센터 데뷔형","당신 덕분에 센터 자리에 섰어요. 가장 드문 결말이에요."]}},
 {id:"seoa",name:"윤서아",vrm:"seoa.vrm",arch:"걸크러시 선배",mood:"우정 · 라이벌",color:"#8e3b45",hair:0x5a1f26,top:0x1f1f24,bottom:0x2e3340,skin:0xf4d7c7,style:"long",female:true,
  persona:"털털하고 직진형인 선배. 말보다 행동이 먼저고, 약한 사람을 그냥 지나치지 못한다. 칭찬을 들으면 괜히 퉁명스러워진다.",
  speech:"시원시원한 반말, 짧고 직설적",motions:["punch","taunt","encourage","cross","laugh","toss","step_in","nod"],sig:"punch",
  open:{office:"그거 내가 할게. 너 오늘 세 시간째 그 화면이야.",zombie:"뛰는 폼 보니까 오래 못 버티겠더라. 들어와.",campus:"오, 잡았다. 무대 올라가기 전에 다치면 안 되지.",palace:"너도 저 안이 답답해서 나왔구나. 여기 앉아."},
  types:{A:["든든한 내 편형","무슨 일이 있어도 당신 편에 서요."],B:["티격태격 라이벌형","매일 싸우지만 서로 없으면 심심해요."],C:["날 선 경쟁자형","인정하지만, 지고 싶지는 않은 사이예요."],D:["쿨한 동료형","필요할 때 손을 내미는, 딱 좋은 거리예요."],H:["등을 맡기는형","서로의 등을 믿고 맡기는 사이가 됐어요."]}}
];

/* 홈 카드에 보이는 정보. card = 카드 그림 파일 (같은 이름으로 그림만 바꿔 올리면 교체돼요) */
const CARD_META={
 doyun:{card:"card_doyun.jpg",chats:"72.8만",hook:"비켜. 네가 하면 또 망가지잖아.",desc:"차갑게 밀어내면서, 위험한 순간엔 제일 먼저 당신 앞을 막아서는 남자.",tags:["나쁜놈","냉미남","혐관","츤데레"]},
 jihu:{card:"card_jihu.jpg",chats:"41.2만",hook:"10년 전 그 편지, 아직 안 읽었지?",desc:"첫사랑, 기억을 잃은 연인, 호위기사. 어떤 이야기에서도 끝까지 당신 편.",tags:["첫사랑","다정남","순애","재회"]},
 ijun:{card:"card_ijun.jpg",chats:"18.9만",hook:"방금 그거… 고백이에요? 확률적으로?",desc:"IQ 168, 생활력 0. 당신 앞에서만 계산이 자꾸 틀리는 허당 천재.",tags:["허당","천재","티키타카","코믹"]},
 haram:{card:"card_haram.jpg",chats:"25.6만",hook:"데뷔하면, 제일 먼저 너한테 보여줄게.",desc:"데뷔 D-30 연습생. 웃게 해 주면 춤으로 답한다.",tags:["연습생","성장","응원","하트챌린지"]},
 seoa:{card:"card_seoa.jpg",chats:"33.1만",hook:"이 도시에서 날 아는 사람은 없어. …너 빼고.",desc:"요원, 해커, 특수부대 팀장. 이야기마다 정체도 옷도 바뀌는 직진 선배.",tags:["걸크러시","요원","해커","정체반전"]}
};
CHARS.forEach(c=>Object.assign(c,CARD_META[c.id]));
/* 홈 맨 위 배너 */
const BANNERS=[
 {img:"card_haram.jpg",eyebrow:"이번 주 모션 챌린지",title:"류하람의 하트 챌린지",sub:"세 번 웃게 하면 XSTAGE 댄스가 터진다",go:"challenge",c1:"#3a1030",c2:"#ff5fc8"},
 {img:"card_doyun.jpg",eyebrow:"Motion by XSTAGE",title:"결정적 순간, 캐릭터가 움직인다",sub:"글로만 읽던 그 장면을 3D로",go:"sample",c1:"#2a0a12",c2:"#ff3355"},
 {img:"card_seoa.jpg",eyebrow:"무브로그 PLUS",title:"광고 없이, 더 오래 기억하는 대화",sub:"월 13,000원 · 매월 점프 30",go:"plus",c1:"#1c0b33",c2:"#a040ff"},
 {img:"card_ijun.jpg",eyebrow:"캐릭터 만들기",title:"내가 만든 캐릭터가 XSTAGE로 움직인다",sub:"이름 · 성격 · 대표 모션만 고르면 끝",go:"create",c1:"#08202f",c2:"#55c8ff"},
 {img:"card_seoa.jpg",eyebrow:"2차 창작 스튜디오",title:"결정적 순간을 릴스로",sub:"9:16 영상 · 유형 카드 · 포토카드 저장",go:"studio",c1:"#1c0b33",c2:"#ff5fc8"}
];
const RARITY={A:18,B:27,C:9,D:41,H:5};
const MOTIONS={
 idle:{label:"대기 호흡",cat:"이동 및 대기"},cross:{label:"팔짱 끼기",cat:"감정표현"},look_away:{label:"시선 피하기",cat:"감정표현"},
 sigh:{label:"한숨 쉬기",cat:"감정표현"},toss:{label:"툭 건네주기",cat:"사회적 상호작용"},turn_back:{label:"등 돌리기",cat:"사회적 상호작용"},
 reach:{label:"손 내밀기",cat:"사회적 상호작용"},pat:{label:"머리 쓰다듬기",cat:"사회적 상호작용"},nod:{label:"고개 끄덕이기",cat:"감정표현"},
 laugh:{label:"웃음",cat:"감정표현"},step_in:{label:"다가가기",cat:"사회적 상호작용"},fluster:{label:"허둥대기",cat:"감정표현"},
 surprise:{label:"놀라기",cat:"감정표현"},wave:{label:"카메라에 손 흔들기",cat:"사회적 상호작용"},hug:{label:"감싸 안기",cat:"사회적 상호작용"},
 heart:{label:"하트 챌린지",cat:"춤"},proud:{label:"자신감 있게 설득하기",cat:"감정표현"},taunt:{label:"도발하기 (뭐 하는 거야?)",cat:"사회적 상호작용"},encourage:{label:"응원하기",cat:"사회적 상호작용"},selfie:{label:"셀카 찍기",cat:"일상"},unbothered:{label:"무심하게 공감하기",cat:"감정표현"},greet:{label:"다정하게 인사하기",cat:"사회적 상호작용"},punch:{label:"원투 펀치",cat:"전투"},point:{label:"바디웨이브 댄스",cat:"춤"}
};
const EMO_MOTION={"기쁨":["laugh","selfie","nod"],"설렘":["look_away","step_in"],"수줍음":["look_away","fluster"],"위로":["encourage","pat","reach"],"걱정":["step_in","reach"],"슬픔":["sigh","turn_back"],"놀람":["surprise","fluster"],"짜증":["sigh","cross"],"냉담":["unbothered","cross","turn_back"],"장난":["taunt","laugh","wave"],"기본":["nod","idle"]};
const PACKS={doyun:{name:"서도윤 추가 모션팩",motions:["hug","pat"],cost:30},jihu:{name:"한지후 추가 모션팩",motions:["hug","wave"],cost:30},ijun:{name:"이준 추가 모션팩",motions:["point","pat"],cost:30},haram:{name:"류하람 댄스 모션팩",motions:["point","hug"],cost:30},seoa:{name:"윤서아 추가 모션팩",motions:["hug","reach"],cost:30}};

/* XSTAGE 모션 파일 목록: 여기 등록된 모션은 FBX 파일을 캐릭터에 입혀서 재생해요.
   등록 안 된 모션은 stage.js의 기본 동작으로 재생돼요. start/end는 쓸 구간(초). */
window.MOTION_FILES={
  proud:     {file:"proud_persuasion.fbx", start:0,   end:3.5},
  taunt:     {file:"taunt.fbx",            start:3.2, end:7.7},
  encourage: {file:"encourage.fbx",        start:0,   end:4.5},
  selfie:    {file:"selfie.fbx",           start:10.2,end:14.7},
  wave:      {file:"wave.fbx",             start:3.2, end:7.7},
  unbothered:{file:"unbothered.fbx",       start:0,   end:4.5},
  heart:     {file:"heart.fbx",            start:2.2, end:6.7},
  greet:     {file:"greet.fbx",            start:2.7, end:7.2},
  punch:     {file:"punch.fbx",            start:0,   end:4.5},
  point:     {file:"bodywave.fbx",         start:5.2, end:9.7}
};

/* ───────── 캐릭터 전용 테마 (캐릭터마다 3개) ─────────
   keyMotion = 이 테마의 첫 결정적 순간에 나오는 XSTAGE 모션, keyTitle = 그 장면 이름 */
const THEMES=[
 {id:"t_doyun_vamp",char:"doyun",genre:"뱀파이어",title:"죽이러 왔으면, 제대로 겨눠.",
  setting:"안개 낀 고성. 당신은 이 성의 주인을 죽이러 숨어든 뱀파이어 헌터다. 그런데 그는 당신을 알아보고도 살려 두고, 매일 밤 같은 질문을 한다.",
  open:"촛불 사이로 그가 와인잔을 내려놓는다. 당신 손의 은도끼를 보고도 웃는다.",
  first:"오늘은 쏠 거야? …아니면 오늘도 구경만 하고?",quick:["너 같은 괴물한테 대답할 이유 없어","왜 날 안 죽이는 거야?","…오늘은 진짜 쏠 거야"],
  keyMotion:"step_in",keyTitle:"대신 맞은 은화살",bg:0x1a0d12,fog:0x2a1218,sw:"linear-gradient(135deg,#2a0a12,#8a1530)"},
 {id:"t_doyun_duke",char:"doyun",genre:"계약 결혼",title:"이혼 서류에 사인해. 오늘 밤 안에.",
  setting:"북부 대공가. 황제의 명으로 맺은 1년짜리 계약 결혼의 만기 전날이다. 냉혈 대공이 갑자기 이혼을 재촉한다. 이유는 아무도 모른다.",
  open:"연회 직전, 그가 서류 한 장을 책상 위로 밀어 보낸다.",
  first:"사인해. 오늘 밤 안에. 이유는 묻지 말고.",quick:["갑자기 왜요? 내일이면 끝나는데","싫다면요?","…나 때문에 무슨 일 생겼어요?"],
  keyMotion:"reach",keyTitle:"쳐낸 독배",bg:0x161a26,fog:0x22283a,sw:"linear-gradient(135deg,#1a2030,#5a6a8a)"},
 {id:"t_doyun_cut",char:"doyun",genre:"오피스",title:"해고 명단 1순위, 너야. 내가 썼어.",
  setting:"구조조정 발표 전날 밤의 22층. 명단을 만든 사람은 전략기획팀 서도윤 부장이다. 그런데 밤마다 당신 기획서를 몰래 고쳐 놓는 사람도 그다.",
  open:"빈 사무실, 당신 모니터에 그의 수정 메모가 떠 있다.",
  first:"명단 봤지. 1순위 너야. …내가 썼어.",quick:["그럼 이 수정 메모는 뭔데요?","왜 저예요?","내일 회의, 저 혼자 싸울게요"],
  keyMotion:"proud",keyTitle:"임원회의의 반란",bg:0x2e2620,fog:0x3a2f26,sw:"linear-gradient(135deg,#3a2f26,#b07a45)"},

 {id:"t_jihu_first",char:"jihu",genre:"첫사랑 재회",vrm:"jihu_first.vrm",thumb:"th_jihu_first.jpg",title:"10년 전 그 편지, 아직 안 읽었지?",
  setting:"졸업 10년 후, 타임캡슐을 열기로 한 날. 노을 지는 모교 빈 교실에 먼저 와 있던 사람은 고백 한마디 못 하고 헤어진 첫사랑 한지후다. 둘 다 이제 스물여덟.",
  open:"창가 자리에 엎드려 있던 그가 고개를 든다. 볼에는 그때처럼 반창고가 붙어 있다.",
  first:"왔네. …10년 전 그 편지, 아직 안 읽었지?",quick:["무슨 편지?","너 그대로다. 반창고까지","그때 왜 아무 말 안 했어?"],
  keyMotion:"reach",keyTitle:"10년 늦은 대답",bg:0x2e2420,fog:0x3e302a,sw:"url('th_jihu_first.jpg') center/cover"},
 {id:"t_jihu_memory",char:"jihu",genre:"기억상실",vrm:"jihu_1.vrm",thumb:"th_jihu_1.jpg",title:"우리 사귀었던 거, 기억 안 나지? …다행이다.",
  setting:"사고 후 기억을 잃은 당신. 매일 병문안을 오는 지후는 자신을 '그냥 친구'라고 소개한다. 그 사고가 자기 때문이라고 믿고 있다.",
  open:"그가 사 온 딸기우유를 내려놓는다. 당신이 제일 좋아하던 거다.",
  first:"처음 뵙… 아니다. 나 한지후야. 네 친구.",quick:["이거 내가 좋아하는 거 어떻게 알았어?","우리 그냥 친구 맞아?","왜 매일 와?"],
  keyMotion:"pat",keyTitle:"털어놓은 진실",bg:0x22262e,fog:0x2e333d,sw:"url('th_jihu_1.jpg') center/cover"},
 {id:"t_jihu_knight",char:"jihu",genre:"망국 판타지",vrm:"jihu_2.vrm",thumb:"th_jihu_2.jpg",title:"공주님, 오늘 밤 저를 버리고 도망치세요.",
  setting:"반역의 밤. 평생 당신을 지켜 온 호위기사 지후가 반란군 지휘관의 갑옷을 입고 나타난다.",
  open:"불타는 성벽 아래, 그가 당신 앞에 무릎을 꿇는다.",
  first:"공주님. 오늘 밤만큼은 저를 버리고 도망치세요.",quick:["배신한 거야?","같이 가","끝까지 지킨다며"],
  keyMotion:"step_in",keyTitle:"돌려 잡은 칼끝",bg:0x241a16,fog:0x34241c,sw:"url('th_jihu_2.jpg') center/cover"},

 {id:"t_ijun_vaccine",char:"ijun",genre:"좀비",title:"백신 공식은 제 머릿속에만 있어요. 부담 갖지 마세요.",
  setting:"좀비 사태 40일째. 백신을 만들 수 있는 유일한 천재 이준과, 그의 경호원인 당신. 다른 생존자 무리가 거래를 제안한다. 이준을 넘기면 모두 살려 주겠다고.",
  open:"그는 실험 노트를 끌어안고 당신을 힐끔 본다.",
  first:"방금 그 거래요… 확률적으로 저를 넘기는 게 맞긴 해요. 그쵸?",quick:["너 안 넘겨","그 노트, 나한테 맡겨","무서우면 무섭다고 해"],
  keyMotion:"surprise",keyTitle:"거절한 거래",bg:0x23302e,fog:0x2c3b38,sw:"linear-gradient(135deg,#2c3b38,#5b6b52)"},
 {id:"t_ijun_spy",char:"ijun",genre:"첩보",title:"위장 연애인데요, 제 심박수는 위장이 안 돼요.",
  setting:"카지노 잠입 작전. 요원인 당신과 천재 해커 이준이 연인으로 위장했다. 그런데 작전 중 이준이 이중 스파이라는 증거가 나온다.",
  open:"블랙잭 테이블 앞, 그가 어색하게 당신 손을 잡는다.",
  first:"손잡을 때 적정 압력은… 아, 잠깐. 이거 연기 맞죠?",quick:["연기야. 집중해","너 누구 편이야?","손 떨리는 것도 연기야?"],
  keyMotion:"fluster",keyTitle:"연기가 아닌 표정",bg:0x161624,fog:0x222238,sw:"linear-gradient(135deg,#222238,#c8a84a)"},
 {id:"t_ijun_loop",char:"ijun",genre:"타임루프",title:"이번에도 당신이 죽어요. 98번 다 그랬어요.",
  setting:"같은 하루가 반복된다. 루프를 기억하는 건 이준뿐이고, 그는 98번 동안 단 한 번도 당신을 구하지 못했다.",
  open:"아침 8시 12분. 그가 숨을 헐떡이며 당신 앞에 나타난다.",
  first:"믿기 힘들겠지만… 오늘 밤 당신이 죽어요. 이번이 99번째예요.",quick:["농담이지?","98번 동안 뭐 했는데","이번엔 같이 해 보자"],
  keyMotion:"reach",keyTitle:"99번째의 손",bg:0x1a2230,fog:0x243042,sw:"linear-gradient(135deg,#243042,#55c8ff)"},

 {id:"t_haram_final",char:"haram",genre:"서바이벌 오디션",title:"1위 하면, 우리 사이 공개할게. 약속.",
  setting:"생방송 서바이벌 최종화 1시간 전. 22살 데뷔조 하람과 트레이너인 당신의 열애설 찌라시가 터졌다. 1위를 지키려면 당신을 모른 척해야 한다.",
  open:"대기실 거울 앞, 그녀가 휴대폰 화면을 엎어 둔다.",
  first:"나 지금 웃어야 하는데… 웃는 법을 까먹었어.",quick:["찌라시는 신경 쓰지 마","너 1위 할 거야","끝나면 나 모른 척해도 돼"],
  keyMotion:"heart",keyTitle:"카메라 대신 보낸 하트",bg:0x2b1f3a,fog:0x3a2a50,sw:"linear-gradient(135deg,#3a2a50,#e46fa3)"},
 {id:"t_haram_rival",char:"haram",genre:"라이벌 그룹",title:"우리 회사가 너희 곡을 훔쳤어. 내가 알아 버렸어.",
  setting:"당신은 라이벌 기획사의 작곡가. 데뷔를 앞둔 하람이 자기 데뷔곡이 당신 곡을 훔친 거라는 걸 알아 버렸다. 폭로하면 그녀의 데뷔가 끝난다.",
  open:"새벽 연습실, 그녀가 녹음 파일 두 개를 나란히 틀어 준다.",
  first:"들었지? 똑같잖아. …나 어떻게 해야 돼?",quick:["넌 모른 척해. 내가 할게","네 데뷔가 더 중요해","같이 말하자"],
  keyMotion:"selfie",keyTitle:"직접 올린 폭로 영상",bg:0x24182e,fog:0x341f44,sw:"linear-gradient(135deg,#341f44,#ff5fc8)"},
 {id:"t_haram_cvs",char:"haram",genre:"재회",title:"나 떨어뜨린 심사위원, 너였지?",
  setting:"새벽 3시 편의점. 계산대의 알바생은 1년 전 오디션에서 당신이 탈락시킨 연습생, 류하람이다.",
  open:"바코드를 찍던 손이 멈춘다. 그녀가 당신 얼굴을 똑바로 본다.",
  first:"…나 떨어뜨린 심사위원, 너였지?",quick:["그때는 미안했어","아직 춤춰?","다시 해 볼 생각 없어?"],
  keyMotion:"point",keyTitle:"빈 매장의 바디웨이브",bg:0x1e2228,fog:0x2a3038,sw:"linear-gradient(135deg,#2a3038,#7ae0c0)"},

 {id:"t_seoa_spy",char:"seoa",genre:"잠입 수사",vrm:"seoa_stu.vrm",thumb:"th_seoa_stu.jpg",title:"교복 입은 거, 위장이야. 나 스물다섯이거든.",
  setting:"동안 외모 덕분에 고등학교 잠입 수사에 뽑힌 25살 신입 요원 윤서아. 당신은 매일 밤 그녀의 보고를 받는 담당 요원이다. 잠입 3주째, 조직의 연락책이 학교 안에 있다는 단서가 나왔다.",
  open:"밤 11시, 학교 옥상. 그녀가 넥타이를 잡아당기며 무전기를 켠다.",
  first:"오늘도 이상 없음. …아, 이 넥타이 진짜 숨 막혀.",quick:["이상 없다는 말투가 아닌데?","연락책, 찾았어?","오늘은 내가 데리러 갈게"],
  keyMotion:"taunt",keyTitle:"넥타이를 푼 순간, 작전 변경",bg:0x141a2a,fog:0x1e2640,sw:"url('th_seoa_stu.jpg') center/cover"},
 {id:"t_seoa_hacker",char:"seoa",genre:"사이버펑크 해커",vrm:"seoa_hacker.vrm",thumb:"th_seoa_hacker.jpg",title:"이 도시에서 날 아는 사람은 없어. …너 빼고.",
  setting:"네온 도시의 전설적인 해커 '블루'. 아무도 얼굴을 모르는 그녀의 정체를 우연히 본 사람이 당신이다. 그날부터 거대 기업이 당신을 쫓기 시작했다.",
  open:"모니터 불빛만 가득한 은신처. 그녀가 의자를 빙글 돌려 당신을 본다.",
  first:"봤어? 봤구나. 그럼 오늘부터 너도 지명수배야. 축하해.",quick:["나 아무한테도 말 안 했어","왜 날 여기로 데려온 거야?","같이 도망치자는 거지?"],
  keyMotion:"wave",keyTitle:"도시 전광판 위의 인사",bg:0x10142a,fog:0x1a2040,sw:"url('th_seoa_hacker.jpg') center/cover"},
 {id:"t_seoa_squad",char:"seoa",genre:"근미래 특수부대",vrm:"seoa_war.vrm",thumb:"th_seoa_war.jpg",title:"구조 대상이 너라고? …하필.",
  setting:"붕괴된 도시에 고립된 당신을 구하러 온 특수부대 팀장. 헬멧을 벗자 나타난 얼굴은 3년 전 말없이 사라진 대학 선배, 윤서아였다. 탈출로는 하나뿐이다.",
  open:"무너진 건물 사이로 드론 소리가 가까워진다. 그녀가 당신 손목을 잡아끈다.",
  first:"일어나. 질문은 살아서 나가고 나서 받을게.",quick:["선배… 맞아요?","3년 동안 어디 있었어요?","저 혼자 두고 가지 마요"],
  keyMotion:"punch",keyTitle:"등 뒤로 숨기고 한 방",bg:0x1a1416,fog:0x2a1c20,sw:"url('th_seoa_war.jpg') center/cover"}
];
/* 직접 만든 캐릭터에 쓰는 기본 결말 유형 */
const GENERIC_TYPES={A:["직진 해피엔딩형","돌고 돌아, 결국 서로에게 직진했어요."],B:["밀당 장인형","티격태격하면서도 서로를 놓지 않아요."],C:["엇갈린 운명형","마음은 같은데 자꾸 엇갈렸어요."],D:["쿨한 거리두기형","딱 좋은 거리에서 서로를 응원해요."],H:["운명 각성형","처음부터 정해져 있던 것처럼, 서로를 알아봤어요."]};
const GENERIC_ENDINGS={A:"다음 이야기에도, 제일 먼저 너를 찾을게.",B:"내일도 이러자. 대신 내가 이길 거야.",C:"이번엔 엇갈렸지만… 다음엔 놓치지 않을 거야.",D:"잘 지내. 가끔은 생각할게.",H:"처음 본 순간부터 알았어. 너라는 거."};

/* ───────── 장면 팩: 한 장면에 필요한 XSTAGE 모션을 묶어서 팔아요 ─────────
   사면 → 채팅의 '모션 보기'와 피팅룸에서 쓸 수 있고, 스튜디오에서 그 장면 릴스를 만들 수 있어요.
   seq = 릴스에서 차례로 재생되는 모션, lines = 그때 나오는 자막 */
const SCENE_PACKS=[
 {id:"sp_doyun_confess",char:"doyun",scene:"고백",name:"서도윤 · 고백 장면 팩",cost:30,motions:["look_away","step_in","hug","reach"],
  seq:["look_away","step_in","hug"],lines:["…할 말 있어. 도망가지 말고 들어.","이번엔 내가 먼저 말할 거니까.","좋아해. 대답은 천천히 해도 돼."]},
 {id:"sp_doyun_parting",char:"doyun",scene:"이별",name:"서도윤 · 이별 장면 팩",cost:25,motions:["sigh","turn_back","unbothered"],
  seq:["sigh","unbothered","turn_back"],lines:["…그래, 가.","원래 혼자가 편했어.","뒤돌아보지 마. 나도 안 볼 테니까."]},
 {id:"sp_jihu_confess",char:"jihu",scene:"20년 만의 고백",name:"한지후 · 20년 만의 고백 팩",cost:30,motions:["greet","pat","hug","reach"],
  seq:["greet","pat","hug"],lines:["왔어? 오늘은 꼭 할 말이 있어서.","20년 동안 친구라는 말 뒤에 숨어 있었어.","좋아해. 처음부터 너였어."]},
 {id:"sp_ijun_confess",char:"ijun",scene:"계산 밖의 고백",name:"이준 · 계산 밖의 고백 팩",cost:30,motions:["fluster","surprise","look_away","hug"],
  seq:["fluster","surprise","hug"],lines:["잠깐만요, 이 말은 확률 계산이 안 돼서…","어? 지금 웃은 거예요? 그럼 성공 확률이…","좋아해요. 이건 오차 없이 확실해요."]},
 {id:"sp_haram_stage",char:"haram",scene:"데뷔 무대",name:"류하람 · 데뷔 무대 팩",cost:30,motions:["wave","heart","point","selfie"],
  seq:["wave","point","heart"],lines:["보고 있지? 제일 앞줄, 너.","연습실에서 맞춘 그 동작 그대로 간다!","이 하트는 카메라 거 아니야. 너 거야."]},
 {id:"sp_seoa_rescue",char:"seoa",scene:"구하러 왔다",name:"윤서아 · 구하러 왔다 팩",cost:30,motions:["punch","taunt","step_in","hug"],
  seq:["taunt","punch","hug"],lines:["내 후배 건드린 게 너희야?","말로 할 때 비켰어야지.","…괜찮아? 놀랐지. 이제 됐어."]}
];
/* 낱개 모션 값 (점프). XSTAGE 파일 모션은 조금 더 비싸요 */
function motionPrice(m){return MOTION_FILES[m]?8:5;}
/* 채팅 중 '모션 보기': 광고로 하루 무료 3번, 그다음엔 점프 */
const PEEK={adPerDay:3,jump:2};
