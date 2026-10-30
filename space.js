import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

// Artistic scene, not a real-time astronomical simulation. Units: Earth radius = 100.
export function setupSpace(globe) {
  const scene = globe.scene();
  const group = new THREE.Group();
  group.name = 'memorial-space';
  scene.add(group);
  let seed = 1979;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  const positions = [];
  for (let i = 0; i < 2200; i++) {
    const z = random() * 2 - 1, angle = random() * Math.PI * 2;
    const radius = 1800, ring = Math.sqrt(1 - z * z);
    positions.push(radius * ring * Math.cos(angle), radius * z, radius * ring * Math.sin(angle));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  group.add(new THREE.Points(geometry, new THREE.PointsMaterial({color: 0xdce9ff, size: 2.2, sizeAttenuation: false})));

  const sun = new THREE.Mesh(new THREE.SphereGeometry(45, 32, 24), new THREE.MeshBasicMaterial({color: 0xffdf9b}));
  sun.position.set(-300, 80, -120);
  group.add(sun);
  const light = new THREE.DirectionalLight(0xfff0d8, 2.6);
  light.position.copy(sun.position);
  globe.lights([new THREE.AmbientLight(0x9bb8e8, 0.35), light]);
  const earthMaterial = globe.globeMaterial();
  earthMaterial.shininess = 5;
  earthMaterial.emissive.set(0x000000);

  // Original procedural moon texture: no third-party photograph or city lights.
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#a3a3a0'; ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 650; i++) {
    const x = random() * 512, y = random() * 256, r = 1 + random() * 12;
    ctx.fillStyle = `rgba(35,35,33,${0.08 + random() * 0.2})`;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.65, 0, 0, Math.PI * 2); ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const moon = new THREE.Mesh(new THREE.SphereGeometry(27, 40, 32), new THREE.MeshPhongMaterial({map: texture, shininess: 0}));
  moon.position.set(260, 90, -270);
  group.add(moon);
  globe.controls().enablePan = false;
  globe.controls().maxDistance = 800;
  globe.camera().far = Math.max(globe.camera().far, 4000);
  globe.camera().updateProjectionMatrix();
  return () => {
    scene.remove(group);
    group.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });
    texture.dispose();
    light.dispose();
  };
}
