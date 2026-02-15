import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroScene from './HeroScene'
import { personalInfo, socialLinks } from '../data/personal'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  HERO SECTION — Quantum Cinema Edition v5
 *  -------------------------------------------------------
 *  - Text scramble name reveal (hacker decode effect)
 *  - Per-character 3D scattered entrance with GSAP
 *  - Typing effect with role rotation
 *  - Magnetic CTA buttons with spring physics
 *  - Canvas floating particles with glow
 *  - Multi-layer parallax mouse tracking
 *  - Floating HUD data readouts
 *  - Social links with magnetic pull
 *  - Scroll indicator with bounce
 *  - Holographic badge decoration
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Text Scramble Hook ───── */
function useTextScramble(text, trigger = true, speed = 30) {
  const [display, setDisplay] = useState('')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>[]{}|/\\'

  useEffect(() => {
    if (!trigger) return
    let frame = 0
    const totalFrames = text.length * 3
    let raf

    const scramble = () => {
      let result = ''
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          result += ' '
        } else if (frame > i * 3) {
          result += text[i]
        } else {
          result += chars[Math.floor(Math.random() * chars.length)]
        }
      }
      setDisplay(result)
      frame++
      if (frame <= totalFrames + 5) {
        raf = setTimeout(() => requestAnimationFrame(scramble), speed)
      }
    }
    scramble()
    return () => clearTimeout(raf)
  }, [text, trigger, speed])

  return display
}

/* ───── Typing Effect Hook ───── */
function useTypingEffect(strings, typeSpeed = 80, deleteSpeed = 40, pauseTime = 2200) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = strings[index]
    let timer

    if (!isDeleting && text === current) {
      timer = setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && text === '') {
      setIsDeleting(false)
      setIndex((prev) => (prev + 1) % strings.length)
    } else {
      timer = setTimeout(() => {
        setText(isDeleting
          ? current.slice(0, text.length - 1)
          : current.slice(0, text.length + 1)
        )
      }, isDeleting ? deleteSpeed : typeSpeed)
    }
    return () => clearTimeout(timer)
  }, [text, index, isDeleting, strings, typeSpeed, deleteSpeed, pauseTime])

  return text
}

/* ───── Magnetic Button ───── */
function MagneticButton({ children, className, ...props }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15 })
  const springY = useSpring(y, { stiffness: 200, damping: 15 })

  const handleMouse = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3)
  }, [x, y])

  const reset = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    </motion.div>
  )
}

/* ───── HUD Data Element ───── */
function HUDElement({ label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.8 }}
      className="flex items-center gap-2 text-sm font-mono"
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }} />
      <span className="text-white/50 uppercase tracking-[0.15em]">{label}</span>
      <span style={{ color: `${color}` }}>{value}</span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const Hero = () => {
  const sectionRef = useRef(null)
  const nameRef = useRef(null)
  const canvasRef = useRef(null)
  const [isNameReady, setIsNameReady] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springMX = useSpring(mouseX, { stiffness: 40, damping: 18 })
  const springMY = useSpring(mouseY, { stiffness: 40, damping: 18 })

  // Multi-layer parallax transforms
  const fgX = useTransform(springMX, [-500, 500], [20, -20])
  const fgY = useTransform(springMY, [-300, 300], [15, -15])
  const bgX = useTransform(springMX, [-500, 500], [-8, 8])
  const bgY = useTransform(springMY, [-300, 300], [-5, 5])
  const midX = useTransform(springMX, [-500, 500], [10, -10])
  const midY = useTransform(springMY, [-300, 300], [6, -6])

  // 3D rotation on mouse move
  const rotateX = useSpring(useTransform(springMY, [-300, 300], [3, -3]), { stiffness: 60, damping: 20 })
  const rotateY = useSpring(useTransform(springMX, [-500, 500], [-3, 3]), { stiffness: 60, damping: 20 })

  // Scroll-based parallax: hero scales down and fades as you scroll down
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])

  // Text scramble for name
  const scrambledName = useTextScramble(personalInfo.name, true, 35)

  // Typing effect for roles
  const typedRole = useTypingEffect(personalInfo.roles, 85, 40, 2200)

  // Mouse tracking — throttled via rAF
  useEffect(() => {
    let rafId = null
    const handleMouse = (e) => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        const rect = sectionRef.current?.getBoundingClientRect()
        if (rect) {
          mouseX.set(e.clientX - rect.width / 2)
          mouseY.set(e.clientY - rect.height / 2)
        }
        rafId = null
      })
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })
    return () => { window.removeEventListener('mousemove', handleMouse); if (rafId) cancelAnimationFrame(rafId) }
  }, [mouseX, mouseY])

  // Per-character GSAP scatter entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNameReady(true)
      const chars = nameRef.current?.querySelectorAll('.hero-char')
      if (!chars?.length) return

      gsap.fromTo(chars, {
        opacity: 0,
        y: () => Math.random() * 120 - 60,
        x: () => Math.random() * 100 - 50,
        rotateX: () => Math.random() * 180 - 90,
        rotateY: () => Math.random() * 180 - 90,
        scale: 0,
        filter: 'blur(12px)',
      }, {
        opacity: 1,
        y: 0,
        x: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        filter: 'blur(0px)',
        stagger: 0.06,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  // Canvas floating particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      color: ['#00d4ff', '#a855f7', '#ff2d55', '#00ffa3'][Math.floor(Math.random() * 4)],
      alpha: 0.15 + Math.random() * 0.25,
      pulse: Math.random() * Math.PI * 2,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.02
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.1

        // Core dot with glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = pulseAlpha
        ctx.fill()

        // Soft outer glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = pulseAlpha * 0.15
        ctx.fill()
        ctx.globalAlpha = 1

        // Connections to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x
          const dy = p.y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.06 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  const scrollToProjects = useCallback(() => {
    const el = document.getElementById('projects')
    if (el && window.__portfolioLenis) {
      window.__portfolioLenis.scrollTo(el, { offset: -80, duration: 1.6 })
    }
  }, [])

  const scrollToContact = useCallback(() => {
    const el = document.getElementById('contact')
    if (el && window.__portfolioLenis) {
      window.__portfolioLenis.scrollTo(el, { offset: -80, duration: 1.6 })
    }
  }, [])

  const [firstName, ...lastNameParts] = personalInfo.name.split(' ')
  const lastName = lastNameParts.join(' ')
  const nameChars = personalInfo.name.split('')

  return (
    <section id="home" ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Scene */}
      <HeroScene />

      {/* Particle canvas overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none" />

      {/* Animated lighting shifts — morphing consciousness orb */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)',
            'radial-gradient(ellipse 80% 60% at 40% 60%, rgba(168,85,247,0.04) 0%, transparent 70%)',
            'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(255,45,85,0.03) 0%, transparent 70%)',
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Morphing shape — consciousness forming */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] morph-shape pointer-events-none z-[1]"
        animate={{
          scale: [1, 1.1, 0.95, 1.05, 1],
          opacity: [0.015, 0.025, 0.01, 0.02, 0.015],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.06), rgba(168,85,247,0.03), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Scroll-based parallax wrapper */}
      <motion.div style={{ scale: heroScale, opacity: heroOpacity, y: heroY }} className="absolute inset-0 z-[2]">

        {/* Background parallax layer */}
        <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cyan-500/[0.04] blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.015, 0.04, 0.015] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-500/[0.03] blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.01, 0.03, 0.01] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-1/2 right-1/6 w-64 h-64 rounded-full bg-pink-500/[0.02] blur-[90px]"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.01, 0.035, 0.01] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            className="absolute bottom-1/4 left-1/6 w-56 h-56 rounded-full bg-green-500/[0.02] blur-[80px]"
          />
        </motion.div>

        {/* Mid-layer floating objects — CSS-only animations */}
        <motion.div style={{ x: midX, y: midY }} className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[20%] left-[15%] w-1.5 h-1.5 rounded-full bg-cyan-400/20 hero-float-1"
            style={{ boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}
          />
          <div
            className="absolute top-[35%] right-[20%] w-2 h-2 rounded-full bg-purple-400/15 hero-float-2"
            style={{ boxShadow: '0 0 16px rgba(168,85,247,0.3)' }}
          />
          <div
            className="absolute bottom-[30%] left-[10%] w-3 h-3 border border-cyan-400/10 rotate-45 hero-float-3"
          />
          <div
            className="absolute top-[60%] right-[12%] w-1.5 h-1.5 rounded-full bg-pink-400/15 hero-float-4"
            style={{ boxShadow: '0 0 12px rgba(255,45,85,0.3)' }}
          />
          {/* Additional floating elements */}
          <div
            className="absolute top-[15%] right-[35%] w-1 h-1 rounded-full bg-green-400/20 hero-float-2"
            style={{ boxShadow: '0 0 10px rgba(0,255,163,0.3)', animationDelay: '3s' }}
          />
          <div
            className="absolute bottom-[20%] right-[30%] w-2.5 h-2.5 border border-purple-400/8 rounded-full hero-float-1"
            style={{ animationDelay: '5s' }}
          />
          <div
            className="absolute top-[45%] left-[25%] w-1 h-4 border-l border-cyan-400/10 hero-float-4"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute top-[75%] left-[40%] w-1 h-1 rounded-full bg-cyan-400/25 hero-float-3"
            style={{ boxShadow: '0 0 8px rgba(0,212,255,0.4)', animationDelay: '7s' }}
          />
          <div
            className="absolute top-[25%] left-[60%] w-4 h-4 border border-white/[0.03] rotate-45 hero-float-2"
            style={{ animationDelay: '4s' }}
          />
          <div
            className="absolute bottom-[40%] left-[70%] w-1 h-1 rounded-full bg-pink-400/20 hero-float-4"
            style={{ boxShadow: '0 0 10px rgba(255,45,85,0.25)', animationDelay: '6s' }}
          />
        </motion.div>

      </motion.div>

      {/* Foreground content with 3D rotation */}
      <motion.div
        style={{ x: fgX, y: fgY, rotateX, rotateY, transformPerspective: 1200, scale: heroScale, opacity: heroOpacity }}
        className="relative z-[3] text-center px-6 max-w-4xl mx-auto will-change-transform"
      >

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-soft-pulse absolute inline-flex h-full w-full rounded-full bg-[#00ffa3] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ffa3]" />
          </span>
          <span className="text-sm font-mono text-white/60 tracking-[0.2em] uppercase">
            Neural System Initialized
          </span>
        </motion.div>

        {/* Name with 3D character scatter + glow pulse */}
        <div ref={nameRef} className="mb-4 relative" style={{ perspective: '1000px' }}>
          {/* Animated glow behind name */}
          <motion.div
            animate={{
              opacity: [0, 0.15, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-[60px] -z-10"
          />
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight">
            {nameChars.map((char, i) => (
              <span
                key={i}
                className="hero-char inline-block glitch-text"
                data-text={char}
                style={{
                  opacity: isNameReady ? undefined : 0,
                  color: i < firstName.length ? 'white' : undefined,
                  transformStyle: 'preserve-3d',
                }}
              >
                {char === ' ' ? (
                  <span>&nbsp;&nbsp;</span>
                ) : (
                  <span className={i >= firstName.length + 1 ? 'text-gradient-hero' : ''}>
                    {char}
                  </span>
                )}
              </span>
            ))}
          </h1>
        </div>

        {/* Role typing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#00d4ff]/30" />
          <span className="text-lg md:text-xl font-mono text-[#00d4ff]/80">
            {typedRole}
            <span className="animate-pulse ml-0.5 text-[#00d4ff]">|</span>
          </span>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#00d4ff]/30" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-lg md:text-xl text-white/60 max-w-lg mx-auto mb-10 leading-relaxed"
        >
          {personalInfo.tagline}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <MagneticButton
            onClick={scrollToProjects}
            className="relative px-8 py-3 rounded-full font-medium text-base text-white overflow-hidden group animate-glow-pulse"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#ff2d55] opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-[1px] rounded-full bg-[#030014]/90 group-hover:bg-[#030014]/70 transition-colors" />
            {/* Animated sweep */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10 flex items-center gap-2">
              View Projects
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </span>
          </MagneticButton>

          <MagneticButton
            onClick={scrollToContact}
            className="px-8 py-3 rounded-full font-medium text-base text-white/60 border border-white/[0.08] hover:border-white/[0.15] hover:text-white/80 transition-all duration-500 hover:bg-white/[0.02]"
          >
            Get In Touch
          </MagneticButton>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="flex items-center justify-center gap-4"
        >
          {socialLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.15 }}
              className="p-2.5 rounded-lg border border-white/[0.08] text-white/50 hover:text-[#00d4ff] hover:border-[#00d4ff]/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all duration-400"
            >
              {link.label === 'GitHub' && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.1.82-.26.82-.58v-2.16c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.3 3.5 1 .1-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18a4.65 4.65 0 0 1 1.24 3.22c0 4.6-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3" />
                </svg>
              )}
              {link.label === 'LinkedIn' && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.45A1.75 1.75 0 0 0 24 22.27V1.73A1.75 1.75 0 0 0 22.22 0z" />
                </svg>
              )}
              {link.label === 'Instagram' && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85 0-3.2.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.63-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z" />
                </svg>
              )}
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      {/* HUD elements - left side */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-[4] hidden lg:flex flex-col gap-3"
      >
        <HUDElement label="CORE" value="AWAKENING" color="#00ffa3" delay={2.5} />
        <HUDElement label="NEURAL" value="ACTIVE" color="#00d4ff" delay={2.7} />
        <HUDElement label="SYNC" value="100%" color="#a855f7" delay={2.9} />
        <HUDElement label="SCENE" value="I / V" color="#ff2d55" delay={3.1} />
      </motion.div>

      {/* HUD elements - right side */}
      <motion.div style={{ opacity: heroOpacity }} className="absolute right-6 top-1/2 -translate-y-1/2 z-[4] hidden lg:flex flex-col gap-3 items-end">
        <HUDElement label="DEPTH" value="∞" color="#00ffa3" delay={2.6} />
        <HUDElement label="SIGNAL" value="STRONG" color="#00d4ff" delay={2.8} />
        <HUDElement label="NODES" value="45" color="#a855f7" delay={3.0} />
        <HUDElement label="PULSE" value="READY" color="#ff2d55" delay={3.2} />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[4] flex flex-col items-center gap-2"
      >
        <span className="text-sm font-mono text-white/50 tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-white/[0.08] flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ height: [4, 12, 4], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-0.5 rounded-full bg-[#00d4ff]"
          />
        </motion.div>
      </motion.div>

      {/* Corner decorations with subtle glow */}
      <div className="absolute top-20 left-6 z-[4] w-16 h-16 border-l border-t border-white/[0.03] animate-border-glow" />
      <div className="absolute top-20 right-6 z-[4] w-16 h-16 border-r border-t border-white/[0.03] animate-border-glow" style={{ animationDelay: '0.75s' }} />
      <div className="absolute bottom-20 left-6 z-[4] w-16 h-16 border-l border-b border-white/[0.03] animate-border-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-20 right-6 z-[4] w-16 h-16 border-r border-b border-white/[0.03] animate-border-glow" style={{ animationDelay: '2.25s' }} />
    </section>
  )
}

export default Hero
