import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle, Vec2, Vec3 } from 'ogl'
import { cn } from '../../../lib/utils.js'
import './Plasma.css'

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
uniform vec3 u_color;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv - 0.5;
  float d = length(p);
  float t = u_time * 0.45;

  float wave = sin(d * 7.0 - t * 3.5) * 0.5 + 0.5;
  float wave2 = sin(d * 13.0 + t * 2.2) * 0.5 + 0.5;
  float band = sin(uv.x * 9.0 + t * 2.6) * 0.5 + 0.5;

  vec3 col = u_color;
  col = mix(col, vec3(1.0), wave * 0.35 + wave2 * 0.25);
  col = mix(col, u_color * 0.55, band * 0.4);

  float alpha = smoothstep(0.75, 0.05, d) * (0.25 + wave * 0.3);
  gl_FragColor = vec4(col, alpha);
}
`

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 }
}

/**
 * Plasma — single-hue WebGL plasma field (React Bits pattern).
 * Transparent background so it layers over any hero; children stack above.
 */
export function Plasma({ children, className, color = '#7c5cff' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const renderer = new Renderer({ dpr: 2 })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    container.appendChild(gl.canvas)

    const { r, g, b } = hexToRgb(color)
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: new Vec3(r, g, b) },
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
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [color])

  return (
    <div ref={containerRef} className={cn('plasma-container', className)} aria-hidden>
      {children && <div className="pointer-events-auto absolute inset-0 z-10">{children}</div>}
    </div>
  )
}
