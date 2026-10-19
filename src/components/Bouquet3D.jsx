import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, ContactShadows, Html } from '@react-three/drei';

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
/* Procedural Velvet Petal Geometry with Natural Curvature & Ruffles  */
/* ------------------------------------------------------------------ */
function makePetal({ w, l, cup = 0.52, curl = 0.28, ruffle = 0, seg = [12, 14] }) {
  const g = new THREE.PlaneGeometry(1, 1, seg[0], seg[1]);
  const pos = g.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i);
    const v = pos.getY(i) + 0.5; // 0 (base) to 1 (tip)

    // Elliptical teardrop petal profile with natural taper
    const prof = Math.pow(Math.sin(Math.PI * (0.07 + 0.93 * v)), 0.6);
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
    scale: 0.74,
    sepal: 0.14,
    // Deep Velvet Ohara Rose: Crimson core blooming to radiant coral blush
    layers: ROSE_LAYERS(['#7f1d1d', '#991b1b', '#be123c', '#e11d48', '#fb7185']),
  },
  spray: {
    scale: 0.45,
    sepal: 0.11,
    // Sweet Coral Spray Rose
    layers: ROSE_LAYERS(['#9f1239', '#e11d48', '#f43f5e', '#fb7185', '#fce7f3']),
  },
  peony: {
    scale: 0.7,
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
    scale: 0.65,
    sepal: 0,
    // Sunrise Coral Tulip
    layers: [
      L(3, 0.05, 0.88, 0.3, 0.08, 0.32, '#b91c1c', { cup: 0.95, curl: 0.16, off: 0 }),
      L(3, 0.04, 0.82, 0.28, 0.04, 0.22, '#f43f5e', { cup: 0.95, curl: 0.14, off: Math.PI / 3 }),
    ],
  },
  tana: {
    scale: 0.76,
    sepal: 0.09,
    center: '#f59e0b',
    // Pure White Chamomile Tana with Warm Golden Button
    layers: [
      L(16, 0.07, 0.45, 0.088, 0.7, 1.4, '#ffffff', { cup: 0.18, curl: 0.18 }),
      L(14, 0.06, 0.39, 0.088, 0.6, 1.32, '#fffbeb', { cup: 0.18, curl: 0.18, off: 0.2 }),
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Bouquet Dome Layout: 20 Harmonious Flowers                          */
/* ------------------------------------------------------------------ */
const KINDS = [
  'rose', 'peony', 'rose', 'peony', 'spray', 'peony', 'rose', 'tulip', 'peony', 'spray',
  'tulip', 'tana', 'tulip', 'spray', 'tana', 'tulip', 'tana', 'spray', 'tana', 'tana',
];
const DOME_CENTER = new THREE.Vector3(0, -0.05, 0);
const DOME_R = 1.74;
const MAX_POLAR = (72 * Math.PI) / 180;
const STEM_BASE = new THREE.Vector3(0, -2.15, 0);

const FLOWERS = KINDS.map((kind, i) => {
  const polar = MAX_POLAR * Math.sqrt((i + 0.5) / KINDS.length);
  const az = i * 2.39996;
  const dir = new THREE.Vector3(
    Math.sin(polar) * Math.cos(az),
    Math.cos(polar),
    Math.sin(polar) * Math.sin(az)
  );
  const pos = DOME_CENTER.clone().addScaledVector(dir, DOME_R);
  const quat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir);
  return { id: i, kind, dir, pos, quat, roll: (i * 1.7) % (Math.PI * 2), delay: 0.5 + i * 0.08 };
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
    // Elegant soft ring when found
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

      <pointLight color="#fde047" intensity={1.1} distance={1.4} decay={2} />
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
  const mats = useMemo(
    () =>
      spec.layers.map(
        (l, idx) =>
          new THREE.MeshStandardMaterial({
            color: l.color,
            vertexColors: true,
            side: THREE.DoubleSide,
            roughness: 0.32,
            metalness: 0.02,
            // Velvet core glow for realistic subsurface depth
            emissive: idx < 2 ? '#881337' : '#000000',
            emissiveIntensity: idx < 2 ? 0.28 : 0,
          })
      ),
    [spec]
  );

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

          {/* Generous touch target area for easy clicking on touch & desktop */}
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
/* 3D Fairy Lights (Dây đèn LED đom đóm quấn quanh bó hoa)             */
/* ------------------------------------------------------------------ */
function FairyLights3D({ startRef }) {
  const meshRef = useRef();
  const COUNT = 48;

  const lights = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const t = i / (COUNT - 1);
      const angle = t * Math.PI * 6.5;
      const height = -1.6 + t * 2.8;
      const radius = 0.75 + Math.sin(t * Math.PI) * 1.25;
      return {
        x: Math.cos(angle) * radius,
        y: height,
        z: Math.sin(angle) * radius,
        phase: i * 0.45,
        speed: 1.8 + (i % 3) * 0.6,
      };
    });
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const since = startRef.current === null ? 0 : t - startRef.current;
    const power = smooth(clamp((since - 1.8) / 1.5, 0, 1));

    lights.forEach((bulb, i) => {
      dummy.position.set(bulb.x, bulb.y, bulb.z);
      const blink = 0.75 + 0.25 * Math.sin(t * bulb.speed + bulb.phase);
      dummy.scale.setScalar(power * blink * 0.052);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#fbbf24"
          emissiveIntensity={2.8}
          roughness={0.15}
          toneMapped={false}
        />
      </instancedMesh>
      <pointLight position={[0, 0.4, 0.2]} intensity={2.4} distance={3.5} color="#fde047" decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Korean Fluted Wrapping Paper (Giấy mếch lụa kem mờ & hồng phấn)     */
/* ------------------------------------------------------------------ */
function makePaper(rTop, rBot, h, flutes, amp, rimWave) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, 160, 24, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    const t = (y + h / 2) / h;
    const a = Math.atan2(z, x);
    const f = 1 + amp * Math.pow(t, 1.3) * Math.sin(a * flutes);
    x *= f;
    z *= f;
    y += rimWave * Math.pow(t, 6) * Math.sin(a * (flutes / 2) + 1);
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

function Paper({ startRef }) {
  const group = useRef();
  const geos = useMemo(
    () => ({
      outer: makePaper(2.2, 0.16, 2.3, 14, 0.08, 0.18),
      inner: makePaper(2.05, 0.14, 2.5, 12, 0.06, 0.12),
      sleeve: makePaper(1.7, 0.22, 1.6, 10, 0.09, 0.08),
    }),
    []
  );
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  useFrame((state) => {
    if (startRef.current === null) return;
    const since = state.clock.elapsedTime - startRef.current;
    const e = easeOutBack(clamp(since / 1.3, 0, 1));
    if (group.current) group.current.scale.setScalar(Math.max(0.2 + 0.8 * e, 0.01));
  });

  return (
    <group ref={group} position={[0, -2.15, 0]}>
      {/* Inner frosted ivory translucent silk paper */}
      <mesh geometry={geos.inner} position-y={1.37}>
        <meshStandardMaterial color="#fffbeb" side={THREE.DoubleSide} roughness={0.6} />
      </mesh>
      {/* Outer soft blush pink paper */}
      <mesh geometry={geos.outer} position-y={1.15}>
        <meshStandardMaterial color="#fbcfe8" side={THREE.DoubleSide} roughness={0.65} />
      </mesh>
      {/* Sleeve cuff */}
      <mesh geometry={geos.sleeve} position-y={0.8} rotation-y={0.2}>
        <meshStandardMaterial color="#f472b6" side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Delicate Eucalyptus Sprigs (Lá khuynh diệp nhỏ nép viền ngoài)    */
/* ------------------------------------------------------------------ */
function Greenery() {
  const leaves = useMemo(() => {
    const r = rng(17);
    return Array.from({ length: 14 }, (_, i) => {
      // Positioned only around the lower rim collar so they frame the bouquet without blocking flowers
      const polar = ((68 + r() * 10) * Math.PI) / 180;
      const az = (i / 14) * Math.PI * 2 + r() * 0.25;
      const dir = new THREE.Vector3(
        Math.sin(polar) * Math.cos(az),
        Math.cos(polar),
        Math.sin(polar) * Math.sin(az)
      );
      return {
        pos: DOME_CENTER.clone().addScaledVector(dir, 1.88 + r() * 0.1),
        quat: new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir),
        spin: r() * Math.PI * 2,
        size: 0.14 + r() * 0.05,
      };
    });
  }, []);

  return (
    <group>
      {leaves.map((lf, i) => (
        <group key={i} position={lf.pos} quaternion={lf.quat}>
          <mesh rotation={[0.4, lf.spin, 0]}>
            <circleGeometry args={[lf.size, 20]} />
            <meshStandardMaterial color="#166534" side={THREE.DoubleSide} roughness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Baby's Breath (Hoa Baby trắng li ti lấp lánh như ngọc tuyết)       */
/* ------------------------------------------------------------------ */
function BabyBreath() {
  const mesh = useRef();
  const COUNT = 75;
  const PER = 4;
  useLayoutEffect(() => {
    const r = rng(23);
    const dummy = new THREE.Object3D();
    let k = 0;
    for (let c = 0; c < COUNT; c++) {
      const polar = ((10 + r() * 64) * Math.PI) / 180;
      const az = r() * Math.PI * 2;
      const dir = new THREE.Vector3(
        Math.sin(polar) * Math.cos(az),
        Math.cos(polar),
        Math.sin(polar) * Math.sin(az)
      );
      const center = DOME_CENTER.clone().addScaledVector(dir, DOME_R + 0.1 + r() * 0.28);
      for (let j = 0; j < PER; j++) {
        dummy.position.set(
          center.x + (r() - 0.5) * 0.12,
          center.y + (r() - 0.5) * 0.12,
          center.z + (r() - 0.5) * 0.12
        );
        dummy.scale.setScalar(0.032 + r() * 0.026);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(k++, dummy.matrix);
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT * PER]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial color="#ffffff" roughness={0.6} emissive="#fffbeb" emissiveIntensity={0.4} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* Satin Wine Red Ribbon (Nơ ruy băng lụa đỏ rượu vang sang trọng)    */
/* ------------------------------------------------------------------ */
function Ribbon() {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#881337', roughness: 0.24, metalness: 0.12 }),
    []
  );
  return (
    <group position={[0, -1.52, 0]}>
      {/* Belt loop */}
      <mesh rotation-x={Math.PI / 2} material={mat}>
        <torusGeometry args={[0.82, 0.048, 12, 64]} />
      </mesh>
      {/* Front bow loops and tails */}
      <group position={[0, 0, 0.88]}>
        <mesh position={[-0.28, 0.04, 0]} rotation-z={0.45} scale={[0.34, 0.2, 0.07]} material={mat}>
          <sphereGeometry args={[1, 20, 14]} />
        </mesh>
        <mesh position={[0.28, 0.04, 0]} rotation-z={-0.45} scale={[0.34, 0.2, 0.07]} material={mat}>
          <sphereGeometry args={[1, 20, 14]} />
        </mesh>
        <mesh position={[-0.09, -0.4, 0]} rotation-z={0.2} material={mat}>
          <boxGeometry args={[0.12, 0.72, 0.02]} />
        </mesh>
        <mesh position={[0.09, -0.4, 0]} rotation-z={-0.2} material={mat}>
          <boxGeometry args={[0.12, 0.72, 0.02]} />
        </mesh>
        <mesh scale={[0.11, 0.11, 0.09]} material={mat}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Dreamy Background Photographic Bokeh Discs                          */
/* ------------------------------------------------------------------ */
function StudioBokeh() {
  const meshRef = useRef();
  const COUNT = 22;

  const discs = useMemo(() => {
    const r = rng(55);
    return Array.from({ length: COUNT }, () => ({
      x: (r() - 0.5) * 10,
      y: (r() - 0.5) * 5 + 0.8,
      z: -2.6 - r() * 3.2,
      scale: 0.3 + r() * 0.65,
      speed: 0.4 + r() * 0.7,
      phase: r() * Math.PI * 2,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    discs.forEach((d, i) => {
      const y = d.y + Math.sin(t * d.speed + d.phase) * 0.12;
      const x = d.x + Math.cos(t * (d.speed * 0.6) + d.phase) * 0.1;
      dummy.position.set(x, y, d.z);
      const pulse = d.scale * (0.88 + 0.12 * Math.sin(t * d.speed * 1.4 + d.phase));
      dummy.scale.set(pulse, pulse, pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial color="#fed7aa" transparent opacity={0.16} depthWrite={false} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* 3D Floating Love Letter Emerging From Bouquet Heart                */
/* ------------------------------------------------------------------ */
function FloatingEnvelopeInner({ onOpenLetter }) {
  const groupRef = useRef();
  const lightBeamRef = useRef();
  const [hovered, setHovered] = useState(false);
  const animProgress = useRef(0);

  useFrame((state, delta) => {
    animProgress.current = THREE.MathUtils.damp(animProgress.current, 1, 3.2, delta);
    const p = animProgress.current;
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      // Emerge from y = 0.2 up to y = 1.35
      const targetY = 0.2 + p * 1.15 + Math.sin(t * 2.2) * 0.06;
      groupRef.current.position.y = targetY;
      groupRef.current.rotation.z = Math.sin(t * 1.6) * 0.05;
      groupRef.current.rotation.y = Math.sin(t * 1.2) * 0.08;

      const hoverScale = hovered ? 1.08 : 1.0;
      const s = p * hoverScale;
      groupRef.current.scale.set(s, s, s);
    }

    if (lightBeamRef.current) {
      lightBeamRef.current.rotation.y = t * 0.6;
      lightBeamRef.current.material.opacity = p * 0.25;
    }
  });

  return (
    <group>
      {/* Golden divine light beam shaft radiating down onto bouquet */}
      <mesh ref={lightBeamRef} position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.3, 1.2, 4.0, 32, 1, true]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3D Floating Wax-Sealed Letter */}
      <group
        ref={groupRef}
        position={[0, 0.2, 0.3]}
        onClick={(e) => {
          e.stopPropagation();
          // Guard click: only clickable after envelope has risen out of bouquet
          if (animProgress.current < 0.6) return;
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
        {/* Envelope Body (Ivory parchment) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.35, 0.9, 0.04]} />
          <meshStandardMaterial color="#fffbeb" roughness={0.4} metalness={0.05} />
        </mesh>

        {/* Envelope Gold Trim Edge */}
        <mesh position={[0, 0, 0.005]}>
          <boxGeometry args={[1.38, 0.93, 0.03]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.25} metalness={0.7} />
        </mesh>

        {/* Triangular Envelope Flap */}
        <mesh position={[0, 0.08, 0.026]} rotation-z={Math.PI}>
          <coneGeometry args={[0.62, 0.44, 3]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.35} />
        </mesh>

        {/* Satin Gold Ribbon crossing envelope */}
        <mesh position={[0, 0, 0.028]}>
          <boxGeometry args={[1.36, 0.12, 0.01]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.65} roughness={0.3} />
        </mesh>

        {/* Royal Crimson Wax Seal with Heart Emblem */}
        <group position={[0, 0, 0.045]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.03, 32]} />
            <meshStandardMaterial color="#be123c" roughness={0.3} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.018]} scale={[0.07, 0.07, 0.04]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#9f1239" roughness={0.2} />
          </mesh>
        </group>

        {/* Golden Sparkle Aura surrounding the Letter */}
        <Sparkles count={35} scale={[1.8, 1.4, 1.2]} size={4.5} speed={0.8} color="#fbbf24" />

        {/* Floating Interactive HTML Badge */}
        <Html position={[0, 0.72, 0]} center distanceFactor={7}>
          <div className="px-3.5 py-1.5 rounded-full bg-rose-600/95 text-white font-bold text-xs tracking-wide shadow-xl shadow-rose-500/50 flex items-center gap-1.5 whitespace-nowrap border border-rose-300 animate-bounce pointer-events-none select-none">
            <span>💌</span>
            <span>Chạm để mở thư tình</span>
            <span>✨</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

function FloatingEnvelope3D({ isRevealed, onOpenLetter }) {
  if (!isRevealed) return null;
  return <FloatingEnvelopeInner onOpenLetter={onOpenLetter} />;
}

/* ------------------------------------------------------------------ */
/* Falling 3D Petals in Studio Air                                     */
/* ------------------------------------------------------------------ */
function FallingPetals({ startRef }) {
  const N = 36;
  const mesh = useRef();
  const geo = useMemo(() => makePetal({ w: 0.08, l: 0.16, cup: 0.3, curl: 0.1, seg: [3, 4] }), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#fb7185',
        side: THREE.DoubleSide,
        vertexColors: true,
        roughness: 0.45,
      }),
    []
  );
  const data = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: N }, () => ({
      a: r() * 6.28,
      rad: 0.5 + r() * 3.0,
      y: r() * 5.5 - 2.5,
      sp: 0.28 + r() * 0.35,
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
    const on = smooth(clamp((since - 2.6) / 1, 0, 1));
    data.forEach((d, i) => {
      d.y -= d.sp * delta;
      if (d.y < -2.4) d.y = 3.6;
      const x = Math.cos(d.a + t * 0.15) * d.rad + Math.sin(t * 0.8 + d.ph) * 0.2;
      const z = Math.sin(d.a + t * 0.15) * d.rad;
      dummy.position.set(x, ySafe(d.y), z);
      dummy.rotation.set(d.rot[0] + t * d.rs, d.rot[1] + t * d.rs * 0.7, d.rot[2]);
      dummy.scale.setScalar(Math.max(on, 0.0001));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  const ySafe = (y) => y;

  return <instancedMesh ref={mesh} args={[geo, mat, N]} frustumCulled={false} />;
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
/* 3D Scene Assembly with Cinematic Studio Lighting                    */
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
      {/* 1. Dramatic Cinematic Three-Point Studio Lighting (Rich contrast, zero plastic flatness) */}
      <ambientLight intensity={0.65} />
      <hemisphereLight args={['#fff1f2', '#fee2e2', 0.55]} />

      {/* Warm Golden Key Light */}
      <directionalLight position={[4, 7, 5]} intensity={3.2} color="#fffbeb" />

      {/* Romantic Rim Light (Backlight) to create glowing petal translucency */}
      <directionalLight position={[-3.5, 4.5, -4]} intensity={2.4} color="#fda4af" />

      {/* Soft warm fill light */}
      <directionalLight position={[0, -1, 3]} intensity={0.8} color="#fed7aa" />

      {/* Dreamy Bokeh Atmosphere */}
      <StudioBokeh />

      {/* Main Bouquet Dome */}
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
        <FairyLights3D startRef={startRef} />

        {/* 3D Floating Love Letter emerging from bouquet center */}
        <FloatingEnvelope3D isRevealed={isLetterRevealed} onOpenLetter={onOpenLetter} />
      </Rig>

      <FallingPetals startRef={startRef} />
      <Sparkles count={70} scale={[6.5, 6.5, 6.5]} size={4.5} speed={0.4} color="#fde047" />

      {/* Soft, authentic contact shadow beneath bouquet base */}
      <ContactShadows position={[0, -2.18, 0]} opacity={0.42} scale={7.2} blur={2.8} far={3.8} color="#881337" />

      <OrbitControls
        enablePan={false}
        enableDamping
        autoRotate={!isLetterRevealed}
        autoRotateSpeed={0.9}
        minDistance={3.6}
        maxDistance={8.5}
        minPolarAngle={0.2}
        maxPolarAngle={1.48}
        target={[0, 0.1, 0]}
        onStart={onInteractStart}
        onEnd={onInteractEnd}
      />
    </>
  );
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
      camera={{ position: [0, 2.2, 5.6], fov: 36 }}
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
