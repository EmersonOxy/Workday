"""Extract the supplied WorkOS sheets; never modify the originals."""
from pathlib import Path
from PIL import Image, ImageDraw
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/ui/workos'; OUT.mkdir(exist_ok=True)
UI=Image.open(ROOT/'assets/ui/Folha de Materiais UI WorkOS em Pixel Art.png').convert('RGBA')
TASK=Image.open(ROOT/'assets/ui/8a53e0c3-26b1-433e-b45f-b656f39d96cb.png').convert('RGBA')
records=[]
def crop(name,box,src=UI,corner=0):
 im=src.crop(box)
 if corner:
  w,h=im.size;m=Image.new('L',im.size);ImageDraw.Draw(m).polygon([(corner,0),(w-corner-1,0),(w-1,corner),(w-1,h-corner-1),(w-corner-1,h-1),(corner,h-1),(0,h-corner-1),(0,corner)],fill=255);im.putalpha(m)
 im.save(OUT/(name+'.png'));records.append(dict(file=name+'.png',rect=box,source='taskbar' if src is TASK else 'materials'));return im

def nine(name,boxes):
 # Assemble the nine independent source pieces, retaining a fixed corner region.
 atlas=Image.new('RGBA',(192,192));sizes=[32,128,32];positions=[0,32,160]
 for i,box in enumerate(boxes):
  tile=crop(name+'-'+str(i),box);x=i%3;y=i//3
  tile=tile.resize((sizes[x],sizes[y]),Image.Resampling.NEAREST)
  atlas.paste(tile,(positions[x],positions[y]))
 # Remove only the sheet backdrop outside the four chamfered corners.
 mask=Image.new('L',atlas.size,255);d=ImageDraw.Draw(mask)
 for points in [[(0,0),(10,0),(0,10)],[(191,0),(181,0),(191,10)],[(0,191),(0,181),(10,191)],[(191,191),(181,191),(191,181)]]:d.polygon(points,fill=0)
 atlas.putalpha(mask);atlas.save(OUT/(name+'.png'))
nine('frame',[(40,757,76,790),(120,757,210,785),(260,757,297,790),(40,835,68,895),(96,814,238,920),(268,835,296,895),(40,945,76,977),(120,949,210,975),(260,945,297,977)])
nine('panel',[(575,763,606,791),(645,763,710,787),(751,763,783,792),(575,835,599,895),(626,815,731,912),(758,835,783,895),(575,935,606,962),(645,940,710,961),(751,935,783,962)])
for name,box in [('titlebar-active',(200,136,220,175)),('titlebar-inactive',(200,255,220,292)),('control-min',(508,149,549,190)),('control-max',(564,149,605,190)),('control-close',(620,149,661,190)),('control-min-inactive',(692,149,733,190)),('control-max-inactive',(748,149,789,190)),('control-close-inactive',(804,149,845,190)),('input',(515,378,699,414)),('progress',(1024,385,1295,414)),('progress-fill',(1335,385,1366,413)),('scroll-up',(947,596,982,627)),('scroll-down',(947,633,982,664)),('scroll-thumb',(1053,595,1075,665)),('scroll-track',(1008,595,1027,665))]:crop(name,box,corner=3 if 'control-' in name else 0)
# Blank button material: retain original border and replace the label region with a clean interior sample.
button=crop('dialog-button',(40,377,187,418),corner=5)
button.paste(UI.crop((47,383,72,410)).resize((127,27),Image.Resampling.NEAREST),(10,6));button.save(OUT/'dialog-button.png')
for name,box in [('taskbar',(665,396,1145,451)),('taskbar-inactive',(665,465,1145,521)),('task-button',(1210,392,1485,451)),('task-button-active',(1210,535,1485,595)),('start-button',(388,392,487,452))]:
 im=crop(name,box,TASK,corner=4)
 if name.startswith('task-button'):
  im.paste(im.crop((190,10,220,45)).resize((255,40),Image.Resampling.NEAREST),(10,10));im.save(OUT/(name+'.png'))
icons={'folder':(904,128,955,170),'document':(1009,126,1048,170),'save':(1097,125,1143,170),'search':(1181,124,1229,171),'settings':(1271,126,1318,170),'monitor':(1360,126,1409,170),'globe':(1447,124,1496,172),'mail':(904,221,953,259),'star':(999,215,1049,262),'warning':(1083,214,1136,262),'info':(1180,214,1231,264),'error':(1275,215,1327,264),'key':(1372,211,1408,264),'trash':(1448,212,1497,264)}
for name,box in icons.items():
 im=crop('icon-'+name,box)
 # Flood only the purple sheet backing connected to the image boundary.
 pix=im.load();w,h=im.size;bg=im.getpixel((0,0));seen=set();stack=[(x,y) for x in range(w) for y in (0,h-1)]+[(x,y) for y in range(h) for x in (0,w-1)]
 while stack:
  x,y=stack.pop()
  if (x,y) in seen:continue
  seen.add((x,y));c=pix[x,y]
  if max(abs(c[i]-bg[i]) for i in range(3))>42:continue
  pix[x,y]=(c[0],c[1],c[2],0)
  stack.extend((a,b) for a,b in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)) if 0<=a<w and 0<=b<h)
 im.save(OUT/('icon-'+name+'.png'))
crop('tab-active',(1070,758,1186,805),corner=7)
crop('tab-inactive',(1185,764,1292,805),corner=6)
(OUT/'materials-manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
