/* Textura da mesa enviada pelo criador: tile 128x128, 5 cores e bordas seamless.
   Incluida como data URI para funcionar em GitHub Pages e no HTML offline. */
const DESK_WALNUT_PNG = '@asset-uri:mesa/walnut.png';

const DESK_MATERIAL_LABELS = {
  pt: {title:'Material da mesa',original:'Madeira original',walnut:'Nogueira escura',oak:'Carvalho claro',slate:'Azul ardósia',ivory:'Branco neve',walnut2:'Nogueira com nós'},
  en: {title:'Desk material',original:'Original wood',walnut:'Dark walnut',oak:'Light oak',slate:'Slate blue',ivory:'Snow white',walnut2:'Knotted walnut'},
  es: {title:'Material de la mesa',original:'Madera original',walnut:'Nogal oscuro',oak:'Roble claro',slate:'Azul pizarra',ivory:'Blanco nieve',walnut2:'Nogal con nudos'}
};
const DeskMaterial = {
  ids: ['original','walnut','oak','slate','ivory','walnut2'],
  sources: Object.assign({walnut:DESK_WALNUT_PNG},DESK_MATERIAL_ADDITIONAL),
  images: {}, loaded:new Set(), image:null, ready:false, readyAll:false,
  edgeColors: {
    walnut: ['#432516','#7a4a30'],
    oak: ['#a8714a','#dca673'],
    slate: ['#4f4f5a','#8e8e9f'],
    ivory: ['#c9c9cf','#ffffff'],
    walnut2: ['#2c180e','#6e3b26']
  },
  names() { return DESK_MATERIAL_LABELS[CFG.lang] || DESK_MATERIAL_LABELS.pt; },
  edge(id) { return this.edgeColors[id] || ['#432516','#7a4a30']; },
  init() {
    for(const [id,src] of Object.entries(this.sources)) {
      const image=new Image();
      this.images[id]=image;
      if(id==='walnut')this.image=image; // compatibilidade com testes e integrações anteriores
      image.onload=()=>{
        this.loaded.add(id);
        if(id==='walnut')this.ready=true;
        this.readyAll=this.loaded.size===Object.keys(this.sources).length;
        if(typeof OFFICE!=='undefined'){OFFICE.key='';OFFICE.last=0;}
        document.querySelectorAll('.desk-material-opt canvas').forEach(c=>this.preview(c,c.dataset.deskMaterial));
      };
      image.onerror=()=>console.warn('Material da mesa indisponível: '+id);
      image.src=src;
    }
  },
  paint(x,w,top,height,id) {
    if(!this.loaded.has(id)) return false;
    const img=this.images[id];
    x.save(); x.imageSmoothingEnabled=false;
    const pattern=x.createPattern(img,'repeat');
    if(!pattern){x.restore();return false;}
    x.fillStyle=pattern; x.fillRect(0,top,w,height); x.restore(); return true;
  },
  preview(c,id) {
    if(!c)return;
    const x=c.getContext('2d'),w=c.width,h=c.height;
    x.clearRect(0,0,w,h);x.imageSmoothingEnabled=false;
    if(this.loaded.has(id)){
      const pat=x.createPattern(this.images[id],'repeat');
      if(pat){ x.fillStyle=pat; x.fillRect(0,0,w,h); }
    } else if(id==='original'){
      x.fillStyle='#d48a4f';x.fillRect(0,0,w,h);
      for(let i=0;i<w;i+=12){x.fillStyle='#a8623a';x.fillRect(i,0,1,h);}
      for(let j=8;j<h;j+=9){x.fillStyle='#6e3b26';x.fillRect(0,j,w,1);}
    } else {
      x.fillStyle=this.edge(id)[1];x.fillRect(0,0,w,h);
    }
  }
};
DeskMaterial.init();
