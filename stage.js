/* stage.js — 3D 무대: VRoid 캐릭터(VRM) + 모션
   · data.js의 CHARS[].vrm 파일을 불러와 화면에 세움
   · data.js의 MOTION_FILES에 XSTAGE FBX가 등록된 모션은 그 파일을 캐릭터에 입혀 재생
   · FBX가 없는 모션은 아래 LIB의 기본 동작(팔짱, 시선 피하기 등)으로 재생
   · 다른 파일에서 쓰는 이름(stage.mount / setCharacter / setScene / play / decor / dur)은 예전과 같음 */
"use strict";
const stage=(function(){
  let T=null, GLTFLoaderC=null, FBXLoaderC=null;
  let renderer,scene,camera,clock,turn,poseRoot,ground,parentEl=null,ready=false,failed=false;
  const canvas=document.createElement("canvas");
  const msg=document.createElement("div");
  msg.style.cssText="position:absolute;inset:0;display:grid;place-items:center;color:#e8e2ee;font-size:13px;padding:20px;text-align:center;pointer-events:none";
  const chars={};            // 캐릭터 id → 불러온 캐릭터
  const fbxCache={};         // FBX 파일 → 불러온 원본
  const baked={};            // 캐릭터id|모션id → 캐릭터에 맞춘 모션
  let cur=null, wantChar=null, wantScene=null, orbit=false;
  let yaw=0,yawGoal=0,drag=null, camGoal=null, camBase=null;
  let mot={id:"idle",start:0,dur:1,bake:null}, snap=null, snapT=0;
  let exprGoal={}, exprNow={}, nextBlink=2, blinkT=-1;

  /* ── 라이브러리 불러오기 (index.html의 importmap 주소 사용) ── */
  (async function boot(){
    try{
      T=await import("three");
      GLTFLoaderC=(await import("three/addons/loaders/GLTFLoader.js")).GLTFLoader;
      FBXLoaderC=(await import("three/addons/loaders/FBXLoader.js")).FBXLoader;
      init(); ready=true;
      if(parentEl) mount(parentEl);
      if(wantScene) setScene(wantScene);
      if(wantChar) setCharacter(wantChar);
    }catch(e){ failed=true; console.error(e); msg.textContent="3D를 불러오지 못했어요. 대화와 모션 태그는 그대로 동작해요."; }
  })();

  function init(){
    renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});   /* 릴스 영상 저장용 */
    renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
    renderer.outputColorSpace=T.SRGBColorSpace;
    scene=new T.Scene();
    camera=new T.PerspectiveCamera(30,1,0.05,60);
    camBase={pos:new T.Vector3(0,1.25,3.9),look:new T.Vector3(0,0.98,0)};
    camera.position.copy(camBase.pos); camera.userData.look=camBase.look.clone();
    scene.add(new T.HemisphereLight(0xffffff,0x5a5068,1.6));
    const key=new T.DirectionalLight(0xffffff,1.6); key.position.set(1.5,3,2.5); scene.add(key);
    const rim=new T.DirectionalLight(0xffd6e2,0.8); rim.position.set(-2.5,2,-2); scene.add(rim);
    ground=new T.Mesh(new T.CircleGeometry(1.6,48),new T.MeshToonMaterial({color:0x3a3444}));
    ground.rotation.x=-Math.PI/2; scene.add(ground);
    turn=new T.Group(); scene.add(turn);
    poseRoot=new T.Group(); turn.add(poseRoot);
    clock=new T.Clock();
    canvas.addEventListener("pointerdown",e=>{drag={x:e.clientX,y0:yawGoal};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener("pointermove",e=>{if(drag) yawGoal=drag.y0+(e.clientX-drag.x)*0.012;});
    canvas.addEventListener("pointerup",()=>{drag=null;});
    document.addEventListener("click",e=>{const b=e.target.closest("[data-view]"); if(b) yawGoal=+b.dataset.view;});
    window.addEventListener("resize",resize);
    if(window.ResizeObserver) new ResizeObserver(resize).observe(document.body);
    requestAnimationFrame(loop);
  }

  /* ── 뼈 이름표: XSTAGE(FBX) 뼈 → VRM 사람 뼈 ── */
  const ORDER=["hips","spine","chest","upperChest","neck","head",
    "leftShoulder","leftUpperArm","leftLowerArm","leftHand","rightShoulder","rightUpperArm","rightLowerArm","rightHand",
    "leftUpperLeg","leftLowerLeg","leftFoot","leftToes","rightUpperLeg","rightLowerLeg","rightFoot","rightToes"];
  const FINGERS=[];
  for(const s of ["left","right"]) for(const f of ["Thumb","Index","Middle","Ring","Little"]) for(const j of (f==="Thumb"?["Metacarpal","Proximal","Distal"]:["Proximal","Intermediate","Distal"])) FINGERS.push(s+f+j);
  const ALL=ORDER.concat(FINGERS);
  const SRC={Hips:"hips",Spine:"spine",Spine1:"chest",Spine2:"upperChest",Neck:"neck",Head:"head"};
  for(const [s,t] of [["Left","left"],["Right","right"]]){
    Object.assign(SRC,{[s+"Shoulder"]:t+"Shoulder",[s+"Arm"]:t+"UpperArm",[s+"ForeArm"]:t+"LowerArm",[s+"Hand"]:t+"Hand",
      [s+"UpLeg"]:t+"UpperLeg",[s+"Leg"]:t+"LowerLeg",[s+"Foot"]:t+"Foot",[s+"ToeBase"]:t+"Toes",
      [s+"HandThumb1"]:t+"ThumbMetacarpal",[s+"HandThumb2"]:t+"ThumbProximal",[s+"HandThumb3"]:t+"ThumbDistal"});
    for(const [f,g] of [["Index","Index"],["Middle","Middle"],["Ring","Ring"],["Pinky","Little"]])
      Object.assign(SRC,{[s+"Hand"+f+"1"]:t+g+"Proximal",[s+"Hand"+f+"2"]:t+g+"Intermediate",[s+"Hand"+f+"3"]:t+g+"Distal"});
  }
  const V0={ThumbMetacarpal:"ThumbProximal",ThumbProximal:"ThumbIntermediate"};   // VRM 0.x 엄지 이름 차이

  /* ── 캐릭터 불러오기 ── */
  async function loadChar(c){
    const gltf=await new GLTFLoaderC().loadAsync(c.vrm);
    const json=gltf.parser.json, ext=json.extensions||{}, v1=ext.VRMC_vrm, v0=ext.VRM;
    const byNode={}, byMesh={};
    gltf.scene.traverse(o=>{const a=gltf.parser.associations.get(o); if(!a) return;
      if(a.nodes!==undefined) byNode[a.nodes]=o;
      if(a.meshes!==undefined) (byMesh[a.meshes]=byMesh[a.meshes]||[]).push(o);});
    const hb={};
    if(v1) for(const [k,v] of Object.entries(v1.humanoid.humanBones)) hb[k]=v.node;
    else for(const b of v0.humanoid.humanBones){ let k=b.bone; if(k==="leftThumbProximal"&&!hb.leftThumbMetacarpal){} hb[k]=b.node; }
    const bones={};
    for(const name of ALL){
      let src=name;
      if(!v1){ const m=name.match(/^(left|right)(ThumbMetacarpal|ThumbProximal)$/); if(m) src=m[1]+V0[m[2]]; }
      if(hb[src]!==undefined&&byNode[hb[src]]) bones[name]=byNode[hb[src]];
    }
    gltf.scene.traverse(o=>{ if(!o.isMesh) return; o.frustumCulled=false;
      const conv=m=>{const n=new T.MeshToonMaterial({map:m.map||null,color:m.color?m.color.clone():new T.Color(1,1,1),
        transparent:m.transparent,opacity:m.opacity,alphaTest:m.alphaTest,side:m.side,depthWrite:m.depthWrite});
        if(n.map) n.map.colorSpace=T.SRGBColorSpace; return n;};
      o.material=Array.isArray(o.material)?o.material.map(conv):conv(o.material); });
    const model=new T.Group(); model.add(gltf.scene);
    if(!v1) model.rotation.y=Math.PI;               // VRM 0.x는 뒤를 보고 있어서 돌려 세움
    poseRoot.add(model); poseRoot.updateMatrixWorld(true);
    const prInv=poseRoot.getWorldQuaternion(new T.Quaternion()).invert();
    const rest={};
    for(const k in bones){ const b=bones[k];
      rest[k]={local:b.quaternion.clone(),pos:b.position.clone(),world:prInv.clone().multiply(b.getWorldQuaternion(new T.Quaternion()))}; }
    const wp=k=>bones[k]?poseRoot.worldToLocal(bones[k].getWorldPosition(new T.Vector3())):new T.Vector3();
    const hipsH=wp("hips").y, faceSign=Math.sign(wp("leftUpperArm").x-wp("rightUpperArm").x)||1;
    /* 표정(눈 깜빡임·기쁨 등) */
    const expr={};
    const meshesUnder=o=>{const r=[];o.traverse(m=>{if(m.morphTargetInfluences) r.push(m);});return r;};
    if(v1){ const P=(v1.expressions&&v1.expressions.preset)||{};
      for(const [k,e] of Object.entries(P)) expr[k]=(e.morphTargetBinds||[]).flatMap(b=>byNode[b.node]?meshesUnder(byNode[b.node]).map(m=>({m,i:b.index,w:b.weight})):[]); }
    else { const G=(v0.blendShapeMaster&&v0.blendShapeMaster.blendShapeGroups)||[];
      const alias={joy:"happy",sorrow:"sad",fun:"relaxed"};
      for(const g of G){ const n=(g.presetName||g.name||"").toLowerCase(); const k=alias[n]||n;
        expr[k]=(g.binds||[]).flatMap(b=>(byMesh[b.mesh]||[]).flatMap(o=>meshesUnder(o)).map(m=>({m,i:b.index,w:(b.weight||0)/100}))); } }
    model.visible=false;
    return {id:c.id,model,bones,rest,hipsH,faceSign,expr};
  }

  function setCharacter(c){
    if(!c) return; if(c.base) c=Object.assign({},c,{id:c.base});   /* 직접 만든 캐릭터는 고른 기본 모델을 같이 씀 */
    wantChar=c;
    if(!ready||(cur&&cur.id===c.id)) return;
    if(cur) cur.model.visible=false;
    const done=ch=>{ if(wantChar.id!==ch.id) return; cur=ch; cur.model.visible=true; msg.textContent=""; yaw=yawGoal=0; mot={id:"idle",start:clock.getElapsedTime(),dur:1,bake:null}; snap=null;
      if(lastReq&&lastReq.charId===ch.id&&Date.now()-lastReq.time<20000){ const r=lastReq; lastReq=null; play(r.m,Object.assign({},r.opt,{sub:null,key:null})); } };
    if(chars[c.id] instanceof Promise){ msg.textContent=`${c.name} 불러오는 중…`; chars[c.id].then(done); return; }
    if(chars[c.id]){ done(chars[c.id]); return; }
    if(!c.vrm){ msg.textContent="이 캐릭터의 VRM 파일이 아직 없어요"; cur=null; return; }
    msg.textContent=`${c.name} 불러오는 중…`;
    chars[c.id]=loadChar(c).then(ch=>{chars[c.id]=ch; done(ch); return ch;})
      .catch(e=>{console.error(e); delete chars[c.id]; msg.textContent=`${c.name} 파일(${c.vrm})을 불러오지 못했어요`;});
  }
  function setScene(st){ if(!st) return; wantScene=st; if(!ready) return; orbit=false;
    scene.background=new T.Color(st.bg); scene.fog=new T.Fog(st.fog,6,14); ground.material.color.set(new T.Color(st.fog).offsetHSL(0,0,0.06)); }
  function decor(d,st){ if(!ready) return; orbit=d.cam==="orbit";
    const bgs={base:st?st.bg:0x222222,sunset:0x5a3040,neon:0x1a1040},fogs={base:st?st.fog:0x333333,sunset:0x8a4a50,neon:0x3a1a70};
    scene.background=new T.Color(bgs[d.bg]); scene.fog=new T.Fog(fogs[d.bg],6,14); }

  /* ── FBX 모션을 캐릭터에 맞추기 (한 번만 계산해서 저장) ── */
  async function bake(ch,id){
    const key=ch.id+"|"+id; if(baked[key]) return baked[key];
    const def=(window.MOTION_FILES||{})[id]; if(!def) return null;
    baked[key]=(async()=>{
      if(!fbxCache[def.file]) fbxCache[def.file]=new FBXLoaderC().loadAsync("movelog_motions/"+def.file);
      const fbx=await fbxCache[def.file];
      const clip=fbx.animations[0]; if(!clip) throw new Error("FBX에 모션이 없어요: "+def.file);
      const src={}; fbx.traverse(o=>{ if(SRC[o.name]&&!src[SRC[o.name]]) src[SRC[o.name]]=o; });
      /* 애니메이션을 틀기 전 기본 자세(T자)를 기준으로 기록 */
      fbx.updateMatrixWorld(true);
      const rootInv=fbx.getWorldQuaternion(new T.Quaternion()).invert();
      const wq=o=>rootInv.clone().multiply(o.getWorldQuaternion(new T.Quaternion()));
      const wpos=o=>fbx.worldToLocal(o.getWorldPosition(new T.Vector3()));
      const srcRest={}; for(const k in src) srcRest[k]=wq(src[k]).invert();
      const sFace=Math.sign(wpos(src.leftUpperArm).x-wpos(src.rightUpperArm).x)||1;
      const R=new T.Quaternion(); if(sFace!==ch.faceSign) R.setFromAxisAngle(new T.Vector3(0,1,0),Math.PI);
      const Ri=R.clone().invert();
      const hipsRest=wpos(src.hips), scale=ch.hipsH/(hipsRest.y||1);
      const restLocal=new Map(); fbx.traverse(o=>restLocal.set(o,[o.position.clone(),o.quaternion.clone(),o.scale.clone()]));
      const mixer=new T.AnimationMixer(fbx); mixer.clipAction(clip).play();
      const start=def.start||0, end=Math.min(def.end||clip.duration,clip.duration), fps=30, n=Math.max(2,Math.round((end-start)*fps));
      const frames=[];
      for(let i=0;i<=n;i++){
        mixer.setTime(start+(end-start)*i/n); fbx.updateMatrixWorld(true);
        const d={};
        for(const k in src){ if(!ch.bones[k]||!srcRest[k]) continue;
          d[k]=R.clone().multiply(wq(src[k]).multiply(srcRest[k])).multiply(Ri); }
        const hp=wpos(src.hips).sub(hipsRest).multiplyScalar(scale).applyQuaternion(R);
        hp.y=Math.max(hp.y,-0.3);
        frames.push({d,hp});
      }
      /* 걸어가는 모션도 제자리에서 보이게: 시작 위치 기준으로 맞추고 이동 거리를 0.35m로 제한 */
      const base=frames[0].hp.clone(); base.y=0;
      for(const f of frames){ f.hp.sub(base); f.hp.x=Math.max(-0.35,Math.min(0.35,f.hp.x)); f.hp.z=Math.max(-0.35,Math.min(0.35,f.hp.z)); }
      return {frames,dur:end-start};
    })();
    try{ baked[key]=await baked[key]; return baked[key]; }catch(e){ console.error(e); delete baked[key]; return null; }
  }

  /* ── 기본 동작 (FBX가 없을 때) ── */
  const IDLE={tx:0,tz:0,hx:0,hy:0,hz:0,lsx:0,lsz:0.2,rsx:0,rsz:-0.2,lex:-0.15,rex:-0.15,ley:0,rey:0,py:0,pz:0,ry:0};
  const K=o=>Object.assign({},IDLE,o);
  const LIB={
   idle:{d:1,keys:[[0,K({})]]},
   cross:{d:2.6,keys:[[0,K({})],[0.4,K({lsx:-0.2,lsz:0.12,lex:-1.6,ley:-1.35,rsx:-0.4,rsz:-0.12,rex:-1.55,rey:1.35,tx:-0.05,hx:-0.05})],[2.1,K({lsx:-0.2,lsz:0.12,lex:-1.6,ley:-1.35,rsx:-0.4,rsz:-0.12,rex:-1.55,rey:1.35,tx:-0.05,hy:0.15})],[2.6,K({})]]},
   look_away:{d:2.2,keys:[[0,K({})],[0.4,K({hy:0.75,hx:0.12,ry:0.18,rsx:-0.25,rex:-1.2})],[1.7,K({hy:0.7,hx:0.18,ry:0.2,rsx:-0.6,rsz:-0.1,rex:-2.2})],[2.2,K({})]]},
   sigh:{d:2.2,keys:[[0,K({})],[0.6,K({py:0.03,lsz:0.25,rsz:-0.25,hx:-0.15})],[1.4,K({py:-0.03,hx:0.35,tx:0.12,lsz:0.15,rsz:-0.15})],[2.2,K({})]]},
   toss:{d:1.9,keys:[[0,K({})],[0.45,K({rsx:0.6,rsz:-0.25,rex:-0.8,ry:-0.25,tx:-0.05})],[0.8,K({rsx:-1.3,rsz:-0.1,rex:-0.1,ry:0.15,tx:0.1})],[1.4,K({rsx:-0.9,rex:-0.3,hy:-0.3})],[1.9,K({})]]},
   turn_back:{d:2.6,keys:[[0,K({})],[0.7,K({ry:2.6,hx:0.1})],[1.8,K({ry:2.6,hx:0.15,hy:-0.4})],[2.6,K({})]]},
   reach:{d:2.4,keys:[[0,K({})],[0.5,K({rsx:-1.25,rsz:-0.05,rex:-0.15,pz:0.08,tx:0.08,hx:0.08})],[1.9,K({rsx:-1.2,rsz:-0.05,rex:-0.2,pz:0.08,tx:0.08,hx:0.12})],[2.4,K({})]]},
   pat:{d:2.8,keys:[[0,K({})],[0.5,K({rsx:-2.2,rsz:-0.2,rex:-0.75,pz:0.12,tx:0.12,hx:0.1})],[2.3,K({rsx:-2.2,rsz:-0.2,rex:-0.75,pz:0.12,tx:0.12,hx:0.1})],[2.8,K({})]],osc:t=>t>0.5&&t<2.3?{rsz:Math.sin(t*12)*0.12}:{}},
   nod:{d:1.6,keys:[[0,K({})],[1.6,K({})]],osc:t=>({hx:Math.max(0,Math.sin(t*9))*0.3*(1-t/1.6)})},
   laugh:{d:2,keys:[[0,K({})],[0.3,K({hx:-0.3,tx:-0.08,lsz:0.3,rsz:-0.3,lex:-0.6,rex:-0.6})],[1.6,K({hx:-0.2,tx:0.1,lsz:0.25,rsz:-0.25,lex:-0.5,rex:-0.5})],[2,K({})]],osc:t=>t<1.7?{py:Math.abs(Math.sin(t*14))*0.02}:{}},
   step_in:{d:2.4,keys:[[0,K({})],[0.7,K({pz:0.3,tx:0.12,hx:0.1})],[1.8,K({pz:0.3,tx:0.1,hx:0.05,hz:0.12})],[2.4,K({})]],osc:t=>t<0.7?{py:Math.abs(Math.sin(t*9))*0.02}:{}},
   fluster:{d:2,keys:[[0,K({})],[0.25,K({lsx:-1.1,rsx:-1.1,lex:-1.4,rex:-1.4,hx:0.1})],[1.7,K({lsx:-1.1,rsx:-1.1,lex:-1.4,rex:-1.4,hx:0.1})],[2,K({})]],osc:t=>t>0.25&&t<1.7?{lsz:0.3+Math.sin(t*22)*0.25,rsz:-0.3-Math.sin(t*22+1)*0.25,hy:Math.sin(t*10)*0.15}:{}},
   surprise:{d:1.8,keys:[[0,K({})],[0.2,K({pz:-0.1,py:0.03,lsx:-0.6,lsz:0.6,rsx:-0.6,rsz:-0.6,lex:-1.2,rex:-1.2,hx:-0.2})],[1.2,K({pz:-0.08,lsx:-0.5,lsz:0.5,rsx:-0.5,rsz:-0.5,lex:-1.1,rex:-1.1})],[1.8,K({})]]},
   wave:{d:2.2,keys:[[0,K({})],[0.4,K({rsz:-2.5,rex:-0.5,hz:0.1})],[1.8,K({rsz:-2.5,rex:-0.5,hz:0.1})],[2.2,K({})]],osc:t=>t>0.4&&t<1.8?{rex:-0.5+Math.sin(t*12)*0.45}:{}},
   hug:{d:3,keys:[[0,K({})],[0.6,K({pz:0.3,lsx:-1.3,lsz:0.7,rsx:-1.3,rsz:-0.7,lex:-0.3,rex:-0.3,hx:0.1})],[1.2,K({pz:0.35,lsx:-1.4,lsz:0.35,rsx:-1.4,rsz:-0.35,lex:-0.9,ley:-0.9,rex:-0.9,rey:0.9,hx:0.2,hz:0.15})],[2.4,K({pz:0.35,lsx:-1.4,lsz:0.35,rsx:-1.4,rsz:-0.35,lex:-0.9,ley:-0.9,rex:-0.9,rey:0.9,hx:0.2,hz:0.15})],[3,K({})]]},
   heart:{d:4,keys:[[0,K({})],[0.4,K({lsx:-2.6,lsz:-0.35,lex:-1.0,rsx:-2.6,rsz:0.35,rex:-1.0,hx:-0.1})],[1.6,K({lsx:-2.6,lsz:-0.35,lex:-1.0,rsx:-2.6,rsz:0.35,rex:-1.0,hz:0.2})],[2.1,K({lsx:-1.2,lsz:0.2,lex:-1.6,rsx:-1.2,rsz:-0.2,rex:-1.6,ry:0.4})],[3.2,K({lsx:-1.2,lsz:0.2,lex:-1.6,rsx:-1.2,rsz:-0.2,rex:-1.6,ry:-0.4})],[4,K({})]],osc:t=>({py:Math.abs(Math.sin(t*7.5))*0.04,hz:Math.sin(t*7.5)*0.08,tz:Math.sin(t*3.75)*0.06})},
   point:{d:3.2,keys:[[0,K({})],[0.4,K({rsz:-2.2,rex:-0.1,ry:0.3})],[1.0,K({rsx:-1.4,rsz:-0.2,rex:0,ry:-0.3,pz:0.1})],[1.8,K({lsz:2.2,lex:-0.1,ry:-0.3})],[2.6,K({lsx:-1.4,lsz:0.2,lex:0,ry:0.3,pz:0.1})],[3.2,K({})]],osc:t=>({py:Math.abs(Math.sin(t*7.5))*0.04})}
  };
  const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
  function poseAt(m,t){const L=LIB[m]||LIB.idle,ks=L.keys;let p=ks[ks.length-1][1];
    for(let i=0;i<ks.length-1;i++){ if(t>=ks[i][0]&&t<=ks[i+1][0]){const a=ks[i][1],b=ks[i+1][1],u=ease((t-ks[i][0])/(ks[i+1][0]-ks[i][0]||1));p={};for(const k in IDLE)p[k]=a[k]+(b[k]-a[k])*u;break;} }
    if(L.osc){const o=L.osc(t);p=Object.assign({},p);for(const k in o)p[k]=(p[k]||0)+o[k];} return p;}
  /* 기본 동작 값을 VRM 뼈 회전으로 바꿈 (T자 자세 → 팔 내린 자세 기준) */
  function poseToDeltas(p,t){
    const Q=(x,y,z)=>new T.Quaternion().setFromEuler(new T.Euler(x,y,z,"XYZ"));
    const br=Math.sin(t*2.1)*0.012;
    const torso=Q(p.tx+br,0,p.tz), half=Q((p.tx+br)*0.5,0,p.tz*0.5);
    const head=torso.clone().multiply(Q(p.hx,p.hy,p.hz)), neck=torso.clone().multiply(Q(p.hx*0.4,p.hy*0.4,p.hz*0.4));
    const downL=Q(0,0,-Math.PI/2), downR=Q(0,0,Math.PI/2);
    const shL=torso.clone().multiply(Q(p.lsx,0,p.lsz+br)), shR=torso.clone().multiply(Q(p.rsx,0,p.rsz-br));
    const uaL=shL.clone().multiply(downL), uaR=shR.clone().multiply(downR);
    const AX=new T.Vector3(1,0,0), AY=new T.Vector3(0,1,0);
    const el=(x,y)=>new T.Quaternion().setFromAxisAngle(AY,y||0).multiply(new T.Quaternion().setFromAxisAngle(AX,x));
    const laL=shL.clone().multiply(el(p.lex,p.ley)).multiply(downL), laR=shR.clone().multiply(el(p.rex,p.rey)).multiply(downR);
    const d={spine:half,chest:torso,upperChest:torso,neck,head,leftShoulder:torso,rightShoulder:torso,
      leftUpperArm:uaL,leftLowerArm:laL,leftHand:laL,rightUpperArm:uaR,rightLowerArm:laR,rightHand:laR};
    for(const f of FINGERS) d[f]=f.startsWith("left")?laL:laR;
    return {d,hp:new T.Vector3(0,p.py+br*0.5,0),ry:p.ry,pz:p.pz};
  }
  function fbxAt(b,t){ const n=b.frames.length-1, x=Math.min(n,Math.max(0,t/b.dur*n)), i=Math.floor(x), u=x-i, A=b.frames[i], B=b.frames[Math.min(n,i+1)];
    const d={}; for(const k in A.d) d[k]=A.d[k].clone().slerp(B.d[k]||A.d[k],u);
    return {d,hp:A.hp.clone().lerp(B.hp,u),ry:0,pz:0}; }

  /* ── 계산한 회전을 캐릭터 뼈에 적용 ── */
  const tmpQ=()=>new T.Quaternion();
  function applyPose(P){
    poseRoot.rotation.y=P.ry||0; poseRoot.position.z=P.pz||0; poseRoot.updateMatrixWorld(true);
    const prInv=poseRoot.getWorldQuaternion(tmpQ()).invert();
    for(const k of ALL){ const b=cur.bones[k]; if(!b) continue; const r=cur.rest[k];
      if(k==="hips"){ b.position.copy(r.pos); }
      const D=P.d[k];
      if(!D){ b.quaternion.copy(r.local); b.updateMatrixWorld(true); continue; }
      const parentRel=prInv.clone().multiply(b.parent.getWorldQuaternion(tmpQ()));
      b.quaternion.copy(parentRel.clone().invert().multiply(D.clone().multiply(r.world)));
      if(k==="hips"&&P.hp){ const off=P.hp.clone().applyQuaternion(parentRel.clone().invert()); b.position.add(off); }
      b.updateMatrixWorld(true);
    }
  }
  function blendPoses(A,B,u){ const d={}; const keys=new Set([...Object.keys(A.d),...Object.keys(B.d)]);
    for(const k of keys){ const a=A.d[k]||new T.Quaternion(), b=B.d[k]||new T.Quaternion(); d[k]=a.clone().slerp(b,u); }
    return {d,hp:A.hp.clone().lerp(B.hp,u),ry:A.ry+(B.ry-A.ry)*u,pz:A.pz+(B.pz-A.pz)*u}; }

  /* ── 표정 ── */
  const EMO_EXPR={"기쁨":"happy","장난":"happy","설렘":"relaxed","수줍음":"relaxed","위로":"relaxed","슬픔":"sad","짜증":"angry","놀람":"surprised","걱정":"sad"};
  function applyExpr(dt){
    if(!cur) return;
    const t=clock.getElapsedTime();
    if(t>nextBlink&&blinkT<0){blinkT=0;} if(blinkT>=0){blinkT+=dt; if(blinkT>0.18){blinkT=-1;nextBlink=t+2.5+Math.random()*2.5;}}
    const blink=blinkT>=0?Math.sin(Math.min(1,blinkT/0.18)*Math.PI):0;
    for(const k in cur.expr) exprNow[k]=(exprNow[k]||0)+(((exprGoal[k]||0))-(exprNow[k]||0))*Math.min(1,dt*6);
    const touched=new Set();
    for(const k in cur.expr) for(const b of cur.expr[k]){ if(b.m.morphTargetInfluences&&!touched.has(b.m)){ b.m.morphTargetInfluences.fill(0); touched.add(b.m);} }
    const w={...exprNow, blink:Math.max(blink,0)};
    if((w.happy||0)>0.3) w.blink=Math.max(w.blink,0);
    for(const k in w){ const binds=cur.expr[k]; if(!binds||!w[k]) continue; for(const b of binds) if(b.m.morphTargetInfluences) b.m.morphTargetInfluences[b.i]=Math.min(1,b.m.morphTargetInfluences[b.i]+w[k]*b.w); }
  }

  /* ── 재생 ── */
  const timers={};
  let curPose=null, lastReq=null;
  function play(m,opt){
    opt=opt||{};
    if(!cur||(wantChar&&cur.id!==wantChar.id)) lastReq={m,opt,charId:wantChar&&wantChar.id,time:Date.now()};
    const tgt=opt.target||({home:"Hero",record:"Rec",community:"Com"}[typeof view!=="undefined"?view:""]||"Ov");
    const sub=document.getElementById("sub"+tgt), key=document.getElementById("key"+tgt);
    const dur0=dur(m);
    if(sub&&opt.sub){sub.textContent=opt.sub;sub.classList.add("on");clearTimeout(timers[tgt+"s"]);timers[tgt+"s"]=setTimeout(()=>sub.classList.remove("on"),Math.max(2800,opt.sub.length*120));}
    if(key){ if(opt.key){key.textContent="결정적 순간 · "+opt.key;key.classList.add("on");clearTimeout(timers[tgt+"k"]);timers[tgt+"k"]=setTimeout(()=>key.classList.remove("on"),dur0*1000+1200);} else key.classList.remove("on"); }
    if(!ready) return;
    exprGoal={}; const ex=EMO_EXPR[opt.emotion]||({laugh:"happy",heart:"happy",wave:"happy",sigh:"sad",surprise:"surprised",fluster:"surprised",cross:"angry"}[m]); if(ex) exprGoal[ex]=0.7;
    snap=curPose; snapT=clock.getElapsedTime();
    const hasFile=!!(window.MOTION_FILES||{})[m];
    mot={id:(LIB[m]||hasFile)?m:"idle",start:clock.getElapsedTime(),dur:dur0,bake:null,pending:hasFile&&!!cur};
    const myMot=mot;
    if(mot.pending){ bake(cur,m).then(b=>{ if(mot!==myMot) return; mot.pending=false;
      if(b){ mot.bake=b; mot.dur=b.dur; mot.start=clock.getElapsedTime(); snap=curPose; snapT=mot.start; } }); }
    if(opt.cam){ const close=opt.cam===true||opt.cam==="close";
      camGoal={pos:close?new T.Vector3(0.3,1.42,2.3):new T.Vector3(0,1.25,3.4),look:new T.Vector3(0,close?1.25:1.0,0),until:clock.getElapsedTime()+mot.dur+0.6}; }
  }
  function dur(m){ const f=(window.MOTION_FILES||{})[m]; if(f) return (f.end||4)-(f.start||0); return (LIB[m]||LIB.idle).d; }

  function loop(){
    requestAnimationFrame(loop); if(!parentEl) return;
    if(!parentEl.offsetParent&&getComputedStyle(parentEl).position!=="fixed"){ clock.getDelta(); return; }   /* 화면에 안 보이면 그리지 않음 (배터리 절약) */
    const dt=Math.min(0.05,clock.getDelta()), t=clock.getElapsedTime();
    if(cur){
      const mt=t-mot.start;
      let P;
      if(mot.bake&&mt<=mot.dur) P=fbxAt(mot.bake,mt);
      else if(!mot.bake&&LIB[mot.id]&&mt<=mot.dur) P=poseToDeltas(poseAt(mot.id,mt),t);
      else if(mot.pending) P=poseToDeltas(IDLE,t);
      else { if(mot.id!=="idle"){ snap=curPose; snapT=t; mot={id:"idle",start:t,dur:1,bake:null}; exprGoal={}; } P=poseToDeltas(IDLE,t); }
      const bu=(t-snapT)/0.3; if(snap&&bu<1) P=blendPoses(snap,P,ease(Math.max(0,bu)));
      curPose=P; applyPose(P); applyExpr(dt);
    }
    if(orbit&&typeof view!=="undefined"&&view==="record") yawGoal+=0.004;
    yaw+=(yawGoal-yaw)*0.12; turn.rotation.y=yaw;
    const goal=camGoal&&t<camGoal.until?camGoal:camBase; if(camGoal&&t>=camGoal.until) camGoal=null;
    camera.position.lerp(goal.pos,0.05);
    camera.userData.look.lerp(goal.look,0.05); camera.lookAt(camera.userData.look);
    renderer.render(scene,camera);
  }
  function resize(){ if(!parentEl||!ready) return; const w=parentEl.clientWidth,h=parentEl.clientHeight; if(!w||!h) return;
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.fov=w/h<0.8?40:30; camera.updateProjectionMatrix(); }
  function mount(el){ parentEl=el; el.insertBefore(msg,el.firstChild); if(ready){ el.insertBefore(canvas,el.firstChild); resize(); } }
  return {mount,setCharacter,setScene,play,decor,dur,canvas:()=>canvas};
})();
