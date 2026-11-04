/* ================= Pênaltis do Expediente =================
   Três cobranças por lado. Jogador cobra puxando a bola para trás.
   Quando defende, escolhe o salto via setas/A-S-D ou toque no setor do gol.
   Em solo a outra equipe é a máquina; versus, Duda; local, dois humanos. */
function mgPenalty(host, done, opts = {}) {
  const u=U(), P=WD_PAL, finishOnce=arcadeDoneOnce(done);
  const local=!!opts.local, versus=!!opts.vs&&!local, rival=Rival.create('penalty',versus);
  const st=mgStage(host,u.mgPenalty,u.mgPenaltyHelp),x=st.x,clock=arcadeClock();
  const [LEFT,MID,RIGHT]=[0,1,2];
  const ZONES=[32,64,96], GOAL_Y=42, BALL_Y=130, TOTAL=6;
  const cpuSkill=local?0:versus?rival.skill:Math.min(.9,(RIVAL_SKILL[CFG.diff||'normal']||.7));
  const help=host.querySelector('.mg-help');
  let shots=0,myGoals=0,otherGoals=0,phase='aim',between=0,aim=null,ball=null,keeperChoice=null,elapsed=0,over=false;
  const attack=()=>shots<3;
  const zoneAt=q=>q<48?LEFT:q>80?RIGHT:MID;
  const zoneName=z=>[u.mgLeft,u.mgCenter,u.mgRight][z];
  const pickDirection=()=>Math.random()*3|0;
  const arrow=e=>({ArrowLeft:LEFT,KeyA:LEFT,ArrowDown:MID,KeyS:MID,Space:MID,ArrowRight:RIGHT,KeyD:RIGHT})[e.code];
  const defender=()=>(local || !attack()) && (phase==='defense-wait'||phase==='flight');
  function dive(dir) {
    if(!defender()||keeperChoice!==null)return;
    keeperChoice=dir;
    sfx('click');
    mgPop(st,zoneName(dir));
  }
  const kd=e=>{
    const z=arrow(e);
    if(z!==undefined&&defender()){e.preventDefault();e.stopPropagation();dive(z);}
  };
  addEventListener('keydown',kd,true);
  function launch(target,power,ai=false) {
    if(over||(phase!=='aim'&&phase!=='defense-wait'))return false;
    if(phase==='aim'&&power<.16){mgPop(st,u.mgPenaltyPull,'bad');return false;}
    const targetX=Math.max(5,Math.min(123,target)),shotZone=zoneAt(targetX);
    if(attack() && !local) {
      // Goleiro automatizado reage ao chute, mas não lê a jogada com certeza absoluta.
      keeperChoice=Math.random()<cpuSkill*.72?shotZone:pickDirection();
    }
    ball={fromX:64,fromY:BALL_Y,x:targetX,y:GOAL_Y,t:0,power,zone:shotZone,ai};
    phase='flight';sfx('click');
    return true;
  }
  let pointer=null;
  st.cv.onpointerdown=e=>{
    if(over)return;
    e.preventDefault();
    const p=arcadePointerXY(st.cv,e);
    if(defender()){dive(zoneAt(p.x));return;}
    if(phase==='aim'&&p.y>103&&Math.abs(p.x-64)<35){
      st.cv.setPointerCapture(e.pointerId);
      pointer={id:e.pointerId,x:p.x,y:p.y};
      aim={x:p.x,y:p.y};
    }
  };
  st.cv.onpointermove=e=>{if(pointer&&pointer.id===e.pointerId)aim=arcadePointerXY(st.cv,e);};
  st.cv.onpointerup=st.cv.onpointercancel=e=>{
    if(pointer&&pointer.id===e.pointerId){
      const p=arcadePointerXY(st.cv,e),dx=p.x-pointer.x,dy=p.y-pointer.y;
      aim=null;pointer=null;
      if(dy>8){launch(64-dx*1.25,Math.min(1,dy/58));}
      else mgPop(st,u.mgPenaltyPull,'bad');
    }
  };
  function nextShot() {
    keeperChoice=null;ball=null;aim=null;pointer=null;
    if(shots>=TOTAL){end(false);return;}
    phase=attack()?'aim':'defense-wait';between=attack()?0:1.1;
    help.textContent=attack()?u.mgPenaltyShoot:u.mgPenaltySave;
    mgPop(st,(attack()?u.vsYou:local?u.mgPlayerTwo:versus?'DUDA':u.mgCPU)+' · '+u.mgPenaltyKick+' '+(shots%3+1));
  }
  function resolveShot() {
    if(!ball)return;
    const inside=ball.x>=18&&ball.x<=110,weak=ball.power<.26;
    const aligned=keeperChoice===ball.zone;
    const saved=aligned && (ball.ai?true:Math.random()<.9);
    const scored=inside&&!weak&&!saved;
    if(scored) {
      if(attack())myGoals++;else otherGoals++;
      sfx('level');mgPop(st,u.mgPenaltyGoal,'ok');
    } else {sfx('err');mgPop(st,inside&&!weak?u.mgPenaltySaveMsg:u.mgPenaltyMiss,'bad');}
    shots++;phase='between';between=.95;
  }
  function end(quit) {
    if(over)return;over=true;removeEventListener('keydown',kd,true);st.off();clock.stop();
    const grade=arcadeGrade(myGoals,otherGoals,true);
    if(quit){finishOnce({score:myGoals,grade:'bad',quit:true});return;}
    if(rival)rival.score=otherGoals;
    const vs=rival?Rival.finish(rival,myGoals):null;
    const who=local?u.mgPlayerTwo:versus?'Duda':u.mgCPU;
    mgResult(st,host,[[u.vsYou,myGoals],[who,otherGoals],[u.mgPenaltyKicks,TOTAL]],vs?(vs.res==='win'?'good':vs.res==='draw'?'ok':'bad'):grade,
      g=>finishOnce({score:myGoals,grade:g,vs,goals:myGoals,against:otherGoals}),vs);
  }
  host._quit=()=>end(true);
  host._penalty={launch,dive,get shots(){return shots;},get score(){return myGoals;},get opposing(){return otherGoals;},get phase(){return phase;}};
  function drawGoal() {
    x.fillStyle=P.X;x.fillRect(0,0,128,160);
    for(let j=0;j<8;j++){x.fillStyle=j%2?P.x:P.X;x.fillRect(0,j*20,128,20);}
    // Linhas da área, arquibancada e gol vistos da perspectiva do cobrador.
    x.fillStyle=P.W;x.fillRect(5,15,118,1);x.fillRect(5,15,1,90);x.fillRect(122,15,1,90);
    x.fillRect(17,20,94,2);x.fillRect(17,20,2,48);x.fillRect(109,20,2,48);
    for(let j=25;j<68;j+=7){x.fillStyle=P.V;x.fillRect(19,j,90,1);}
    for(let j=27;j<110;j+=9){x.fillStyle=P.V;x.fillRect(j,22,1,45);}
    x.fillStyle=P.W;x.fillRect(8,112,112,1);x.fillRect(8,144,112,1);
    x.fillStyle=P.W;x.fillRect(63,74,2,2);
    const diveX=keeperChoice===null?64:ZONES[keeperChoice];
    const move=ball?Math.max(0,Math.min(1,(ball.t-.16)/.35)):0;
    const kx=64+(diveX-64)*move;
    // O goleiro também é um funcionário em miniatura.
    arcadeEmployee(x,kx-5,45,attack()?'boss':'player',1);
    // Cobrador na marca do pênalti: boneco com camisa e gravata.
    arcadeEmployee(x,52,138,attack()?'player':'boss',1);
    const bx=ball?64+(ball.x-64)*Math.min(1,ball.t):64;
    const by=ball?BALL_Y+(GOAL_Y-BALL_Y)*Math.min(1,ball.t):BALL_Y;
    x.fillStyle=P.k;x.fillRect((bx-4)|0,(by-4)|0,8,8);
    x.fillStyle=P.W;x.fillRect((bx-3)|0,(by-3)|0,6,6);
    x.fillStyle=P.J;x.fillRect((bx-1)|0,(by-1)|0,3,3);
    if(aim&&pointer&&phase==='aim') {
      x.strokeStyle=P.Y;x.lineWidth=1;x.beginPath();x.moveTo(64,BALL_Y);x.lineTo(aim.x,aim.y);x.stroke();
      x.fillStyle=P.y;x.fillRect((64-(aim.x-pointer.x)*1.25)|0,GOAL_Y,2,2);
    }
    // Indicação dos três setores de defesa.
    if(defender()) {
      for(let i=0;i<3;i++){
        x.fillStyle=keeperChoice===i?P.Y:P.w;
        x.fillRect(21+i*32,72,23,2);
        if(keeperChoice===i)x.fillRect(31+i*32,68,3,3);
      }
    }
    st.hud.textContent=(u.vsYou+' '+myGoals+' × '+otherGoals+' '+(local?u.mgPlayerTwo:versus?'DUDA':u.mgCPU))+' · '+Math.min(shots+1,TOTAL)+'/'+TOTAL;
  }
  function frame() {
    if(!st.cv.isConnected){end(true);return;}
    const dt=clock.step();elapsed+=dt;
    if(phase==='defense-wait') {
      between-=dt;
      if(between<=0)launch(ZONES[pickDirection()]+(Math.random()-.5)*18,.48+Math.random()*.5,true);
    } else if(phase==='flight'){
      ball.t+=dt/0.73;
      if(ball.t>=1)resolveShot();
    } else if(phase==='between'){between-=dt;if(between<=0)nextShot();}
    drawGoal();
    if(!over)requestAnimationFrame(frame);
  }
  nextShot();requestAnimationFrame(frame);
}
