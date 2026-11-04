/* ================= Ateliê Workday: livro de colorir progressivo =================
   Artes em contornos, regiões clicáveis e paleta. Progresso e conquistas persistidos.
   Sem limite de tempo, vidas, pontuação, estresse nem dinheiro. */
const PAINT_SHAPES = {
  r:(x,y,w,h)=>({t:'r',x,y,w,h}),
  e:(x,y,rx,ry)=>({t:'e',x,y,rx,ry}),
  p:(...points)=>({t:'p',points})
};
const ARTWORKS = [
 {id:'mug',name:['Pausa para café','Coffee break','Pausa para café'],shapes:[
  PAINT_SHAPES.r(42,59,43,57), PAINT_SHAPES.e(88,83,13,19), PAINT_SHAPES.e(63,62,22,8),
  PAINT_SHAPES.r(52,45,3,11),PAINT_SHAPES.r(66,42,3,14),PAINT_SHAPES.e(64,88,12,15)]},
 {id:'flower',name:['Flor no escritório','Office flower','Flor en la oficina'],shapes:[
  PAINT_SHAPES.p([44,93],[80,93],[86,127],[38,127]),PAINT_SHAPES.r(59,65,5,35),
  PAINT_SHAPES.e(49,75,16,7), PAINT_SHAPES.e(77,78,15,7),PAINT_SHAPES.e(62,57,15,18),
  PAINT_SHAPES.e(47,44,14,13), PAINT_SHAPES.e(79,44,14,13), PAINT_SHAPES.e(63,46,9,10)]},
 {id:'cat',name:['Gato de plantão','Office cat','Gato de guardia'],shapes:[
  PAINT_SHAPES.e(65,98,33,29),PAINT_SHAPES.p([40,56],[45,29],[59,52],[72,29],[86,56]),
  PAINT_SHAPES.e(64,62,29,27),PAINT_SHAPES.e(52,63,6,9),PAINT_SHAPES.e(77,63,6,9),
  PAINT_SHAPES.e(64,77,7,5),PAINT_SHAPES.e(97,106,11,22)]},
 {id:'rocket',name:['Férias espaciais','Space vacation','Vacaciones espaciales'],shapes:[
  PAINT_SHAPES.p([65,22],[90,68],[80,111],[49,111],[40,68]),
  PAINT_SHAPES.e(65,61,13,13),PAINT_SHAPES.p([46,100],[27,119],[45,116],[54,104]),
  PAINT_SHAPES.p([76,104],[87,116],[105,119],[84,100]),
  PAINT_SHAPES.p([60,108],[70,108],[75,142],[55,142]),
  PAINT_SHAPES.e(65,28,6,6)]},
 {id:'computer',name:['PC de escritório','Office PC','PC de oficina'],shapes:[
  PAINT_SHAPES.r(20,31,88,64),PAINT_SHAPES.r(27,38,74,50),
  PAINT_SHAPES.r(60,94,8,21),PAINT_SHAPES.r(44,115,40,7),
  PAINT_SHAPES.r(33,128,62,9),PAINT_SHAPES.e(46,58,10,11),
  PAINT_SHAPES.e(82,62,12,13)]},
 {id:'fish',name:['Aquário relaxante','Relaxing aquarium','Acuario relajante'],shapes:[
  PAINT_SHAPES.r(16,34,96,87), PAINT_SHAPES.p([45,76],[28,60],[28,92]),
  PAINT_SHAPES.e(63,76,31,19),PAINT_SHAPES.e(82,71,4,4),
  PAINT_SHAPES.p([47,61],[63,42],[72,61]),
  PAINT_SHAPES.e(30,50,6,6),PAINT_SHAPES.e(96,51,8,8)]},
 {id:'robot',name:['Robô do TI','IT robot','Robot de TI'],shapes:[
  PAINT_SHAPES.r(42,34,44,43),PAINT_SHAPES.e(54,55,5,6),PAINT_SHAPES.e(75,55,5,6),
  PAINT_SHAPES.r(57,70,14,4),PAINT_SHAPES.r(38,80,52,39),
  PAINT_SHAPES.r(25,88,12,24),PAINT_SHAPES.r(91,88,12,24),
  PAINT_SHAPES.r(50,120,10,17),PAINT_SHAPES.r(68,120,10,17)]},
 {id:'landscape',name:['Final de expediente','After work','Fin de jornada'],shapes:[
  PAINT_SHAPES.r(13,27,102,101),PAINT_SHAPES.e(86,52,14,14),
  PAINT_SHAPES.p([13,104],[38,63],[70,104]), PAINT_SHAPES.p([45,110],[83,57],[115,110]),
  PAINT_SHAPES.r(26,95,9,29),PAINT_SHAPES.e(30,91,16,21),
  PAINT_SHAPES.r(83,99,9,27),PAINT_SHAPES.e(87,92,15,17)]}
];
const PAINT_PALETTE=['#ffffff','#f2c4a0','#a8684c','#f4c15d','#ef4b3f','#7fb35a','#5fa79a','#6f93d9','#a983d6','#4a3a4e'];
function mgPainting(host,done,opts={}) {
  const u=U(),P=WD_PAL,st=mgStage(host,u.mgPainting,u.mgPaintingHelp),x=st.x,finishOnce=arcadeDoneOnce(done);
  host.classList.add('mg-painting');
  const state=arcadePaintProgress(),order=ARTWORKS.map(a=>a.id);
  let selected=0,paintColor=4,over=false,changes=0;
  const panel=document.createElement('div');panel.className='mg-paint-panel';host.append(panel);
  const gallery=document.createElement('div');gallery.className='mg-paint-gallery';
  const colors=document.createElement('div');colors.className='mg-paint-palette';
  const caption=document.createElement('div');caption.className='mg-paint-caption';
  const close=document.createElement('button');close.type='button';close.className='pxbtn';close.textContent=u.mgPaintingDone;
  panel.append(gallery,caption,colors,close);
  close.onclick=()=>end(false);
  const current=()=>ARTWORKS[selected];
  const unlocked=idx=>idx<Math.min(ARTWORKS.length,3+Object.keys(state.done).length);
  const areaColors=()=>state.colors[current().id]||(state.colors[current().id]=Array(current().shapes.length).fill(0));
  const tr=art=>art.name[CFG.lang==='en'?1:CFG.lang==='es'?2:0];
  function shapePath(s) {
    x.beginPath();
    if(s.t==='r')x.rect(s.x,s.y,s.w,s.h);
    if(s.t==='e')x.ellipse(s.x,s.y,s.rx,s.ry,0,0,Math.PI*2);
    if(s.t==='p'){x.moveTo(...s.points[0]);for(let i=1;i<s.points.length;i++)x.lineTo(...s.points[i]);x.closePath();}
  }
  function draw() {
    x.imageSmoothingEnabled=false;
    x.fillStyle=P[0];x.fillRect(0,0,128,160);
    x.fillStyle=P.w;x.fillRect(9,13,110,135);
    x.fillStyle=P.p;x.fillRect(13,17,102,127);
    x.fillStyle=P.W;x.fillRect(15,19,98,123);
    const art=current(),filled=areaColors();
    art.shapes.forEach((shape,i)=>{
      shapePath(shape);
      x.fillStyle=PAINT_PALETTE[filled[i]||0];x.fill();
      x.strokeStyle=P.k;x.lineWidth=2.5;x.stroke();
    });
    ctxFrame(x,P,changes);
    st.hud.textContent=tr(art)+' · '+filled.filter(Boolean).length+'/'+filled.length;
    caption.textContent=u.mgPaintingCompleted+': '+Object.keys(state.done).length+'/'+ARTWORKS.length+(state.done[art.id]?' · '+u.mgPaintingFinished:'');
  }
  function ctxFrame(x,P,n) {
    x.fillStyle=P.k;x.fillRect(8,12,112,2);x.fillRect(8,148,112,2);
    x.fillRect(8,12,2,138);x.fillRect(118,12,2,138);
    x.fillStyle=P.Y;x.fillRect(110,14,6,2);
  }
  function showPalette() {
    colors.replaceChildren();
    PAINT_PALETTE.forEach((hex,i)=>{
      const b=document.createElement('button');b.type='button';b.className='mg-paint-swatch'+(i===paintColor?' on':'');
      b.style.background=hex;b.setAttribute('aria-label',u.mgPaintingColor+' '+(i+1));
      b.onclick=()=>{paintColor=i;showPalette();};
      colors.append(b);
    });
  }
  function showGallery() {
    gallery.replaceChildren();
    ARTWORKS.forEach((a,i)=>{
      const b=document.createElement('button');b.type='button';b.className='pxbtn'+(i===selected?' on':'');
      b.disabled=!unlocked(i);
      b.textContent=(i+1)+'. '+(unlocked(i)?tr(a):u.mgPaintingLocked)+(state.done[a.id]?' ✓':'');
      b.onclick=()=>{selected=i;draw();showGallery();};
      gallery.append(b);
    });
  }
  function completeIfReady() {
    const art=current(),filled=areaColors();
    if(state.done[art.id]||!filled.every(i=>i>0))return;
    state.done[art.id]=Date.now();save('arcade-paint',state);
    mgPop(st,u.mgPaintingUnlocked,'ok');sfx('level');
    showGallery();
    if(typeof Quests!=='undefined'&&Quests.check)Quests.check();
  }
  function fillAt(px,py) {
    if(over)return;
    const art=current(),shapes=art.shapes;
    for(let i=shapes.length-1;i>=0;i--){
      shapePath(shapes[i]);
      if(x.isPointInPath(px,py)){
        const arr=areaColors();
        arr[i]=paintColor;state.colors[art.id]=arr;
        save('arcade-paint',state);changes++;completeIfReady();draw();break;
      }
    }
  }
  st.cv.onpointerdown=e=>{e.preventDefault();const p=arcadePointerXY(st.cv,e);fillAt(p.x,p.y);};
  st.cv.onpointermove=e=>{if(e.buttons&1){const p=arcadePointerXY(st.cv,e);fillAt(p.x,p.y);}};
  function end(quit) {
    if(over)return;over=true;st.off();
    host.classList.remove('mg-painting');panel.remove();
    finishOnce({score:Object.keys(state.done).length,grade:Object.keys(state.done).length===ARTWORKS.length?'good':'ok',quit:!!quit});
  }
  host._quit=()=>end(true);
  host._painting={state,get selected(){return selected;},select(i){if(unlocked(i)){selected=i;showGallery();draw();}},fill(i,col=4){
    if(!Number.isInteger(i)||i<0||i>=current().shapes.length)return;
    const arr=areaColors();arr[i]=col;state.colors[current().id]=arr;save('arcade-paint',state);completeIfReady();draw();
  }};
  showPalette();showGallery();draw();
}
