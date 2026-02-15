import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { personalInfo, stats } from '../data/personal'
import { techOrbit } from '../data/skills'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  ABOUT — Neural Profile Matrix v5
 *  -------------------------------------------------------
 *  - Canvas particle network background
 *  - Animated stat counters with digit flip odometer
 *  - 3D perspective timeline with pulse dots
 *  - Bio paragraphs with directional blur reveal
 *  - Tech orbit badges with spin-in entrance
 *  - Parallax depth cards
 *  - Glowing section dividers
 *  - Interactive hover sparkle effects
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Particle Network Background (visibility-gated) ───── */
function ParticleNetwork({ containerRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef?.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    let raf, dead = false, visible = false

    const resize = () => {
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Only animate when section is in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !dead) draw()
      },
      { threshold: 0 }
    )
    observer.observe(container)

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
    }))

    const draw = () => {
      if (dead || !visible) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.03 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 212, 255, 0.15)'
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }

    return () => {
      dead = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [containerRef])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" style={{ willChange: 'contents' }} />
}

/* ───── Animated Stat Counter with digit-by-digit flip ───── */
function StatCounter({ stat, index }) {
  const ref = useRef(null)
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  const colors = ['#00d4ff', '#a855f7', '#ff2d55', '#00ffa3']
  const color = colors[index % colors.length]

  useEffect(() => {
    if (!ref.current) return
    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 85%',
      onEnter: () => {
        if (hasAnimated) return
        setHasAnimated(true)

        const target = parseFloat(stat.value)
        if (isNaN(target)) {
          setCount(stat.value)
          return
        }

        const isDecimal = String(stat.value).includes('.')
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target,
          duration: 2.5,
          ease: 'power2.out',
          onUpdate: () => {
            setCount(isDecimal ? obj.val.toFixed(1) : Math.round(obj.val))
          },
        })
      },
    })
    return () => trigger.kill()
  }, [stat.value, hasAnimated])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.7, type: 'spring', stiffness: 120 }}
      whileHover={{ y: -10, scale: 1.1, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
      className="relative text-center group"
    >
      {/* Glow aura on hover */}
      <div className="absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-10"
        style={{ background: `${color}12` }}
      />

      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 hover:border-white/[0.08] transition-all duration-500 relative overflow-hidden depth-shadow shimmer-on-hover">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Value */}
        <div className="font-display text-3xl md:text-4xl font-bold mb-1" style={{ color }}>
          <span className="tabular-nums">{typeof count === 'number' || !isNaN(count) ? count : stat.value}</span>
          <span className="text-lg text-white/65">{stat.suffix}</span>
        </div>

        {/* Label */}
        <div className="text-sm font-mono uppercase tracking-[0.3em] text-white/65 mt-1">
          {stat.label}
        </div>

        {/* Bottom accent */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: index * 0.15 + 0.5, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
          style={{ background: `linear-gradient(to right, ${color}50, transparent)` }}
        />

        {/* Corner dot */}
        <div className="absolute top-3 right-3 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
    </motion.div>
  )
}

/* ───── Tech Badge variants (parent-controlled stagger, no per-badge observer) ───── */
const techContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
}

const techBadgeVariants = {
  hidden: { opacity: 0, scale: 0.3, y: 16, rotate: -60 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: { type: 'spring', stiffness: 260, damping: 18 },
  },
}

function TechBadge({ tech, index }) {
  return (
    <motion.div
      variants={techBadgeVariants}
      whileHover={{
        y: -8,
        scale: 1.15,
        boxShadow: '0 0 25px rgba(0,212,255,0.2)',
      }}
      className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-sm font-mono text-white/65 hover:text-[#00d4ff] hover:border-[#00d4ff]/25 transition-colors duration-300 group shimmer-on-hover"
      style={{ animation: `tech-float ${3 + (index % 3)}s ease-in-out infinite`, animationDelay: `${index * 0.2}s` }}
    >
      <span className="relative">
        {tech}
        {/* Underline on hover */}
        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#00d4ff]/50 group-hover:w-full transition-all duration-300" />
      </span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const About = () => {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const bioRefs = useRef([])
  const timelineRef = useRef(null)

  // Heading character animation
  useEffect(() => {
    if (!headingRef.current) return
    const chars = headingRef.current.querySelectorAll('.about-char')
    gsap.fromTo(chars, {
      opacity: 0,
      y: 60,
      rotateX: -90,
      scale: 0.5,
    }, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      stagger: 0.04,
      duration: 0.8,
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: headingRef.current,
        start: 'top 85%',
      },
    })
  }, [])

  // Bio paragraphs staggered reveal with blur
  useEffect(() => {
    bioRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.fromTo(el, {
        opacity: 0,
        x: i % 2 === 0 ? -50 : 50,
        filter: 'blur(10px)',
        scale: 0.95,
      }, {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
        },
      })
    })
  }, [])

  // Timeline line animation (scrub)
  useEffect(() => {
    if (!timelineRef.current) return
    gsap.fromTo(timelineRef.current, { scaleY: 0 }, {
      scaleY: 1,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: timelineRef.current,
        start: 'top 85%',
        end: 'bottom 50%',
        scrub: 1,
      },
    })
  }, [])

  return (
    <section id="about" ref={sectionRef} className="relative py-16 md:py-24 px-6 overflow-hidden aurora-bg">
      {/* Canvas particle background */}
      <ParticleNetwork containerRef={sectionRef} />

      {/* Morphing consciousness shape */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] morph-shape pointer-events-none opacity-[0.012]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.08), rgba(168,85,247,0.04), transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Synaptic flash */}
      <div className="absolute inset-0 synaptic-flash pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(0,212,255,0.03), transparent 60%)' }}
      />

      {/* Animated background glow */}
      <motion.div
        animate={{
          x: [-50, 50, -50],
          y: [-30, 30, -30],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.025] blur-[120px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />
      <motion.div
        animate={{
          x: [40, -40, 40],
          y: [20, -20, 20],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/[0.02] blur-[110px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />
      <motion.div
        animate={{
          x: [-30, 30, -30],
          y: [15, -15, 15],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
        className="absolute top-1/2 left-1/2 w-[350px] h-[350px] rounded-full bg-pink-500/[0.015] blur-[100px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />

      {/* Floating decorative dots */}
      <div className="absolute top-[15%] left-[8%] w-1 h-1 rounded-full bg-cyan-400/20 hero-float-1 pointer-events-none" style={{ boxShadow: '0 0 8px rgba(0,212,255,0.3)' }} />
      <div className="absolute top-[40%] right-[5%] w-1.5 h-1.5 rounded-full bg-purple-400/15 hero-float-2 pointer-events-none" style={{ boxShadow: '0 0 10px rgba(168,85,247,0.25)' }} />
      <div className="absolute bottom-[25%] left-[15%] w-1 h-1 rounded-full bg-pink-400/20 hero-float-4 pointer-events-none" style={{ boxShadow: '0 0 8px rgba(255,45,85,0.25)' }} />
      <div className="absolute bottom-[15%] right-[20%] w-2 h-2 border border-cyan-400/8 rotate-45 hero-float-3 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-xs font-mono uppercase tracking-[0.4em] text-shimmer"><span className="scene-chapter mr-1">II</span> Identity Protocol</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10" />
          </motion.div>

          <h2 ref={headingRef} className="font-display text-4xl md:text-6xl font-bold text-white" style={{ perspective: '800px' }}>
            {'About Me'.split('').map((char, i) => (
              <span key={i} className="about-char inline-block" style={{ transformStyle: 'preserve-3d' }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>
        </div>

        {/* Bio with timeline */}
        <div className="relative max-w-3xl mx-auto mb-24">
          {/* Timeline line */}
          <div
            ref={timelineRef}
            className="absolute left-0 md:left-8 top-0 bottom-0 w-[1px] origin-top"
            style={{ background: 'linear-gradient(to bottom, #00d4ff30, #a855f730, #ff2d5530, transparent)' }}
          />

          <div className="space-y-10 pl-6 md:pl-20">
            {personalInfo.bio.map((paragraph, i) => (
              <div
                key={i}
                ref={(el) => (bioRefs.current[i] = el)}
                className="relative group"
              >
                {/* Timeline dot with pulse */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -left-6 md:-left-[52px] top-1.5"
                >
                  <div className="w-3 h-3 rounded-full border-2 relative" style={{
                    borderColor: ['#00d4ff', '#a855f7', '#ff2d55'][i % 3],
                    backgroundColor: `${['#00d4ff', '#a855f7', '#ff2d55'][i % 3]}15`,
                    boxShadow: `0 0 12px ${['#00d4ff', '#a855f7', '#ff2d55'][i % 3]}30`,
                  }}>
                    {/* Pulse ring — lightweight opacity-only pulse */}
                    <div className="absolute inset-0 rounded-full animate-soft-pulse" style={{
                      backgroundColor: ['#00d4ff', '#a855f7', '#ff2d55'][i % 3],
                      willChange: 'opacity',
                    }} />
                  </div>
                </motion.div>

                {/* Paragraph */}
                <div className="p-4 rounded-xl border border-transparent hover:border-white/[0.03] hover:bg-white/[0.01] transition-all duration-500">
                  <p className="text-base md:text-lg text-white/70 leading-relaxed group-hover:text-white/85 transition-colors duration-500">
                    {paragraph}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {stats.map((stat, i) => (
            <StatCounter key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Section divider */}
        <div className="flex items-center justify-center mb-12">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/[0.03]" />
          <div className="px-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-2 h-2 border border-[#00d4ff]/20 rotate-45"
            />
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/[0.03]" />
        </div>

        {/* Tech badges — single observer drives all children via variants */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center"
        >
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }}
            className="text-sm font-mono uppercase tracking-[0.4em] text-white/65 mb-6"
          >
            Technologies I Work With
          </motion.p>
          <motion.div variants={techContainerVariants} className="flex flex-wrap justify-center gap-3">
            {techOrbit.map((tech, i) => (
              <TechBadge key={tech} tech={tech} index={i} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default About
