"""Original CC0 rectangular plate, metre units, exact 100×100×3 mm body, calibrated UV front.
No external model/texture data. Produces a self-contained binary GLB 2.0.
"""
import json,struct,base64
from pathlib import Path
blob=bytearray();views=[];accessors=[];meshes=[]
def accessor(data,kind,components):
 offset=len(blob)
 for row in data:blob.extend(struct.pack('<'+'f'*components,*row))
 views.append({'buffer':0,'byteOffset':offset,'byteLength':len(blob)-offset,'target':34962});d={'bufferView':len(views)-1,'componentType':5126,'count':len(data),'type':kind}
 if kind=='VEC3':d.update(min=[min(p[i] for p in data) for i in range(3)],max=[max(p[i] for p in data) for i in range(3)])
 accessors.append(d);return len(accessors)-1
def mesh(name,faces,material):
 pos=[];norm=[];uv=[]
 for corners,n in faces:
  for index in [0,1,2,0,2,3]:pos.append(corners[index]);norm.append(n);uv.append([[0,0],[1,0],[1,1],[0,1]][index])
 meshes.append({'name':name,'primitives':[{'attributes':{'POSITION':accessor(pos,'VEC3',3),'NORMAL':accessor(norm,'VEC3',3),'TEXCOORD_0':accessor(uv,'VEC2',2)},'material':material}]})
a=.05;z=.0015
mesh('PlateBody',[
 ([[-a,-a,z],[a,-a,z],[a,a,z],[-a,a,z]],[0,0,1]),
 ([[a,-a,-z],[-a,-a,-z],[-a,a,-z],[a,a,-z]],[0,0,-1]),
 ([[-a,-a,-z],[a,-a,-z],[a,-a,z],[-a,-a,z]],[0,-1,0]),
 ([[a,a,-z],[-a,a,-z],[-a,a,z],[a,a,z]],[0,1,0]),
 ([[-a,a,-z],[-a,-a,-z],[-a,-a,z],[-a,a,z]],[-1,0,0]),
 ([[a,-a,-z],[a,a,-z],[a,a,z],[a,-a,z]],[1,0,0])],0)
mesh('Printable',[([[-a,-a,z+.00001],[a,-a,z+.00001],[a,a,z+.00001],[-a,a,z+.00001]],[0,0,1])],1)
gltf={'asset':{'version':'2.0','generator':'FEP Editor PRO original panel-model.py','copyright':'CC0 1.0; original FEP geometry'},'scene':0,'scenes':[{'nodes':[0,1]}],'nodes':[{'name':'PlateBody','mesh':0},{'name':'Printable','mesh':1}],'materials':[{'name':'Body','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':0,'roughnessFactor':.5}},{'name':'Print','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':0,'roughnessFactor':.6}}],'meshes':meshes,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors}
j=json.dumps(gltf,separators=(',',':')).encode();j+=b' '*((-len(j))%4);blob+=b'\0'*((-len(blob))%4)
result=struct.pack('<III',0x46546c67,2,12+8+len(j)+8+len(blob))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(blob),0x004e4942)+blob
Path('vendor/panel100.glb').write_bytes(result)

gltf['buffers'][0]['uri']='data:application/octet-stream;base64,'+base64.b64encode(blob).decode()
Path('vendor/panel100.gltf').write_text(json.dumps(gltf,separators=(',',':')))
