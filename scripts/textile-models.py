"""Original parametric textile meshes. Metres, indexed triangles, baked UV, no external assets.
CC0-1.0: FEP's generated geometry and this model-generation data may be redistributed commercially.
"""
import math,json,struct,base64,bisect
from pathlib import Path
sin=math.sin;cos=math.cos;pi=math.pi
class Model:
 def __init__(self):self.blob=bytearray();self.views=[];self.acc=[];self.meshes=[];self.nodes=[]
 def accessor(self,data,components,kind,index=False):
  while len(self.blob)%4:self.blob.append(0)
  start=len(self.blob)
  for row in data:self.blob.extend(struct.pack('<'+('H' if index else 'f')*components,*row))
  self.views.append(dict(buffer=0,byteOffset=start,byteLength=len(self.blob)-start,target=34963 if index else 34962));a=dict(bufferView=len(self.views)-1,componentType=5123 if index else 5126,count=len(data),type=kind)
  if kind=='VEC3':a.update(min=[min(p[i] for p in data) for i in range(3)],max=[max(p[i] for p in data) for i in range(3)])
  self.acc.append(a);return len(self.acc)-1
 def grid(self,name,fn,nx=48,ny=48,reverse=False):
  pos=[];uv=[];indices=[]
  for j in range(ny+1):
   for i in range(nx+1):
    p,t=fn(i/nx,j/ny);pos.append(p);uv.append(t)
  for j in range(ny):
   for i in range(nx):
    a=j*(nx+1)+i;b=a+1;c=a+nx+1;d=c+1
    indices.extend([(a,c,b),(b,c,d)] if reverse else [(a,b,c),(b,d,c)])
  normals=[[0.,0.,0.] for _ in pos]
  for a,b,c in indices:
   u=[pos[b][k]-pos[a][k] for k in range(3)];v=[pos[c][k]-pos[a][k] for k in range(3)];n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
   for idx in [a,b,c]:
    for k in range(3):normals[idx][k]+=n[k]
  for n in normals:
   length=math.sqrt(sum(x*x for x in n)) or 1
   for k in range(3):n[k]/=length
  attrs=dict(POSITION=self.accessor(pos,3,'VEC3'),NORMAL=self.accessor(normals,3,'VEC3'),TEXCOORD_0=self.accessor(uv,2,'VEC2'))
  self.meshes.append(dict(name=name,primitives=[dict(attributes=attrs,indices=self.accessor([(idx,) for tri in indices for idx in tri],1,'SCALAR',True),material=0)]));self.nodes.append(dict(name=name,mesh=len(self.meshes)-1))
 def write(self,name):
  g=dict(asset=dict(version='2.0',generator='FEP original textile-models.py',copyright='CC0-1.0 original parametric model'),scene=0,scenes=[dict(nodes=list(range(len(self.nodes))))],nodes=self.nodes,meshes=self.meshes,materials=[dict(name='Fabric',pbrMetallicRoughness=dict(baseColorFactor=[1,1,1,1],metallicFactor=0,roughnessFactor=.93))],buffers=[dict(byteLength=len(self.blob))],bufferViews=self.views,accessors=self.acc)
  j=json.dumps(g,separators=(',',':')).encode();j+=b' '*(-len(j)%4);self.blob+=b'\0'*(-len(self.blob)%4);binary=struct.pack('<III',0x46546c67,2,12+8+len(j)+8+len(self.blob))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(self.blob),0x004e4942)+self.blob
  Path(f'vendor/{name}.glb').write_bytes(binary);g['buffers'][0]['uri']='data:application/octet-stream;base64,'+base64.b64encode(self.blob).decode();Path(f'vendor/{name}.gltf').write_text(json.dumps(g,separators=(',',':')))
# A softly draped torso. UV projection stays in physical X/Y, including the collar dip.
def torso(u,v,side):
 x=(u-.5)*.52;top=.345-.025*(abs(x)/.26)**2-(.070 if side>0 else .025)*max(0,1-(x/.11)**2);bottom=-.35+.003*(1+cos(x/.26*pi));y=bottom+(top-bottom)*v
 z=side*(.022+.018*cos(x/.26*pi/2)*sin(v*pi)+.0025*sin(x*87+y*19)*sin(v*pi)**2+.002*sin(y*62+x*13)*abs(x/.26)**4)
 return [x,y,z],[u if side>0 else 1-u,1-(y+.35)/.70]
m=Model()
for side,zone in [(1,'front'),(-1,'back')]:m.grid('Zone_'+zone,lambda u,v,side=side:torso(u,v,side),reverse=side<0)
# Body edge rim joins both surfaces, following the same soft outline (no printing overlay).
for boundary in ['left','right','bottom','top']:
 def rim(u,v,boundary=boundary):
  a,b=(0,u) if boundary=='left' else (1,u) if boundary=='right' else (u,0) if boundary=='bottom' else (u,1)
  front,_=torso(a,b,1);back,_=torso(a,b,-1);return [front[k]*(1-v)+back[k]*v for k in range(3)],[u,v]
 if boundary=='top':
  # Shoulder joins stop at the collar: keep the neck opening genuinely hollow.
  m.grid('Seam_shoulder_left',lambda u,v:rim(u*.28,v,'top'),24,3)
  m.grid('Seam_shoulder_right',lambda u,v:rim(.72+u*.28,v,'top'),24,3)
 else:m.grid('Seam_'+boundary,rim,48,3,reverse=boundary in ['right','bottom'])
# Tubular sleeves with independent circumferential UV and open cuffs. Left is wearer's left (+X).
sleeve_arcs={}
def arc_coordinates(u,v):
 if v not in sleeve_arcs:
  ry=.103-.018*v;rz=.031-.004*v;points=[(ry*cos(2*pi*i/1024-pi/2),rz*sin(2*pi*i/1024-pi/2)) for i in range(1025)];s=[0.]
  for i in range(1024):s.append(s[-1]+math.dist(points[i],points[i+1]))
  sleeve_arcs[v]=s
 s=sleeve_arcs[v];at=u*s[-1];i=min(1023,max(0,bisect.bisect_right(s,at)-1));fraction=(at-s[i])/(s[i+1]-s[i]);theta=2*pi*(i+fraction)/1024-pi/2
 # UV spans physical arc length, including taper, inside a 48 cm atlas.
 return theta,.5+(u-.5)*s[-1]/.48
for sign,zone in [(1,'leftSleeve'),(-1,'rightSleeve')]:
 def sleeve(u,v,sign=sign):
  theta,uvx=arc_coordinates(u,v);x=sign*(.252+.188*v);cy=.222-.095*v;ry=.103-.018*v;rz=.031-.004*v
  return [x,cy+ry*cos(theta),rz*sin(theta)+.0015*sin(v*35)*sin(theta)],[uvx,.5+(.5-v)*math.sqrt(.188**2+.095**2)/.22]
 m.grid('Zone_'+zone,sleeve,64,24,reverse=sign<0)
 # Narrow cuff lip; all vertices remain part of the textile body.
 def cuff(u,v,sign=sign):
  theta=2*pi*u-pi/2;r=.085;return [sign*(.44-.006*v),.127+(r-.002*v)*cos(theta),(.027-.002*v)*sin(theta)],[u,v]
 m.grid('Cuff_'+zone,cuff,64,2,reverse=sign>0)
m.write('shirt-zones')
# Pillow: pinched corners, soft padded centre, edge piping. Back UV reads correctly from outside.
def pillow(u,v,side):
 a=2*u-1;b=2*v-1;x=.2*a*(1-.035*abs(b)**14);y=.2*b*(1-.035*abs(a)**14);bulge=max(0,(1-a*a)*(1-b*b))**.55;z=side*(.014+.064*bulge+.0018*sin(a*36+b*13)*(1-bulge)*sin(pi*u)*sin(pi*v))
 return [x,y,z],[u if side>0 else 1-u,1-v]
m=Model()
for side,zone in [(1,'a'),(-1,'b')]:m.grid('Zone_'+zone,lambda u,v,side=side:pillow(u,v,side),64,64,reverse=side<0)
for i in range(4):
 def edge(u,v,i=i):
  a,b=[(u,0),(1,u),(1-u,1),(0,1-u)][i];front,_=pillow(a,b,1);back,_=pillow(a,b,-1);p=[front[k]*(1-v)+back[k]*v for k in range(3)];return p,[u,v]
 m.grid('Piping_'+str(i),edge,64,4,reverse=True)
m.write('cushion-zones')
print('Generated original shirt and cushion GLB/glTF')
