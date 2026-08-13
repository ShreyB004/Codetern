import { useEffect, useRef } from 'react'

/**
 * useCanvasLayer — powers the canvas-based animated backgrounds.
 *
 * Returns a ref to attach to a <canvas>. Handles:
 *  - devicePixelRatio capping (default 1.5) for cheap full-screen layers
 *  - ResizeObserver sizing against the parent element
 *  - pausing the rAF loop when the tab is hidden or the layer is offscreen
 *  - prefers-reduced-motion: paints a single settled frame, then halts
 *
 * The `draw` callback is always read fresh via a ref, so components can keep
 * mutable particle state in their own refs without re-mounting the loop.
 */
export function useCanvasLayer(draw, { dprCap = 1.5 } = {}) {
  const canvasRef = useRef(null)
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cap = dprCap

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let dims = { w: 0, h: 0, dpr: 1 }
    let running = true
    let settled = false
    let raf = 0
    let last = performance.now()

    const setSize = () => {
      const parent = canvas.parentElement
      const rect = parent?.getBoundingClientRect()
      if (!rect || rect.width === 0 || rect.height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, cap)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dims = { w: rect.width, h: rect.height, dpr }
    }

    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (!running || dims.w === 0 || dims.h === 0) return
      const dt = Math.min(now - last, 50)
      last = now
      if (reduced) {
        if (!settled) {
          drawRef.current(ctx, dims.w, dims.h, dims.dpr, now, 0)
          settled = true
        }
        return
      }
      drawRef.current(ctx, dims.w, dims.h, dims.dpr, now, dt)
    }

    setSize()
    const ro = new ResizeObserver(setSize)
    ro.observe(canvas.parentElement)

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting && !document.hidden
    })
    io.observe(canvas.parentElement)

    const onVisibility = () => {
      running = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [dprCap])

  return canvasRef
}
