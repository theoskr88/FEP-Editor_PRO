"""Generate FEP Outline Sans polygon outlines from OFL Liberation Sans Bold.
Reproducible using Debian fonts-liberation and fontTools; runtime needs no font server.
"""
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from pathlib import Path
import json
font=TTFont('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'); glyphs=font.getGlyphSet(); cmap=font.getBestCmap(); em=font['head'].unitsPerEm
class Pen(BasePen):
 def __init__(self):super().__init__(glyphs);self.paths=[];self.current=[]
 def _moveTo(self,p):self.current=[list(p)];self.paths.append(self.current)
 def _lineTo(self,p):self.current.append(list(p))
 def _curveToOne(self,a,b,c):
  x,y=self._getCurrentPoint()
  for i in range(1,25):
   t=i/24;u=1-t;self.current.append([u*u*u*x+3*u*u*t*a[0]+3*u*t*t*b[0]+t*t*t*c[0],u*u*u*y+3*u*u*t*a[1]+3*u*t*t*b[1]+t*t*t*c[1]])
 def _qCurveToOne(self,a,b):
  x,y=self._getCurrentPoint()
  for i in range(1,25):
   t=i/24;u=1-t;self.current.append([u*u*x+2*u*t*a[0]+t*t*b[0],u*u*y+2*u*t*a[1]+t*t*b[1]])
 def _closePath(self):pass
 def _endPath(self):pass
out={}
for code in range(32,384):
 if code not in cmap:continue
 name=cmap[code];p=Pen();glyphs[name].draw(p)
 out[chr(code)]={'advance':round(glyphs[name].width/em,6),'paths':[[[round(x/em,6),round(-y/em,6)] for x,y in ring] for ring in p.paths if len(ring)>=3]}
Path('vendor/font-outlines.js').write_text('// FEP Outline Sans; derived outlines of Liberation Sans Bold, SIL OFL 1.1. See font-LICENSE.txt.\nexport default '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
