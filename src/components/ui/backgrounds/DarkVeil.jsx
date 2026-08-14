import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl'
import { useTheme } from '../../../context/ThemeContext.jsx'
import { cn } from '../../../lib/utils.js'
import './DarkVeil.css'

const VERT = `
precision highp float;
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
uniform float u_time;
uniform float u_scroll;
uniform vec2 u_resolution;
uniform bool u_light;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv - 0.5;
  float d = length(p);
  float t = u_time * 0.12;
  float s = u_scroll * 0.0003;

  float wave = sin(uv.x * 5.0 + t * 2.0) * cos(uv.y * 4.0 - t * 1.4) * 0.5 + 0.5;
  float field = sin((uv.x + uv.y * 0.6) * 7.0 + t * 3.0 + d * 4.0 - s * 3.0) * 0.5 + 0.5;

  vec3 color = u_light
    ? vec3(0.965, 0.97, 0.995)
    : vec3(0.035, 0.03, 0.05);
  color += u_light
    ? vec3(0.49, 0.35, 0.95) * wave * 0.055
    : vec3(0.2, 0.14, 0.36) * wave * 0.5;
  color += u_light
    ? vec3(0.1, 0.55, 0.7) * field * 0.04
    : vec3(0.05, 0.22, 0.28) * field * 0.35;

  gl_FragColor = vec4(color, 1.0);
}
`

/**
 * DarkVeil — deep violet-ink WebGL veil with slow drift + scroll parallax.
 * variant: 'auto' follows the app theme, 'dark'/'light' force a side.
 * Sits behind content; children render above.
 */
export function DarkVeil({ children, className, variant = 'auto' }) {
  const containerRef = useRef(null)
  const { isDark } = useTheme()
  const light = variant === 'light' || (variant === 'auto' && !isDark)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const renderer = new Renderer({ dpr: 2 })
    const gl = renderer.gl
    gl.clearColor(light ? 0.965 : 0.035, light ? 0.97 : 0.03, light ? 0.995 : 0.05, 1)
    container.appendChild(gl.canvas)

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        u_time: { value: 0 },
        u_scroll: { value: 0 },
        u_light: { value: light },
        u_resolution: { value: new Vec2(container.clientWidth, container.clientHeight) },
      },
    })

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height)
      program.uniforms.u_resolution.value = new Vec2(gl.drawingBufferWidth, gl.drawingBufferHeight)
    }
    resize()
    window.addEventListener('resize', resize)

    const onScroll = () => {
      program.uniforms.u_scroll.value = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    let animationId
    const update = (t) => {
      animationId = requestAnimationFrame(update)
      program.uniforms.u_time.value = t * 0.001
      renderer.render({ scene: mesh })
    }
    animationId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [light])

  return (
    <div ref={containerRef} className={cn('dark-veil', className)} aria-hidden>
      {children && <div className="pointer-events-auto absolute inset-0 z-10">{children}</div>}
    </div>
  )
}
