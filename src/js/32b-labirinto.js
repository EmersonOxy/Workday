/* ================= Caça-Café: labirinto, itens e um único chefe ================= */
function mgPacman(host, done, opts = {}) {
  const u = U(), P = WD_PAL, finishOnce = arcadeDoneOnce(done);
  const touch = document.body.classList.contains('touch');
  const st = mgStage(host, u.mgPacman, touch ? u.mgPacHelpT : u.mgPacHelp);
  const x = st.x, CW = 15, CH = 17, CELL = 8, OX = 4, OY = 10, MAX_TIME = 80;
  // Labirinto conectado, com atalhos; nenhum outro inimigo além do chefe.
  const maze = Array.from({ length: CH }, () => Array(CW).fill('#'));
  const visited = new Set(['1,1']), stack = [[1,1]], dirs = [[0,-2],[2,0],[0,2],[-2,0]];
  maze[1][1] = ' ';
  while (stack.length) {
    const [px,py] = stack[stack.length-1];
    const next = dirs.map(([dx,dy])=>[px+dx,py+dy,dx,dy]).filter(([nx,ny])=>nx>0&&nx<CW-1&&ny>0&&ny<CH-1&&!visited.has(nx+','+ny));
    if (!next.length) { stack.pop(); continue; }
    const [nx,ny,dx,dy] = next[Math.random()*next.length|0];
    maze[py+dy/2][px+dx/2] = ' ';
    maze[ny][nx] = ' '; visited.add(nx+','+ny); stack.push([nx,ny]);
  }
  // Criar loops sem abrir bordas exteriores.
  for (let k=0;k<22;k++) {
    const xx=1+(Math.random()*(CW-2)|0), yy=1+(Math.random()*(CH-2)|0);
    if (maze[yy][xx]==='#' && ((maze[yy][xx-1]===' '&&maze[yy][xx+1]===' ') ||
                              (maze[yy-1][xx]===' '&&maze[yy+1][xx]===' '))) maze[yy][xx]=' ';
  }
  const key=(a,b)=>a+','+b, walk=(a,b)=>a>0&&a<CW-1&&b>0&&b<CH-1&&maze[b][a]===' ';
  const free=[];
  for(let yy=1;yy<CH-1;yy++) for(let xx=1;xx<CW-1;xx++) if(walk(xx,yy)) free.push([xx,yy]);
  const items=new Map();
  for(const [xx,yy] of free) {
    if ((xx===1&&yy===1) || (xx===CW-2&&yy===CH-2)) continue;
    if(Math.random()<.57) items.set(key(xx,yy),Math.random()<.24?'coffee':Math.random()<.56?'clip':'staple');
  }
  // Garantir que a fase tenha quantidade suficiente de colecionáveis.
  if(items.size<20) for(const [xx,yy] of free) if(items.size<30 && !(xx===1&&yy===1)) items.set(key(xx,yy),'clip');
  const total=items.size;
  const player={x:1,y:1}, boss={x:CW-2,y:CH-2};
  let dir={x:0,y:0}, requested={x:0,y:0}, lives=3, score=0, collected=0, elapsed=0, pTime=0, bTime=0;
  let boost=0, inv=0, over=false;
  const timing=arcadeClock();
  const controls={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};
  const moveInput=(dx,dy)=>{requested={x:dx,y:dy};};
  const kd=e=>{const d=controls[e.code];if(d){e.preventDefault();e.stopPropagation();moveInput(...d);}};
  addEventListener('keydown',kd,true);
  let origin=null;
  st.cv.onpointerdown=e=>{e.preventDefault();st.cv.setPointerCapture(e.pointerId);origin={id:e.pointerId,x:e.clientX,y:e.clientY};};
  st.cv.onpointermove=e=>{if(origin&&origin.id===e.pointerId) {
    const dx=e.clientX-origin.x,dy=e.clientY-origin.y;
    if(Math.hypot(dx,dy)>18){moveInput(Math.abs(dx)>Math.abs(dy)?Math.sign(dx):0,Math.abs(dx)>Math.abs(dy)?0:Math.sign(dy));origin.x=e.clientX;origin.y=e.clientY;}
  }};
  st.cv.onpointerup=st.cv.onpointercancel=e=>{if(origin&&origin.id===e.pointerId){const dx=e.clientX-origin.x,dy=e.clientY-origin.y;if(Math.hypot(dx,dy)>9)moveInput(Math.abs(dx)>Math.abs(dy)?Math.sign(dx):0,Math.abs(dx)>Math.abs(dy)?0:Math.sign(dy));origin=null;}};
  function shortestStep(from,to) {
    const queue=[[from.x,from.y]],seen=new Set([key(from.x,from.y)]),prev=new Map();
    for(let i=0;i<queue.length;i++) {
      const [xx,yy]=queue[i], here=key(xx,yy);
      if(xx===to.x&&yy===to.y)break;
      for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1]]) {
        const nx=xx+dx,ny=yy+dy,nk=key(nx,ny);
        if(!walk(nx,ny)||seen.has(nk))continue;
        seen.add(nk);prev.set(nk,here);queue.push([nx,ny]);
      }
    }
    let cur=key(to.x,to.y),start=key(from.x,from.y);
    if(!seen.has(cur))return from;
    while(prev.has(cur)&&prev.get(cur)!==start)cur=prev.get(cur);
    const parts=cur.split(',').map(Number);
    return {x:parts[0],y:parts[1]};
  }
  function collect() {
    const k=key(player.x,player.y),item=items.get(k);
    if(!item)return;
    items.delete(k);collected++;
    const points=item==='coffee'?20:item==='staple'?15:10;
    score+=points;sfx('pop');
    if(item==='coffee'){boost=2.8;bTime=0;mgPop(st,u.mgPacCoffee,'ok');}
  }
  function hit() {
    if(inv>0||player.x!==boss.x||player.y!==boss.y)return;
    lives--;inv=1.5;player.x=1;player.y=1;boss.x=CW-2;boss.y=CH-2;dir={x:0,y:0};requested={x:0,y:0};
    sfx('err');Motion.shake(st.cv,3);
    if(lives<=0)end(false);
  }
  function end(quit) {
    if(over)return;over=true;removeEventListener('keydown',kd,true);st.off();timing.stop();
    if(quit){finishOnce({score,grade:'bad',quit:true});return;}
    const ratio=collected/Math.max(1,total),grade=ratio>=.95?'good':ratio>=.55?'ok':'bad';
    mgResult(st,host,[[u.mgScore,fmt(score)],[u.mgPacItems,collected+'/'+total],[u.mgLives,lives]],grade,g=>finishOnce({score,grade:g,acc:ratio}),null);
  }
  host._quit=()=>end(true);
  host._pacman={player,boss,maze,items,get lives(){return lives;},get score(){return score;},get collected(){return collected;},moveInput};
  function itemArt(kind,px,py) {
    if(kind==='coffee') {
      x.fillStyle=P.k;x.fillRect(px+2,py+2,5,5);x.fillStyle=P.w;x.fillRect(px+2,py+2,4,4);x.fillStyle=P[3];x.fillRect(px+3,py+2,3,2);x.fillStyle=P.W;x.fillRect(px+4,py,1,2);
    } else if(kind==='clip') {
      x.fillStyle=P.m;x.fillRect(px+3,py+2,3,1);x.fillRect(px+2,py+3,1,3);x.fillRect(px+3,py+5,3,1);x.fillRect(px+5,py+3,1,2);
    } else {
      x.fillStyle=P.M;x.fillRect(px+2,py+2,5,2);x.fillStyle=P.W;x.fillRect(px+2,py+4,1,2);x.fillRect(px+6,py+4,1,2);
    }
  }
  function draw() {
    x.fillStyle=P[0];x.fillRect(0,0,128,160);
    for(let yy=0;yy<CH;yy++)for(let xx=0;xx<CW;xx++) {
      const px=OX+xx*CELL,py=OY+yy*CELL;
      if(maze[yy][xx]==='#') {
        // Muros como divisórias de escritório, com cantoneiras e reflexos.
        x.fillStyle=P.k;x.fillRect(px,py,CELL,CELL);
        x.fillStyle=P[7];x.fillRect(px+1,py+1,6,6);
        x.fillStyle=P.L;x.fillRect(px+1,py+1,6,2);
        x.fillStyle=P.l;x.fillRect(px+2,py+3,3,1);
        if((xx+yy)%3===0){x.fillStyle=P.W;x.fillRect(px+1,py+1,1,1);}
      } else {
        x.fillStyle=(xx+yy)%2===0?P.X:P.x;x.fillRect(px,py,CELL,CELL);
        if((xx*7+yy*3)%11===0){x.fillStyle=P.N;x.fillRect(px+3,py+3,1,1);}
      }
    }
    for(const [loc,item] of items) {const [xx,yy]=loc.split(',').map(Number);itemArt(item,OX+xx*CELL,OY+yy*CELL);}
    if(boost>0){x.fillStyle=P.Y;x.globalAlpha=.28;x.fillRect(OX+player.x*CELL-3,OY+player.y*CELL-4,15,18);x.globalAlpha=1;}
    arcadeEmployee(x,OX+boss.x*CELL-1,OY+boss.y*CELL-3,'boss');
    if(inv<=0||(elapsed*9|0)%2===0)arcadeEmployee(x,OX+player.x*CELL-1,OY+player.y*CELL-3,'player');
    x.fillStyle=P.W;x.fillRect(5,151,118,2);
    x.fillStyle=boost>0?P.Y:P.F;x.fillRect(5,151,(118*(1-elapsed/MAX_TIME))|0,2);
    st.hud.textContent=u.mgScore+' '+fmt(score)+' · '+u.mgLives+' '+lives+' · '+Math.max(0,MAX_TIME-elapsed|0)+'s';
  }
  function frame() {
    if(!st.cv.isConnected){end(true);return;}
    const dt=timing.step();elapsed+=dt;pTime+=dt;bTime+=dt;boost=Math.max(0,boost-dt);inv=Math.max(0,inv-dt);
    const playerDelay=boost>0?.085:.13;
    while(pTime>=playerDelay&&!over) {
      pTime-=playerDelay;
      if(walk(player.x+requested.x,player.y+requested.y))dir={...requested};
      if(walk(player.x+dir.x,player.y+dir.y)){player.x+=dir.x;player.y+=dir.y;collect();}
      hit();
    }
    const bossDelay=.35;
    if(boost>0)bTime=0; // O café paralisa o chefe por alguns segundos.
    if(boost<=0&&bTime>=bossDelay&&!over) {
      bTime-=bossDelay;
      const next=shortestStep(boss,player);boss.x=next.x;boss.y=next.y;hit();
    }
    draw();
    if(!over&&(items.size===0||elapsed>=MAX_TIME))end(false);
    if(!over)requestAnimationFrame(frame);
  }
  mgPop(st,u.mgReady);requestAnimationFrame(frame);
}
