"""Original CC0 indexed GLB writer, metres and embedded fallback."""
import math,json,struct,base64
from pathlib import Path
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
 def write(self,name,generator='FEP original textile-models.py'):
  g=dict(asset=dict(version='2.0',generator=generator,copyright='CC0-1.0 original parametric model'),scene=0,scenes=[dict(nodes=list(range(len(self.nodes))))],nodes=self.nodes,meshes=self.meshes,materials=[dict(name='Fabric',pbrMetallicRoughness=dict(baseColorFactor=[1,1,1,1],metallicFactor=0,roughnessFactor=.93))],buffers=[dict(byteLength=len(self.blob))],bufferViews=self.views,accessors=self.acc)
  j=json.dumps(g,separators=(',',':')).encode();j+=b' '*(-len(j)%4);self.blob+=b'\0'*(-len(self.blob)%4);binary=struct.pack('<III',0x46546c67,2,12+8+len(j)+8+len(self.blob))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(self.blob),0x004e4942)+self.blob
  Path(f'vendor/{name}.glb').write_bytes(binary);g['buffers'][0]['uri']='data:application/octet-stream;base64,'+base64.b64encode(self.blob).decode();Path(f'vendor/{name}.gltf').write_text(json.dumps(g,separators=(',',':')))
