import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, downloadApkFiles } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  PROJECTS — Cyberpunk Mission Dossier v6
 *  -------------------------------------------------------
 *  - Massive cinematic project number watermark
 *  - Circuit-grid canvas on each card
 *  - Glitch text title on hover
 *  - 3D parallax tilt with depth layers
 *  - Animated scanning laser + data rain columns
 *  - Pulsing LIVE status beacon
 *  - Morphing holographic border with animated gradient
 *  - Staggered hero entrance with 3D flip
 *  - Interactive tech orbs with glow
 *  - Terminal-style feature readout
 *  - Ambient floating particles per card
 *  - Cursor-reactive spotlight + refraction
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Circuit Grid Canvas (visibility-gated) ───── */
function CircuitCanvas({ color, isHovered }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  // Only run canvas when card is in viewport
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) { cancelAnimationFrame(animRef.current); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h

    const resize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w * window.devicePixelRatio
      canvas.height = h * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()

    // Data rain columns
    const cols = Math.floor(w / 18)
    const drops = Array.from({ length: cols }, () => Math.random() * -50)
    const chars = '01アイウエオカキクケコ∞∑∂λπ'

    // Floating particles
    const particles = Array.from({ length: 8 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3,
      pulse: Math.random() * Math.PI * 2,
    }))

    let frame = 0

    const animate = () => {
      frame++
      ctx.clearRect(0, 0, w, h)

      // Floating particles + connections
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.03
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        const alpha = 0.06 + Math.sin(p.pulse) * 0.03
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
        ctx.fill()

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x
          const dy = p.y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `${color}${Math.round(0.03 * (1 - dist / 80) * 255).toString(16).padStart(2, '0')}`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      // Data rain (only on hover)
      if (isHovered) {
        ctx.font = '10px JetBrains Mono, monospace'
        for (let i = 0; i < cols; i++) {
          if (drops[i] > 0) {
            const char = chars[Math.floor(Math.random() * chars.length)]
            const alpha = Math.max(0, 0.15 - drops[i] * 0.002)
            ctx.fillStyle = `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
            ctx.fillText(char, i * 18, drops[i])
          }
          drops[i] += 0.8
          if (drops[i] > h && Math.random() > 0.97) drops[i] = Math.random() * -30
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => cancelAnimationFrame(animRef.current)
  }, [color, isHovered, isVisible])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}

/* ───── Glitch Text Hook ───── */
function useGlitchText(text, active) {
  const [display, setDisplay] = useState(text)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!active) { setDisplay(text); return }
    const glitchChars = '!@#$%^&*_+-=<>?/\\|{}[]~`░▒▓█'
    let iteration = 0
    let lastTime = 0
    const interval = 45 // ms per tick — controls decode speed

    const run = (timestamp) => {
      if (timestamp - lastTime < interval) {
        frameRef.current = requestAnimationFrame(run)
        return
      }
      lastTime = timestamp

      setDisplay(
        text.split('').map((c, i) => {
          if (c === ' ') return ' '
          if (i < iteration) return text[i]
          return glitchChars[Math.floor(Math.random() * glitchChars.length)]
        }).join('')
      )
      iteration += 1
      if (iteration <= text.length) {
        frameRef.current = requestAnimationFrame(run)
      } else {
        setDisplay(text)
      }
    }
    frameRef.current = requestAnimationFrame(run)
    return () => cancelAnimationFrame(frameRef.current)
  }, [active, text])

  return display
}

/* ───── Scanning Laser ───── */
function ScanLaser({ isHovered, color }) {
  return (
    <>
      {/* Horizontal sweep */}
      <motion.div
        initial={{ top: '-2px' }}
        animate={isHovered ? { top: ['0%', '100%', '0%'] } : { top: '-2px' }}
        transition={isHovered ? { duration: 2.5, repeat: Infinity, ease: 'linear' } : {}}
        className="absolute left-0 right-0 h-[1px] z-20 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}90, transparent)`,
          boxShadow: `0 0 15px ${color}30, 0 0 30px ${color}15`,
          opacity: isHovered ? 1 : 0,
        }}
      />
      {/* Trailing glow band */}
      <motion.div
        initial={{ top: '-20px' }}
        animate={isHovered ? { top: ['0%', '100%', '0%'] } : { top: '-20px' }}
        transition={isHovered ? { duration: 2.5, repeat: Infinity, ease: 'linear' } : {}}
        className="absolute left-0 right-0 h-8 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${color}08, transparent)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
    </>
  )
}

/* ───── Project Card ───── */
function ProjectCard({ project, index }) {
  const cardRef = useRef(null)
  const innerRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)

  const glitchedTitle = useGlitchText(project.title, isHovered)

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const spotX = useMotionValue(50)
  const spotY = useMotionValue(50)

  const rotateX = useSpring(useTransform(my, [0, 1], [12, -12]), { stiffness: 200, damping: 18 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 200, damping: 18 })

  // Dramatic scroll entrance
  useEffect(() => {
    if (!cardRef.current) return
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 90%',
      },
    })

    tl.fromTo(cardRef.current, {
      opacity: 0,
      y: 80,
      rotateX: index % 2 === 0 ? -12 : 12,
      rotateY: index % 2 === 0 ? 6 : -6,
      scale: 0.7,
      filter: 'blur(16px)',
      clipPath: 'inset(30% 15% 30% 15% round 16px)',
    }, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      filter: 'blur(0px)',
      clipPath: 'inset(0% 0% 0% 0% round 16px)',
      duration: 1.6,
      delay: index * 0.22,
      ease: 'power3.out',
    })

    return () => tl.kill()
  }, [index])

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mx.set(x)
    my.set(y)
    spotX.set(x * 100)
    spotY.set(y * 100)
  }, [mx, my, spotX, spotY])

  const handleEnter = useCallback(() => setIsHovered(true), [])
  const handleLeave = useCallback(() => {
    setIsHovered(false)
    mx.set(0.5)
    my.set(0.5)
  }, [mx, my])

  const isFeatured = index === 0

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: '1200px',
      }}
      className={`relative rounded-2xl overflow-hidden group ${isFeatured ? 'md:col-span-2' : ''}`}
    >
      {/* Animated holographic border */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 proj-holo-border"
        style={{
          '--card-color': project.color,
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Card body */}
      <div ref={innerRef} className="relative bg-white/[0.012] border border-white/[0.04] group-hover:border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-700 z-10 group-hover:shadow-[0_20px_80px_rgba(0,0,0,0.4)]">

        {/* Ambient scan line on featured card */}
        {isFeatured && <div className="animate-scan-line z-30" />}

        {/* Circuit canvas background */}
        <CircuitCanvas color={project.color} isHovered={isHovered} />

        {/* Scanning laser */}
        <ScanLaser isHovered={isHovered} color={project.color} />

        {/* Cursor spotlight */}
        <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-[5] rounded-2xl overflow-hidden"
          style={{
            background: useTransform([spotX, spotY], ([sx, sy]) =>
              `radial-gradient(400px circle at ${sx}% ${sy}%, ${project.color}0a, transparent 60%)`
            ),
          }}
        />

        {/* Large watermark number */}
        <div className="absolute -top-4 -right-2 text-[120px] md:text-[160px] font-display font-black leading-none pointer-events-none select-none z-0"
          style={{
            WebkitTextStroke: `1px ${project.color}08`,
            color: 'transparent',
            opacity: isHovered ? 1 : 0.4,
            transition: 'opacity 0.5s',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Corner brackets with animated glow */}
        {[
          'top-3 left-3 border-l border-t rounded-tl',
          'top-3 right-3 border-r border-t rounded-tr',
          'bottom-3 left-3 border-l border-b rounded-bl',
          'bottom-3 right-3 border-r border-b rounded-br',
        ].map((pos, i) => (
          <div key={i} className={`absolute w-4 h-4 ${pos} transition-all duration-500 z-30`}
            style={{
              borderColor: isHovered ? `${project.color}50` : 'rgba(255,255,255,0.03)',
              boxShadow: isHovered ? `0 0 6px ${project.color}15` : 'none',
            }}
          />
        ))}

        {/* Content */}
        <div className={`relative z-20 ${isFeatured ? 'p-8 md:p-10' : 'p-6 md:p-7'}`}>

          {/* Top bar: index + status + category */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {/* Project index badge */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/[0.04] bg-white/[0.02]">
                <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider">Proj</span>
                <span className="text-xs font-mono font-semibold" style={{ color: `${project.color}70` }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* LIVE indicator */}
              {project.liveDemo && (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-soft-pulse absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: `${project.color}60` }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: `${project.color}80` }} />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: `${project.color}60` }}>
                    Live
                  </span>
                </div>
              )}
            </div>

            {/* Category */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-2.5 py-1 rounded-md text-xs font-mono border uppercase tracking-wider"
              style={{
                color: `${project.color}70`,
                borderColor: `${project.color}15`,
                backgroundColor: `${project.color}06`,
              }}
            >
              {project.category}
            </motion.div>
          </div>

          {/* Title with glitch */}
          <div className="mb-1">
            <h3 className={`font-display ${isFeatured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} font-bold transition-colors duration-300 relative`}
              style={{ color: isHovered ? project.color : 'rgba(255,255,255,0.85)' }}
            >
              {glitchedTitle}

              {/* Chromatic glitch layers */}
              {isHovered && (
                <>
                  <span className="absolute inset-0 opacity-30" style={{
                    color: '#00d4ff',
                    transform: 'translate(1px, -1px)',
                    clipPath: 'inset(10% 0 60% 0)',
                  }}>
                    {project.title}
                  </span>
                  <span className="absolute inset-0 opacity-30" style={{
                    color: '#ff2d55',
                    transform: 'translate(-1px, 1px)',
                    clipPath: 'inset(50% 0 10% 0)',
                  }}>
                    {project.title}
                  </span>
                </>
              )}
            </h3>
            <p className="text-sm text-white/55 mt-1 font-mono">{project.subtitle}</p>
          </div>

          {/* Meta line */}
          <div className="flex items-center gap-3 mb-4 mt-3">
            <span className="text-sm font-mono text-white/65 px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.03]">{project.role}</span>
            <span className="text-sm font-mono text-white/60">{project.date}</span>
          </div>

          {/* Description */}
          <p className={`text-sm text-white/65 leading-relaxed mb-5 ${isFeatured ? '' : 'line-clamp-3'}`}>
            {project.description}
          </p>

          {/* Features — Terminal style */}
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="flex items-center gap-2 text-sm font-mono text-white/65 hover:text-white/85 transition-colors mb-4 group/btn"
          >
            <span className="text-xs" style={{ color: `${project.color}60` }}>
              {showFeatures ? '▼' : '▸'}
            </span>
            <span className="opacity-40">$</span> features <span className="opacity-30">--list</span>
            <span className="text-white/10">({project.features.length})</span>
          </button>

          <AnimatePresence>
            {showFeatures && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden mb-5"
              >
                <div className="rounded-lg bg-black/30 border border-white/[0.03] p-4 font-mono">
                  {/* Terminal header */}
                  <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-white/[0.04]">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/30" />
                    <span className="ml-2 text-[10px] text-white/20 uppercase tracking-wider">features.log</span>
                  </div>
                  {project.features.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                      className="flex items-start gap-2 py-1"
                    >
                      <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: `${project.color}60` }}>→</span>
                      <span className="text-sm text-white/70">{f}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tech stack orbs — parent-controlled stagger */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {project.techStack.map((tech) => (
              <motion.span
                key={tech}
                variants={{
                  hidden: { opacity: 0, scale: 0.4, y: 16, rotate: -90 },
                  visible: { opacity: 1, scale: 1, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 18 } },
                }}
                whileHover={{
                  scale: 1.15,
                  y: -4,
                  boxShadow: `0 6px 25px ${project.color}20`,
                }}
                className="px-2.5 py-1 rounded-full text-xs font-mono border transition-all duration-300 cursor-default"
                style={{
                  borderColor: isHovered ? `${project.color}20` : 'rgba(255,255,255,0.04)',
                  backgroundColor: isHovered ? `${project.color}06` : 'rgba(255,255,255,0.015)',
                  color: isHovered ? `${project.color}80` : 'rgba(255,255,255,0.40)',
                }}
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/[0.03]">
            {project.liveDemo && (
              <motion.a
                href={project.liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, x: 3 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-mono tracking-wide transition-all duration-500 group/link"
                style={{
                  borderColor: `${project.color}20`,
                  backgroundColor: `${project.color}06`,
                  color: `${project.color}90`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full relative" style={{
                  backgroundColor: project.color,
                  boxShadow: `0 0 8px ${project.color}60`,
                }}>
                  <span className="absolute inset-0 rounded-full animate-soft-pulse" style={{ backgroundColor: `${project.color}40` }} />
                </span>
                View Live
                <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.a>
            )}

            {project.apkDownloads && (
              <motion.button
                onClick={() => downloadApkFiles(project.apkDownloads)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] text-sm font-mono text-white/60 hover:text-green-400/80 hover:border-green-400/20 hover:bg-green-400/[0.04] transition-all duration-500"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download APK
              </motion.button>
            )}
          </div>
        </div>

        {/* Bottom accent line with glow */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + index * 0.1, duration: 1 }}
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left z-30"
          style={{
            background: `linear-gradient(to right, ${project.color}60, ${project.color}20, transparent)`,
            boxShadow: `0 0 10px ${project.color}20`,
          }}
        />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const Projects = () => {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)

  // Heading character animation — dramatic 3D scatter
  useEffect(() => {
    if (!headingRef.current) return
    const chars = headingRef.current.querySelectorAll('.proj-char')
    gsap.fromTo(chars, {
      opacity: 0,
      y: 80,
      x: () => gsap.utils.random(-40, 40),
      rotateX: -120,
      rotateZ: () => gsap.utils.random(-20, 20),
      scale: 0.3,
      filter: 'blur(8px)',
    }, {
      opacity: 1,
      y: 0,
      x: 0,
      rotateX: 0,
      rotateZ: 0,
      scale: 1,
      filter: 'blur(0px)',
      stagger: 0.06,
      duration: 1,
      ease: 'elastic.out(1, 0.5)',
      scrollTrigger: {
        trigger: headingRef.current,
        start: 'top 85%',
      },
    })
  }, [])

  return (
    <section ref={sectionRef} id="projects" className="relative py-16 md:py-24 px-6 overflow-hidden aurora-bg">
      {/* Morphing archive shape */}
      <div
        className="absolute top-1/4 right-1/4 w-[550px] h-[550px] morph-shape pointer-events-none opacity-[0.012]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,45,85,0.05), rgba(168,85,247,0.03), transparent 70%)',
          filter: 'blur(75px)',
          animationDelay: '8s',
        }}
      />

      {/* Synaptic flash */}
      <div className="absolute inset-0 synaptic-flash pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 60% 30%, rgba(255,45,85,0.025), transparent 60%)', animationDelay: '3s' }}
      />

      {/* Ambient background nebulas — animated blobs */}
      <motion.div
        animate={{ x: [-30, 30, -30], y: [-20, 20, -20], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-purple-500/[0.025] blur-[120px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />
      <motion.div
        animate={{ x: [20, -20, 20], y: [15, -15, 15], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-1/4 left-0 w-[700px] h-[700px] rounded-full bg-cyan-500/[0.02] blur-[130px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />
      <motion.div
        animate={{ x: [-15, 15, -15], scale: [1, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-pink-500/[0.015] blur-[100px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />

      {/* Grid lines decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-[1px] w-16 bg-gradient-to-r from-transparent to-cyan-400/20 origin-right"
            />
            <span className="text-sm font-mono uppercase tracking-[0.5em] text-shimmer flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-cyan-400/30" />
              <span className="scene-chapter mr-1">III</span> Memory Archives
              <span className="w-1 h-1 rounded-full bg-cyan-400/30" />
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-[1px] w-16 bg-gradient-to-l from-transparent to-cyan-400/20 origin-left"
            />
          </motion.div>

          <h2 ref={headingRef} className="font-display text-5xl md:text-7xl font-bold text-white mb-5" style={{ perspective: '1000px' }}>
            {'Projects'.split('').map((char, i) => (
              <span key={i} className="proj-char inline-block" style={{ transformStyle: 'preserve-3d' }}>
                {char}
              </span>
            ))}
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-center gap-4 text-sm font-mono text-white/60"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-cyan-400/30" />
              {projects.length} projects
            </span>
            <span className="text-white/5">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-purple-400/30" />
              Full-Stack
            </span>
            <span className="text-white/5">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-pink-400/30" />
              AI/ML
            </span>
          </motion.div>
        </div>

        {/* Project cards — first one spans full width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* Bottom section count */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-sm font-mono text-white/50 uppercase tracking-[0.3em]">
            End of transmission — {projects.length}/{projects.length} loaded
          </p>
        </motion.div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes proj-holo-spin {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        .proj-holo-border {
          background: linear-gradient(90deg,
            var(--card-color),
            #a855f7,
            #ff2d55,
            #00ffa3,
            var(--card-color)
          );
          background-size: 300% 100%;
          animation: proj-holo-spin 3s linear infinite;
        }
      `}</style>
    </section>
  )
}

export default Projects
