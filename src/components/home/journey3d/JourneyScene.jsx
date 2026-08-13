/* eslint-disable react/no-unknown-property -- three.js intrinsics (position, map, blending, ...) */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { MoveHorizontal } from 'lucide-react'
import { gsap, ScrollTrigger } from '../../../lib/gsap.js'
import { MILESTONES, NODE_SIZE, RING_RADIUS } from './data.js'

// Device heuristic — decided once at module scope because antialias is a
// WebGL context attribute (must be chosen before the context is created).
const isLowEnd = () =>
  typeof navigator !== 'undefined' &&
  ((navigator.hardwareConcurrency ?? 8) <= 4 ||
    (navigator.deviceMemory ?? 8) <= 4 ||
    /Android|iPhone/i.test(navigator.userAgent))

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const deg = (d) => (d * Math.PI) / 180

// Shared GPU resources — one sphere for all five nodes, one white radial
// glow texture tinted per-node. Module scope: survives StrictMode double
// mount, and R3F never disposes objects passed in as props.
const NODE_SPHERE = new THREE.SphereGeometry(NODE_SIZE, 16, 12)
const RING_GEOM = new THREE.RingGeometry(RING_RADIUS - 0.12, RING_RADIUS + 0.08, 128)
const GLOW_TEX = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.4)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
})()

/** One milestone node: opaque neon core + additive halo + floating label. */
function Node({ milestone, index, coreRef }) {
  const group = useRef(null)
  const labelRef = useRef(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const angle = (index / MILESTONES.length) * Math.PI * 2
  const pos = [Math.cos(angle) * RING_RADIUS, 0, Math.sin(angle) * RING_RADIUS]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    group.current.position.y = Math.sin(t * 0.9 + index * 1.3) * 0.07
    const p = group.current.getWorldPosition(tmp)
    const opacity = 0.35 + 0.65 * clamp((p.z + RING_RADIUS) / (RING_RADIUS * 2), 0, 1)
    if (labelRef.current) labelRef.current.style.opacity = String(opacity)
  })

  return (
    <group position={pos} ref={group}>
      <mesh geometry={NODE_SPHERE} ref={coreRef}>
        <meshBasicMaterial color={milestone.color} toneMapped={false} />
      </mesh>
      <sprite scale={[2.3, 2.3, 1]}>
        <spriteMaterial
          map={GLOW_TEX}
          color={milestone.color}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
      <Html center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={labelRef} className="pointer-events-none select-none whitespace-nowrap">
          <span className="flex items-center gap-1.5 rounded-bubble border border-white/12 bg-ink-soft/80 px-3 py-1.5 text-[10px] font-semibold text-white/85 backdrop-blur-md">
            <span
              className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-black text-ink dark:text-paper"
              style={{ background: milestone.color }}
            >
              {milestone.step[1]}
            </span>
            {milestone.title}
          </span>
        </div>
      </Html>
    </group>
  )
}

/** Sparse static starfield behind the ring. */
function Stars() {
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(120 * 3)
    const col = new Float32Array(120 * 3)
    const palette = ['#b4ff39', '#22d3ee', '#38ffb0', '#7c5cff', '#ff5c7a']
    const c = new THREE.Color()
    for (let i = 0; i < 120; i++) {
      const r = 4 + Math.random() * 8
      const a = Math.random() * Math.PI * 2
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5
      pos[i * 3 + 2] = Math.sin(a) * r
      c.set(palette[i % palette.length])
      const b = 0.2 + Math.random() * 0.8
      col[i * 3] = c.r * b
      col[i * 3 + 1] = c.g * b
      col[i * 3 + 2] = c.b * b
    }
    return { positions: pos, colors: col }
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        sizeAttenuation
        transparent
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

/** Scale the ring so its footprint (~6.6 units) fills ~72% of the viewport width. */
function FitToViewport({ children }) {
  const viewport = useThree((s) => s.viewport)
  const scale = useMemo(() => Math.min(1, (viewport.width * 0.72) / ((RING_RADIUS + NODE_SIZE) * 2 + 0.3)), [viewport.width])
  return <group scale={scale}>{children}</group>
}

/** Stop the render loop when the tab is hidden or the section is off-screen. */
function FrameloopGate({ wrapperRef }) {
  const setFrameloop = useThree((s) => s.setFrameloop)
  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? 'never' : 'always')
    document.addEventListener('visibilitychange', onVis)
    let io
    if (wrapperRef?.current) {
      io = new IntersectionObserver(
        ([e]) => setFrameloop(e.isIntersecting ? 'always' : 'never'),
        { rootMargin: '120px' },
      )
      io.observe(wrapperRef.current)
    }
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      io?.disconnect()
    }
  }, [setFrameloop, wrapperRef])
  return null
}

/** Scene contents — reads a mutable controller shared with the DOM wrapper. */
function Scene({ controller }) {
  const ring = useRef(null)
  const coreRefs = useMemo(() => MILESTONES.map(() => ({ current: null })), [])

  useFrame((_state, delta) => {
    if (!ring.current) return
    const target = deg(controller.baseRot + controller.dragRot)
    ring.current.rotation.y = THREE.MathUtils.damp(ring.current.rotation.y, target, 6, delta)
  })

  return (
    <>
      <FitToViewport>
        <group ref={ring}>
          <mesh geometry={RING_GEOM} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial
              color="#22d3ee"
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          {MILESTONES.map((m, i) => (
            <Node key={m.step} milestone={m} index={i} coreRef={coreRefs[i]} />
          ))}
          <Stars />
        </group>
      </FitToViewport>
    </>
  )
}

/**
 * JourneyScene — WebGL milestone ring. Lazy-loaded (React.lazy) so three +
 * r3f + drei live in a separate async chunk that only loads near the section.
 * Scroll spins the ring, pointer drag adds rotation on top (with inertia).
 */
export default function JourneyScene() {
  const wrapper = useRef(null)
  const controller = useRef({ baseRot: -34, dragRot: 0 })
  const down = useRef(false)
  const lastX = useRef(null)
  const vel = useRef(0)
  const tween = useRef(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!wrapper.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const st = ScrollTrigger.create({
      trigger: wrapper.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        controller.current.baseRot = gsap.utils.interpolate(-34, 34, self.progress)
      },
    })
    return () => st.kill()
  }, [])

  const onPointerDown = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    tween.current?.kill()
    down.current = true
    lastX.current = e.clientX
    vel.current = 0
    setDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!down.current) return
    const dx = e.clientX - (lastX.current ?? e.clientX)
    lastX.current = e.clientX
    controller.current.dragRot = clamp(controller.current.dragRot + dx * 0.4, -170, 170)
    vel.current = dx * 0.4
  }

  const onPointerUp = () => {
    if (!down.current) return
    down.current = false
    setDragging(false)
    const obj = { v: controller.current.dragRot }
    const target = clamp(controller.current.dragRot + vel.current * 9, -170, 170)
    tween.current = gsap.to(obj, {
      v: target,
      duration: 0.7,
      ease: 'power3.out',
      onUpdate: () => {
        controller.current.dragRot = obj.v
      },
    })
  }

  return (
    <div
      ref={wrapper}
      className="absolute inset-0 select-none"
      style={{ touchAction: 'pan-y', cursor: dragging ? 'grabbing' : 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      role="group"
      aria-label="Drag to spin the 3D journey milestones"
    >
      <Canvas
        dpr={isLowEnd() ? [1, 1.5] : [1, 2]}
        gl={{
          alpha: true,
          antialias: !isLowEnd(),
          powerPreference: 'default',
          stencil: false,
        }}
        camera={{ position: [0, 1.6, 7.8], fov: 45, near: 0.1, far: 50 }}
        frameloop="always"
        style={{ width: '100%', height: '100%', touchAction: 'pan-y', outline: 'none' }}
        onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
      >
        <FrameloopGate wrapperRef={wrapper} />
        <Scene controller={controller.current} />
      </Canvas>

      <span className="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-bubble border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/40 backdrop-blur-sm">
        <MoveHorizontal size={11} /> Drag to spin
      </span>
    </div>
  )
}
