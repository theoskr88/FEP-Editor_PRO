// Built-in product contract. Dimensions are centimetres; GLB coordinates use metres.
export const PRODUCT_PROFILES=[
 {id:'mug',name:'Taza cerámica 11 oz',printCm:[20,8.5],kind:'legacy',circumferenceCm:26},
 {id:'tumbler',name:'Vaso térmico',printCm:[23,21],kind:'legacy',circumferenceCm:25.5},
 {id:'mug_enamel',name:'Taza esmaltada · borde de color (prototipo)',printCm:[20,8.5],kind:'legacy',circumferenceCm:26,calibration:'visual; confirmar dimensiones del producto físico'},
 {id:'shirt',name:'Polera · cuatro zonas',printCm:[30,35],kind:'glb',url:'./vendor/shirt-zones.glb?v=fep-6a4c2734f7b31778',gltfURL:'./vendor/shirt-zones.gltf?v=fep-6a4c2734f7b31778',worldScale:4.5,multiZone:true,license:'CC0-1.0'},
 {id:'tote',name:'Bolsa de tela · dos caras',printCm:[28,30],kind:'glb',url:'./vendor/tote-zones.glb?v=fep-6a4c2734f7b31778',gltfURL:'./vendor/tote-zones.gltf?v=fep-6a4c2734f7b31778',worldScale:5.5,multiZone:true,license:'CC0-1.0'},
 {id:'notebook',name:'Libreta · portada y contraportada',printCm:[15,21],kind:'glb',url:'./vendor/notebook-zones.glb?v=fep-6a4c2734f7b31778',gltfURL:'./vendor/notebook-zones.gltf?v=fep-6a4c2734f7b31778',worldScale:12,multiZone:true,license:'CC0-1.0'},
 {id:'mousepad',name:'Mousepad rectangular',printCm:[22,18],kind:'legacy'},
 {id:'cushion',name:'Cojín · dos caras',printCm:[28,28],kind:'glb',url:'./vendor/cushion-zones.glb?v=fep-6a4c2734f7b31778',gltfURL:'./vendor/cushion-zones.gltf?v=fep-6a4c2734f7b31778',worldScale:7,multiZone:true,license:'CC0-1.0'},
 {id:'keychain',name:'Llavero redondo',printCm:[4,4],kind:'legacy'},
 {id:'panel100',name:'Placa 100 × 100 mm · modelo propio',printCm:[10,10],kind:'glb',url:'./vendor/panel100.glb?v=fep-6a4c2734f7b31778',gltfURL:'./vendor/panel100.gltf?v=fep-6a4c2734f7b31778',worldScale:20,physicalM:[.1,.1,.003],printMesh:'Printable',license:'CC0-1.0',calibration:'digital; fabricación pendiente'}
];
export const PRODUCT_VARIANTS={original:{name:'Original',roughness:null,metalness:null},matte:{name:'Mate',roughness:.85,metalness:0},gloss:{name:'Brillante',roughness:.22,metalness:.06},metal:{name:'Metal',roughness:.3,metalness:.75}};
export const profileById=id=>PRODUCT_PROFILES.find(p=>p.id===id);
export function profileVariant(value='original'){if(typeof value!=='string'||!Object.hasOwn(PRODUCT_VARIANTS,value))throw Error('Variante de material no disponible');return value}

export const WRAPPED_PRODUCTS=new Set(['mug','mug_enamel','tumbler']);
export const MUG_PRODUCTS=new Set(['mug','mug_enamel']);
export const isWrappedProduct=id=>WRAPPED_PRODUCTS.has(id);
export const isMugProduct=id=>MUG_PRODUCTS.has(id);
