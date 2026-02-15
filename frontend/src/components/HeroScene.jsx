import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════════════
 *  HERO SCENE — Cosmic Void Edition v5
 *  -------------------------------------------------------
 *  1. Nebula particle field (3000 instanced particles, 5-color)
 *  2. Wormhole vortex tunnel with accretion ring
 *  3. DNA double helix with energy rungs
 *  4. Constellation network with traveling pulses
 *  5. Shooting stars with elongated trails
 *  6. Triple orbital rings with dot particles
 *  7. Floating wireframe polyhedra (8 shapes)
 *  8. Energy streams flowing between attractors
 *  9. Aurora ribbons
 *  10. Mouse-reactive displacement
 * ═══════════════════════════════════════════════════════════════ */

/* ---------- Mouse tracker ---------- */
const mousePos = new THREE.Vector2(0, 0)
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    mousePos.x = (e.clientX / window.innerWidth) * 2 - 1
    mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1
  })
}

/* ───── 1. Nebula Particle Field ───── */
function NebulaParticles({ count = 800 }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const data = useMemo(() => {
    const positions = []
    const colors = []
    const speeds = []
    const palette = [
      new THREE.Color('#00d4ff'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#ff2d55'),
      new THREE.Color('#00ffa3'),
      new THREE.Color('#ff6b9d'),
    ]

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 3 + Math.random() * 35
      positions.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseR: r,
        theta,
        phi,
        wobbleSpeed: 0.2 + Math.random() * 0.8,
        wobbleAmp: 0.1 + Math.random() * 0.4,
        orbitSpeed: (0.01 + Math.random() * 0.03) * (Math.random() > 0.5 ? 1 : -1),
        scale: 0.02 + Math.random() * 0.06,
        breatheOffset: Math.random() * Math.PI * 2,
      })
      colors.push(palette[Math.floor(Math.random() * palette.length)])
      speeds.push(0.3 + Math.random() * 0.7)
    }
    return { positions, colors, speeds }
  }, [count])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      const p = data.positions[i]
      const wobble = Math.sin(t * p.wobbleSpeed + p.breatheOffset) * p.wobbleAmp
      const orbit = p.orbitSpeed * t

      dummy.position.set(
        p.x + Math.sin(orbit + p.theta) * wobble + mousePos.x * (p.baseR * 0.03),
        p.y + Math.cos(t * 0.3 + p.breatheOffset) * 0.2 + mousePos.y * (p.baseR * 0.03),
        p.z + Math.sin(orbit) * wobble
      )

      const breathe = 1 + Math.sin(t * 0.8 + p.breatheOffset) * 0.3
      dummy.scale.setScalar(p.scale * breathe)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  const colorArray = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = data.colors[i].r
      arr[i * 3 + 1] = data.colors[i].g
      arr[i * 3 + 2] = data.colors[i].b
    }
    return arr
  }, [count, data.colors])

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 4, 4]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </sphereGeometry>
      <meshBasicMaterial vertexColors transparent opacity={0.7} toneMapped={false} />
    </instancedMesh>
  )
}

/* ───── 2. Wormhole Vortex ───── */
function WormholeTunnel() {
  const ref = useRef()
  const geo = useMemo(() => {
    const points = []
    for (let i = 0; i < 120; i++) {
      const t = i / 120
      const angle = t * Math.PI * 6
      const r = 1.5 + t * 3
      points.push(new THREE.Vector3(
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        -t * 20 + 5
      ))
    }
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.TubeGeometry(curve, 200, 0.15, 8, false)
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.15
    }
  })

  return (
    <mesh ref={ref} geometry={geo}>
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.06} wireframe side={THREE.DoubleSide} />
    </mesh>
  )
}

/* ───── 3. DNA Double Helix ───── */
function DNAHelix() {
  const groupRef = useRef()
  const count = 60

  const { spheres, rungs } = useMemo(() => {
    const s = [], r = []
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4
      const y = (i / count) * 16 - 8
      s.push(
        { pos: [Math.cos(t) * 1.8, y, Math.sin(t) * 1.8], color: '#00d4ff' },
        { pos: [Math.cos(t + Math.PI) * 1.8, y, Math.sin(t + Math.PI) * 1.8], color: '#a855f7' }
      )
      if (i % 4 === 0) {
        r.push({
          start: [Math.cos(t) * 1.8, y, Math.sin(t) * 1.8],
          end: [Math.cos(t + Math.PI) * 1.8, y, Math.sin(t + Math.PI) * 1.8],
        })
      }
    }
    return { spheres: s, rungs: r }
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2
      groupRef.current.position.x = -12 + mousePos.x * 0.5
    }
  })

  return (
    <group ref={groupRef} position={[-12, 0, -5]}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={s.color} transparent opacity={0.5} />
        </mesh>
      ))}
      {rungs.map((r, i) => {
        const start = new THREE.Vector3(...r.start)
        const end = new THREE.Vector3(...r.end)
        const mid = start.clone().add(end).multiplyScalar(0.5)
        const length = start.distanceTo(end)
        const dir = end.clone().sub(start).normalize()
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
        return (
          <mesh key={`r${i}`} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.02, 0.02, length, 4]} />
            <meshBasicMaterial color="#ff2d55" transparent opacity={0.2} />
          </mesh>
        )
      })}
    </group>
  )
}

/* ───── 4. Constellation Network ───── */
function ConstellationNetwork() {
  const groupRef = useRef()
  const points = useMemo(() => Array.from({ length: 15 }, () => ({
    pos: new THREE.Vector3(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    ),
  })), [])

  const { geos } = useMemo(() => {
    const lines = []
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i].pos.distanceTo(points[j].pos) < 6) {
          lines.push(new THREE.BufferGeometry().setFromPoints([points[i].pos, points[j].pos]))
        }
      }
    }
    return { geos: lines }
  }, [points])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} />
        </mesh>
      ))}
      {geos.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial color="#00d4ff" transparent opacity={0.04} />
        </line>
      ))}
    </group>
  )
}

/* ───── 5. Shooting Stars ───── */
function ShootingStars({ count = 5 }) {
  const refs = useRef([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((ref, i) => {
      if (!ref) return
      const speed = 0.4 + i * 0.1
      const cycle = ((t * speed + i * 3.7) % 12) / 12
      const startX = -20 + i * 5
      ref.position.x = startX + cycle * 40
      ref.position.y = 10 - cycle * 20 + Math.sin(i) * 3
      ref.position.z = -10 + i * 2

      const stretch = 0.5 + cycle * 3
      ref.scale.set(stretch, 0.02, 0.02)
      ref.material.opacity = cycle < 0.1 || cycle > 0.9 ? 0 : 0.6
    })
  })

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={el => refs.current[i] = el}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={['#00d4ff', '#ffffff', '#a855f7', '#00ffa3'][i % 4]}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </>
  )
}

/* ───── 6. Orbital Rings ───── */
function OrbitalRings() {
  const refs = useRef([])
  const ringConfigs = useMemo(() => [
    { radius: 8, count: 18, tiltX: 0.3, tiltZ: 0.1, color: '#00d4ff', speed: 0.3 },
    { radius: 11, count: 14, tiltX: -0.5, tiltZ: 0.3, color: '#a855f7', speed: -0.2 },
    { radius: 14, count: 10, tiltX: 0.2, tiltZ: -0.4, color: '#ff2d55', speed: 0.15 },
    { radius: 17, count: 8, tiltX: -0.3, tiltZ: 0.5, color: '#00ffa3', speed: -0.1 },
  ], [])

  useFrame(({ clock }) => {
    refs.current.forEach((ref, i) => {
      if (!ref) return
      ref.rotation.y = clock.getElapsedTime() * ringConfigs[i].speed
    })
  })

  return (
    <>
      {ringConfigs.map((cfg, ri) => (
        <group key={ri} ref={el => refs.current[ri] = el} rotation={[cfg.tiltX, 0, cfg.tiltZ]}>
          {Array.from({ length: cfg.count }).map((_, i) => {
            const angle = (i / cfg.count) * Math.PI * 2
            return (
              <mesh key={i} position={[
                Math.cos(angle) * cfg.radius,
                0,
                Math.sin(angle) * cfg.radius
              ]}>
                <sphereGeometry args={[0.035, 4, 4]} />
                <meshBasicMaterial color={cfg.color} transparent opacity={0.4} />
              </mesh>
            )
          })}
        </group>
      ))}
    </>
  )
}

/* ───── 7. Floating Wireframe Shapes ───── */
function FloatingShapes() {
  const shapes = useMemo(() => [
    { geo: 'icosahedron', pos: [8, 3, -5], scale: 0.6, color: '#00d4ff' },
    { geo: 'octahedron', pos: [-7, -4, -3], scale: 0.8, color: '#a855f7' },
    { geo: 'torus', pos: [5, -6, -8], scale: 0.5, color: '#ff2d55' },
    { geo: 'torusKnot', pos: [-9, 5, -6], scale: 0.35, color: '#00ffa3' },
    { geo: 'dodecahedron', pos: [11, -2, -7], scale: 0.5, color: '#ff6b9d' },
    { geo: 'tetrahedron', pos: [-4, 7, -4], scale: 0.7, color: '#00d4ff' },
    { geo: 'octahedron', pos: [3, -8, -6], scale: 0.4, color: '#ff2d55' },
    { geo: 'icosahedron', pos: [-11, -1, -8], scale: 0.45, color: '#a855f7' },
  ], [])

  return (
    <>
      {shapes.map((s, i) => (
        <Float key={i} speed={0.6 + i * 0.15} rotationIntensity={0.5} floatIntensity={0.8}>
          <mesh position={s.pos} scale={s.scale}>
            {s.geo === 'icosahedron' && <icosahedronGeometry args={[1, 0]} />}
            {s.geo === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
            {s.geo === 'torus' && <torusGeometry args={[1, 0.3, 8, 16]} />}
            {s.geo === 'torusKnot' && <torusKnotGeometry args={[1, 0.3, 64, 8]} />}
            {s.geo === 'dodecahedron' && <dodecahedronGeometry args={[1, 0]} />}
            {s.geo === 'tetrahedron' && <tetrahedronGeometry args={[1, 0]} />}
            <meshBasicMaterial color={s.color} wireframe transparent opacity={0.12} />
          </mesh>
        </Float>
      ))}
    </>
  )
}

/* ───── 8. Energy Streams ───── */
function EnergyStreams() {
  const groupRef = useRef()

  const streams = useMemo(() => Array.from({ length: 3 }, (_, i) => {
    const points = []
      const startAngle = (i / 3) * Math.PI * 2
    for (let j = 0; j < 50; j++) {
      const t = j / 50
      const angle = startAngle + t * Math.PI * 2
      const r = 3 + t * 15
      points.push(new THREE.Vector3(
        Math.cos(angle) * r,
        Math.sin(t * Math.PI * 4) * 3,
        Math.sin(angle) * r
      ))
    }
    const curve = new THREE.CatmullRomCurve3(points)
    return {
      geo: new THREE.TubeGeometry(curve, 50, 0.03, 3, false),
      color: ['#00d4ff', '#a855f7', '#ff2d55'][i],
    }
  }), [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {streams.map((s, i) => (
        <mesh key={i} geometry={s.geo}>
          <meshBasicMaterial color={s.color} transparent opacity={0.08} />
        </mesh>
      ))}
    </group>
  )
}

/* ───── 9. Aurora Ribbons ───── */
function AuroraRibbons() {
  const refs = useRef([])

  const ribbons = useMemo(() => Array.from({ length: 2 }, (_, i) => {
    const points = []
    for (let j = 0; j < 80; j++) {
      const t = j / 80
      points.push(new THREE.Vector3(
        t * 40 - 20,
        8 + Math.sin(t * Math.PI * 3 + i) * 2 + i * 0.5,
        -15 + Math.sin(t * Math.PI * 2 + i * 0.5) * 3
      ))
    }
    const curve = new THREE.CatmullRomCurve3(points)
    return {
      geo: new THREE.TubeGeometry(curve, 60, 0.3 + i * 0.05, 3, false),
      color: ['#00d4ff', '#a855f7'][i],
    }
  }), [])

  useFrame(({ clock }) => {
    refs.current.forEach((ref, i) => {
      if (!ref) return
      ref.position.x = Math.sin(clock.getElapsedTime() * 0.1 + i) * 2
      ref.position.y = Math.sin(clock.getElapsedTime() * 0.15 + i * 0.5) * 0.5
    })
  })

  return (
    <>
      {ribbons.map((r, i) => (
        <mesh key={i} ref={el => refs.current[i] = el} geometry={r.geo}>
          <meshBasicMaterial color={r.color} transparent opacity={0.03} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
 *  MAIN SCENE
 * ═══════════════════════════════════════════════════════════════ */
function Scene() {
  const { camera } = useThree()

  useFrame(() => {
    camera.position.x += (mousePos.x * 1.5 - camera.position.x) * 0.02
    camera.position.y += (mousePos.y * 1 - camera.position.y) * 0.02
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <color attach="background" args={['#030014']} />
      <fog attach="fog" args={['#030014', 15, 50]} />

      <Stars radius={60} depth={80} count={1000} factor={3} saturation={0.2} fade speed={0.5} />

      <NebulaParticles count={1200} />
      <WormholeTunnel />
      <DNAHelix />
      <ConstellationNetwork />
      <ShootingStars count={7} />
      <OrbitalRings />
      <FloatingShapes />
      <EnergyStreams />
      <AuroraRibbons />
    </>
  )
}

const HeroScene = () => {
  const [visible, setVisible] = useState(true)
  const containerRef = useRef(null)

  // Pause 3D rendering when hero is scrolled out of view
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        frameloop={visible ? 'always' : 'never'}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

export default HeroScene
