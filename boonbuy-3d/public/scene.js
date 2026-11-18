// Plaque BoonBuy en 3D : cadre blanc laqué dont la face porte une affiche —
// photo lifestyle en fond, « BOON BUY » en gros relief orange, vêtements en stickers sur le côté.
// Paramètres d'URL : ?view=front|three-quarter|side&size=2048
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

const query = new URLSearchParams(location.search);
const VIEW = query.get("view") ?? "front";
const SIZE = Number(query.get("size") ?? 1200);

// Angles calqués sur le cadre de référence (rotation de la plaque autour de l'axe vertical).
const VIEWS = {
  front: { yaw: 0 },
  "three-quarter": { yaw: 38 },
  side: { yaw: 82 },
};
const CAMERA = { fov: 30, distance: 25 };

// ------------------------------------------------------------------ mise en page
// Plaque de 10 × 10 unités ; la face avant est le plan z = 0.
const PLATE = { size: 10, radius: 0.9, depth: 0.3, bevel: 0.2 };
const PHOTO_INSET = 0.12; // liseré blanc entre la photo et l'arrondi de la plaque
const LAYOUT = {
  // Titre sur deux lignes, ancré en bas ; cap = hauteur des capitales.
  title: { cap: 1.56, lineGap: 0.38, bottom: -4.25, x: 0, align: "center", depth: 0.36 },
  logo: { size: 1.05, x: -3.95, y: 3.95 }, // null pour le retirer
  // Vêtements : stickers détourés, étagés en diagonale sur le côté droit.
  jacket: { width: 3.8, x: 2.05, y: 2.62, rotation: -4 },
  pants: { height: 3.4, x: 3.08, y: 1.0, rotation: 6 },
};

const COLORS = {
  plate: 0xe2e2e2,
  orange: 0xe58200,
  stickerEdge: 0xf7f7f7,
};

// ------------------------------------------------------------------ moteur
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(SIZE, SIZE);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = Number(query.get("exposure") ?? 0.75);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// Studio virtuel : pièce sombre + softbox. Les reflets restent localisés,
// les noirs des produits restent noirs et l'orange garde sa saturation.
function studioEnvironment() {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(0.05), side: THREE.BackSide })));
  const panel = (w, h, intensity, pos, look) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(...look);
    env.add(m);
  };
  panel(36, 18, 3.2, [0, 24, 6], [0, 0, 0]); // softbox zénithale
  panel(8, 34, 2.6, [-24, 2, 10], [0, 0, 0]); // strip gauche
  panel(6, 34, 0.75, [24, 2, 10], [0, 0, 0]); // strip droit (doux : évite un reflet brûlé de trois-quarts)
  panel(30, 14, 0.12, [0, 4, 30], [0, 0, 0]); // réflecteur frontal doux
  panel(34, 34, 0.9, [8, 0, -30], [0, 0, 0]); // fond clair : éclaire la face en vue rasante (profil)
  return env;
}
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;
scene.environmentIntensity = 1;

const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 1, 100);
camera.position.set(0, 0, CAMERA.distance);
camera.lookAt(0, 0, 0);

const rig = new THREE.Group(); // tout ce qui tourne avec la plaque, éclairage compris
scene.add(rig);

const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(-4, 6, 16);
key.castShadow = true;
key.shadow.mapSize.set(4096, 4096);
Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 40 });
key.shadow.bias = -0.0004;
key.shadow.radius = 10;
key.shadow.blurSamples = 20;
rig.add(key, key.target);

// Débouchage par lumière hémisphérique : pas de point spéculaire parasite sur les lettres.
rig.add(new THREE.HemisphereLight(0xffffff, 0xd8d8d8, 1.45));

const maxAniso = renderer.capabilities.getMaxAnisotropy();
const textureLoader = new THREE.TextureLoader();
const loadTexture = (url) =>
  textureLoader.loadAsync(url).then((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  });

// ------------------------------------------------------------------ géométries
function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

// Extrusion dont la face avant affleure z = front et la face arrière z = front - épaisseur.
function extrude(shape, { depth, bevel = 0, bevelSegments = 6, curveSegments = 24 }) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments,
    curveSegments,
  });
  geo.translate(0, 0, bevel); // face arrière en z = 0
  return geo;
}

// UV planaires : la texture couvre exactement le rectangle w × h centré.
function planarUV(geo, w, h) {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return geo;
}

function shadowed(mesh, cast = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  return mesh;
}

// ------------------------------------------------------------------ éléments
function buildPlate() {
  const group = new THREE.Group();
  const { size, radius, depth, bevel } = PLATE;
  const inner = size - 2 * bevel;
  const lacquer = new THREE.MeshPhysicalMaterial({
    color: COLORS.plate,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  const body = new THREE.Mesh(extrude(roundedRect(inner, inner, radius - bevel), { depth, bevel, bevelSegments: 14, curveSegments: 48 }), lacquer);
  body.position.z = -(depth + 2 * bevel);
  group.add(shadowed(body, false));

  // Contre-plaque légèrement en retrait : donne l'épaulement visible de profil.
  const backSize = size - 0.9;
  const back = new THREE.Mesh(
    extrude(roundedRect(backSize - 0.16, backSize - 0.16, radius - 0.5), { depth: 0.16, bevel: 0.08, bevelSegments: 6, curveSegments: 48 }),
    lacquer,
  );
  back.position.z = -(depth + 2 * bevel) - 0.32;
  group.add(shadowed(back, false));
  return group;
}

async function buildPhotoPanel() {
  const map = await loadTexture("textures/fond-photo.png");
  const side = PLATE.size - 2 * PLATE.bevel - 2 * PHOTO_INSET;
  const radius = PLATE.radius - PLATE.bevel - PHOTO_INSET;
  const geo = planarUV(new THREE.ShapeGeometry(roundedRect(side, side, radius), 32), side, side);
  const mat = new THREE.MeshPhysicalMaterial({ map, roughness: 0.4, specularIntensity: 0.5, clearcoat: 0.8, clearcoatRoughness: 0.04 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.position.z = 0.002;
  return mesh;
}

// Titre extrudé, une ligne par entrée de data/wordmark.json, ancré par sa ligne de base basse.
async function buildWordmark({ cap, lineGap, bottom, x, align, depth }) {
  const wm = await (await fetch("data/wordmark.json")).json();
  const s = cap / wm.capHeight;
  const bevel = 0.05;
  const mat = new THREE.MeshPhysicalMaterial({
    color: COLORS.orange,
    roughness: 0.14,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  });
  const group = new THREE.Group();
  const n = wm.lines.length;
  wm.lines.forEach((line, i) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${line.d}"/></svg>`;
    const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: depth / s,
      bevelEnabled: true,
      bevelThickness: bevel / s,
      bevelSize: (bevel * 0.8) / s,
      bevelSegments: 6,
      curveSegments: 16,
    });
    geo.scale(s, s, s);
    const width = (line.bbox.x2 - line.bbox.x1) * s;
    const left = align === "center" ? x - width / 2 : x;
    geo.translate(left - line.bbox.x1 * s, bottom + (n - 1 - i) * (cap + lineGap), bevel);
    group.add(shadowed(new THREE.Mesh(geo, mat)));
  });
  return group;
}

async function buildLogoTile(size, x, y) {
  const map = await loadTexture("textures/logo.png");
  const r = size * 0.22;
  const geo = planarUV(extrude(roundedRect(size, size, r), { depth: 0.1, bevel: 0.045, bevelSegments: 5, curveSegments: 32 }), size + 0.09, size + 0.09);
  const face = new THREE.MeshPhysicalMaterial({ map, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.05 });
  const mesh = shadowed(new THREE.Mesh(geo, [face, face]));
  mesh.position.set(x, y, 0);
  return mesh;
}

async function buildSticker(info, { width, height }) {
  const map = await loadTexture(info.texture);
  const h = height ?? width / info.aspect;
  const w = h * info.aspect;
  const pts = info.outline.map(([u, v]) => new THREE.Vector2((u - 0.5) * w, (v - 0.5) * h));
  const geo = planarUV(extrude(new THREE.Shape(pts), { depth: 0.035, bevel: 0.012, bevelSegments: 2, curveSegments: 1 }), w, h);
  const face = new THREE.MeshPhysicalMaterial({ map, roughness: 0.62, specularIntensity: 0.35, clearcoat: 0.22, clearcoatRoughness: 0.08 });
  const edge = new THREE.MeshPhysicalMaterial({ color: COLORS.stickerEdge, roughness: 0.45 });
  const mesh = shadowed(new THREE.Mesh(geo, [face, edge]));
  mesh.userData.size = { w, h };
  return mesh;
}

// ------------------------------------------------------------------ assemblage
async function build() {
  const content = new THREE.Group();
  rig.add(buildPlate(), content);

  content.add(await buildPhotoPanel());
  content.add(await buildWordmark(LAYOUT.title));
  if (LAYOUT.logo) content.add(await buildLogoTile(LAYOUT.logo.size, LAYOUT.logo.x, LAYOUT.logo.y));

  const stickers = await (await fetch("data/stickers.json")).json();
  const jacket = await buildSticker(stickers.veste, { width: LAYOUT.jacket.width });
  jacket.position.set(LAYOUT.jacket.x, LAYOUT.jacket.y, 0.005);
  jacket.rotation.z = THREE.MathUtils.degToRad(LAYOUT.jacket.rotation);

  const pants = await buildSticker(stickers.pantalon, { height: LAYOUT.pants.height });
  pants.position.set(LAYOUT.pants.x, LAYOUT.pants.y, 0.065); // posé sur la veste
  pants.rotation.z = THREE.MathUtils.degToRad(LAYOUT.pants.rotation);

  content.add(jacket, pants);

  const view = VIEWS[VIEW] ?? VIEWS.front;
  rig.rotation.y = THREE.MathUtils.degToRad(view.yaw); // pivot : centre de la face avant

  renderer.render(scene, camera);
  window.__ready = true;
}

build().catch((err) => {
  window.__error = String(err?.stack ?? err);
});
