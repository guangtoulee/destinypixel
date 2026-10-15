import * as THREE from "three";

type Point2 = readonly [number, number];

const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;

function randomGenerator(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

function paintedTexture(width: number, height: number, paint: (context: CanvasRenderingContext2D) => void) {
  if (typeof document === "undefined") return undefined;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return undefined;
  paint(context);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function mesh(parent: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[], position: [number, number, number] = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function rod(parent: THREE.Group, from: THREE.Vector3, to: THREE.Vector3, radius: number, material: THREE.Material, endRadius = radius) {
  const direction = to.clone().sub(from);
  const object = mesh(parent, new THREE.CylinderGeometry(endRadius, radius, direction.length(), 8), material);
  object.position.copy(from).add(to).multiplyScalar(0.5);
  object.quaternion.setFromUnitVectors(UP, direction.normalize());
  return object;
}

function horizontalShape(points: readonly Point2[]) {
  const shape = new THREE.Shape();
  points.forEach(([x, z], index) => index ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
  shape.closePath();
  return shape;
}

function horizontalExtrusion(shape: THREE.Shape, depth: number, bevel = 0) {
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 18 });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function roundedShape(width: number, depth: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2, y = -depth / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + depth - radius);
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  shape.lineTo(x + radius, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function lathe(parent: THREE.Group, profile: Point2[], material: THREE.Material, position: [number, number, number], segments = 56) {
  return mesh(parent, new THREE.LatheGeometry(profile.map(([radius, height]) => new THREE.Vector2(radius, height)), segments), material, position);
}

function labelTexture(title: string, subtitle: string) {
  const texture = paintedTexture(768, 288, (ctx) => {
    ctx.fillStyle = "#eee8d3"; ctx.fillRect(0, 0, 768, 288);
    const random = randomGenerator(293);
    for (let i = 0; i < 3000; i++) { ctx.fillStyle = "rgba(113,98,64,.045)"; ctx.fillRect(random() * 768, random() * 288, random() * 3, 1); }
    ctx.strokeStyle = "#ad9a70"; ctx.lineWidth = 2; ctx.strokeRect(20, 20, 728, 248);
    ctx.strokeStyle = "#d3c7a6"; ctx.lineWidth = 1; ctx.strokeRect(28, 28, 712, 232);
    ctx.fillStyle = "#354b3f"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = '55px "Songti SC", "STSong", serif'; ctx.fillText(title, 384, 112);
    ctx.fillStyle = "#8c7958"; ctx.font = '25px "Songti SC", serif'; ctx.fillText(subtitle, 384, 192);
    ctx.fillStyle = "#9c6750"; ctx.fillRect(691, 211, 24, 25);
  });
  if (texture) { texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping; }
  return texture;
}

function tag(parent: THREE.Group, title: string, subtitle: string, width: number, position: [number, number, number], bronze: THREE.Material) {
  const group = new THREE.Group();
  group.position.set(...position);
  const height = width * 0.375;
  rod(group, new THREE.Vector3(-width * 0.3, -0.23, -0.015), new THREE.Vector3(-width * 0.3, height * 0.1, -0.015), 0.014, bronze);
  rod(group, new THREE.Vector3(width * 0.3, -0.23, -0.015), new THREE.Vector3(width * 0.3, height * 0.1, -0.015), 0.014, bronze);
  const board = mesh(group, new THREE.BoxGeometry(width + 0.035, height + 0.035, 0.035), bronze);
  board.rotation.x = -0.25;
  const face = mesh(group, new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ color: 0xffffff, map: labelTexture(title, subtitle), roughness: 0.94, side: THREE.DoubleSide }), [0, 0.004, 0.025]);
  face.rotation.x = -0.25;
  parent.add(group);
  return group;
}

/**
 * A miniature cultural interpretation of Taixi: deliberately not an excavation
 * reconstruction. Caller supplies lighting, camera, interaction and disposal.
 * Positive Z is the viewing/front edge; both focus groups sit in the foreground.
 */
export function buildTaixiScene(): THREE.Group {
  const root = new THREE.Group();
  root.name = "台西 · 土中回声（文化艺术示意）";
  root.userData = { sceneId: "taixi", interpretation: "艺术示意，非考古复原；器物造型与空间组合为互动创作" };
  const random = randomGenerator(1806);

  const soilMap = paintedTexture(512, 512, (ctx) => {
    ctx.fillStyle = "#d7c5a1"; ctx.fillRect(0, 0, 512, 512);
    const noise = randomGenerator(58);
    for (let i = 0; i < 14000; i++) {
      const light = noise() > 0.52;
      ctx.fillStyle = light ? "rgba(255,243,209,.17)" : "rgba(91,65,40,.09)";
      ctx.fillRect(noise() * 512, noise() * 512, 0.5 + noise() * 2.8, 0.5 + noise() * 1.7);
    }
    ctx.strokeStyle = "rgba(99,72,44,.11)"; ctx.lineWidth = 1;
    for (let i = 0; i < 36; i++) {
      const x = noise() * 512, y = noise() * 512;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 7, y + 4); ctx.lineTo(x + 17, y + 2); ctx.stroke();
    }
  });
  const woodMap = paintedTexture(512, 256, (ctx) => {
    ctx.fillStyle = "#8c6e43"; ctx.fillRect(0, 0, 512, 256);
    const noise = randomGenerator(93);
    for (let i = 0; i < 160; i++) {
      const y = noise() * 256;
      ctx.strokeStyle = `rgba(52,38,22,${0.05 + noise() * 0.18})`; ctx.lineWidth = 0.5 + noise();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(150, y + 14, 280, y - 11, 512, y + 3); ctx.stroke();
    }
  });
  const stoneMap = paintedTexture(512, 512, (ctx) => {
    ctx.fillStyle = "#aeb4aa"; ctx.fillRect(0, 0, 512, 512);
    const noise = randomGenerator(328);
    for (let i = 0; i < 11000; i++) {
      ctx.fillStyle = noise() > 0.6 ? "rgba(238,235,210,.18)" : "rgba(35,49,43,.14)";
      ctx.fillRect(noise() * 512, noise() * 512, 1 + noise() * 5, 0.8 + noise() * 2);
    }
    for (let i = 0; i < 14; i++) {
      const y = noise() * 512; ctx.strokeStyle = "rgba(60,75,66,.16)"; ctx.lineWidth = 1 + noise() * 3;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(130, y + 30, 300, y - 24, 512, y + 18); ctx.stroke();
    }
  });
  const clayMap = paintedTexture(512, 512, (ctx) => {
    ctx.fillStyle = "#caa47b"; ctx.fillRect(0, 0, 512, 512);
    const noise = randomGenerator(409);
    for (let y = 0; y < 512; y += 5) { ctx.fillStyle = `rgba(70,39,22,${0.025 + noise() * 0.06})`; ctx.fillRect(0, y, 512, 0.5 + noise()); }
    for (let i = 0; i < 8500; i++) { ctx.fillStyle = noise() > 0.6 ? "rgba(249,213,154,.13)" : "rgba(74,48,30,.12)"; ctx.fillRect(noise() * 512, noise() * 512, 1 + noise(), 1 + noise()); }
  });
  const kernelMap = paintedTexture(256, 128, (ctx) => {
    ctx.fillStyle = "#c69c61"; ctx.fillRect(0, 0, 256, 128);
    const noise = randomGenerator(391);
    for (let i = 0; i < 65; i++) {
      const x = noise() * 256; ctx.strokeStyle = "rgba(91,51,26,.23)"; ctx.lineWidth = 0.5 + noise();
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x - 6, 48, x + 8, 79, x + 2, 128); ctx.stroke();
    }
  });

  const earthColors = [0x75654d, 0x94704d, 0xb38a59, 0x98714a, 0xc09a68, 0xb89360];
  const earth = earthColors.map((color) => new THREE.MeshStandardMaterial({ color, map: soilMap, roughness: 1, metalness: 0 }));
  const topSoil = new THREE.MeshStandardMaterial({ color: 0xc6a475, map: soilMap, roughness: 1 });
  const darkSoil = new THREE.MeshStandardMaterial({ color: 0x88704f, map: soilMap, roughness: 1 });
  const wood = new THREE.MeshStandardMaterial({ color: 0xb19a70, map: woodMap, roughness: 0.83 });
  const woodEdge = new THREE.MeshStandardMaterial({ color: 0x695639, map: woodMap, roughness: 0.86 });
  const bronze = new THREE.MeshStandardMaterial({ color: 0x72694b, metalness: 0.46, roughness: 0.67 });
  const linen = new THREE.MeshStandardMaterial({ color: 0xe5dac0, map: soilMap, roughness: 1, side: THREE.DoubleSide });
  const stone = new THREE.MeshStandardMaterial({ color: 0x7f8c80, map: stoneMap, roughness: 0.84 });
  const stoneEdge = new THREE.MeshStandardMaterial({ color: 0xa5aea0, map: stoneMap, roughness: 0.94 });
  const clay = new THREE.MeshStandardMaterial({ color: 0xa77a52, map: clayMap, roughness: 0.91, side: THREE.DoubleSide });
  const clayInside = new THREE.MeshStandardMaterial({ color: 0x76543b, map: clayMap, roughness: 1, side: THREE.DoubleSide });
  const kernelMaterial = new THREE.MeshStandardMaterial({ color: 0xceaa70, map: kernelMap, roughness: 0.94 });
  const kernelCrease = new THREE.MeshStandardMaterial({ color: 0x785332, roughness: 1 });

  // Continuous organic strata, rather than stacked rectangular land blocks.
  const boundary: Point2[] = Array.from({ length: 80 }, (_, i) => {
    const angle = i / 80 * TAU;
    const ripple = 1 + Math.sin(angle * 3 + 0.2) * 0.031 + Math.sin(angle * 7) * 0.018;
    return [Math.cos(angle) * 4.92 * ripple, Math.sin(angle) * 3.87 * ripple] as Point2;
  });
  const pit: Point2[] = [[-2.3, -1.9], [0.45, -1.76], [0.56, 0.18], [-2.35, 0.34]];
  for (let layer = 0; layer < 3; layer++) {
    const shape = horizontalShape(boundary.map(([x, z]) => [x * (0.94 + layer * 0.02), z * (0.94 + layer * 0.02)] as Point2));
    mesh(root, horizontalExtrusion(shape, 0.16), earth[layer], [0, -1.08 + layer * 0.16, 0]);
  }
  for (let layer = 0; layer < 3; layer++) {
    const shape = horizontalShape(boundary);
    const hole = new THREE.Path();
    pit.forEach(([x, z], i) => i ? hole.lineTo(x, -z) : hole.moveTo(x, -z));
    hole.closePath(); shape.holes.push(hole);
    mesh(root, horizontalExtrusion(shape, 0.2), [layer === 2 ? topSoil : earth[layer + 3], earth[layer + 3]], [0, -0.6 + layer * 0.2, 0]);
  }
  const pitFloor = mesh(root, horizontalExtrusion(horizontalShape(pit), 0.025), darkSoil, [0, -0.604, 0]);
  pitFloor.name = "下探的探方面与连续土层剖面";

  // A low, curving cut bank rises behind the excavation and frames both objects.
  const stations = [
    [-4.1, -1.9, 0.08], [-3.65, -2.5, 0.7], [-2.65, -2.9, 1.08], [-1.2, -3.0, 1.31],
    [0.3, -3.02, 1.22], [1.65, -2.83, 0.96], [2.8, -2.5, 0.64], [3.7, -1.9, 0.1],
  ];
  for (let layer = 0; layer < 5; layer++) {
    const vertices: number[] = [], indices: number[] = [], uv: number[] = [];
    stations.forEach(([x, z, height], index) => {
      const lower = height * layer / 5, upper = height * (layer + 1) / 5;
      const wave = Math.sin(index * 1.7 + layer) * 0.025;
      vertices.push(x, lower, z + 0.36, x, upper + wave, z + 0.36, x, lower, z - 0.32, x, upper + wave, z - 0.32);
      uv.push(index / 2, layer / 5, index / 2, (layer + 1) / 5, index / 2, layer / 5, index / 2, (layer + 1) / 5);
      if (index < stations.length - 1) {
        const a = index * 4, b = a + 4;
        indices.push(a, b, a + 1, b, b + 1, a + 1, a + 2, a + 3, b + 2, b + 2, a + 3, b + 3, a + 1, b + 1, a + 3, b + 1, b + 3, a + 3);
      }
    });
    indices.push(0, 1, 2, 1, 3, 2, 28, 30, 29, 29, 30, 31);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    mesh(root, geometry, earth[layer + 1]);
  }

  const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0xd5c9a6, roughness: 1 });
  pit.forEach(([x, z]) => {
    rod(root, new THREE.Vector3(x, 0.01, z), new THREE.Vector3(x, 0.39, z), 0.023, woodEdge);
    mesh(root, new THREE.SphereGeometry(0.035, 8, 5), bronze, [x, 0.39, z]);
  });
  for (let i = 0; i < pit.length; i++) {
    const a = pit[i], b = pit[(i + 1) % pit.length];
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(a[0], 0.29, a[1]), new THREE.Vector3((a[0] + b[0]) / 2, 0.23, (a[1] + b[1]) / 2), new THREE.Vector3(b[0], 0.29, b[1]));
    mesh(root, new THREE.TubeGeometry(curve, 12, 0.009, 4, false), ropeMaterial);
  }

  // Small curved pottery fragments; their surfaces retain the vessel curvature.
  const shardGeometry = (variant: number) => {
    const points: Point2[] = variant % 2 ? [[-.23,-.12],[.02,-.2],[.22,-.05],[.14,.17],[-.13,.19]] : [[-.2,-.15],[.13,-.19],[.24,.07],[-.02,.2],[-.23,.07]];
    const geometry = horizontalExtrusion(horizontalShape(points), 0.025);
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) positions.setY(i, positions.getY(i) + Math.pow(positions.getX(i) / 0.25, 2) * 0.047);
    geometry.computeVertexNormals(); return geometry;
  };
  const shards = [shardGeometry(0), shardGeometry(1), shardGeometry(2)];
  const shardPositions = [[-1.85,-.55,-1.16],[-.92,-.55,-1.42],[-1.33,-.55,-.26],[-.23,-.55,-.78],[-2.0,.026,.72],[.81,.025,-1.55],[2.4,.025,-.97],[3.04,.025,1.55]];
  shardPositions.forEach(([x,y,z], i) => { const fragment = mesh(root, shards[i % 3], i % 3 ? clay : clayInside, [x,y,z]); fragment.rotation.y = i * 1.7; fragment.rotation.z = i % 2 ? .12 : -.08; fragment.scale.setScalar(i < 4 ? .9 : .6); });
  const ruler = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 0.025, 0.11), new THREE.MeshStandardMaterial({ roughness: 1 }), 12);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < 12; i++) { matrix.makeTranslation(-1.8 + i * .09, -.546, -1.57); ruler.setMatrixAt(i, matrix); ruler.setColorAt(i, new THREE.Color(i % 2 ? 0x46473d : 0xe9dfbf)); }
  ruler.castShadow = ruler.receiveShadow = true; root.add(ruler);

  // Focus 1: a broad, bevelled grey stone crescent resting above a linen tray.
  const bladeFocus = new THREE.Group();
  bladeFocus.name = "灰石弧刃 · 砭镰意象";
  bladeFocus.userData = { focusId: "taixi-blade", label: "砭镰 · 艺术示意，非器物复原" };
  bladeFocus.position.set(-2.05, 0.015, 1.7); bladeFocus.rotation.y = -.13;
  root.add(bladeFocus);
  mesh(bladeFocus, horizontalExtrusion(roundedShape(2.22, 1.32, .12), .12, .015), woodEdge);
  mesh(bladeFocus, horizontalExtrusion(roundedShape(2.07, 1.17, .1), .025), wood, [0,.125,0]);
  const cloth = mesh(bladeFocus, new THREE.PlaneGeometry(1.91, 1.03, 10, 8), linen, [0,.16,0]);
  const clothPosition = cloth.geometry.getAttribute("position");
  for (let i = 0; i < clothPosition.count; i++) clothPosition.setZ(i, Math.sin(clothPosition.getX(i) * 12) * .009 + Math.sin(clothPosition.getY(i) * 10) * .005);
  cloth.geometry.computeVertexNormals(); cloth.rotation.x = -Math.PI / 2;
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-.87,-.15);
  bladeShape.bezierCurveTo(-.78,.22,-.45,.53,-.05,.55);
  bladeShape.bezierCurveTo(.36,.58,.69,.39,.89,.03);
  bladeShape.bezierCurveTo(.56,.23,.27,.27,-.03,.22);
  bladeShape.bezierCurveTo(-.33,.17,-.58,-.02,-.67,-.21);
  bladeShape.bezierCurveTo(-.74,-.32,-.84,-.27,-.87,-.15);
  const blade = mesh(bladeFocus, horizontalExtrusion(bladeShape, .072, .019), stone, [0,.21,-.02]);
  blade.rotation.z = -.055; blade.rotation.y = .035;
  const edgeShape = new THREE.Shape();
  edgeShape.moveTo(-.79,-.12); edgeShape.bezierCurveTo(-.59,.18,-.31,.37,.02,.39); edgeShape.bezierCurveTo(.36,.42,.66,.25,.89,.03);
  edgeShape.bezierCurveTo(.56,.23,.27,.27,-.03,.22); edgeShape.bezierCurveTo(-.33,.17,-.58,-.02,-.67,-.21); edgeShape.lineTo(-.79,-.12);
  const bladeLip = mesh(bladeFocus, horizontalExtrusion(edgeShape, .008), stoneEdge, [0,.305,-.02]); bladeLip.rotation.z = -.055;
  tag(bladeFocus, "砭镰 · 灰石弧刃", "器形艺术示意", .96, [.37,.31,.73], bronze);

  // Focus 2: an open earthenware vessel and seeds with readable fine creases.
  const seedFocus = new THREE.Group();
  seedFocus.name = "陶与种仁 · 文化艺术示意";
  seedFocus.userData = { focusId: "taixi-seeds", label: "桃仁与郁李仁意象 · 艺术示意" };
  seedFocus.position.set(1.55, 0.015, 1.15); seedFocus.rotation.y = -.12;
  root.add(seedFocus);
  mesh(seedFocus, horizontalExtrusion(roundedShape(1.98, 1.69, .16), .08, .012), woodEdge, [0,0,.05]);
  mesh(seedFocus, horizontalExtrusion(roundedShape(1.82, 1.53, .13), .012), linen, [0,.095,.05]);
  const potProfile: Point2[] = [[0,.09],[.28,.09],[.34,.14],[.39,.25],[.48,.47],[.51,.71],[.47,.94],[.36,1.1],[.3,1.19],[.3,1.34],[.335,1.37],[.34,1.4],[.29,1.4],[.272,1.34],[.27,1.2],[.31,1.1],[.4,.93],[.43,.7],[.4,.47],[.31,.27],[.21,.18],[0,.18]];
  lathe(seedFocus, potProfile, clay, [.34,.1,-.28]);
  [.3, .315].forEach((radius, i) => { const ring = mesh(seedFocus, new THREE.TorusGeometry(radius,.012,6,48), clayInside, [.34,1.39 + i*.075,-.28]); ring.rotation.x = Math.PI / 2; });
  lathe(seedFocus, [[0,0],[.34,0],[.48,.07],[.55,.16],[.56,.2],[.52,.21],[.48,.16],[.34,.07],[0,.055]], clayInside, [-.43,.13,.49], 48);
  const seedGeometry = new THREE.SphereGeometry(1, 14, 10);
  const seedVertices = seedGeometry.getAttribute("position");
  for (let i = 0; i < seedVertices.count; i++) {
    const y = seedVertices.getY(i), x = seedVertices.getX(i), z = seedVertices.getZ(i);
    const irregularity = 1 + Math.sin(Math.atan2(z,x) * 7) * .045 + Math.sin(y * 12) * .02;
    seedVertices.setXYZ(i, x * irregularity * (1 - Math.abs(y) * .1), y, z * irregularity);
  }
  seedGeometry.computeVertexNormals();
  const kernels = new THREE.InstancedMesh(seedGeometry, kernelMaterial, 27);
  const temporary = new THREE.Object3D();
  for (let i = 0; i < 27; i++) {
    if (i < 19) {
      const angle = i * 2.39996, radius = .4 * Math.sqrt(i / 19);
      temporary.position.set(-.43 + Math.cos(angle) * radius, .365 + Math.sin(i * 1.2) * .012, .49 + Math.sin(angle) * radius);
      temporary.scale.set(.095 + random() * .04,.047 + random() * .014,.065 + random() * .02);
    } else if (i < 24) {
      temporary.position.set(.34 + (random()-.5)*.31,1.36 + random()*.04,-.28 + (random()-.5)*.29);
      temporary.scale.set(.09,.047,.065);
    } else {
      temporary.position.set(-.58 + (i-24)*.29,.18,-.22 - (i-24)*.1);
      temporary.scale.set(.145,.062,.092);
    }
    temporary.rotation.set(.1, random() * TAU, (random()-.5)*.25);
    if (i >= 24) temporary.rotation.set(.02,0,0);
    temporary.updateMatrix(); kernels.setMatrixAt(i,temporary.matrix);
    kernels.setColorAt(i,new THREE.Color().setHSL(.09 + random()*.025,.32,.53 + random()*.1));
  }
  kernels.castShadow = kernels.receiveShadow = true; seedFocus.add(kernels);
  for (let i = 0; i < 3; i++) {
    const x = -.58 + i*.29, z = -.22-i*.1;
    const crease = new THREE.CatmullRomCurve3([new THREE.Vector3(x-.1,.235,z),new THREE.Vector3(x,.245,z+.008),new THREE.Vector3(x+.1,.235,z)]);
    mesh(seedFocus,new THREE.TubeGeometry(crease,10,.005,4,false),kernelCrease);
  }
  tag(seedFocus,"桃仁 · 郁李仁","种仁意象 · 艺术示意",1.03,[.34,.29,.96],bronze);

  // Conservation tools and a restrained interpretation board at the rear.
  const brush = new THREE.Group(); brush.position.set(1.6,.075,-.85); brush.rotation.y = -.6; root.add(brush);
  rod(brush,new THREE.Vector3(-.52,0,0),new THREE.Vector3(.3,0,0),.031,wood);
  rod(brush,new THREE.Vector3(.28,0,0),new THREE.Vector3(.43,0,0),.045,bronze);
  const bristles = mesh(brush,new THREE.CylinderGeometry(.085,.04,.26,12),ropeMaterial,[.56,0,0]); bristles.rotation.z = -Math.PI / 2; bristles.scale.z = .62;
  const toolsTray = mesh(root,horizontalExtrusion(roundedShape(1.35,.73,.1),.07,.012),woodEdge,[2.45,.02,-1.16]); toolsTray.rotation.y = .2;
  for (let i = 0; i < 4; i++) { const fragment = mesh(root,shards[i%3],clay,[2.14+(i%2)*.39,.12,-1.36+Math.floor(i/2)*.36]); fragment.scale.setScalar(.65); fragment.rotation.y = i*.8; }
  tag(root,"台西 · 土中回声","文化艺术示意 · 非考古复原",1.95,[2.15,1.53,-2.54],bronze);
  tag(root,"探方与剖面","空间组合为艺术创作",1.04,[-2.78,.53,-1.4],bronze).rotation.y = .2;

  // Shared geometry/instancing keeps the loose earth and plants inexpensive.
  const pebbleGeometry = new THREE.IcosahedronGeometry(1,1);
  const pebbles = new THREE.InstancedMesh(pebbleGeometry,new THREE.MeshStandardMaterial({color:0xad9874,roughness:1}),72);
  for (let i = 0; i < 72; i++) {
    const angle = random()*TAU, radius = 2.9 + random()*1.6;
    temporary.position.set(Math.cos(angle)*radius,.025,Math.sin(angle)*radius*.77);
    temporary.rotation.set(random()*2,random()*TAU,random()*2);
    const size=.025+random()*.065; temporary.scale.set(size*1.4,size*.7,size); temporary.updateMatrix(); pebbles.setMatrixAt(i,temporary.matrix);
    pebbles.setColorAt(i,new THREE.Color().setHSL(.09+random()*.03,.15+random()*.15,.39+random()*.18));
  }
  pebbles.castShadow = pebbles.receiveShadow = true; root.add(pebbles);
  const leafGeometry = new THREE.BufferGeometry();
  leafGeometry.setAttribute("position",new THREE.Float32BufferAttribute([0,0,0,-.065,.25,.015,-.045,.49,-.08,0,.67,-.2,.045,.49,-.08,.065,.25,.015,0,.28,.055],3));
  leafGeometry.setIndex([0,1,6,1,2,6,2,3,6,3,4,6,4,5,6,5,0,6]); leafGeometry.computeVertexNormals();
  const foliage = new THREE.InstancedMesh(leafGeometry,new THREE.MeshStandardMaterial({color:0x748467,roughness:1,side:THREE.DoubleSide}),56);
  const plantCenters = [[-4.02,.46],[-3.51,-1.95],[3.43,-1.43],[3.89,.65],[2.82,2.4],[-.8,3.22],[.8,-3.48]];
  for (let i=0;i<56;i++) {
    const center=plantCenters[Math.floor(i/8)];
    temporary.position.set(center[0]+(random()-.5)*.24,.015,center[1]+(random()-.5)*.2);
    temporary.rotation.set((random()-.5)*.2,i*2.399,.05); temporary.scale.setScalar(.52+random()*.5); temporary.updateMatrix(); foliage.setMatrixAt(i,temporary.matrix);
    foliage.setColorAt(i,new THREE.Color().setHSL(.19+random()*.06,.18+random()*.13,.32+random()*.12));
  }
  foliage.castShadow = foliage.receiveShadow = true; root.add(foliage);

  // Propagate focus IDs to surfaces for raycasters that inspect the first hit.
  [bladeFocus,seedFocus].forEach((group) => group.traverse((child) => { child.userData.focusId = group.userData.focusId; }));
  return root;
}
