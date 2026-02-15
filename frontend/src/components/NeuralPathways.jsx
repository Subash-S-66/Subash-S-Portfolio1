import React, { useRef, useEffect, memo } from 'react'

/**
 * NeuralPathways — The signature visual motif of the portfolio.
 *
 * A persistent canvas overlay drawing an evolving neural network:
 * - Nodes positioned along viewport edges with organic wobble
 * - Curved connections with subtle opacity
 * - Energy pulses traveling between nodes with trails
 * - Cursor-proximity glow reactions
 * - Scroll-synced vertical positioning
 *
 * Performance: requestAnimationFrame, only draws visible nodes,
 * max 2x DPR, simple shapes.
 */
const NeuralPathways = memo(() => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio, 2)
    let width = 0
    let height = 0
    let scrollY = 0
    let mouseX = -9999
    let mouseY = -9999
    let raf = 0

    const COLORS = ['#00d4ff', '#a855f7', '#ff2d55', '#00ffa3']
    const NODE_COUNT = 45
    const CONNECTION_LIMIT = 25
    const PULSE_LIMIT = 6

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    /* Node generation — distributed along edges + sparse middle */
    const nodes = Array.from({ length: NODE_COUNT }, (_, i) => {
      const t = i / NODE_COUNT
      const kind = i % 3 // 0 = left, 1 = right, 2 = mid
      let baseX, baseY

      if (kind === 0) {
        baseX = Math.random() * width * 0.08 + 5
        baseY = t * height * 6
      } else if (kind === 1) {
        baseX = width - Math.random() * width * 0.08 - 5
        baseY = t * height * 6
      } else {
        baseX = width * 0.2 + Math.random() * width * 0.6
        baseY = t * height * 6
      }

      return {
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        radius: 0.6 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.005 + Math.random() * 0.012,
        wobbleAmpX: 5 + Math.random() * 20,
        wobbleAmpY: 3 + Math.random() * 12,
        wobbleFreq: 0.0003 + Math.random() * 0.0008,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        baseAlpha: 0.06 + Math.random() * 0.14,
      }
    })

    /* Pre-compute connections — prefer cross-viewport links */
    const allConnections = []
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = Math.abs(nodes[i].baseX - nodes[j].baseX)
        const dy = Math.abs(nodes[i].baseY - nodes[j].baseY)
        const dist = Math.sqrt(dx * dx + dy * dy)
        const crossScore = dx > width * 0.4 ? 2 : 1
        const distScore = dist < height * 0.6 ? 1 : 0

        if (distScore > 0 && dy < height * 1.2) {
          allConnections.push({ from: i, to: j, score: crossScore * distScore, dist })
        }
      }
    }
    const connections = allConnections
      .sort((a, b) => b.score - a.score || a.dist - b.dist)
      .slice(0, CONNECTION_LIMIT)

    /* Energy pulses */
    const pulses = []
    let lastPulseTime = 0
    const addPulse = () => {
      if (pulses.length >= PULSE_LIMIT || connections.length === 0) return
      const conn = connections[Math.floor(Math.random() * connections.length)]
      pulses.push({
        from: conn.from,
        to: conn.to,
        progress: 0,
        speed: 0.002 + Math.random() * 0.006,
        color: nodes[conn.from].color,
        size: 1.5 + Math.random() * 1.5,
        trail: [],
      })
    }

    const onScroll = () => { scrollY = window.scrollY }
    const onMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('resize', resize)

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height)

      if (time - lastPulseTime > 1500) {
        addPulse()
        lastPulseTime = time
      }

      /* Update node positions */
      for (const node of nodes) {
        node.phase += node.phaseSpeed
        node.x = node.baseX + Math.sin(time * node.wobbleFreq) * node.wobbleAmpX
        node.y = node.baseY - scrollY + Math.cos(time * node.wobbleFreq * 0.7) * node.wobbleAmpY
      }

      /* Draw connections */
      for (const conn of connections) {
        const a = nodes[conn.from]
        const b = nodes[conn.to]
        if ((a.y < -200 && b.y < -200) || (a.y > height + 200 && b.y > height + 200)) continue

        const cpX = (a.x + b.x) / 2 + Math.sin(time * 0.0003 + conn.from) * 30
        const cpY = (a.y + b.y) / 2 + Math.cos(time * 0.0004 + conn.to) * 15

        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.quadraticCurveTo(cpX, cpY, b.x, b.y)
        ctx.strokeStyle = a.color
        ctx.globalAlpha = 0.015
        ctx.lineWidth = 0.6
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      /* Draw nodes */
      for (const node of nodes) {
        if (node.y < -80 || node.y > height + 80) continue

        const dx = node.x - mouseX
        const dy = node.y - mouseY
        const mouseDist = Math.sqrt(dx * dx + dy * dy)
        const proximity = Math.max(0, 1 - mouseDist / 180)

        const alpha = node.baseAlpha + Math.sin(node.phase) * 0.06 + proximity * 0.35
        const size = node.radius + proximity * 3.5

        if (proximity > 0.05) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, size * 5, 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.globalAlpha = proximity * 0.05
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.globalAlpha = Math.min(alpha, 0.6)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      /* Draw energy pulses with trails */
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.progress += p.speed

        if (p.progress >= 1) {
          pulses.splice(i, 1)
          continue
        }

        const from = nodes[p.from]
        const to = nodes[p.to]
        const cpX = (from.x + to.x) / 2 + Math.sin(time * 0.0003 + p.from) * 30
        const cpY = (from.y + to.y) / 2 + Math.cos(time * 0.0004 + p.to) * 15

        const t = p.progress
        const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cpX + t * t * to.x
        const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cpY + t * t * to.y

        if (y < -80 || y > height + 80) continue

        p.trail.push({ x, y })
        if (p.trail.length > 8) p.trail.shift()

        /* Trail */
        for (let j = 0; j < p.trail.length; j++) {
          const tp = p.trail[j]
          ctx.beginPath()
          ctx.arc(tp.x, tp.y, p.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = (j / p.trail.length) * 0.15
          ctx.fill()
        }

        /* Outer glow */
        ctx.beginPath()
        ctx.arc(x, y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.08
        ctx.fill()

        /* Core */
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = 0.4 + Math.sin(p.progress * Math.PI) * 0.3
        ctx.fill()
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    />
  )
})

NeuralPathways.displayName = 'NeuralPathways'
export default NeuralPathways
