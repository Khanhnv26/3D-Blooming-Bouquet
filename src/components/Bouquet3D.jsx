import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sparkles, ContactShadows } from '@react-three/drei';

/* ------------------------------------------------------------------ */
/* Math & Animation Helpers                                            */
/* ------------------------------------------------------------------ */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (x) => x * x * (3 - 2 * x);
const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);

/* ------------------------------------------------------------------ */
/* 1. Procedural In-Memory Canvas Textures (Micro-noise & Soft Bokeh)  */
/* ------------------------------------------------------------------ */
function createPaperNoiseTexture() {
  if (typeof document === 'undefined') return null;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Multi-scale micro noise simulating fine cotton paper tooth & woven textile fibers
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const n1 = (Math.random() - 0.5) * 38;
      const n2 = Math.sin(x * 0.75) * Math.cos(y * 0.75) * 12;
      const val = Math.min(255, Math.max(0, 128 + n1 + n2));
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.needsUpdate = true;
  return texture;
}

function createBokehTexture() {
  if (typeof document === 'undefined') return null;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0.0, 'rgba(255, 252, 235, 1.0)'); // luminous warm white-gold center
  gradient.addColorStop(0.25, 'rgba(253, 224, 71, 0.85)'); // golden aura
  gradient.addColorStop(0.55, 'rgba(251, 146, 60, 0.35)'); // warm sunset amber
  gradient.addColorStop(0.85, 'rgba(244, 63, 94, 0.08)');  // soft feathered rose fringe
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');        // transparent fade

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

let cachedTextures = null;
function getSharedTextures() {
  if (!cachedTextures && typeof document !== 'undefined') {
    cachedTextures = {
      noise: createPaperNoiseTexture(),
      bokeh: createBokehTexture(),
    };
  }
  return cachedTextures || { noise: null, bokeh: null };
}

/* ------------------------------------------------------------------ */
/* Procedural Velvet Petal Geometry with Natural Curvature & Ruffles  */
/* ------------------------------------------------------------------ */
function makePetal({ w, l, cup = 0.52, curl = 0.28, ruffle = 0, seg = [12, 14] }) {
  const g = new THREE.PlaneGeometry(1, 1, seg[0], seg[1]);
  const pos = g.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i);
    const v = clamp(pos.getY(i) + 0.5, 0, 1); // 0 (base) to 1 (tip) safely clamped!

    // Elliptical teardrop petal profile with natural taper
    const prof = Math.pow(Math.max(0, Math.sin(Math.PI * (0.07 + 0.93 * v))), 0.6);
    const nx = 2 * u * prof;
    const x = nx * w;
    const y = v * l;

    // Organic double-curvature bowl + tip curl + edge ripple
    const z =
      -cup * w * nx * nx * (0.45 + 0.85 * v) +
      curl * l * Math.pow(v, 2.5) +
      ruffle * w * Math.sin(u * 16 + v * 7.5) * Math.pow(v, 1.3);

    pos.setXYZ(i, x, y, z);

    // Natural gradient: deeper at the petal base, radiant towards the rim
    const shade = 0.76 + 0.24 * Math.pow(v, 0.65);
    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade * 0.96;
    colors[i * 3 + 2] = shade;
  }

  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/* Procedural 3D Curved Botanical Leaf Geometry (Lá bo tròn mềm mại)   */
/* ------------------------------------------------------------------ */
function makeEucalyptusLeaf(w, l) {
  const g = new THREE.PlaneGeometry(1, 1, 14, 16);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const rawX = pos.getX(i); // -0.5 to 0.5
    const v = clamp(pos.getY(i) + 0.5, 0, 1); // 0 (base) to 1 (tip)

    // Smooth organic teardrop profile: tapered base, rounded belly, soft pointed tip
    const profile = Math.sin(v * Math.PI) * Math.pow(1.0 - v * 0.32, 0.45);
    const x = rawX * w * 2.0 * profile;
    const y = (v - 0.5) * l;

    // Organic 3D curvature: arches naturally backwards + soft central crease
    const arch = -0.045 * Math.sin(v * Math.PI) * l;
    const uNorm = rawX * 2.0;
    const veinCrease = 0.02 * (1.0 - Math.abs(uNorm)) * Math.sin(v * Math.PI);
    const z = arch + veinCrease;

    pos.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/* Botanical Flower Specifications & Palette Definitions               */
/* ------------------------------------------------------------------ */
const L = (n, r, l, w, t0, t1, color, extra = {}) => ({
  n,
  r,
  t0,
  t1,
  color,
  off: extra.off,
  geo: { w, l, cup: extra.cup ?? 0.52, curl: extra.curl ?? 0.28, ruffle: extra.ruffle ?? 0 },
});

const ROSE_LAYERS = (c) => [
  L(3, 0.015, 0.38, 0.14, 0.05, 0.12, c[0], { cup: 0.95, curl: 0.06 }),
  L(4, 0.026, 0.46, 0.19, 0.1, 0.36, c[1], { cup: 0.86, curl: 0.14 }),
  L(5, 0.046, 0.54, 0.24, 0.2, 0.66, c[2], { cup: 0.76, curl: 0.24 }),
  L(6, 0.068, 0.6, 0.29, 0.34, 0.96, c[3], { cup: 0.66, curl: 0.34, ruffle: 0.02 }),
  L(7, 0.088, 0.66, 0.34, 0.5, 1.28, c[4], { cup: 0.56, curl: 0.48, ruffle: 0.04 }),
];

const SPECS = {
  rose: {
    scale: 0.66,
    sepal: 0.14,
    // Deep Velvet Ohara Rose: Crimson core blooming to radiant coral blush
    layers: ROSE_LAYERS(['#7f1d1d', '#991b1b', '#be123c', '#e11d48', '#fb7185']),
  },
  spray: {
    scale: 0.40,
    sepal: 0.11,
    // Sweet Coral Spray Rose
    layers: ROSE_LAYERS(['#9f1239', '#e11d48', '#f43f5e', '#fb7185', '#fce7f3']),
  },
  peony: {
    scale: 0.63,
    sepal: 0.16,
    // Lush Peach & Milk Cream Peony
    layers: [
      L(5, 0.02, 0.32, 0.18, 0.1, 0.3, '#c2410c', { cup: 0.78, ruffle: 0.04, curl: 0.2 }),
      L(6, 0.04, 0.42, 0.23, 0.2, 0.5, '#ea580c', { cup: 0.68, ruffle: 0.05, curl: 0.25 }),
      L(7, 0.06, 0.52, 0.28, 0.3, 0.75, '#f97316', { cup: 0.58, ruffle: 0.06, curl: 0.3 }),
      L(8, 0.08, 0.6, 0.32, 0.45, 1.0, '#fb923c', { cup: 0.48, ruffle: 0.07, curl: 0.35 }),
      L(9, 0.1, 0.66, 0.36, 0.6, 1.28, '#fed7aa', { cup: 0.4, ruffle: 0.08, curl: 0.4 }),
      L(10, 0.12, 0.72, 0.4, 0.75, 1.52, '#fff7ed', { cup: 0.34, ruffle: 0.09, curl: 0.46 }),
    ],
  },
  tulip: {
    scale: 0.58,
    sepal: 0,
    // Sunrise Coral Tulip
    layers: [
      L(3, 0.05, 0.88, 0.3, 0.08, 0.32, '#b91c1c', { cup: 0.95, curl: 0.16, off: 0 }),
      L(3, 0.04, 0.82, 0.28, 0.04, 0.22, '#f43f5e', { cup: 0.95, curl: 0.14, off: Math.PI / 3 }),
    ],
  },
  tana: {
    scale: 0.66,
    sepal: 0.12,
    center: '#d97706',
    // Warm Buttercream Chamomile Daisy with Deep Golden Center (Crisp separation from ivory wrap)
    layers: [
      L(16, 0.07, 0.45, 0.092, 0.7, 1.4, '#fef08a', { cup: 0.22, curl: 0.20 }),
      L(14, 0.06, 0.39, 0.092, 0.6, 1.32, '#fef9c3', { cup: 0.22, curl: 0.20, off: 0.2 }),
    ],
  },
};

/* ------------------------------------------------------------------ */
/* 16 Flowers Balanced Florist Layout (Thoáng đãng, có khoảng thở)    */
/* ------------------------------------------------------------------ */
const DOME_CENTER = new THREE.Vector3(0, -0.02, 0);
const DOME_R = 1.70;
const STEM_BASE = new THREE.Vector3(0, -2.15, 0);

// 3 Balanced Tiers: 1 Center Crown + 5 Upper Ring + 10 Lower Collar
const FLOWER_TIERS = [
  // Tier 1: Center Crown (Polar = 0°)
  { id: 0, kind: 'rose', polar: 0, az: 0 },

  // Tier 2: Upper Ring (5 flowers, Polar = 26°, 72° apart)
  { id: 1, kind: 'peony', polar: 26, az: 0 },
  { id: 2, kind: 'tulip', polar: 26, az: 72 },
  { id: 3, kind: 'rose', polar: 26, az: 144 },
  { id: 4, kind: 'peony', polar: 26, az: 216 },
  { id: 5, kind: 'spray', polar: 26, az: 288 },

  // Tier 3: Lower Collar Ring (10 flowers, Polar = 54°, 36° apart, offset 18°)
  { id: 6, kind: 'peony', polar: 54, az: 18 },
  { id: 7, kind: 'tulip', polar: 54, az: 54 },
  { id: 8, kind: 'rose', polar: 54, az: 90 },
  { id: 9, kind: 'spray', polar: 54, az: 126 },
  { id: 10, kind: 'tana', polar: 54, az: 162 },
  { id: 11, kind: 'peony', polar: 54, az: 198 },
  { id: 12, kind: 'tulip', polar: 54, az: 234 },
  { id: 13, kind: 'rose', polar: 54, az: 270 },
  { id: 14, kind: 'spray', polar: 54, az: 306 },
  { id: 15, kind: 'tana', polar: 54, az: 342 },
];

const FLOWERS = FLOWER_TIERS.map((f, i) => {
  const polarRad = (f.polar * Math.PI) / 180;
  const azRad = (f.az * Math.PI) / 180;
  const dir = new THREE.Vector3(
    Math.sin(polarRad) * Math.cos(azRad),
    Math.cos(polarRad),
    Math.sin(polarRad) * Math.sin(azRad)
  );
  const pos = DOME_CENTER.clone().addScaledVector(dir, DOME_R);
  const quat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir);
  return { id: f.id, kind: f.kind, dir, pos, quat, roll: (i * 1.7) % (Math.PI * 2), delay: 0.35 + (f.polar / 60) * 0.45 };
});

/* ------------------------------------------------------------------ */
/* Stems                                                               */
/* ------------------------------------------------------------------ */
const Stem = memo(function Stem({ to }) {
  const { pos, quat, len } = useMemo(() => {
    const d = to.clone().sub(STEM_BASE);
    const length = d.length();
    return {
      pos: STEM_BASE.clone().add(to).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(Y_AXIS, d.normalize()),
      len: length,
    };
  }, [to]);

  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[0.024, 0.032, len, 6]} />
      <meshStandardMaterial color="#2d5a27" roughness={0.7} />
    </mesh>
  );
});

/* ------------------------------------------------------------------ */
/* Quest Beacon (Đốm sao vàng lấp lánh dẫn lối người thương)          */
/* ------------------------------------------------------------------ */
function QuestBeacon({ active, collected }) {
  const haloRef = useRef();
  const starRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 1.6;
      const s = 1 + 0.22 * Math.sin(t * 3.5);
      haloRef.current.scale.set(s, s, s);
    }
    if (starRef.current) {
      starRef.current.position.y = 0.52 + 0.07 * Math.sin(t * 4);
      starRef.current.rotation.y = t * 2.6;
      starRef.current.rotation.x = t * 1.8;
    }
  });

  if (collected) {
    return (
      <group position-y={0.4}>
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[0.12, 0.16, 24]} />
          <meshBasicMaterial color="#f43f5e" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group position-y={0.38}>
      {/* Outer pulsing beacon ring */}
      <mesh ref={haloRef} rotation-x={Math.PI / 2}>
        <ringGeometry args={[0.18, 0.26, 28]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={active ? 0.95 : 0.75} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating 3D golden star diamond */}
      <group ref={starRef}>
        <mesh scale={[0.09, 0.14, 0.09]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={2.8}
            roughness={0.15}
            toneMapped={false}
          />
        </mesh>
      </group>

      <pointLight color="#fde047" intensity={0.65} distance={1.2} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Individual Flower Component with Velvet Shading & Touch Target     */
/* ------------------------------------------------------------------ */
const Flower = memo(function Flower({ data, active, isQuest, isCollected, onPick, startRef }) {
  const { id, kind, dir, pos, quat, roll, delay } = data;
  const spec = SPECS[kind];
  const wrap = useRef();
  const head = useRef();
  const petals = useRef([]);
  const pop = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  const geoms = useMemo(() => spec.layers.map((l) => makePetal(l.geo)), [spec]);
  const mats = useMemo(() => {
    const noise = getSharedTextures().noise;
    return spec.layers.map(
      (l, idx) =>
        new THREE.MeshPhysicalMaterial({
          color: l.color,
          vertexColors: true,
          side: THREE.DoubleSide,
          roughness: 0.80,
          metalness: 0.0,
          clearcoat: 0.0,
          sheen: 0.45,
          sheenRoughness: 0.85,
          sheenColor: new THREE.Color('#fda4af'),
          bumpMap: noise,
          bumpScale: 0.016,
          emissive: idx < 2 ? '#881337' : '#000000',
          emissiveIntensity: idx < 2 ? 0.22 : 0,
        })
    );
  }, [spec]);

  useEffect(
    () => () => {
      geoms.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    },
    [geoms, mats]
  );

  useFrame((state, delta) => {
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - startRef.current - delay;

    const appear = smooth(clamp((t + 0.5) / 0.5, 0, 1));
    const open = smooth(clamp(t / 1.7, 0, 1));
    const s = spec.scale * (appear * 0.35 + 0.65 * open);

    pop.current = THREE.MathUtils.damp(pop.current, activeRef.current ? 1 : 0, 7, delta);
    const p = pop.current;

    if (wrap.current) {
      wrap.current.position.copy(pos).addScaledVector(dir, p * 0.35);
      wrap.current.scale.setScalar(1 + p * 0.24);
    }
    if (head.current) {
      head.current.scale.setScalar(Math.max(s, 0.0001));
      const tt = state.clock.elapsedTime;
      head.current.rotation.x = Math.sin(tt * 1.2 + id) * 0.04;
      head.current.rotation.z = Math.sin(tt * 1.0 + id * 2) * 0.04 + Math.sin(tt * 32) * 0.1 * p;
    }
    petals.current.forEach((g) => {
      if (!g) return;
      const { li, c, o } = g.userData;
      const b = smooth(clamp((t - li * 0.11) / 1.4, 0, 1));
      g.rotation.x = c + (o - c) * b;
    });
  });

  let counter = 0;
  return (
    <>
      <Stem to={pos} />
      <group ref={wrap} position={pos} quaternion={quat}>
        <group
          ref={head}
          rotation-y={roll}
          onClick={(e) => {
            e.stopPropagation();
            onPick(kind, id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {spec.layers.map((layer, li) =>
            Array.from({ length: layer.n }).map((_, pi) => {
              const idx = counter++;
              const az = (pi / layer.n) * Math.PI * 2 + (layer.off ?? li * 0.55);
              return (
                <group key={`${li}-${pi}`} rotation-y={az}>
                  <group
                    position-z={layer.r}
                    rotation-x={layer.t0}
                    userData={{ li, c: layer.t0, o: layer.t1 }}
                    ref={(el) => {
                      petals.current[idx] = el;
                    }}
                  >
                    <mesh geometry={geoms[li]} material={mats[li]} />
                  </group>
                </group>
              );
            })
          )}
          {spec.center && (
            <mesh position-y={0.06} scale={[1, 0.65, 1]}>
              <sphereGeometry args={[0.13, 16, 12]} />
              <meshStandardMaterial color={spec.center} roughness={0.35} emissive="#f59e0b" emissiveIntensity={0.4} />
            </mesh>
          )}
          {spec.sepal > 0 && (
            <mesh position-y={-0.01} scale={[1, 0.45, 1]}>
              <sphereGeometry args={[spec.sepal, 12, 10]} />
              <meshStandardMaterial color="#2d5a27" roughness={0.8} />
            </mesh>
          )}

          {/* Generous touch target area */}
          <mesh position-y={0.2}>
            <sphereGeometry args={[0.55, 10, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Interactive Quest Indicator Beacon */}
          {isQuest && <QuestBeacon active={active} collected={isCollected} />}
        </group>
      </group>
    </>
  );
});



/* ------------------------------------------------------------------ */
/* 4. Smooth Multi-Frequency Korean Fluted Paper Geometry             */
/* ------------------------------------------------------------------ */
function makePaper(rTop, rBot, h, flutes, amp, rimWave) {
  // High-density mesh: 256 radial segments, 64 height segments for buttery-smooth drape
  const g = new THREE.CylinderGeometry(rTop, rBot, h, 256, 64, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    const t = clamp((y + h / 2) / h, 0, 1); // Safely clamped to prevent NaN!
    const a = Math.atan2(z, x);

    // Multi-frequency harmonic folding waves (flute + secondary cloth drapes)
    const wave1 = Math.sin(a * flutes);
    const wave2 = Math.sin(a * (flutes * 2.1) + 1.2) * 0.32;
    const wave3 = Math.cos(a * (flutes * 0.5) - 0.7) * 0.18;
    const combinedWave = wave1 + wave2 + wave3;

    const f = 1 + amp * Math.pow(t, 1.35) * combinedWave;
    x *= f;
    z *= f;

    // Multi-frequency organic scalloped rim wave (smooth cloth drape without sharp kinks)
    const rimHarmonic =
      Math.sin(a * (flutes / 2) + 1.0) * 0.72 +
      Math.sin(a * flutes + 2.3) * 0.22 +
      Math.cos(a * 3.0) * 0.12;
    y += rimWave * Math.pow(t, 5) * rimHarmonic;

    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

function Paper({ startRef }) {
  const group = useRef();
  const geos = useMemo(
    () => ({
      outer: makePaper(1.82, 0.16, 2.36, 14, 0.08, 0.16),
      inner: makePaper(1.76, 0.14, 2.52, 12, 0.06, 0.11),
      sleeve: makePaper(1.62, 0.22, 1.62, 10, 0.09, 0.07),
    }),
    []
  );

  const mats = useMemo(() => {
    const noise = getSharedTextures().noise;
    return {
      inner: new THREE.MeshPhysicalMaterial({
        color: '#fffdf5', // Frosted ivory silk paper
        roughness: 0.95,
        metalness: 0.0,
        clearcoat: 0.0,
        sheen: 0.25,
        sheenRoughness: 0.85,
        sheenColor: new THREE.Color('#fef08a'),
        bumpMap: noise,
        bumpScale: 0.02,
        side: THREE.DoubleSide,
      }),
      outer: new THREE.MeshPhysicalMaterial({
        color: '#fbcfe8', // Soft blush pink fine art paper
        roughness: 0.95,
        metalness: 0.0,
        clearcoat: 0.0,
        sheen: 0.22,
        sheenRoughness: 0.85,
        sheenColor: new THREE.Color('#fda4af'),
        bumpMap: noise,
        bumpScale: 0.02,
        side: THREE.DoubleSide,
      }),
      sleeve: new THREE.MeshPhysicalMaterial({
        color: '#be123c', // Deep matte crimson kraft cuff (100% matte, zero shine)
        roughness: 0.95,
        metalness: 0.0,
        clearcoat: 0.0,
        sheen: 0.15,
        sheenRoughness: 0.90,
        sheenColor: new THREE.Color('#fb7185'),
        bumpMap: noise,
        bumpScale: 0.025,
        side: THREE.DoubleSide,
      }),
    };
  }, []);

  useEffect(() => () => {
    Object.values(geos).forEach((g) => g.dispose());
    Object.values(mats).forEach((m) => m.dispose());
  }, [geos, mats]);

  useFrame((state) => {
    if (startRef.current === null) return;
    const since = state.clock.elapsedTime - startRef.current;
    const e = easeOutBack(clamp(since / 1.3, 0, 1));
    if (group.current) group.current.scale.setScalar(Math.max(0.2 + 0.8 * e, 0.01));
  });

  return (
    <group ref={group} position={[0, -2.15, 0]}>
      {/* Inner frosted ivory translucent silk paper */}
      <mesh geometry={geos.inner} material={mats.inner} position-y={1.50} />
      {/* Outer soft blush pink paper */}
      <mesh geometry={geos.outer} material={mats.outer} position-y={1.30} />
      {/* Sleeve cuff */}
      <mesh geometry={geos.sleeve} material={mats.sleeve} position-y={0.90} rotation-y={0.2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Realistic 3D Silver Dollar Eucalyptus Leaves (Lá cong không xuyên hoa) */
/* ------------------------------------------------------------------ */
function Greenery() {
  const leafGeo = useMemo(() => makeEucalyptusLeaf(0.19, 0.29), []);
  const leafMat = useMemo(() => {
    const noise = getSharedTextures().noise;
    return new THREE.MeshPhysicalMaterial({
      color: '#264e36', // Deep elegant botanical eucalyptus green
      side: THREE.DoubleSide,
      roughness: 0.88,
      metalness: 0.0,
      clearcoat: 0.0,
      sheen: 0.30,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color('#6ee7b7'),
      bumpMap: noise,
      bumpScale: 0.018,
    });
  }, []);

  useEffect(() => () => {
    leafGeo.dispose();
    leafMat.dispose();
  }, [leafGeo, leafMat]);

  const leaves = useMemo(() => {
    const r = rng(53);
    const result = [];
    const N = 10;
    for (let i = 0; i < N; i++) {
      const az = (i / N) * Math.PI * 2 + (r() - 0.5) * 0.18;
      const azDeg = ((az * 180) / Math.PI) % 360;

      // Special handling around orange flowers on left (az 170° - 250°):
      // Push polar downward to 65° so leaf stays safely below the flowers and drapes down
      const isLeft = azDeg > 170 && azDeg < 250;
      const polar = (isLeft ? 65 + r() * 4 : 58 + r() * 6) * (Math.PI / 180);

      const dir = new THREE.Vector3(
        Math.sin(polar) * Math.cos(az),
        Math.cos(polar),
        Math.sin(polar) * Math.sin(az)
      );

      // Distance slightly below flower heads (1.66 vs flowers at 1.70)
      const dist = isLeft ? 1.66 : 1.72;
      const pos = DOME_CENTER.clone().addScaledVector(dir, dist);
      if (isLeft) {
        pos.y -= 0.12; // Lower down away from flower petals
        pos.z -= 0.05; // Offset back
      }

      const quat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir);
      // Rotation: isLeft drapes outward/downward ([0.75, ...]) avoiding petal intersection
      const rot = isLeft ? [0.75, (r() - 0.5) * 0.3, -0.2] : [0.45, (r() - 0.5) * 0.4, 0];

      result.push({ pos, quat, rot });
    }
    return result;
  }, []);

  return (
    <group>
      {leaves.map((lf, i) => (
        <group key={i} position={lf.pos} quaternion={lf.quat}>
          <mesh geometry={leafGeo} material={leafMat} rotation={lf.rot} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Natural Fluffy Baby's Breath (Thưa thoáng ở kẽ hở, không đè lên hoa) */
/* ------------------------------------------------------------------ */
function BabyBreath() {
  const mesh = useRef();
  const COUNT = 65; // Giảm 40% số lượng (từ 110 xuống 65)
  const PER = 3;

  useLayoutEffect(() => {
    const r = rng(42);
    const dummy = new THREE.Object3D();
    let k = 0;

    // Collect flower centers for collision avoidance
    const flowerPosList = FLOWERS.map((f) => f.pos);

    let clusterCount = 0;
    let attempts = 0;
    while (clusterCount < COUNT && attempts < 1500) {
      attempts++;
      // Distribution: 35% in gaps across upper dome, 65% around collar rim
      const isCollar = r() < 0.65;
      const polar = (isCollar ? 44 + r() * 16 : 14 + r() * 28) * (Math.PI / 180);
      const az = r() * Math.PI * 2;

      const dir = new THREE.Vector3(
        Math.sin(polar) * Math.cos(az),
        Math.cos(polar),
        Math.sin(polar) * Math.sin(az)
      );

      // Candidate position on dome surface
      const cand = DOME_CENTER.clone().addScaledVector(dir, DOME_R + (isCollar ? 0.03 : 0.06));

      // Rule 1: Never place in the front stem opening (y < -0.15 and z > 0.75)
      if (cand.y < -0.15 && cand.z > 0.75) continue;

      // Rule 2: Never place directly on top of a flower head! (distance must be >= 0.36)
      let tooClose = false;
      for (let i = 0; i < flowerPosList.length; i++) {
        if (cand.distanceTo(flowerPosList[i]) < 0.36) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      // Accepted cluster in natural gap!
      clusterCount++;
      for (let j = 0; j < PER; j++) {
        const floretX = cand.x + (r() - 0.5) * 0.11;
        const floretY = cand.y + (r() - 0.5) * 0.11;
        const floretZ = cand.z + (r() - 0.5) * 0.11;
        dummy.position.set(floretX, floretY, floretZ);
        dummy.scale.setScalar(0.024 + r() * 0.016);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(k++, dummy.matrix);
      }
    }

    mesh.current.count = k;
    mesh.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT * PER]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      {/* Matte ivory delicate baby's breath floret */}
      <meshStandardMaterial
        color="#fffdfa"
        roughness={0.92}
        metalness={0.0}
        emissive="#fef9c3"
        emissiveIntensity={0.12}
      />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Handcrafted Woven Fabric Ribbon (Cánh nơ uốn lượn & đuôi vát chữ V) */
/* ------------------------------------------------------------------ */
function makeRibbonLoop(width = 0.14, segV = 36, segU = 6) {
  const g = new THREE.BufferGeometry();
  const verts = [];
  const norms = [];
  const uvs = [];
  const indices = [];

  for (let iv = 0; iv <= segV; iv++) {
    const v = iv / segV;
    const angle = v * Math.PI * 2;
    // Teardrop curved centerline of the bow loop
    const cx = Math.sin(angle * 0.5) * 0.36;
    const cy = Math.sin(angle) * 0.095 * (1 - 0.25 * Math.cos(angle * 0.5));
    const cz = (1 - Math.cos(angle * 0.5)) * 0.12;

    for (let iu = 0; iu <= segU; iu++) {
      const u = iu / segU;
      const wOffset = (u - 0.5) * width;
      // Natural fabric crease through the middle of the ribbon loop
      const crease = Math.sin(u * Math.PI) * 0.018 * Math.sin(angle * 0.5);

      const vx = cx;
      const vy = cy + wOffset;
      const vz = cz - crease;

      verts.push(vx, vy, vz);
      norms.push(0, 0, 1);
      uvs.push(u, v);
    }
  }

  const row = segU + 1;
  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * row + iu;
      const b = (iv + 1) * row + iu;
      const c = (iv + 1) * row + (iu + 1);
      const d = iv * row + (iu + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  g.setIndex(indices);
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.computeVertexNormals();
  return g;
}

function makeRibbonTail(length = 0.85, width = 0.14, driftX = 0.1, segV = 28, segU = 6) {
  const g = new THREE.BufferGeometry();
  const verts = [];
  const norms = [];
  const uvs = [];
  const indices = [];

  for (let iv = 0; iv <= segV; iv++) {
    const vBase = iv / segV; // 0 (knot) to 1 (tip)
    for (let iu = 0; iu <= segU; iu++) {
      const u = iu / segU;
      const uNorm = (u - 0.5) * 2; // -1 to 1

      // Swallowtail V-notch cutout: center cuts upward by 0.15
      const vNotch = (1 - Math.abs(uNorm)) * 0.15;
      const vEffective = clamp(vBase - vNotch * Math.pow(vBase, 2.5), 0, 1);

      const vy = -vEffective * length;
      const vx = (u - 0.5) * width + driftX * Math.pow(vEffective, 1.25) + Math.sin(vEffective * Math.PI * 1.4) * 0.032;
      const vz = Math.cos(vEffective * Math.PI * 0.8) * 0.035 - Math.sin(u * Math.PI) * 0.012;

      verts.push(vx, vy, vz);
      norms.push(0, 0, 1);
      uvs.push(u, vBase);
    }
  }

  const row = segU + 1;
  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * row + iu;
      const b = (iv + 1) * row + iu;
      const c = (iv + 1) * row + (iu + 1);
      const d = iv * row + (iu + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  g.setIndex(indices);
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.computeVertexNormals();
  return g;
}

function makeRibbonKnot() {
  const g = new THREE.CylinderGeometry(0.075, 0.075, 0.14, 32, 12, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    const t = y / 0.07;
    const cinch = 0.82 + 0.18 * (t * t);
    x *= cinch * 1.28;
    z *= cinch * 0.95;
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

function Ribbon() {
  const mat = useMemo(() => {
    const noise = getSharedTextures().noise;
    return new THREE.MeshPhysicalMaterial({
      color: '#7f1d1d', // Deep warm romantic crimson wine red
      roughness: 0.92, // Matte woven fabric
      metalness: 0.0,
      clearcoat: 0.0,
      sheen: 0.85,
      sheenRoughness: 0.85,
      sheenColor: new THREE.Color('#f43f5e'),
      bumpMap: noise,
      bumpScale: 0.025,
      side: THREE.DoubleSide,
    });
  }, []);

  const geos = useMemo(
    () => ({
      loopR: makeRibbonLoop(0.14),
      loopL: makeRibbonLoop(0.14),
      tailL: makeRibbonTail(0.82, 0.14, -0.12),
      tailR: makeRibbonTail(0.88, 0.14, 0.14),
      knot: makeRibbonKnot(),
      belt: new THREE.CylinderGeometry(0.85, 0.81, 0.12, 64, 1, true),
    }),
    []
  );

  useEffect(() => () => {
    mat.dispose();
    Object.values(geos).forEach((g) => g.dispose());
  }, [mat, geos]);

  return (
    <group position={[0, -1.52, 0]}>
      {/* 1. Wrapping belt hugging paper cone */}
      <mesh geometry={geos.belt} material={mat} />

      {/* 2. Bow knot and draped fabric loops in front */}
      <group position={[0, 0, 0.88]}>
        {/* Right curved loop */}
        <mesh geometry={geos.loopR} material={mat} rotation={[0.08, 0.25, 0.15]} />

        {/* Left curved loop (mirrored on X) */}
        <mesh geometry={geos.loopL} material={mat} scale={[-1, 1, 1]} rotation={[0.08, -0.25, -0.15]} />

        {/* Left cascading tail with V-notch */}
        <mesh geometry={geos.tailL} material={mat} position={[-0.04, -0.05, 0.02]} rotation={[0.12, 0.05, 0.1]} />

        {/* Right cascading tail with V-notch */}
        <mesh geometry={geos.tailR} material={mat} position={[0.04, -0.05, 0.02]} rotation={[0.14, -0.05, -0.08]} />

        {/* Center cinched knot */}
        <mesh geometry={geos.knot} material={mat} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.04]} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Soft Bokeh Luminous Fireflies (Đốm sáng siêu mờ lãng đãng)       */
/* ------------------------------------------------------------------ */
function Fireflies3D() {
  const pointsRef = useRef();
  const COUNT = 42;
  const bokehTex = useMemo(() => getSharedTextures().bokeh, []);

  const [geo, data] = useMemo(() => {
    const r = rng(77);
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const list = [];

    const c1 = new THREE.Color('#fef3c7'); // Soft warm butter gold
    const c2 = new THREE.Color('#fed7aa'); // Soft sunset peach
    const c3 = new THREE.Color('#fbcfe8'); // Rose champagne

    for (let i = 0; i < COUNT; i++) {
      // Float loosely in surrounding ambient space (không tụ dày trong hoa)
      const x = (r() - 0.5) * 8.6;
      const y = (r() - 0.5) * 6.2 + 0.3;
      const z = (r() - 0.5) * 6.0;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const pick = r();
      const col = pick < 0.55 ? c1 : pick < 0.8 ? c2 : c3;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      list.push({
        origX: x,
        origY: y,
        origZ: z,
        speedX: 0.22 + r() * 0.4,
        speedY: 0.18 + r() * 0.35,
        phase: r() * Math.PI * 2,
      });
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return [g, list];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < COUNT; i++) {
      const f = data[i];
      const x = f.origX + Math.sin(t * f.speedX + f.phase) * 0.45;
      const y = f.origY + Math.cos(t * f.speedY + f.phase) * 0.38;
      const z = f.origZ + Math.sin(t * (f.speedX * 0.7) + f.phase) * 0.32;
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        map={bokehTex}
        size={0.42}
        sizeAttenuation={true}
        transparent
        alphaTest={0.001}
        opacity={0.22} // Siêu mờ (opacity: 0.15 - 0.3), không gây rối mắt
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        vertexColors
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Falling 3D Velvet Petals in Space (Cánh hoa rơi hồng/đỏ nhạt mờ)    */
/* ------------------------------------------------------------------ */
function FallingPetals({ startRef }) {
  const N = 48;
  const mesh = useRef();
  const geo = useMemo(() => makePetal({ w: 0.08, l: 0.16, cup: 0.3, curl: 0.1, seg: [3, 4] }), []);
  const mat = useMemo(() => {
    const noise = getSharedTextures().noise;
    return new THREE.MeshPhysicalMaterial({
      color: '#fb7185',
      side: THREE.DoubleSide,
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.0,
      clearcoat: 0.0,
      sheen: 0.35,
      sheenColor: new THREE.Color('#fda4af'),
      bumpMap: noise,
      bumpScale: 0.015,
      transparent: true,
      opacity: 0.78, // Mềm mại, đồng bộ với bối cảnh hoàng hôn
    });
  }, []);
  const data = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: N }, () => ({
      a: r() * 6.28,
      rad: 0.6 + r() * 3.4,
      y: r() * 5.8 - 2.5,
      sp: 0.25 + r() * 0.32,
      rs: r() * 2 + 0.6,
      ph: r() * 6.28,
      rot: [r() * 6, r() * 6, r() * 6],
    }));
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const since = startRef.current === null ? 0 : t - startRef.current;
    const on = smooth(clamp((since - 2.5) / 1, 0, 1));
    data.forEach((d, i) => {
      d.y -= d.sp * delta;
      if (d.y < -2.4) d.y = 3.6;
      const x = Math.cos(d.a + t * 0.15) * d.rad + Math.sin(t * 0.8 + d.ph) * 0.2;
      const z = Math.sin(d.a + t * 0.15) * d.rad;
      dummy.position.set(x, d.y, z);
      dummy.rotation.set(d.rot[0] + t * d.rs, d.rot[1] + t * d.rs * 0.7, d.rot[2]);
      dummy.scale.setScalar(Math.max(on, 0.0001));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geo, mat, N]} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* 3D Floating Love Letter Emerging From Bouquet Heart                */
/* ------------------------------------------------------------------ */
function FloatingEnvelopeInner({ onOpenLetter }) {
  const groupRef = useRef();
  const beamMatRef = useRef();
  const beamCoreMatRef = useRef();
  const auraMatRef = useRef();
  const spotLightRef = useRef();
  const pointLightRef = useRef();
  const [hovered, setHovered] = useState(false);
  const animProgress = useRef(0);

  const spotTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, 1.10, 0.85);
    return obj;
  }, []);

  const flapGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.61, 0.40);
    shape.lineTo(0.61, 0.40);
    shape.lineTo(0.0, 0.02);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  const flapBorderGeo = useMemo(() => {
    const pts = [
      new THREE.Vector3(-0.61, 0.40, 0),
      new THREE.Vector3(0.0, 0.02, 0),
      new THREE.Vector3(0.61, 0.40, 0),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  useFrame((state, delta) => {
    animProgress.current = THREE.MathUtils.damp(animProgress.current, 1, 2.4, delta);
    const p = animProgress.current;
    const t = state.clock.elapsedTime;
    const smoothP = smooth(p);

    if (groupRef.current) {
      // Emerge gracefully from inside bouquet heart up to eye-level front center (y = 1.10, z = 0.85)
      const targetY = 0.25 + smoothP * 0.85 + Math.sin(t * 2.0) * 0.035;
      groupRef.current.position.y = targetY;
      groupRef.current.position.z = 0.35 + smoothP * 0.50;
      groupRef.current.rotation.x = 0.16 + Math.sin(t * 1.4) * 0.025;
      groupRef.current.rotation.y = Math.sin(t * 1.1) * 0.035;
      groupRef.current.rotation.z = Math.sin(t * 1.7) * 0.02;

      const hoverScale = hovered ? 1.08 : 1.0;
      const s = (0.2 + 0.8 * smoothP) * hoverScale;
      groupRef.current.scale.set(s, s, s);
    }

    if (spotLightRef.current) {
      spotLightRef.current.intensity = p * 4.5;
    }
    if (pointLightRef.current) {
      pointLightRef.current.intensity = p * 2.6;
    }
    if (beamMatRef.current) {
      beamMatRef.current.opacity = (0.13 + Math.sin(t * 2.2) * 0.025) * p;
    }
    if (beamCoreMatRef.current) {
      beamCoreMatRef.current.opacity = (0.22 + Math.sin(t * 2.8) * 0.035) * p;
    }
    if (auraMatRef.current) {
      auraMatRef.current.opacity = (0.28 + Math.sin(t * 2.0) * 0.05) * p;
    }
  });

  return (
    <>
      {/* Target for overhead spotlight */}
      <primitive object={spotTarget} />

      {/* 1. Dramatic Golden Theatrical Spotlight shining down on the letter */}
      <spotLight
        ref={spotLightRef}
        position={[0, 5.2, 2.2]}
        target={spotTarget}
        color="#fffbeb"
        intensity={0}
        angle={0.44}
        penumbra={0.82}
        distance={12}
        decay={1.2}
      />

      {/* 2. Soft Volumetric God-Ray Light Cone (Outer Halo) */}
      <mesh position={[0, 3.10, 1.45]} rotation-x={0.26} raycast={() => null}>
        <cylinderGeometry args={[0.26, 1.5, 4.4, 32, 1, true]} />
        <meshBasicMaterial
          ref={beamMatRef}
          color="#fef3c7"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Volumetric God-Ray Core (Inner Luminous Beam) */}
      <mesh position={[0, 3.10, 1.45]} rotation-x={0.26} raycast={() => null}>
        <cylinderGeometry args={[0.1, 0.8, 4.4, 32, 1, true]} />
        <meshBasicMaterial
          ref={beamCoreMatRef}
          color="#fef08a"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Golden Aura Ring at Bouquet Heart where letter emerges */}
      <mesh position={[0, 0.45, 0.40]} rotation-x={-Math.PI / 2} raycast={() => null}>
        <ringGeometry args={[0.15, 0.95, 32]} />
        <meshBasicMaterial
          ref={auraMatRef}
          color="#fbbf24"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 5. Sparkling Fairy Dust motes rising within the Light Beam */}
      <Sparkles
        count={35}
        scale={[1.6, 2.4, 1.6]}
        position={[0, 1.8, 0.85]}
        size={3.8}
        speed={0.7}
        color="#fef08a"
        opacity={0.8}
      />

      {/* 6. The Emerged 3D Love Letter Envelope */}
      <group
        ref={groupRef}
        position={[0, 0.25, 0.35]}
        onClick={(e) => {
          e.stopPropagation();
          if (animProgress.current < 0.5) return;
          onOpenLetter();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Warm local light radiating from the letter itself */}
        <pointLight
          ref={pointLightRef}
          position={[0, 0, 0.28]}
          color="#fef08a"
          intensity={0}
          distance={3.6}
          decay={2}
        />

        {/* 6a. Envelope Body (Ivory handmade parchment with fine paper tooth) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.26, 0.82, 0.024]} />
          <meshPhysicalMaterial
            color="#fffdf7"
            roughness={0.90}
            metalness={0.0}
            clearcoat={0.0}
            sheen={0.3}
            sheenColor={new THREE.Color('#fef08a')}
            bumpMap={getSharedTextures().noise}
            bumpScale={0.015}
          />
        </mesh>

        {/* 6b. Triangular Envelope Flap Folded Down */}
        <mesh geometry={flapGeo} position={[0, 0, 0.013]}>
          <meshPhysicalMaterial
            color="#fef8f0"
            roughness={0.90}
            metalness={0.0}
            clearcoat={0.0}
            sheen={0.3}
            side={THREE.DoubleSide}
            bumpMap={getSharedTextures().noise}
            bumpScale={0.015}
          />
        </mesh>

        {/* 6c. Delicate Golden Foil Flap Border */}
        <line geometry={flapBorderGeo} position={[0, 0, 0.015]}>
          <lineBasicMaterial color="#d97706" linewidth={2} />
        </line>

        {/* 6d. Fine Satin Gold Ribbon across envelope */}
        <mesh position={[0, 0.02, 0.014]}>
          <boxGeometry args={[1.27, 0.09, 0.006]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.45} metalness={0.4} />
        </mesh>

        {/* 6e. Royal Crimson Wax Seal with Embossed Heart Emblem */}
        <group position={[0, 0.02, 0.022]}>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.13, 0.14, 0.02, 32]} />
            <meshPhysicalMaterial
              color="#9f1239"
              roughness={0.58}
              metalness={0.05}
              sheen={0.45}
              sheenColor={new THREE.Color('#fda4af')}
            />
          </mesh>
          <mesh position={[0, 0, 0.012]} scale={[0.065, 0.065, 0.035]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.35} metalness={0.6} />
          </mesh>
        </group>
      </group>
    </>
  );
}

function FloatingEnvelope3D({ isRevealed, onOpenLetter }) {
  if (!isRevealed) return null;
  return <FloatingEnvelopeInner onOpenLetter={onOpenLetter} />;
}

/* ------------------------------------------------------------------ */
/* Swaying Rig                                                         */
/* ------------------------------------------------------------------ */
function Rig({ startRef, children }) {
  const g = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (startRef.current === null) startRef.current = t;
    const since = t - startRef.current;
    const e = smooth(clamp(since / 1.4, 0, 1));
    if (!g.current) return;
    g.current.scale.setScalar(0.55 + 0.45 * e);
    g.current.rotation.z = Math.sin(t * 0.9) * 0.02;
    g.current.rotation.x = Math.cos(t * 0.7) * 0.015;
  });
  return <group ref={g}>{children}</group>;
}

/* ------------------------------------------------------------------ */
/* 3D Scene Assembly with Midnight Velvet Lighting                     */
/* ------------------------------------------------------------------ */
function Scene({
  replayKey,
  activeId,
  questIds = [0, 1, 7, 9, 11],
  collectedIds = [],
  isLetterRevealed = false,
  onPick,
  onOpenLetter,
  onInteractStart,
  onInteractEnd,
}) {
  const startRef = useRef(null);
  useEffect(() => {
    startRef.current = null;
  }, [replayKey]);

  const collectedSet = useMemo(() => new Set(collectedIds), [collectedIds]);
  const questSet = useMemo(() => new Set(questIds), [questIds]);

  return (
    <>
      {/* Softened Warm Ambient & Diffuse Studio Lighting */}
      <ambientLight intensity={0.95} color="#fff1f2" />
      <hemisphereLight args={['#ffedd5', '#1e1b4b', 0.85]} />

      {/* Gentle Warm Golden Key Light */}
      <directionalLight position={[3.5, 6, 4.5]} intensity={1.8} color="#fffbeb" />

      {/* Soft Romantic Rim Light */}
      <directionalLight position={[-3, 4, -3.5]} intensity={1.3} color="#fecdd3" />

      {/* Soft Ambient Under-Fill */}
      <directionalLight position={[0, -1.5, 2.5]} intensity={0.65} color="#fed7aa" />

      {/* Soft Bokeh Luminous Fireflies in 3D Space (Siêu mờ 0.22) */}
      <Fireflies3D />

      {/* Main Bouquet Dome (16 elegant flowers) */}
      <Rig startRef={startRef}>
        <Paper startRef={startRef} />
        {FLOWERS.map((f) => (
          <Flower
            key={f.id}
            data={f}
            active={activeId === f.id}
            isQuest={questSet.has(f.id)}
            isCollected={collectedSet.has(f.id)}
            onPick={onPick}
            startRef={startRef}
          />
        ))}
        <Greenery />
        <BabyBreath />
        <Ribbon />

        {/* 3D Floating Love Letter emerging gracefully from bouquet heart */}
        <FloatingEnvelope3D isRevealed={isLetterRevealed} onOpenLetter={onOpenLetter} />

        {/* Golden celebratory aura when secret flowers are unlocked */}
        {isLetterRevealed && (
          <Sparkles count={45} scale={[4.5, 3.5, 4.5]} size={3.5} speed={0.7} color="#fbbf24" opacity={0.65} />
        )}
      </Rig>

      {/* Soft floating pastel rose petals in the air */}
      <FallingPetals startRef={startRef} />

      {/* Soft, authentic contact shadow beneath bouquet base */}
      <ContactShadows position={[0, -2.18, 0]} opacity={0.55} scale={7.2} blur={3.2} far={3.8} color="#0d0918" />

      {/* Responsive Camera Calibrator for Perfect Fullscreen Framing */}
      <ResponsiveCamera />

      <OrbitControls
        enablePan={false}
        enableDamping
        autoRotate={!isLetterRevealed}
        autoRotateSpeed={0.9}
        minDistance={4.2}
        maxDistance={11.0}
        minPolarAngle={0.2}
        maxPolarAngle={1.48}
        target={[0, 0.1, 0]}
        onStart={onInteractStart}
        onEnd={onInteractEnd}
      />
    </>
  );
}

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const isPortrait = size.width < size.height;
    const aspect = size.width / Math.max(size.height, 1);

    if (isPortrait) {
      // In portrait mode (phones / narrow screens), ensure the full bouquet width & height fit without clipping
      const reqDist = Math.max(7.4, 4.0 / Math.max(aspect, 0.35));
      camera.position.set(0, 1.85, Math.min(reqDist, 10.5));
    } else {
      // Landscape (desktop / laptop 16:9, 16:10, ultrawide):
      // Bouquet is ~4.4 units high. With fov 38 and dist 7.3, visible vertical height is 5.25 units.
      // Top rose petals and bottom paper wrapping & ribbon fit comfortably with elegant breathing room!
      camera.position.set(0, 1.85, 7.3);
    }
    camera.lookAt(0, 0.1, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

export default function Bouquet3D({
  replayKey,
  activeId,
  questIds = [0, 1, 7, 9, 11],
  collectedIds = [],
  isLetterRevealed = false,
  onPick,
  onOpenLetter,
  onInteractStart,
  onInteractEnd,
}) {
  return (
    <Canvas
      camera={{ position: [0, 1.85, 7.3], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'none', width: '100%', height: '100%' }}
    >
      <Scene
        replayKey={replayKey}
        activeId={activeId}
        questIds={questIds}
        collectedIds={collectedIds}
        isLetterRevealed={isLetterRevealed}
        onPick={onPick}
        onOpenLetter={onOpenLetter}
        onInteractStart={onInteractStart}
        onInteractEnd={onInteractEnd}
      />
    </Canvas>
  );
}
