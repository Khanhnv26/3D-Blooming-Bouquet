import React, { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, ContactShadows } from '@react-three/drei';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
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
/* Procedural petal geometry                                           */
/* ------------------------------------------------------------------ */
function makePetal({ w, l, cup = 0.5, curl = 0.25, ruffle = 0, seg = [8, 10] }) {
  const g = new THREE.PlaneGeometry(1, 1, seg[0], seg[1]);
  const pos = g.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i);
    const v = pos.getY(i) + 0.5;
    const prof = Math.pow(Math.sin(Math.PI * (0.1 + 0.9 * v)), 0.6);
    const nx = 2 * u * prof;
    const x = nx * w;
    const y = v * l;
    const z =
      -cup * w * nx * nx * (0.4 + 0.8 * v) +
      curl * l * v * v * v +
      ruffle * w * Math.sin(u * 14 + v * 6) * v;
    pos.setXYZ(i, x, y, z);
    const shade = 0.75 + 0.25 * v;
    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade;
    colors[i * 3 + 2] = shade;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/* Flower specifications with extra vibrant palettes                   */
/* ------------------------------------------------------------------ */
const L = (n, r, l, w, t0, t1, color, extra = {}) => ({
  n,
  r,
  t0,
  t1,
  color,
  off: extra.off,
  geo: { w, l, cup: extra.cup ?? 0.5, curl: extra.curl ?? 0.25, ruffle: extra.ruffle ?? 0 },
});

const ROSE_LAYERS = (c) => [
  L(3, 0.015, 0.35, 0.12, 0.05, 0.12, c[0], { cup: 0.95, curl: 0.05 }),
  L(4, 0.025, 0.44, 0.17, 0.1, 0.35, c[1], { cup: 0.85, curl: 0.1 }),
  L(5, 0.045, 0.50, 0.22, 0.2, 0.65, c[2], { cup: 0.75, curl: 0.2 }),
  L(6, 0.065, 0.55, 0.26, 0.34, 0.95, c[3], { cup: 0.65, curl: 0.3 }),
  L(7, 0.085, 0.60, 0.30, 0.5, 1.25, c[4], { cup: 0.55, curl: 0.45 }),
];

const SPECS = {
  rose: {
    scale: 0.68,
    sepal: 0.14,
    // Radiant Ohara Rose: from crimson core to blush velvety outer
    layers: ROSE_LAYERS(['#9f1239', '#e11d48', '#f43f5e', '#fb7185', '#fbcfe8']),
  },
  spray: {
    scale: 0.42,
    sepal: 0.12,
    // Radiant Coral Spray Rose
    layers: ROSE_LAYERS(['#be123c', '#fb7185', '#fda4af', '#fecdd3', '#fff1f2']),
  },
  peony: {
    scale: 0.65,
    sepal: 0.16,
    // Lush Warm Peach & Cream Peony
    layers: [
      L(5, 0.02, 0.32, 0.18, 0.1, 0.3, '#f97316', { cup: 0.75, ruffle: 0.04, curl: 0.2 }),
      L(6, 0.04, 0.42, 0.22, 0.2, 0.5, '#fb923c', { cup: 0.65, ruffle: 0.05, curl: 0.25 }),
      L(7, 0.06, 0.50, 0.27, 0.3, 0.75, '#fdba74', { cup: 0.55, ruffle: 0.06, curl: 0.3 }),
      L(8, 0.08, 0.58, 0.31, 0.45, 1.0, '#fed7aa', { cup: 0.45, ruffle: 0.06, curl: 0.35 }),
      L(9, 0.1, 0.64, 0.35, 0.6, 1.28, '#ffedd5', { cup: 0.38, ruffle: 0.07, curl: 0.4 }),
      L(10, 0.12, 0.68, 0.38, 0.75, 1.5, '#fff7ed', { cup: 0.32, ruffle: 0.08, curl: 0.45 }),
    ],
  },
  tulip: {
    scale: 0.6,
    sepal: 0,
    // Vibrant Sunrise Coral Tulip
    layers: [
      L(3, 0.05, 0.85, 0.28, 0.08, 0.32, '#ea580c', { cup: 0.95, curl: 0.15, off: 0 }),
      L(3, 0.04, 0.78, 0.26, 0.04, 0.22, '#f43f5e', { cup: 0.95, curl: 0.12, off: Math.PI / 3 }),
    ],
  },
  tana: {
    scale: 0.75,
    sepal: 0.09,
    center: '#eab308',
    layers: [
      L(16, 0.07, 0.42, 0.08, 0.7, 1.4, '#ffffff', { cup: 0.2, curl: 0.2 }),
      L(14, 0.06, 0.36, 0.08, 0.6, 1.32, '#fffbeb', { cup: 0.2, curl: 0.2, off: 0.2 }),
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Bouquet layout: 20 flowers on a dense dome                          */
/* ------------------------------------------------------------------ */
const KINDS = [
  'rose', 'peony', 'rose', 'peony', 'spray', 'peony', 'rose', 'tulip', 'peony', 'spray',
  'tulip', 'tana', 'tulip', 'spray', 'tana', 'tulip', 'tana', 'spray', 'tana', 'tana',
];
const DOME_CENTER = new THREE.Vector3(0, -0.1, 0);
const DOME_R = 1.75;
const MAX_POLAR = (72 * Math.PI) / 180;
const STEM_BASE = new THREE.Vector3(0, -2.1, 0);

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
  return { id: i, kind, dir, pos, quat, roll: (i * 1.7) % (Math.PI * 2), delay: 0.7 + i * 0.1 };
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
      <cylinderGeometry args={[0.026, 0.034, len, 6]} />
      <meshStandardMaterial color="#365314" roughness={0.7} />
    </mesh>
  );
});

/* ------------------------------------------------------------------ */
/* Flower                                                              */
/* ------------------------------------------------------------------ */
const Flower = memo(function Flower({ data, active, onPick, startRef }) {
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
            roughness: 0.45,
            metalness: 0.05,
            // Warm inner glow for core petals
            emissive: idx < 2 ? '#be123c' : '#000000',
            emissiveIntensity: idx < 2 ? 0.2 : 0,
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
              <sphereGeometry args={[0.12, 16, 12]} />
              <meshStandardMaterial color={spec.center} roughness={0.4} emissive="#f59e0b" emissiveIntensity={0.3} />
            </mesh>
          )}
          {spec.sepal > 0 && (
            <mesh position-y={-0.01} scale={[1, 0.45, 1]}>
              <sphereGeometry args={[spec.sepal, 12, 10]} />
              <meshStandardMaterial color="#4d7c0f" roughness={0.8} />
            </mesh>
          )}
        </group>
      </group>
    </>
  );
});

/* ------------------------------------------------------------------ */
/* 3D FAIRY LIGHTS (DÂY ĐÈN LED ĐOM ĐÓM 3D QUẤN QUANH BÓ HOA)         */
/* ------------------------------------------------------------------ */
function FairyLights3D({ startRef }) {
  const meshRef = useRef();
  const COUNT = 48;

  // Helical curve wrapping around the bouquet dome
  const lights = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const t = i / (COUNT - 1);
      const angle = t * Math.PI * 6.5; // ~3.2 turns
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
    // Lights turn on once bloom is underway (~2.2s)
    const power = smooth(clamp((since - 2.2) / 1.5, 0, 1));

    lights.forEach((bulb, i) => {
      dummy.position.set(bulb.x, bulb.y, bulb.z);
      // Gentle breathing pulsation
      const blink = 0.7 + 0.3 * Math.sin(t * bulb.speed + bulb.phase);
      dummy.scale.setScalar(power * blink * 0.05);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* 48 Glowing LED Beads */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#fbbf24"
          emissiveIntensity={2.5}
          roughness={0.2}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Internal warm glow light in bouquet heart */}
      <pointLight position={[0, 0.4, 0.2]} intensity={2.8} distance={3.5} color="#fde047" decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Korean fluted wrapping paper                                        */
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
    <group ref={group} position={[0, -2.2, 0]}>
      <mesh geometry={geos.inner} position-y={1.37}>
        <meshStandardMaterial color="#fff7ed" side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
      <mesh geometry={geos.outer} position-y={1.15}>
        <meshStandardMaterial color="#fbcfe8" side={THREE.DoubleSide} roughness={0.75} />
      </mesh>
      <mesh geometry={geos.sleeve} position-y={0.8} rotation-y={0.2}>
        <meshStandardMaterial color="#f472b6" side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Greenery & Baby's Breath                                            */
/* ------------------------------------------------------------------ */
function Greenery() {
  const leaves = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: 18 }, (_, i) => {
      const polar = ((58 + r() * 22) * Math.PI) / 180;
      const az = (i / 18) * Math.PI * 2 + r() * 0.3;
      const dir = new THREE.Vector3(
        Math.sin(polar) * Math.cos(az),
        Math.cos(polar),
        Math.sin(polar) * Math.sin(az)
      );
      return {
        pos: DOME_CENTER.clone().addScaledVector(dir, 1.95 + r() * 0.15),
        quat: new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir),
        spin: r() * Math.PI * 2,
        size: 0.8 + r() * 0.5,
      };
    });
  }, []);

  return (
    <group>
      {leaves.map((lf, i) => (
        <group key={i} position={lf.pos} quaternion={lf.quat}>
          <mesh rotation={[0.5, lf.spin, 0]} scale={[0.22 * lf.size, 0.05, 0.42 * lf.size]}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial color="#86efac" roughness={0.65} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BabyBreath() {
  const mesh = useRef();
  const COUNT = 75;
  const PER = 4;
  useLayoutEffect(() => {
    const r = rng(23);
    const dummy = new THREE.Object3D();
    let k = 0;
    for (let c = 0; c < COUNT; c++) {
      const polar = ((8 + r() * 68) * Math.PI) / 180;
      const az = r() * Math.PI * 2;
      const dir = new THREE.Vector3(
        Math.sin(polar) * Math.cos(az),
        Math.cos(polar),
        Math.sin(polar) * Math.sin(az)
      );
      const center = DOME_CENTER.clone().addScaledVector(dir, DOME_R + 0.12 + r() * 0.3);
      for (let j = 0; j < PER; j++) {
        dummy.position.set(
          center.x + (r() - 0.5) * 0.14,
          center.y + (r() - 0.5) * 0.14,
          center.z + (r() - 0.5) * 0.14
        );
        dummy.scale.setScalar(0.035 + r() * 0.03);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(k++, dummy.matrix);
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT * PER]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial color="#ffffff" roughness={0.7} emissive="#fff7ed" emissiveIntensity={0.35} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* Satin Ribbon                                                        */
/* ------------------------------------------------------------------ */
function Ribbon() {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#881337', roughness: 0.2, metalness: 0.15 }),
    []
  );
  return (
    <group position={[0, -1.55, 0]}>
      <mesh rotation-x={Math.PI / 2} material={mat}>
        <torusGeometry args={[0.85, 0.055, 12, 64]} />
      </mesh>
      <group position={[0, 0, 0.9]}>
        <mesh position={[-0.32, 0.05, 0]} rotation-z={0.5} scale={[0.38, 0.22, 0.08]} material={mat}>
          <sphereGeometry args={[1, 20, 14]} />
        </mesh>
        <mesh position={[0.32, 0.05, 0]} rotation-z={-0.5} scale={[0.38, 0.22, 0.08]} material={mat}>
          <sphereGeometry args={[1, 20, 14]} />
        </mesh>
        <mesh position={[-0.1, -0.45, 0]} rotation-z={0.22} material={mat}>
          <boxGeometry args={[0.14, 0.8, 0.02]} />
        </mesh>
        <mesh position={[0.1, -0.45, 0]} rotation-z={-0.22} material={mat}>
          <boxGeometry args={[0.14, 0.8, 0.02]} />
        </mesh>
        <mesh scale={[0.12, 0.12, 0.1]} material={mat}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Falling 3D petals in full space                                     */
/* ------------------------------------------------------------------ */
function FallingPetals({ startRef }) {
  const N = 40;
  const mesh = useRef();
  const geo = useMemo(() => makePetal({ w: 0.08, l: 0.16, cup: 0.3, curl: 0.1, seg: [3, 4] }), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#fb7185',
        side: THREE.DoubleSide,
        vertexColors: true,
        roughness: 0.5,
      }),
    []
  );
  const data = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: N }, () => ({
      a: r() * 6.28,
      rad: 0.5 + r() * 3.2,
      y: r() * 6 - 2.5,
      sp: 0.28 + r() * 0.4,
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
    const on = smooth(clamp((since - 3.2) / 1, 0, 1));
    data.forEach((d, i) => {
      d.y -= d.sp * delta;
      if (d.y < -2.6) d.y = 3.6;
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
/* Rig: Swaying gently in breeze                                       */
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
    g.current.rotation.z = Math.sin(t * 0.9) * 0.022;
    g.current.rotation.x = Math.cos(t * 0.7) * 0.016;
  });
  return <group ref={g}>{children}</group>;
}

function Scene({ replayKey, activeId, onPick, onInteractStart, onInteractEnd }) {
  const startRef = useRef(null);
  useEffect(() => {
    startRef.current = null;
  }, [replayKey]);

  return (
    <>
      <ambientLight intensity={1.1} />
      <hemisphereLight args={['#fff1f2', '#fda4af', 0.85]} />
      <directionalLight position={[4, 6, 5]} intensity={2.6} />
      <directionalLight position={[-4, 3, -3]} intensity={1.2} color="#fbcfe8" />
      <directionalLight position={[0, -2, -4]} intensity={0.6} color="#fbbf24" />

      <Rig startRef={startRef}>
        <Paper startRef={startRef} />
        {FLOWERS.map((f) => (
          <Flower key={f.id} data={f} active={activeId === f.id} onPick={onPick} startRef={startRef} />
        ))}
        <Greenery />
        <BabyBreath />
        <Ribbon />
        <FairyLights3D startRef={startRef} />
      </Rig>

      <FallingPetals startRef={startRef} />
      <Sparkles count={80} scale={[7, 7, 7]} size={5} speed={0.45} color="#fde047" />
      <ContactShadows position={[0, -2.3, 0]} opacity={0.4} scale={9} blur={2.6} far={4.5} />

      <OrbitControls
        enablePan={false}
        enableDamping
        autoRotate
        autoRotateSpeed={1.2}
        minDistance={3.8}
        maxDistance={9.5}
        minPolarAngle={0.4}
        maxPolarAngle={1.9}
        target={[0, -0.15, 0]}
        onStart={onInteractStart}
        onEnd={onInteractEnd}
      />
    </>
  );
}

export default function Bouquet3D({ replayKey, activeId, onPick, onInteractStart, onInteractEnd }) {
  return (
    <Canvas
      camera={{ position: [0, 1.4, 6.8], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'none', width: '100%', height: '100%' }}
    >
      <Scene
        replayKey={replayKey}
        activeId={activeId}
        onPick={onPick}
        onInteractStart={onInteractStart}
        onInteractEnd={onInteractEnd}
      />
    </Canvas>
  );
}
