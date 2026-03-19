import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function initCourtroomScene(container: HTMLDivElement) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e1a);
  scene.fog = new THREE.FogExp2(0x0a0e1a, 0.04);

  // Camera
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.set(0, 3.5, 6);
  camera.lookAt(0, 0.5, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Orbit Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 3;
  controls.maxDistance = 15;
  controls.target.set(0, 0.5, 0);

  // ── Lighting ──

  // Ambient
  const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
  scene.add(ambientLight);

  // Main spotlight (from above, casts shadows)
  const mainLight = new THREE.SpotLight(0xfff5e8, 30, 25, Math.PI / 4, 0.5, 1);
  mainLight.position.set(0, 10, 2);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  scene.add(mainLight);

  // Accent lights
  const accentLight1 = new THREE.PointLight(0x6366f1, 8, 12);
  accentLight1.position.set(-4, 3, -2);
  scene.add(accentLight1);

  const accentLight2 = new THREE.PointLight(0x8b5cf6, 6, 12);
  accentLight2.position.set(4, 3, -2);
  scene.add(accentLight2);

  // ── Floor ──
  const floorGeo = new THREE.PlaneGeometry(20, 20);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a1e2e,
    roughness: 0.3,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Floor grid
  const gridHelper = new THREE.GridHelper(20, 40, 0x2a2e40, 0x1e2234);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // ── Materials ──
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.6, metalness: 0.1 });
  const lightWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a3528, roughness: 0.5, metalness: 0.05 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.2, metalness: 0.8 });

  // ── Judge's Bench (elevated) ──
  const benchBase = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 1), darkWoodMat);
  benchBase.position.set(0, 0.6, -3.5);
  benchBase.castShadow = true;
  benchBase.receiveShadow = true;
  scene.add(benchBase);

  const benchTop = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 1.2), lightWoodMat);
  benchTop.position.set(0, 1.25, -3.5);
  benchTop.castShadow = true;
  scene.add(benchTop);

  // Judge nameplate
  const nameplateMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.7 });
  const nameplate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.05), nameplateMat);
  nameplate.position.set(0, 1.35, -2.98);
  scene.add(nameplate);

  // ── Gavel ──
  const gavelHead = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16), darkWoodMat);
  gavelHead.rotation.z = Math.PI / 2;
  gavelHead.position.set(0.6, 1.36, -3.3);
  gavelHead.castShadow = true;
  scene.add(gavelHead);

  const gavelHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), lightWoodMat);
  gavelHandle.position.set(0.6, 1.36, -3.3);
  gavelHandle.castShadow = true;
  scene.add(gavelHandle);

  // ── Party Tables ──
  function createTable(x: number, z: number) {
    const group = new THREE.Group();
    // Table top
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.8), lightWoodMat);
    top.position.y = 0.75;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8);
    const positions = [[-0.8, 0.375, -0.3], [0.8, 0.375, -0.3], [-0.8, 0.375, 0.3], [0.8, 0.375, 0.3]];
    positions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, metalMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    group.position.set(x, 0, z);
    return group;
  }

  const plaintiffTable = createTable(-2, -0.5);
  scene.add(plaintiffTable);
  const defendantTable = createTable(2, -0.5);
  scene.add(defendantTable);

  // ── Chairs (simple) ──
  function createChair(x: number, z: number, rotY: number) {
    const group = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), darkWoodMat);
    seat.position.y = 0.45;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.06), darkWoodMat);
    back.position.set(0, 0.75, -0.22);
    group.add(back);

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    return group;
  }

  scene.add(createChair(-2, 0.2, 0));
  scene.add(createChair(2, 0.2, 0));
  scene.add(createChair(0, -3.0, Math.PI)); // Judge

  // ── Railing / Bar ──
  const railMat = new THREE.MeshStandardMaterial({ color: 0x3a2820, roughness: 0.4, metalness: 0.3 });
  const railBar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.06, 0.06), railMat);
  railBar.position.set(0, 0.9, -1.8);
  scene.add(railBar);

  // Rail posts
  for (let x = -3; x <= 3; x += 1.5) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), railMat);
    post.position.set(x, 0.45, -1.8);
    scene.add(post);
  }

  // ── Floating holographic scales of justice ──
  const scalesGroup = new THREE.Group();
  scalesGroup.position.set(0, 3.5, -3.5);

  const glowMat = new THREE.MeshBasicMaterial({ 
    color: 0x6366f1, 
    transparent: true, 
    opacity: 0.6 
  });

  // Center post
  const scalePost = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8), glowMat);
  scalesGroup.add(scalePost);

  // Beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.03), glowMat);
  beam.position.y = 0.4;
  scalesGroup.add(beam);

  // Pans
  const panGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.05, 16);
  const pan1 = new THREE.Mesh(panGeo, glowMat);
  pan1.position.set(-0.5, 0.1, 0);
  scalesGroup.add(pan1);

  const pan2 = new THREE.Mesh(panGeo, glowMat);
  pan2.position.set(0.5, 0.25, 0);
  scalesGroup.add(pan2);

  scene.add(scalesGroup);

  // ── Animation Loop ──
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Gentle float for scales
    scalesGroup.position.y = 3.5 + Math.sin(elapsed * 0.8) * 0.1;
    scalesGroup.rotation.y = elapsed * 0.15;

    // Accent light pulse
    accentLight1.intensity = 8 + Math.sin(elapsed * 1.5) * 2;
    accentLight2.intensity = 6 + Math.cos(elapsed * 1.2) * 2;

    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  // ── Resize Handler ──
  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(container);

  return { scene, camera, renderer, cleanup: () => { resizeObserver.disconnect(); } };
}