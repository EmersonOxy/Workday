/* ================= Dardos do Expediente =================
   Alvo com anéis, oscilação da mira e potência ao segurar.
   Desktop: move mouse, segura/solta clique; teclado: setas + Espaço.
   Touch: joystick virtual no centro inferior e botão LANÇAR à direita.
   Aposta opcional em dinheiro da carreira (0 = treino gratuito). */
function mgDarts(host,done,opts={}) {
  const u=U(),P=WD_PAL,st=mgStage(host,u.mgDarts,u.mgDartsHelp);
  const x=st.x,finishOnce=arcadeDoneOnce(done),clock=arcadeClock();
  const versus=!!opts.vs,rival=Rival.create('darts',versus),touch=document.body.classList.contains('touch');
  const CENTER={x:64,y:69},R=44;
  const ARM={x:63,y:143},THROW={x:107,y:144};
  let aim={x:64,y:64},position={x:64,y:64},joystick={x:0,y:0},pointerId=null,joyId=null;
  let phase='bet',charge=0,hold=false,elapsed=0,shots=0,points=0,opponent=0,stake=0,over=false,flight=null,impacts=[];
  let wager;
  const clip=(v,a,b)=>Math.max(a,Math.min(b,v));
  const skill=RIVAL_SKILL[CFG.diff||'normal']||.7;
  const target=()=>{
    const swx=Math.sin(elapsed*4.2)*3.3+Math.sin(elapsed*7.5)*1.6;
    const swy=Math.cos(elapsed*3.6)*3+Math.sin(elapsed*8.1)*1.2;
    return {x:clip(aim.x+swx,8,120),y:clip(aim.y+swy,22,115)};
  };
  function dartPoints(px,py) {
    const dx=px-CENTER.x,dy=py-CENTER.y,r=Math.hypot(dx,dy);
    if(r>R)return 0;
    if(r<=4)return 50;
    if(r<=9)return 25;
    const angle=(Math.atan2(dy,dx)+Math.PI*2)%(Math.PI*2);
    const sectors=[6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10];
    const index=Math.floor((angle/(Math.PI*2))*20);
    let value=sectors[index];
    if(r>=30&&r<=34)value*=3;
    else if(r>=39&&r<=43)value*=2;
    return value;
  }
  const release=()=>{
    if(!hold||phase!=='aim')return;
    hold=false;
    const power=clip(charge/1.55,0,1),pt=target();
    // Força ideal de ~75%; muito fraco/forte aumenta o erro mas não
    // escolhe uma pontuação artificial depois do lançamento.
    const scatter=2+Math.abs(power-.72)*24;
    const px=clip(pt.x+(Math.random()-.5)*scatter,0,128);
    const py=clip(pt.y+(Math.random()-.5)*scatter,0,125);
    flight={fromX:64,fromY:155,x:px,y:py,t:0,power};
    phase='flight';sfx('click');
  };
  const press=()=>{if(phase==='aim'&&!hold){hold=true;charge=0;sfx('key');}};
  const kd=e=>{
    if(phase!=='aim')return;
    const move=({ArrowLeft:[-4,0],KeyA:[-4,0],ArrowRight:[4,0],KeyD:[4,0],ArrowUp:[0,-4],KeyW:[0,-4],ArrowDown:[0,4],KeyS:[0,4]})[e.code];
    if(move){e.preventDefault();e.stopPropagation();aim.x=clip(aim.x+move[0],4,124);aim.y=clip(aim.y+move[1],20,120);}
    if(e.code==='Space'){e.preventDefault();e.stopPropagation();if(!e.repeat)press();}
  };
  const ku=e=>{if(e.code==='Space'){e.preventDefault();e.stopPropagation();release();}};
  addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);
  st.cv.onpointerdown=e=>{
    if(phase!=='aim')return;
    e.preventDefault();const p=arcadePointerXY(st.cv,e);
    st.cv.setPointerCapture(e.pointerId);
    if(touch&&Math.hypot(p.x-ARM.x,p.y-ARM.y)<22) {
      joyId=e.pointerId;joystick={x:0,y:0};
    }else if(touch&&(p.x>92&&p.y>128)){
      pointerId=e.pointerId;press();
    }else if(!touch){
      pointerId=e.pointerId;aim.x=p.x;aim.y=p.y;press();
    }
  };
  st.cv.onpointermove=e=>{
    if(phase!=='aim')return;
    const p=arcadePointerXY(st.cv,e);
    if(e.pointerId===joyId){
      joystick.x=clip((p.x-ARM.x)/16,-1,1);
      joystick.y=clip((p.y-ARM.y)/16,-1,1);
    }else if(!touch&&(!hold||pointerId===e.pointerId)){
      aim.x=clip(p.x,5,123);aim.y=clip(p.y,20,124);
    }
  };
  st.cv.onpointerup=e=>{
    if(e.pointerId===joyId){joyId=null;joystick={x:0,y:0};}
    if(e.pointerId===pointerId){pointerId=null;release();}
  };
  // Interrupções do navegador (troca de aba, gesto do sistema, captura perdida)
  // cancelam o arremesso em andamento; não contam como soltura intencional.
  st.cv.onpointercancel=e=>{
    if(e.pointerId===joyId){joyId=null;joystick={x:0,y:0};}
    if(e.pointerId===pointerId){pointerId=null;hold=false;charge=0;}
  };
  function resolve() {
    const scored=dartPoints(flight.x,flight.y);
    impacts.push({x:flight.x,y:flight.y,points:scored});
    points+=scored;shots++;sfx(scored>0?'pop':'err');
    mgPop(st,scored?u.mgDartsHit+' '+scored:u.mgDartsMiss,scored?'ok':'bad');
    flight=null;hold=false;charge=0;
    if(shots>=3){phase='settle';elapsed=0;}
    else phase='aim';
  }
  function settle() {
    // Solo precisa superar uma meta, versus compara com os lançamentos
    // simulados do oponente. Não existe resultado controlado pelo pagamento.
    if(versus){
      for(let i=0;i<3;i++){
        const err=(1-(rival?.skill||skill))*25;
        const px=CENTER.x+(Math.random()-.5)*(10+err*2);
        const py=CENTER.y+(Math.random()-.5)*(10+err*2);
        opponent+=dartPoints(px,py);
      }
    }
    const win=versus?points>opponent:points>=80;
    const prize=arcadeBetPayout(stake,win);
    if(rival)rival.score=opponent;
    const vs=rival?Rival.finish(rival,points):null;
    over=true;st.off();clock.stop();
    removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);
    mgResult(st,host,[[u.mgScore,fmt(points)],...(versus?[['Duda',fmt(opponent)]]:[[u.mgDartsTarget,'80']]),...(stake>0?[[u.mgBetAmount,money(stake)],[u.mgBetPrize,money(prize)]]:[])],
      win?'good':'bad',g=>finishOnce({score:points,grade:g,vs,bet:stake,winnings:prize}));
  }
  function end(quit=false) {
    if(over)return;over=true;st.off();clock.stop();
    removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);
    if(wager)wager.cancel();
    finishOnce({score:points,grade:'bad',quit:true,bet:stake});
  }
  host._quit=()=>end(true);
  host._darts={dartPoints,press,release,get phase(){return phase;},get points(){return points;},get shots(){return shots;},get stake(){return stake;},aim};
  function board() {
    x.fillStyle=P[0];x.fillRect(0,0,128,160);
    for(let xx=0;xx<128;xx+=14){x.fillStyle=P.N;x.fillRect(xx,0,2,160);}
    x.fillStyle=P.k;x.fillRect(17,19,94,97);
    for(let yy=21;yy<=114;yy+=6){x.fillStyle=P.K;x.fillRect(19,yy,90,1);}
    // Darts target with wedge segments and concentric pixel rings.
    for(let yy=24;yy<=113;yy++)for(let xx=19;xx<=109;xx++){
      const dx=xx-CENTER.x,dy=yy-CENTER.y,r=Math.sqrt(dx*dx+dy*dy);
      if(r>R+1)continue;
      let c=P.k;
      if(r<=R){
        const seg=Math.floor((((Math.atan2(dy,dx)+Math.PI*2)%(Math.PI*2))/(Math.PI*2))*20);
        const even=seg%2===0;
        c=r<4?P.R:r<9?P.F:r<29?(even?P.W:P.J):r<34?(even?P.F:P.R):r<39?(even?P.W:P.J):r<43?(even?P.F:P.R):P.k;
      }
      x.fillStyle=c;x.fillRect(xx,yy,1,1);
    }
    // Sector separators and outer rim.
    x.strokeStyle=P.k;x.lineWidth=1;
    for(let i=0;i<20;i++){
      const a=i*Math.PI*2/20;
      x.beginPath();x.moveTo(CENTER.x+Math.cos(a)*9,CENTER.y+Math.sin(a)*9);
      x.lineTo(CENTER.x+Math.cos(a)*R,CENTER.y+Math.sin(a)*R);x.stroke();
    }
    for(const it of impacts){
      x.fillStyle=P.k;x.fillRect((it.x-2)|0,(it.y-2)|0,5,5);
      x.fillStyle=P.m;x.fillRect((it.x-1)|0,(it.y-1)|0,3,3);
      x.fillStyle=P.W;x.fillRect((it.x-1)|0,(it.y-6)|0,2,5);
    }
    if(phase==='aim'){
      const p=target();
      x.strokeStyle=P.y;x.lineWidth=1;
      x.beginPath();x.moveTo(p.x-6,p.y);x.lineTo(p.x+6,p.y);x.moveTo(p.x,p.y-6);x.lineTo(p.x,p.y+6);x.stroke();
      x.fillStyle=P.k;x.fillRect((p.x-1)|0,(p.y-1)|0,3,3);
      x.fillStyle=P.Y;x.fillRect((p.x)|0,(p.y)|0,1,1);
    }
    if(flight){
      const t=Math.min(1,flight.t),fx=64+(flight.x-64)*t,fy=150+(flight.y-150)*t;
      x.fillStyle=P.W;x.fillRect((fx-1)|0,(fy-5)|0,2,7);
      x.fillStyle=P.M;x.fillRect((fx-2)|0,(fy)|0,5,3);
    }
    x.fillStyle=P.J;x.fillRect(0,124,128,36);
    x.fillStyle=P.m;x.fillRect(10,125,108,2);
    if(phase==='aim'||phase==='flight'){
      const power=clip(charge/1.55,0,1);
      x.fillStyle=P.k;x.fillRect(5,128,25,7);
      x.fillStyle=P.Y;x.fillRect(6,129,(23*power)|0,5);
      if(touch){
        x.fillStyle=P.k;for(let a=0;a<Math.PI*2;a+=.18){
          const px=ARM.x+Math.cos(a)*15,py=ARM.y+Math.sin(a)*15;
          x.fillRect(px|0,py|0,2,2);
        }
        x.fillStyle=P.L;x.fillRect((ARM.x+joystick.x*10-4)|0,(ARM.y+joystick.y*10-4)|0,8,8);
        x.fillStyle=P.k;x.fillRect(99,134,20,20);
        x.fillStyle=hold?P.R:P.F;x.fillRect(101,136,16,16);
        Pixel.text(x,u.mgDartsThrowShort,101,146,P.W);
      }else Pixel.text(x,u.mgDartsThrowShort,85,146,P.W);
    }
    st.hud.textContent=u.mgScore+' '+points+' · '+u.mgDartsThrow+' '+Math.min(3,shots+1)+'/3 · '+(stake>0?u.mgBetAmount+' '+money(stake):u.mgNoBet);
  }
  wager=arcadeBetPanel(host,u.mgDarts,n=>{
    stake=n;phase='aim';elapsed=0;mgPop(st,u.mgReady);
  },{stage:st,allowFree:true});
  function frame(){
    if(!st.cv.isConnected){end(true);return;}
    const dt=clock.step();elapsed+=dt;
    if(phase==='aim') {
      if(hold)charge=Math.min(1.55,charge+dt);
      if(touch && joyId!==null){aim.x=clip(aim.x+joystick.x*40*dt,8,120);aim.y=clip(aim.y+joystick.y*40*dt,22,115);}
    }
    if(phase==='flight'){flight.t+=dt/.63;if(flight.t>=1)resolve();}
    if(phase==='settle'&&elapsed>=1.1){settle();return;}
    board();
    if(!over)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
