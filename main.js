/* main.js — 시작: 모든 파일이 불러와진 뒤 맨 마지막에 실행 */
"use strict";
const today=new Date().toDateString(); if(W.day!==today){W.day=today;W.adsToday=0;checkinReset();save();}
function checkinReset(){W.checkin=false;W.peekAds=0;}
renderWallet(); renderHome(); show("home"); updateChatBadge();
setAiNote();
