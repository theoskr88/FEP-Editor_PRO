// Built-in product contract. Dimensions are centimetres; GLB coordinates use metres.
export const PRODUCT_PROFILES=[
 {id:'mug',name:'Taza cerámica 11 oz',printCm:[20,8.5],kind:'legacy',circumferenceCm:26},
 {id:'tumbler',name:'Vaso térmico',printCm:[23,21],kind:'legacy',circumferenceCm:25.5},
 {id:'shirt',name:'Polera manga corta · mejorada',printCm:[30,35],kind:'legacy'},
 {id:'tote',name:'Bolsa de tela',printCm:[28,30],kind:'legacy'},
 {id:'notebook',name:'Libreta espiral',printCm:[15,21],kind:'legacy'},
 {id:'mousepad',name:'Mousepad rectangular',printCm:[22,18],kind:'legacy'},
 {id:'cushion',name:'Cojín cuadrado',printCm:[28,28],kind:'legacy'},
 {id:'keychain',name:'Llavero redondo',printCm:[4,4],kind:'legacy'},
 {id:'panel100',name:'Placa 100 × 100 mm · modelo propio',printCm:[10,10],kind:'glb',url:'./vendor/panel100.glb?v=fase3f-20261110',gltfURL:'./vendor/panel100.gltf?v=fase3f-20261110',worldScale:20,physicalM:[.1,.1,.003],printMesh:'Printable',license:'CC0-1.0',calibration:'digital; fabricación pendiente'}
];
export const PRODUCT_VARIANTS={original:{name:'Original',roughness:null,metalness:null},matte:{name:'Mate',roughness:.85,metalness:0},gloss:{name:'Brillante',roughness:.22,metalness:.06},metal:{name:'Metal',roughness:.3,metalness:.75}};
export const profileById=id=>PRODUCT_PROFILES.find(p=>p.id===id);
export function profileVariant(value='original'){if(typeof value!=='string'||!Object.hasOwn(PRODUCT_VARIANTS,value))throw Error('Variante de material no disponible');return value}
