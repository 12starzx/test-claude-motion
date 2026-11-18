// Plaque BoonBuy en 3D : cadre blanc laqué, logo, « BOON BUY » en relief
// et trois stickers détourés (personne, veste, pantalon).
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
const SAFE = 4.3; // demi-largeur de la zone utile
const LAYOUT = {
  header: { top: SAFE, height: 1.45, gap: 0.38 },
  bodyTop: 2.4,
  person: { height: 6.75 },
  jacket: { width: 5.0, x: 1.25, rotation: -4 },
  pants: { height: 4.2, x: 2.2, rotation: 7 },
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
  panel(8, 34, 2.0, [24, 2, 10], [0, 0, 0]); // strip droit
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

const fill = new THREE.DirectionalLight(0xffffff, 0.7);
fill.position.set(8, -2, 10);
rig.add(fill, fill.target);
rig.add(new THREE.HemisphereLight(0xffffff, 0xd8d8d8, 1.1));

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

async function buildWordmark(left, centerY, maxRight) {
  const wm = await (await fetch("data/wordmark.json")).json();
  const line = wm.lines[0];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${line.d}"/></svg>`;
  const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
  const width = line.bbox.x2 - line.bbox.x1;
  const s = Math.min((maxRight - left) / width, 0.95 / wm.capHeight);
  const depth = 0.3;
  const bevel = 0.045;
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: depth / s,
    bevelEnabled: true,
    bevelThickness: bevel / s,
    bevelSize: (bevel * 0.8) / s,
    bevelSegments: 6,
    curveSegments: 16,
  });
  geo.scale(s, s, s);
  geo.translate(-line.bbox.x1 * s, 0, bevel);
  const mat = new THREE.MeshPhysicalMaterial({
    color: COLORS.orange,
    roughness: 0.14,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  });
  const mesh = shadowed(new THREE.Mesh(geo, mat));
  mesh.position.set(left, centerY - (wm.capHeight * s) / 2, 0);
  return mesh;
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

  const { header } = LAYOUT;
  const headerY = header.top - header.height / 2;
  content.add(await buildLogoTile(header.height, -SAFE + header.height / 2, headerY));
  content.add(await buildWordmark(-SAFE + header.height + header.gap, headerY, SAFE));

  const stickers = await (await fetch("data/stickers.json")).json();
  const bodyBottom = -SAFE;
  const bodyCenter = (LAYOUT.bodyTop + bodyBottom) / 2;

  const person = await buildSticker(stickers.personne, { height: LAYOUT.person.height });
  person.position.set(-SAFE + person.userData.size.w / 2, bodyCenter, 0);

  const pants = await buildSticker(stickers.pantalon, { height: LAYOUT.pants.height });
  pants.position.set(LAYOUT.pants.x, bodyBottom + pants.userData.size.h / 2, 0.06); // posé sur la veste
  pants.rotation.z = THREE.MathUtils.degToRad(LAYOUT.pants.rotation);

  const jacket = await buildSticker(stickers.veste, { width: LAYOUT.jacket.width });
  jacket.position.set(LAYOUT.jacket.x, LAYOUT.bodyTop - jacket.userData.size.h / 2, 0);
  jacket.rotation.z = THREE.MathUtils.degToRad(LAYOUT.jacket.rotation);

  content.add(person, pants, jacket);

  const view = VIEWS[VIEW] ?? VIEWS.front;
  rig.rotation.y = THREE.MathUtils.degToRad(view.yaw); // pivot : centre de la face avant

  renderer.render(scene, camera);
  window.__ready = true;
}

build().catch((err) => {
  window.__error = String(err?.stack ?? err);
});
