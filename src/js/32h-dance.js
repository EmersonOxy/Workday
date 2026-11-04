/* ================= Dança das Setas: ritmo e vidas ================= */
function mgDance(host,done,opts={}) {
  const u=U(),P=WD_PAL,st=mgStage(host,u.mgDance,document.body.classList.contains('touch')?u.mgDanceHelpT:u.mgDanceHelp);
  const x=st.x,finishOnce=arcadeDoneOnce(done),clock=arcadeClock();
  const cols=[9,39,69,99],colors=[P.L,P.O,P.F,P.I],SYMS=['←','↓','↑','→'],HIT=116;
  const START=1.8,DURATION=35,WINDOW=.18,LEAD=1.55;
  const notes=[],parts=[];
  let lives=5,score=0,combo=0,best=0,hits=0,miss=0,elapsed=0,over=false,last=0,avatar=1,flash=[0,0,0,0];
  for(let t=START,idx=0;t<START+DURATION;t+=idx<12?.55:idx<36?.43:.36,idx++){
    const lane=(idx*3+Math.floor(idx/6)+(Math.random()*4|0))%4;
    notes.push({at:t,lane,hit:false,miss:false});
  }
  const hit=(lane)=>{
    if(over)return;
    flash[lane]=.12;
    const n=notes.find(n=>!n.hit&&!n.miss&&n.lane===lane&&Math.abs(n.at-elapsed)<=WINDOW);
    if(n) {
      n.hit=true;hits++;combo++;best=Math.max(combo,best);score+=100+Math.min(200,combo*5);
      avatar=lane;
      mgParticles(parts,cols[lane]+11,HIT,colors[lane],8);
      mgPop(st,u.mgDanceGood,'ok');
      sfx('pop');
    } else lose();
  };
  function lose() {
    if(over)return;
    miss++;combo=0;lives--;
    mgPop(st,u.mgDanceMiss,'bad');sfx('err');
    if(lives<=0)end(false);
  }
  const keyDirs={ArrowLeft:0,KeyA:0,ArrowDown:1,KeyS:1,ArrowUp:2,KeyW:2,ArrowRight:3,KeyD:3};
  const kd=e=>{if(Object.hasOwn(keyDirs,e.code)&&!e.repeat){e.preventDefault();e.stopPropagation();hit(keyDirs[e.code]);}};
  addEventListener('keydown',kd,true);
  st.cv.onpointerdown=e=>{
    e.preventDefault();const pos=arcadePointerXY(st.cv,e);
    const idx=Math.min(3,Math.max(0,Math.floor(pos.x/32)));
    hit(idx);
  };
  function draw(dt) {
    x.fillStyle=P[0];x.fillRect(0,0,128,160);
    // Dancefloor grid with stage lights, pixel stars and directional pads.
    for(let i=0;i<4;i++){
      x.fillStyle=i%2?P.n:P.N;x.fillRect(i*32,0,32,160);
      x.fillStyle=colors[i];x.fillRect(i*32+14,8,4,4);
      x.fillStyle=P.k;x.fillRect(i*32+5,26,25,104);
      x.fillStyle=P.J;x.fillRect(i*32+7,28,21,99);
      if(flash[i]>0){x.fillStyle=colors[i];x.globalAlpha=.32;x.fillRect(i*32+7,28,21,99);x.globalAlpha=1;}
      // Target arrows with carved silhouettes.
      const cx=cols[i]+11;
      x.fillStyle=P.k;x.fillRect(cx-11,HIT-12,23,22);
      x.fillStyle=flash[i]>0?P.W:P.p;x.fillRect(cx-9,HIT-10,19,18);
      arcadeDanceArrow(x,cx,HIT-1,i,flash[i]>0?colors[i]:P.J);
    }
    for(const n of notes) {
      if(n.hit||n.miss)continue;
      const y=HIT-(n.at-elapsed)/LEAD*97;
      if(y<-18||y>140)continue;
      x.fillStyle=P.k;x.fillRect(cols[n.lane],(y-12)|0,23,22);
      x.fillStyle=colors[n.lane];x.fillRect(cols[n.lane]+2,(y-10)|0,19,18);
      arcadeDanceArrow(x,cols[n.lane]+11,(y-1)|0,n.lane,P.W);
    }
    mgDrawParticles(x,parts,dt);
    // Miniature dancer at the top of the stage.
    arcadeEmployee(x,58+(avatar===0?-5:avatar===3?5:0),6,'player');
    st.hud.textContent=u.mgScore+' '+fmt(score)+' · '+u.mgCombo+' '+combo+' · '+u.mgLives+' '+lives;
  }
  function end(quit) {
    if(over)return;over=true;
    removeEventListener('keydown',kd,true);st.off();clock.stop();
    if(quit){finishOnce({score,grade:'bad',quit:true});return;}
    const ratio=hits/Math.max(1,hits+miss),grade=lives>0&&ratio>.84?'good':lives>0?'ok':'bad';
    mgResult(st,host,[[u.mgScore,fmt(score)],[u.mgLives,lives],[u.mgBest,best],[u.mgAcc,Math.round(ratio*100)+'%']],grade,
      g=>finishOnce({score,grade:g,lives,acc:ratio}));
  }
  host._quit=()=>end(true);
  host._dance={notes,hit,get lives(){return lives;},get score(){return score;},get elapsed(){return elapsed;}};
  function frame(){
    if(!st.cv.isConnected){end(true);return;}
    const dt=clock.step();elapsed+=dt;
    for(let i=0;i<4;i++)flash[i]=Math.max(0,flash[i]-dt);
    for(const n of notes)if(!n.hit&&!n.miss&&elapsed>n.at+WINDOW){
      n.miss=true;lose();if(over)return;
    }
    draw(dt);
    if(elapsed>START+DURATION+1)end(false);
    if(!over)requestAnimationFrame(frame);
  }
  mgPop(st,u.mgReady);requestAnimationFrame(frame);
}
function arcadeDanceArrow(ctx,cx,cy,dir,color){
  // Compact 9x9 pixel-arrow rotated in four orientations without canvas interpolation.
  const pts=[[-1,-5],[1,-5],[5,-1],[3,1],[1,-1],[1,5],[-1,5],[-1,-1],[-3,1],[-5,-1]];
  ctx.fillStyle=color;
  for(const [dx,dy] of pts) {
    let xx=dx,yy=dy;
    if(dir===0){xx=-dy;yy=dx;}
    if(dir===1){xx=-dx;yy=-dy;}
    if(dir===3){xx=dy;yy=-dx;}
    ctx.fillRect((cx+xx)|0,(cy+yy)|0,3,3);
  }
}
