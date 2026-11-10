/* Workday: dez gatos estáticos a partir das imagens aprovadas pelo criador.
   Todos os sprites são 80x120 nativos, incluindo os nove atualizados. PNGs transparentes, embutidos offline.
   Sem animar ou gerar quadros inexistentes. */
const CAT_STATIC_PNG = {
branco:'@asset-b64:gatos-miniatura/branco.png',
'cinza-tigrado':'@asset-b64:gatos-miniatura/cinza-tigrado.png',
tricolor:CAT_TRICOLOR_NATIVE_PNG,
preto:'@asset-b64:gatos-miniatura/preto.png',
siames:'@asset-b64:gatos-miniatura/siames.png',
frajola:'@asset-b64:gatos-miniatura/frajola.png',
laranja:'@asset-b64:gatos-miniatura/laranja.png',
'siames-azul':'@asset-b64:gatos-miniatura/siames-azul.png',
'preto-verde':'@asset-b64:gatos-miniatura/preto-verde.png',
'cinza-azul':'@asset-b64:gatos-miniatura/cinza-azul.png'
};
// Substituir os nove PNGs antigos de 40x60 pelos originais em 80x120.
Object.assign(CAT_STATIC_PNG,CAT_STATIC_NATIVE_PNG);
const CAT_STATIC_IDS = ['branco','cinza-tigrado','tricolor','preto','siames','frajola','laranja','siames-azul','preto-verde','cinza-azul'];
// Compatibilidade com saves antigos: o jogador conserva a pelagem mais próxima.
const CAT_STATIC_ALIAS = {
  'laranja-tigrado':'laranja', cinza:'cinza-azul', creme:'branco',
  'tigrado-marrom':'cinza-tigrado', escaminha:'tricolor',
  bicolor:'branco', vaquinha:'frajola'
};
const CatStatic = {
  images:{}, renderImages:{}, previewUrls:{}, loaded:new Set(),
  // Repara somente falhas de alfa internas aos dois sprites pretos.
  // A borda e os vazios externos continuam transparentes; os PNGs originais não são regravados.
  repairBlack(id, image) {
    if (id !== 'preto' && id !== 'preto-verde') return image;
    const cv=document.createElement('canvas');cv.width=image.naturalWidth;cv.height=image.naturalHeight;
    const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
    const source=ctx.getImageData(0,0,cv.width,cv.height), p=source.data, w=cv.width,h=cv.height;
    const at=(x,y)=>p[(y*w+x)*4+3];
    // Buracos realmente cercados de pixels opacos, nunca o fundo junto às orelhas/cauda.
    const visited=new Uint8Array(w*h), dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const idx=y*w+x;if(visited[idx]||at(x,y)>32)continue;
      const group=[],stack=[idx];visited[idx]=1;let outside=false;
      while(stack.length){const n=stack.pop(),cx=n%w,cy=(n/w)|0;group.push(n);
        if(cx===0||cy===0||cx===w-1||cy===h-1)outside=true;
        for(const [dx,dy] of dirs){const xx=cx+dx,yy=cy+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;
          const j=yy*w+xx;if(!visited[j]&&p[j*4+3]<=32){visited[j]=1;stack.push(j);}
        }
      }
      if(outside)continue;
      // Somente pixels internos: preserva olhos, contorno, bigodes e paleta original.
      for(const n of group){const cx=n%w,cy=(n/w)|0;let best=-1,dmin=Infinity;
        for(let yy=Math.max(0,cy-8);yy<Math.min(h,cy+9);yy++)
          for(let xx=Math.max(0,cx-8);xx<Math.min(w,cx+9);xx++){
            const j=yy*w+xx,d=(xx-cx)**2+(yy-cy)**2;
            if(p[j*4+3]===255&&d<dmin){best=j;dmin=d;}
          }
        if(best>=0){const b=best*4,a=n*4;p[a]=p[b];p[a+1]=p[b+1];p[a+2]=p[b+2];p[a+3]=255;}
      }
    }
    // Os PNGs pretos possuem frestas conectadas ao exterior, sobretudo entre
    // pescoço, patas e cauda. O preenchimento por flood-fill não alcança essas frestas.
    // Fechar apenas fendas curtas do miolo, usando pelagem escura vizinha.
    const bodyPixel=(x,y)=>x>=12&&x<=65&&y>=43&&y<=117;
    const dark=(i)=>p[i*4+3]>=160&&Math.max(p[i*4],p[i*4+1],p[i*4+2])<125;
    const paint=(x,y,ref)=>{const i=(y*w+x)*4,j=ref*4;
      p[i]=p[j];p[i+1]=p[j+1];p[i+2]=p[j+2];p[i+3]=255;};
    for(let pass=0;pass<2;pass++){
      for(let y=43;y<Math.min(h,118);y++)for(let x=13;x<Math.min(w-10,65);x++){
        if(!bodyPixel(x,y)||at(x,y)>150)continue;
        // Duas extremidades escuras próximas, na horizontal ou vertical.
        for(const [dx,dy] of [[1,0],[0,1]]){
          let a=-1,b=-1;
          for(let k=1;k<=7;k++){
            const xx=x-dx*k,yy=y-dy*k;if(!bodyPixel(xx,yy))break;
            const idx=yy*w+xx;if(dark(idx)){a=idx;break;}
            if(at(xx,yy)>150)break;
          }
          for(let k=1;k<=7;k++){
            const xx=x+dx*k,yy=y+dy*k;if(!bodyPixel(xx,yy))break;
            const idx=yy*w+xx;if(dark(idx)){b=idx;break;}
            if(at(xx,yy)>150)break;
          }
          if(a>=0&&b>=0){paint(x,y,a);break;}
        }
      }
    }
    // Pixel art nativa: não deixar semitransparência atravessar a pelagem do corpo.
    for(let y=43;y<Math.min(h,118);y++)for(let x=12;x<Math.min(w,66);x++){
      const n=(y*w+x)*4,a=p[n+3];
      if(a>96&&a<255)p[n+3]=255;
    }
    ctx.putImageData(source,0,0);return cv;
  },
  // Miniatura direta do sprite nativo, sem passar pelo conversor de paleta 40x60.
  preview(id) {
    const key=this.id(id), image=this.renderImages[key]||this.images[key];
    if(!image||!this.loaded.has(key))return pxSize(catStill(id,.65),2);
    const out=document.createElement('img');
    out.src=this.previewUrls[key]||(this.previewUrls[key]=image.toDataURL ? image.toDataURL('image/png') : image.src);
    out.alt='';out.width=52;out.height=78;
    out.style.cssText='display:block;width:52px;height:78px;object-fit:contain;image-rendering:pixelated;margin:auto';
    return out;
  },

  // Tamanho LOGICO da silhueta: 40x60. Na mesa k=2 desenha 80x120.
  // Todos os gatos são desenhados 1:1 na mesa a partir dos PNGs nativos 80x120.
  sizes(k){return [Math.ceil(40*k),Math.ceil(60*k)]},
  id(c){const key=String(c||'laranja').split('|')[0];return CAT_STATIC_ALIAS[key]||key},
  ready(c){return this.loaded.has(this.id(c))},
  draw(ctx,x,by,c,k=1) {
    const id=this.id(c), img=this.renderImages[id]||this.images[id]; if(!img||!this.loaded.has(id)) return false;
    const [w,h]=this.sizes(k);
    ctx.save();ctx.imageSmoothingEnabled=false;
    ctx.drawImage(img,Math.round(x),Math.round(by-h),w,h);ctx.restore();
    return h;
  },
  refresh() {
    CAT_STILL.clear();CAT_FRAMES.clear();
    try { SPR2.cat = catRows('laranja',.8); } catch (e) {}
    if(typeof OFFICE!=='undefined'){OFFICE.last=0;OFFICE.key='';}
    for(const b of document.querySelectorAll('.hw-card .cat[data-c]')){
      const el=b.querySelector('.cimg');
      if(el) el.replaceChildren(this.preview(b.dataset.c));
    }
    const pc=document.querySelector('.hw-card .pv-cat');
    if(pc){const ctx=pc.getContext('2d');ctx.clearRect(0,0,pc.width,pc.height);
      catDraw(ctx,(pc.width-this.sizes(1.12)[0])/2,pc.height,hw().cat||'tricolor',CatAI.make(),0,1.12);}
  },
  init() {
    for(const id of CAT_STATIC_IDS){
      const im=new Image();this.images[id]=im;
      im.onload=()=>{const w=80,h=120;
        if(im.naturalWidth!==w||im.naturalHeight!==h){console.warn('Dimensoes invalidas do gato: '+id);return;}
        this.renderImages[id]=this.repairBlack(id,im);this.loaded.add(id);this.refresh();};
      im.onerror=()=>{console.warn('Falha ao carregar sprite do gato: '+id);};
      im.src='data:image/png;base64,'+CAT_STATIC_PNG[id];
    }
  }
};
window.WorkdayCatStatic=CatStatic;
CatStatic.init();
