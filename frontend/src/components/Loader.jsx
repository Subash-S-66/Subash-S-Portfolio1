import React, { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { personalInfo } from '../data/personal'

/* ═══════════════════════════════════════════════════════════════
 *  LOADER — Cinematic Sci-Fi Boot Sequence v5
 *  -------------------------------------------------------
 *  Layer 1 : Digital rain / code matrix (canvas)
 *  Layer 2 : Particle vortex convergence (canvas)
 *  Layer 3 : Neural-link network pulses (canvas)
 *  Layer 4 : Scanlines + CRT warp
 *  Layer 5 : Terminal boot sequence (DOM)
 *  Layer 6 : Name reveal with chromatic aberration glitch
 *  Layer 7 : Progress bar + percentage counter
 *  Layer 8 : Electromagnetic shockwave exit
 * ═══════════════════════════════════════════════════════════════ */

/* ---------- constants ---------- */
const TOTAL_DURATION = 4200 // ms
const NAME = personalInfo.name
const FIRST = NAME.split(' ')[0]
const LAST = NAME.split(' ').slice(1).join(' ')

const BOOT_LINES = [
  { text: '> INITIALIZING NEURAL CORE...', delay: 0 },
  { text: '> LOADING QUANTUM PROCESSOR [OK]', delay: 250 },
  { text: '> ESTABLISHING SECURE TUNNEL...', delay: 500 },
  { text: '> COMPILING SHADER PIPELINE [OK]', delay: 750 },
  { text: '> SCANNING BIO-SIGNATURE...', delay: 950 },
  { text: `> IDENTITY VERIFIED: ${NAME.toUpperCase()}`, delay: 1200 },
  { text: '> DEPLOYING PORTFOLIO MATRIX [OK]', delay: 1500 },
  { text: '> SYSTEM ONLINE ■', delay: 1800 },
]

const Loader = ({ onComplete }) => {
  const containerRef = useRef(null)
  const matrixRef = useRef(null)
  const vortexRef = useRef(null)
  const neuralRef = useRef(null)
  const nameRef = useRef(null)
  const termRef = useRef(null)
  const progressRef = useRef(null)

  const [percent, setPercent] = useState(0)
  const [phase, setPhase] = useState('boot') // boot | loading | reveal | exit
  const [termLines, setTermLines] = useState([])
  const [glitchActive, setGlitchActive] = useState(false)

  /* ───── Digital-rain matrix canvas ───── */
  useEffect(() => {
    const cvs = matrixRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    const resize = () => { cvs.width = window.innerWidth; cvs.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const fontSize = 13
    const cols = Math.ceil(cvs.width / fontSize)
    const drops = Array.from({ length: cols }, () => Math.random() * -50)
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ0123456789ABCDEF<>{}/\\|[]'

    const colors = ['#00d4ff', '#a855f7', '#00ffa3']
    let raf
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fillRect(0, 0, cvs.width, cvs.height)
      for (let i = 0; i < cols; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const color = colors[i % colors.length]
        ctx.fillStyle = color
        ctx.globalAlpha = 0.35 + Math.random() * 0.25
        ctx.font = `${fontSize}px "JetBrains Mono", monospace`
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > cvs.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.5 + Math.random() * 0.5
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  /* ───── Particle vortex convergence ───── */
  useEffect(() => {
    const cvs = vortexRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    const resize = () => { cvs.width = window.innerWidth; cvs.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const cx = cvs.width / 2, cy = cvs.height / 2
    const particles = Array.from({ length: 120 }, (_, i) => {
      const angle = (i / 120) * Math.PI * 8
      const radius = 50 + Math.random() * Math.max(cvs.width, cvs.height) * 0.6
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        targetX: cx + (Math.random() - 0.5) * 60,
        targetY: cy + (Math.random() - 0.5) * 30,
        angle,
        radius,
        baseRadius: radius,
        size: Math.random() * 2.5 + 0.5,
        speed: 0.002 + Math.random() * 0.004,
        color: ['#00d4ff', '#a855f7', '#ff2d55', '#00ffa3', '#ffffff'][Math.floor(Math.random() * 5)],
        converge: 0,
        trail: [],
      }
    })

    const startTime = performance.now()
    let raf, dead = false

    const draw = (now) => {
      if (dead) return
      const elapsed = now - startTime
      const convergeFactor = Math.min(elapsed / 3000, 1)

      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(0, 0, cvs.width, cvs.height)

      particles.forEach(p => {
        p.angle += p.speed
        const currentRadius = p.baseRadius * (1 - convergeFactor * 0.92)
        const spiralX = cx + Math.cos(p.angle) * currentRadius
        const spiralY = cy + Math.sin(p.angle) * currentRadius

        p.x += (spiralX - p.x) * 0.04
        p.y += (spiralY - p.y) * 0.04

        // Trail
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 8) p.trail.shift()

        // Draw trail
        for (let t = 0; t < p.trail.length; t++) {
          const alpha = (t / p.trail.length) * 0.3 * convergeFactor
          ctx.beginPath()
          ctx.arc(p.trail[t].x, p.trail[t].y, p.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = alpha
          ctx.fill()
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 + convergeFactor * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.4 + convergeFactor * 0.6
        ctx.fill()

        // (glow removed for performance)
      })

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { dead = true; cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  /* ───── Neural-link network pulses ───── */
  useEffect(() => {
    const cvs = neuralRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    const resize = () => { cvs.width = window.innerWidth; cvs.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const nodes = Array.from({ length: 20 }, () => ({
      x: Math.random() * cvs.width,
      y: Math.random() * cvs.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2 + 1,
    }))

    const pulses = []
    let raf, dead = false

    const draw = () => {
      if (dead) return
      ctx.clearRect(0, 0, cvs.width, cvs.height)

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > cvs.width) n.vx *= -1
        if (n.y < 0 || n.y > cvs.height) n.vy *= -1
      })

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 180)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 212, 255, 0.25)'
        ctx.fill()
      })

      // Random pulse generation
      if (Math.random() < 0.04 && pulses.length < 10) {
        const startNode = nodes[Math.floor(Math.random() * nodes.length)]
        pulses.push({
          x: startNode.x, y: startNode.y,
          radius: 0, maxRadius: 80 + Math.random() * 100,
          alpha: 0.6,
        })
      }

      // Animate pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.radius += 2
        p.alpha -= 0.012
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(168, 85, 247, ${Math.max(p.alpha, 0)})`
        ctx.lineWidth = 1
        ctx.stroke()
        if (p.alpha <= 0) pulses.splice(i, 1)
      }

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { dead = true; cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  /* ───── Terminal boot sequence ───── */
  useEffect(() => {
    BOOT_LINES.forEach(line => {
      const timer = setTimeout(() => {
        setTermLines(prev => [...prev, line.text])
      }, line.delay)
      return () => clearTimeout(timer) // cleanup isn't perfect here but short-lived
    })
  }, [])

  /* ───── Progress counter ───── */
  useEffect(() => {
    const start = performance.now()
    let raf
    const tick = (now) => {
      const elapsed = now - start
      const p = Math.min(Math.round((elapsed / TOTAL_DURATION) * 100), 100)
      setPercent(p)

      if (p < 30) setPhase('boot')
      else if (p < 85) setPhase('loading')
      else setPhase('reveal')

      if (p < 100) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* ───── Glitch flicker effect ───── */
  useEffect(() => {
    const intervals = []
    // Random glitch bursts
    const startGlitch = () => {
      const id = setInterval(() => {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 80 + Math.random() * 120)
      }, 800 + Math.random() * 2000)
      intervals.push(id)
    }
    const timer = setTimeout(startGlitch, 1000)
    return () => { clearTimeout(timer); intervals.forEach(clearInterval) }
  }, [])

  /* ───── Master GSAP exit timeline ───── */
  useEffect(() => {
    if (percent < 100) return
    const el = containerRef.current
    if (!el) return

    const tl = gsap.timeline({
      onComplete: () => onComplete?.(),
    })

    // Intense screen flash
    tl.to(el, { backgroundColor: '#00d4ff', duration: 0.06 })
      .to(el, { backgroundColor: '#ffffff', duration: 0.04 })
      .to(el, { backgroundColor: '#000', duration: 0.08 })
      // Screen shake
      .to(el, { x: -8, duration: 0.04 })
      .to(el, { x: 8, duration: 0.04 })
      .to(el, { x: -4, duration: 0.03 })
      .to(el, { x: 0, duration: 0.03 })
      // Chromatic split
      .to('.loader-name-main', {
        textShadow: '-6px 0 #00d4ff, 6px 0 #ff2d55',
        duration: 0.1,
      }, '-=0.1')
      .to('.loader-name-main', {
        textShadow: '-12px 0 #00d4ff, 12px 0 #ff2d55',
        duration: 0.08,
      })
      .to('.loader-name-main', {
        textShadow: '0 0 transparent',
        duration: 0.06,
      })
      // Scale burst everything
      .to('.loader-center-content', { scale: 1.15, opacity: 0.8, duration: 0.15 })
      .to('.loader-center-content', { scale: 0, opacity: 0, duration: 0.3, ease: 'power4.in' })
      // EMP ring
      .to('.emp-ring', {
        scale: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
      }, '-=0.4')
      // Final wipe
      .to(el, { clipPath: 'circle(0% at 50% 50%)', duration: 0.5, ease: 'power3.in' }, '-=0.3')

    return () => tl.kill()
  }, [percent, onComplete])

  return (
    <div ref={containerRef} className="loader-container">
      {/* Canvas layers */}
      <canvas ref={matrixRef} className="absolute inset-0 z-[1] opacity-40" />
      <canvas ref={vortexRef} className="absolute inset-0 z-[2]" />
      <canvas ref={neuralRef} className="absolute inset-0 z-[3] opacity-60" />

      {/* Scanlines */}
      <div className="loader-scanlines z-[4]" />

      {/* CRT vignette */}
      <div className="absolute inset-0 z-[4] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Horizontal scan bars */}
      <div className="loader-bars z-[5]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="loader-bar" style={{
            top: `${(i + 1) * 9}%`,
            animation: `scan-bar ${2 + i * 0.3}s linear infinite`,
            animationDelay: `${i * 0.2}s`,
            opacity: 0.4,
          }} />
        ))}
      </div>

      {/* Terminal boot text */}
      <div ref={termRef} className="absolute top-6 left-6 z-[6] max-w-sm">
        {termLines.map((line, i) => (
          <div key={i} className="font-mono text-xs leading-relaxed"
            style={{
              color: line.includes('[OK]') ? '#00ffa3' :
                     line.includes('VERIFIED') ? '#00d4ff' :
                     line.includes('ONLINE') ? '#a855f7' : 'rgba(255,255,255,0.2)',
              textShadow: line.includes('[OK]') ? '0 0 6px #00ffa340' : 'none',
            }}
          >
            {line}
          </div>
        ))}
        <div className="w-2 h-3 bg-white/20 mt-1" style={{
          animation: 'blink 0.8s step-end infinite',
        }} />
      </div>

      {/* Phase indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[6] flex items-center gap-4">
        {['boot', 'loading', 'reveal'].map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full transition-all duration-500" style={{
              backgroundColor: phase === p ? ['#00d4ff', '#a855f7', '#00ffa3'][i] : 'rgba(255,255,255,0.1)',
              boxShadow: phase === p ? `0 0 8px ${['#00d4ff', '#a855f7', '#00ffa3'][i]}60` : 'none',
            }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]" style={{
              color: phase === p ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
            }}>{p}</span>
          </div>
        ))}
      </div>

      {/* Counter */}
      <div className="loader-counter z-[6]">
        <span className="loader-counter-number">{String(percent).padStart(3, '0')}</span>
        <span className="loader-counter-percent">%</span>
      </div>

      {/* Corner brackets */}
      {[
        'top-4 left-4 border-l-2 border-t-2',
        'top-4 right-4 border-r-2 border-t-2',
        'bottom-4 left-4 border-l-2 border-b-2',
        'bottom-4 right-4 border-r-2 border-b-2',
      ].map((pos, i) => (
        <div key={i} className={`absolute w-8 h-8 z-[6] ${pos}`} style={{
          borderColor: ['#00d4ff30', '#a855f730', '#ff2d5530', '#00ffa330'][i],
          animation: `corner-pulse ${2 + i * 0.3}s ease-in-out infinite`,
        }} />
      ))}

      {/* EMP rings for exit */}
      <div className="absolute inset-0 flex items-center justify-center z-[7] pointer-events-none">
        {[0, 1, 2].map(i => (
          <div key={i} className="emp-ring absolute w-12 h-12 rounded-full border" style={{
            borderColor: ['#00d4ff50', '#a855f750', '#ff2d5550'][i],
          }} />
        ))}
      </div>

      {/* Center content */}
      <div className="loader-center z-[8] loader-center-content">
        {/* Rotating rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full border border-dashed border-white/[0.04] animate-[spin_12s_linear_infinite]" />
          <div className="absolute w-64 h-64 rounded-full border border-dotted border-white/[0.03] animate-[spin_20s_linear_infinite_reverse]" />
          <div className="absolute w-80 h-80 rounded-full border border-white/[0.02] animate-[spin_30s_linear_infinite]" />
        </div>

        {/* Name display */}
        <div ref={nameRef} className="relative">
          <h1 className={`loader-name loader-name-main ${glitchActive ? 'loader-glitch-active' : ''}`}>
            <span className="text-white">{FIRST}</span>
            <span className="loader-name-accent"> {LAST}</span>
          </h1>

          {/* Chromatic aberration layers */}
          {glitchActive && (
            <>
              <h1 className="loader-name absolute top-0 left-0 w-full text-center opacity-60"
                style={{ color: '#00d4ff', transform: 'translate(-3px, -1px)', clipPath: 'inset(15% 0 60% 0)' }}>
                <span>{FIRST}</span><span> {LAST}</span>
              </h1>
              <h1 className="loader-name absolute top-0 left-0 w-full text-center opacity-60"
                style={{ color: '#ff2d55', transform: 'translate(3px, 1px)', clipPath: 'inset(50% 0 20% 0)' }}>
                <span>{FIRST}</span><span> {LAST}</span>
              </h1>
            </>
          )}
        </div>

        {/* Tagline */}
        <div className="loader-tagline mt-4 overflow-hidden">
          <span style={{
            display: 'inline-block',
            animation: 'slide-up-in 0.6s ease-out 0.8s both',
          }}>
            {personalInfo.title}
          </span>
        </div>

        {/* Data readouts */}
        <div className="flex justify-center gap-8 mt-6">
          {['NEURAL_LINK', 'QUANTUM_STATE', 'MATRIX_CORE'].map((label, i) => (
            <div key={label} className="text-center">
              <div className="text-[10px] font-mono tracking-[0.2em] text-white/20">{label}</div>
              <div className="text-xs font-mono mt-0.5" style={{
                color: ['#00d4ff60', '#a855f760', '#00ffa360'][i],
              }}>
                {percent > 30 + i * 20 ? 'ACTIVE' : '-.--'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="loader-progress-track z-[8]">
        <div ref={progressRef} className="loader-progress-fill" style={{ width: `${percent}%` }} />
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes scan-bar {
          0% { transform: scaleX(0); opacity: 0; }
          50% { transform: scaleX(1); opacity: 0.3; }
          100% { transform: scaleX(0); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes corner-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes slide-up-in {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .loader-glitch-active {
          animation: loader-heavy-glitch 0.1s steps(1) infinite;
        }
        @keyframes loader-heavy-glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </div>
  )
}

export default Loader
