/* ================= Snake: Duelo =================
   Dois jogadores no mesmo campo em tempo real: frutas, cerco, colisão e respawn.
   Em solo o rival é controlado pela máquina; versus Duda usa habilidade e histórico;
   multiplayer local opcional: WASD x setas ou dois toques simultâneos no tabuleiro. */
function mgSnakeDuel(host, done, opts = {}) {
  const u=U(),P=WD_PAL, finishOnce=arcadeDoneOnce(done), local=!!opts.local, versus=!!opts.vs&&!local;
  const st=mgStage(host,u.mgSnake,local?u.mgSnakeLocalHelp:u.mgSnakeHelp);
  const x=st.x, cols=14, rows=16, cell=8, ox=8, oy=18, MAX_TIME=75, clock=arcadeClock();
  const rival=Rival.create('snake',versus);
  const skill=versus?rival.skill:Math.min(.9,RIVAL_SKILL[CFG.diff||'normal']||.7);
  const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
  const player={body:[[3,5],[2,5],[1,5]],dir:1,next:1,fruits:0,kills:0,lives:3,inv:0,turn:0};
  const opponent={body:[[10,11],[11,11],[12,11]],dir:3,next:3,fruits:0,kills:0,lives:3,inv:0,turn:0};
  const key=(a,b)=>a+','+b, inside=(p)=>p[0]>=0&&p[0]<cols&&p[1]>=0&&p[1]<rows;
  const has=(snake,p,tail=true)=>snake.body.some((a,i)=>i!==(tail?snake.body.length-1:-1)&&a[0]===p[0]&&a[1]===p[1]);
  const occupied=p=>has(player,p,false)||has(opponent,p,false);
  const newFruit=()=>{
    const open=[];
    for(let yy=0;yy<rows;yy++)for(let xx=0;xx<cols;xx++) if(!occupied([xx,yy]))open.push([xx,yy]);
    return open.length?open[Math.random()*open.length|0]:null;
  };
  let fruit=newFruit(), elapsed=0, accum=0, over=false, tickCount=0, lastHit='';
  const score=s=>s.fruits*10+s.kills*30;
  function turn(s,d) { if(((d+2)%4)!==s.dir)s.next=d; }
  const keyDir=e=>{
    const p={KeyW:0,KeyD:1,KeyS:2,KeyA:3},q={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3};
    if(Object.hasOwn(p,e.code)){turn(player,p[e.code]);return true;}
    if(Object.hasOwn(q,e.code)){turn(local?opponent:player,q[e.code]);return true;}
    return false;
  };
  const kd=e=>{if(keyDir(e)){e.preventDefault();e.stopPropagation();}};
  addEventListener('keydown',kd,true);
  const touches=new Map();
  const steer=(side,dx,dy)=>{
    if(Math.hypot(dx,dy)<11)return;
    const dir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);
    turn(local&&side==='other'?opponent:player,dir);
  };
  st.cv.onpointerdown=e=>{e.preventDefault();st.cv.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY,side:local&&arcadePointerXY(st.cv,e).x>=64?'other':'player'});};
  st.cv.onpointermove=e=>{
    const t=touches.get(e.pointerId);if(!t)return;
    const dx=e.clientX-t.x,dy=e.clientY-t.y;
    if(Math.hypot(dx,dy)>16){steer(t.side,dx,dy);t.x=e.clientX;t.y=e.clientY;}
  };
  st.cv.onpointerup=st.cv.onpointercancel=e=>{
    const t=touches.get(e.pointerId);if(t){steer(t.side,e.clientX-t.x,e.clientY-t.y);touches.delete(e.pointerId);}
  };
  function aiMove() {
    const head=opponent.body[0],danger=new Set([...opponent.body.slice(0,-1),...player.body.slice(0,-1)].map(p=>key(...p)));
    const choices=[];
    for(let d=0;d<4;d++) {
      if((d+2)%4===opponent.dir)continue;
      const [dx,dy]=dirs[d],p=[head[0]+dx,head[1]+dy];
      if(!inside(p)||danger.has(key(...p)))continue;
      let sc=fruit?Math.abs(p[0]-fruit[0])+Math.abs(p[1]-fruit[1]):0;
      let exits=0;
      for(const [ex,ey] of dirs){const q=[p[0]+ex,p[1]+ey];if(inside(q)&&!danger.has(key(...q)))exits++;}
      sc+=(4-exits)*2.2;
      // O rival ocasionalmente tenta cortar o caminho do jogador, sem atravessar corpos.
      if(Math.random()<.3*skill)sc+=Math.abs(p[0]-player.body[0][0])*.13+Math.abs(p[1]-player.body[0][1])*.13;
      sc+=(Math.random()-.5)*(2-skill);
      choices.push({d,sc});
    }
    choices.sort((a,b)=>a.sc-b.sc);
    if(choices.length)turn(opponent,choices[Math.random()<skill?0:Math.random()*choices.length|0].d);
  }
  function respawn(s,side) {
    const bases=side===0?[[3,4],[3,9],[3,13],[5,2]]:[[10,11],[10,5],[10,14],[8,8]];
    for(const [px,py] of bases) {
      const dir=side===0?1:3;
      const body=Array.from({length:3},(_,i)=>[px+(side===0?-i:i),py]);
      if(body.every(p=>inside(p)&&!occupied(p))) {
        s.body=body;s.dir=dir;s.next=dir;s.inv=1.7;return;
      }
    }
    for(let y=1;y<rows-1;y++)for(let x=3;x<cols-3;x++){
      const body=[[x,y],[x-1,y],[x-2,y]];
      if(body.every(p=>inside(p)&&!occupied(p))){s.body=body;s.dir=1;s.next=1;s.inv=1.7;return;}
    }
  }
  function step() {
    tickCount++;
    if(!local)aiMove();
    const snakes=[player,opponent];
    for(const s of snakes)if((s.next+2)%4!==s.dir)s.dir=s.next;
    const [p,q]=snakes.map(s=>[s.body[0][0]+dirs[s.dir][0],s.body[0][1]+dirs[s.dir][1]]);
    const eating=[fruit&&p[0]===fruit[0]&&p[1]===fruit[1],fruit&&q[0]===fruit[0]&&q[1]===fruit[1]];
    // Cruzamento frontal ou troca de cabeças: ambos colidem.
    const headCrash=(p[0]===q[0]&&p[1]===q[1]) ||
      (p[0]===opponent.body[0][0]&&p[1]===opponent.body[0][1]&&q[0]===player.body[0][0]&&q[1]===player.body[0][1]);
    const dead=[!inside(p)||has(player,p,!eating[0])||has(opponent,p,!eating[1]),
                !inside(q)||has(opponent,q,!eating[1])||has(player,q,!eating[0])];
    if(headCrash){dead[0]=dead[1]=true;}
    // Atualização simultânea: nenhum dos dois vê a posição futura do outro.
    if(!dead[0]){player.body.unshift(p);if(eating[0]){player.fruits++;sfx('pop');}else player.body.pop();}
    if(!dead[1]){opponent.body.unshift(q);if(eating[1]){opponent.fruits++;sfx('pop');}else opponent.body.pop();}
    if(eating[0]||eating[1])fruit=newFruit();
    for(let i=0;i<2;i++)if(dead[i]) {
      const s=snakes[i],other=snakes[1-i];
      s.lives--;if(!dead[1-i]){other.kills++;lastHit=i===0?u.mgSnakeEnemyKill:u.mgSnakeYouKill;}
      else lastHit=u.mgSnakeCrash;
      sfx('err');
    }
    for(let i=0;i<2;i++)if(dead[i]&&snakes[i].lives>0)respawn(snakes[i],i);
    if(dead[0]||dead[1])mgPop(st,lastHit,'bad');
    if(player.lives<=0||opponent.lives<=0)end(false);
  }
  function end(quit) {
    if(over)return;over=true;removeEventListener('keydown',kd,true);st.off();clock.stop();
    const mine=score(player),theirs=score(opponent);
    if(quit){finishOnce({score:mine,grade:'bad',quit:true});return;}
    if(rival)rival.score=theirs;
    const vs=rival?Rival.finish(rival,mine):null;
    const grade=arcadeGrade(mine,theirs,true);
    const who=local?u.mgPlayerTwo:versus?'Duda':u.mgCPU;
    mgResult(st,host,[[u.vsYou,fmt(mine)],[who,fmt(theirs)],[u.mgSnakeFruits,player.fruits+' / '+opponent.fruits],[u.mgLives,player.lives+' / '+opponent.lives]],
      vs?(vs.res==='win'?'good':vs.res==='draw'?'ok':'bad'):grade,
      g=>finishOnce({score:mine,grade:g,vs,fruits:player.fruits,kills:player.kills}),vs);
  }
  host._quit=()=>end(true);
  host._snakeDuel={player,opponent,get fruit(){return fruit;},turn,step,get time(){return elapsed;}};
  function draw() {
    x.fillStyle=P[0];x.fillRect(0,0,128,160);
    x.fillStyle=P.J;x.fillRect(ox-2,oy-2,cols*cell+4,rows*cell+4);
    for(let yy=0;yy<rows;yy++)for(let xx=0;xx<cols;xx++){
      x.fillStyle=(xx+yy)%2?P.X:P.x;
      x.fillRect(ox+xx*cell,oy+yy*cell,cell,cell);
      if((xx*11+yy*7)%19===0){x.fillStyle=P.N;x.fillRect(ox+xx*cell+2,oy+yy*cell+2,1,1);}
    }
    if(fruit){
      const fx=ox+fruit[0]*cell,fy=oy+fruit[1]*cell;
      x.fillStyle=P.k;x.fillRect(fx+1,fy+2,6,6);
      x.fillStyle=P.R;x.fillRect(fx+2,fy+2,4,4);
      x.fillStyle=P.G;x.fillRect(fx+4,fy,2,3);
    }
    for(const [i,s] of [[0,player],[1,opponent]]) {
      for(let j=s.body.length-1;j>=0;j--) {
        const [xx,yy]=s.body[j],px=ox+xx*cell,py=oy+yy*cell;
        x.fillStyle=P.k;x.fillRect(px,py,8,8);
        x.fillStyle=i===0?P.F:P.Y;x.fillRect(px+1,py+1,6,6);
        x.fillStyle=i===0?P.f:P.z;x.fillRect(px+1,py+1,6,2);
        x.fillStyle=i===0?P[9]:P[2];x.fillRect(px+6,py+3,1,3);
        if(j===s.body.length-1){x.fillStyle=i===0?P.g:P.y;x.fillRect(px+3,py+3,2,2);}
        if(j===0){
          x.fillStyle=P.W;x.fillRect(px+2,py+2,2,2);x.fillRect(px+5,py+2,2,2);
          x.fillStyle=P.J;x.fillRect(px+3,py+2,1,1);x.fillRect(px+6,py+2,1,1);
        }
      }
    }
    x.fillStyle=P.W;x.fillRect(8,155,112,2);
    x.fillStyle=P.F;x.fillRect(8,155,(112*Math.max(0,1-elapsed/MAX_TIME))|0,2);
    st.hud.textContent=u.vsYou+' '+score(player)+' × '+score(opponent)+' '+(local?u.mgPlayerTwo:versus?'DUDA':u.mgCPU)+' · '+Math.max(0,MAX_TIME-elapsed|0)+'s';
  }
  function frame() {
    if(!st.cv.isConnected){end(true);return;}
    const dt=clock.step();elapsed+=dt;accum+=dt;
    const interval=Math.max(.083,.155-Math.floor(elapsed/15)*.01);
    while(accum>=interval&&!over){accum-=interval;step();}
    draw();
    if(!over&&elapsed>=MAX_TIME)end(false);
    if(!over)requestAnimationFrame(frame);
  }
  mgPop(st,u.mgReady);requestAnimationFrame(frame);
}
