"""Original CC0 tote and wire-bound notebook. Metres, UVs in physical cm, no external assets."""
import math
from model_builder import Model
sin=math.sin;cos=math.cos;pi=math.pi
m=Model()
def bag(u,v,side):
 x=(u-.5)*.36*(.96+.04*v);y=-.2+.4*v+.003*sin(pi*u)*v**8;z=side*(.018+.009*sin(v*pi)*cos((u-.5)*pi)+.0015*sin(x*100+y*13)*sin(v*pi))
 return [x,y,z],[x/.36+.5 if side>0 else .5-x/.36,1-(y+.205)/.41]
for side,zone in [(1,'front'),(-1,'back')]:m.grid('Zone_'+zone,lambda u,v,side=side:bag(u,v,side),48,48,reverse=side<0)
for edge in ['left','right','bottom']:
 def gusset(u,v,edge=edge):
  a,b=(0,u) if edge=='left' else (1,u) if edge=='right' else (u,0);f,_=bag(a,b,1);back,_=bag(a,b,-1);return [f[k]*(1-v)+back[k]*v for k in range(3)],[u,v]
 m.grid('Gusset_'+edge,gusset,48,4,reverse=edge in ['right','bottom'])
for side,zone in [(1,'front'),(-1,'back')]:
 def handle(u,v,side=side):
  t=pi*u;dx=.09*pi*sin(t);dy=.22*pi*cos(t);length=math.hypot(dx,dy);offset=(v-.5)*.024
  return [-.09*cos(t)-dy/length*offset,.19+.22*sin(t)+dx/length*offset,side*(.020+.015*sin(t))],[u,v]
 m.grid('Handle_'+zone,handle,64,4,reverse=side<0)
 def hem(u,v,side=side):
  p,uv=bag(u,.982+.018*v,side);p[2]+=side*.0006;return p,uv
 m.grid('Hem_'+zone,hem,48,2,reverse=side<0)
m.write('tote-zones','FEP original accessory-models.py')
m=Model()
def cover(u,v,side):
 y=(v-.5)*.23;half=.085 if abs(y)<=.105 else .075+math.sqrt(max(0,.01**2-(abs(y)-.105)**2));x=(2*u-1)*half;z=side*(.009+.0008*cos(x/.085*pi/2)*sin(v*pi))
 return [x,y,z],[x/.17+.5 if side>0 else .5-x/.17,1-v]
for side,zone in [(1,'front'),(-1,'back')]:
 m.grid('Zone_'+zone,lambda u,v,side=side:cover(u,v,side),32,48,reverse=side<0)
 for edge in ['left','right','bottom','top']:
  def rim(u,v,side=side,edge=edge):
   a,b=(0,u) if edge=='left' else (1,u) if edge=='right' else (u,0) if edge=='bottom' else (u,1);p,uv=cover(a,b,side);p[2]-=side*.0015*v;return p,[u,v]
  m.grid('CoverEdge_'+zone+'_'+edge,rim,32,2,reverse=(edge in ['left','top'])==(side<0))
for edge in ['left','right','bottom','top']:
 def pages(u,v,edge=edge):
  x,y=(-.082,(u-.5)*.224) if edge=='left' else (.082,(u-.5)*.224) if edge=='right' else ((u-.5)*.164,-.112) if edge=='bottom' else ((u-.5)*.164,.112)
  return [x,y,(v-.5)*.014],[u,v]
 m.grid('Pages_'+edge,pages,32,3,reverse=edge in ['right','bottom'])
for i in range(14):
 def wire(u,v,i=i):
  a=2*pi*u;b=2*pi*v;thickness=.0011
  return [-.086+(.009+thickness*sin(b))*cos(a),-.100+i*.0154+thickness*cos(b),(.014+thickness*sin(b))*sin(a)],[u,v]
 m.grid('Binding_'+str(i),wire,28,6)
m.write('notebook-zones','FEP original accessory-models.py')
print('Generated original tote and notebook GLB/glTF')
