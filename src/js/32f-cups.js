/* ================= Três Copos: acompanhe a bolinha e aposte ================= */
function mgCups(host,done,opts={}) {
  const u=U(),P=WD_PAL,st=mgStage(host,u.mgCups,u.mgCupsHelp);
  const ctx=st.x,finishOnce=arcadeDoneOnce(done),clock=arcadeClock();
  const POS=[24,64,104],cups=[0,1,2].map(i=>({id:i,slot:i,start:i,target:i,x:POS[i],y:0}));
  const ballCup=Math.random()*3|0, swaps=9;
  let phase='bet',t=0,elapsed=0,swap=0,stake=0,chosen=-1,settled=false,over=false,win=false;
  let pair=[0,1],control;
  const at=(id)=>cups.find(c=>c.id===id);
  const shapeCup=(cup)=>{
    const xx=cup.x|0,yy=(cup.y||0)|0,edge=xx-15;
    // Cup with rim, pattern, highlight, shade and cast shadow.
    ctx.fillStyle=P.k;ctx.fillRect(edge-1,87+yy,31,3);
    ctx.fillStyle=P.J;ctx.fillRect(edge+1,84+yy,27,2);
    ctx.fillStyle=P.k;ctx.fillRect(edge,57+yy,28,29);
    ctx.fillStyle=P.W;ctx.fillRect(edge+2,58+yy,23,25);
    ctx.fillStyle=P.p;ctx.fillRect(edge+18,60+yy,7,23);
    ctx.fillStyle=P.R;ctx.fillRect(edge+4,60+yy,5,20);
    ctx.fillStyle=P.y;ctx.fillRect(edge+10,63+yy,5,18);
    ctx.fillStyle=P.R;ctx.fillRect(edge+16,67+yy,4,14);
    ctx.fillStyle=P.W;ctx.fillRect(edge+2,57+yy,24,4);
    ctx.fillStyle=P.k;ctx.fillRect(edge-2,54+yy,32,4);
    ctx.fillStyle=P.w;ctx.fillRect(edge+1,55+yy,26,2);
    ctx.fillStyle=P.K;ctx.fillRect(edge+10,71+yy,7,7);
    Pixel.text(ctx,String(cup.id+1),edge+12,73+yy,P.W);
  };
  function draw() {
    ctx.fillStyle=P[0];ctx.fillRect(0,0,128,160);
    // Office breakroom: wall panel, wall clock and wood counter with perspective.
    for(let i=0;i<6;i++){ctx.fillStyle=i%2?P.N:P.n;ctx.fillRect(0,i*12,128,12);}
    ctx.fillStyle=P.w;ctx.fillRect(9,16,110,24);
    ctx.fillStyle=P.p;ctx.fillRect(12,19,104,2);
    ctx.fillStyle=P.k;ctx.fillRect(56,19,16,16);
    ctx.fillStyle=P.W;ctx.fillRect(58,21,12,12);ctx.fillStyle=P.J;ctx.fillRect(63,23,1,5);ctx.fillRect(64,27,4,1);
    ctx.fillStyle=P[3];ctx.fillRect(0,98,128,62);
    for(let y=100;y<160;y+=12){ctx.fillStyle=P[2];ctx.fillRect(0,y,128,2);}
    ctx.fillStyle=P[1];ctx.fillRect(0,97,128,6);
    ctx.fillStyle=P.k;ctx.fillRect(0,95,128,2);
    for(const c of cups) {
      const shown=(phase==='show'||phase==='reveal')&&c.id===ballCup;
      if(shown) {
        ctx.fillStyle=P.k;ctx.fillRect((c.x-4)|0,92,8,8);
        ctx.fillStyle=P.Y;ctx.fillRect((c.x-3)|0,93,6,6);
        ctx.fillStyle=P.y;ctx.fillRect((c.x-2)|0,93,2,2);
      }
      if(phase==='choose'&&chosen<0){ctx.fillStyle=P.y;ctx.fillRect((c.x-14)|0,91,28,2);}
      shapeCup({...c,y:shown?-11:c.y});
    }
    if(phase==='reveal'&&chosen>=0) {
      const c=cups.find(c=>c.slot===chosen);
      ctx.fillStyle=win?P.F:P.R;
      ctx.fillRect((c.x-16)|0,47,32,4);
    }
    ctx.fillStyle=P.W;ctx.fillRect(7,130,114,1);
    st.hud.textContent=(stake>0?u.mgBetAmount+': '+money(stake):u.mgNoBet)+' · '+(phase==='bet'?u.mgChooseMode:phase==='show'?u.mgCupsWatch:phase==='shuffle'?u.mgCupsShuffle:phase==='choose'?u.mgCupsChoose:u.mgCupsReveal);
  }
  function scheduleSwap() {
    const a=Math.random()*3|0;
    let b=Math.random()*3|0;if(b===a)b=(b+1+(Math.random()*2|0))%3;
    pair=[a,b];
    for(const c of cups){c.start=c.slot;c.target=c.slot===a?b:c.slot===b?a:c.slot;}
    t=0;phase='shuffle';
  }
  const choose=n=>{
    if(phase!=='choose'||n<0||n>2)return;
    chosen=n;
    const selected=cups.find(c=>c.slot===n);
    win=selected&&selected.id===ballCup;
    if(!settled){settled=true;arcadeBetPayout(stake,win);}
    sfx(win?'level':'err');mgPop(st,win?u.mgCupsWon:u.mgCupsLost,win?'ok':'bad');
    phase='reveal';t=0;
  };
  const kd=e=>{
    if(phase!=='choose')return;
    const n=({Digit1:0,Digit2:1,Digit3:2,Numpad1:0,Numpad2:1,Numpad3:2})[e.code];
    if(n!==undefined){e.preventDefault();e.stopPropagation();choose(n);}
  };
  addEventListener('keydown',kd,true);
  st.cv.onpointerdown=e=>{
    if(phase!=='choose')return;
    e.preventDefault();
    const p=arcadePointerXY(st.cv,e);
    if(p.y<38||p.y>112)return;
    let best=0;for(let i=1;i<3;i++)if(Math.abs(p.x-POS[i])<Math.abs(p.x-POS[best]))best=i;
    choose(best);
  };
  function end(quit=false) {
    if(over)return;over=true;
    removeEventListener('keydown',kd,true);st.off();clock.stop();if(control)control.cancel();
    if(quit)return finishOnce({score:0,grade:'bad',quit:true,bet:stake});
    const grade=win?'good':'bad';
    mgResult(st,host,[[u.mgCupsResult,win?u.mgCupsWon:u.mgCupsLost],...(stake>0?[[u.mgBetAmount,money(stake)],[u.mgBetPrize,money(win?stake*2:0)]]:[])],grade,
      g=>finishOnce({score:win?1:0,grade:g,bet:stake,winnings:win?stake*2:0}));
  }
  host._quit=()=>end(true);
  host._cups={choose,get phase(){return phase;},get ballCup(){return ballCup;},get stake(){return stake;},get settled(){return settled;}};
  control=arcadeBetPanel(host,u.mgCups,v=>{
    stake=v;phase='show';t=0;mgPop(st,u.mgCupsWatch);}, {stage:st});
  function frame() {
    if(!st.cv.isConnected){end(true);return;}
    const dt=clock.step();elapsed+=dt;
    if(phase==='show'){t+=dt;if(t>1.8){swap=0;scheduleSwap();}}
    else if(phase==='shuffle'){
      t+=dt;const k=Math.min(1,t/.54),ease=k*k*(3-2*k);
      for(const c of cups) {
        c.x=POS[c.start]+(POS[c.target]-POS[c.start])*ease;
        c.y=(c.target!==c.start)?-Math.sin(Math.PI*k)*8:0;
      }
      if(k>=1){
        for(const c of cups){c.slot=c.target;c.x=POS[c.slot];c.y=0;}
        swap++;if(swap<swaps)scheduleSwap();else{phase='choose';mgPop(st,u.mgCupsChoose);}
      }
    } else if(phase==='reveal'){t+=dt;if(t>1.5){end(false);return;}}
    draw();if(!over)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
