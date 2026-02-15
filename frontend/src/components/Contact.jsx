import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { contactInfo, socialLinks } from '../data/personal'
import { API_ENDPOINTS } from '../config/api'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  CONTACT — Quantum Communication Terminal v5
 *  -------------------------------------------------------
 *  - Electric field canvas on form container
 *  - Floating label inputs with glow underlines
 *  - Form validation (name/email/subject/message)
 *  - POST to API with status feedback
 *  - Success particle burst animation
 *  - Contact cards with 3D hover
 *  - Social links orbit
 *  - Per-character heading animation
 *  - HUD-style decorative elements
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Electric Canvas Background (visibility-gated) ───── */
function ElectricCanvas({ isActive }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  // Only run canvas when in viewport
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

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes = Array.from({ length: 15 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }))

    const animate = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 212, 255, 0.12)'
        ctx.fill()
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.04 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isVisible])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
    />
  )
}

/* ───── Floating Label Input ───── */
function FormField({ label, type = 'text', name, value, onChange, error, rows }) {
  const [focused, setFocused] = useState(false)
  const isTextarea = type === 'textarea'
  const hasValue = value && value.length > 0

  const Tag = isTextarea ? 'textarea' : 'input'

  return (
    <motion.div
      className="contact-field relative mb-6"
      animate={focused ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Tag
        name={name}
        type={isTextarea ? undefined : type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        className={`contact-input w-full bg-transparent border-b ${
          error ? 'border-red-500/40' : focused ? 'border-cyan-400/30' : 'border-white/[0.06]'
        } px-0 py-3 text-base text-white/80 placeholder-transparent outline-none transition-colors duration-300 resize-none`}
        placeholder={label}
        autoComplete="off"
      />
      <motion.label
        className={`contact-label absolute left-0 transition-all duration-300 pointer-events-none ${
          focused || hasValue ? '-top-3 text-[10px]' : 'top-3 text-sm'
        } ${focused ? 'text-cyan-400/70' : 'text-white/45'}`}
        animate={focused ? { x: 3 } : { x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {label}
      </motion.label>

      {/* Glow underline with pulse on focus */}
      <motion.div
        initial={false}
        animate={{
          scaleX: focused ? 1 : 0,
          opacity: focused ? 1 : 0,
        }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
        className="contact-glow absolute bottom-0 left-0 right-0 h-[2px] origin-left"
        style={{
          background: 'linear-gradient(to right, #00d4ff60, #a855f760)',
          boxShadow: focused ? '0 0 12px rgba(0,212,255,0.2)' : 'none',
        }}
      />

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-red-400/70 mt-1 font-mono"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ───── Contact Info Card ───── */
function InfoCard({ info, index }) {
  return (
    <motion.a
      href={info.href}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, type: 'spring', stiffness: 180 }}
      whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
      className="block p-5 rounded-xl border border-white/[0.04] bg-white/[0.015] group hover:border-white/[0.06] transition-all duration-500 relative overflow-hidden shimmer-on-hover magnetic-glow card-hover-lift"
    >
      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.015] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

      <div className="relative z-10">
        <p className="text-sm font-mono uppercase tracking-[0.3em] text-white/50 mb-2">{info.label}</p>
        <p className="text-base text-white/60 group-hover:text-white/75 transition-colors">{info.value}</p>
      </div>

      {/* Corner accent */}
      <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-cyan-400/15 group-hover:bg-cyan-400/30 transition-colors" />
    </motion.a>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const Contact = () => {
  const headingRef = useRef(null)
  const formRef = useRef(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle, sending, success, error

  // Heading chars animation
  useEffect(() => {
    if (!headingRef.current) return
    const chars = headingRef.current.querySelectorAll('.contact-char')
    gsap.fromTo(chars, {
      opacity: 0,
      y: 50,
      rotateX: -90,
      scale: 0.6,
    }, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      stagger: 0.04,
      duration: 0.7,
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: headingRef.current,
        start: 'top 85%',
      },
    })
  }, [])

  // Form entrance
  useEffect(() => {
    if (!formRef.current) return
    gsap.fromTo(formRef.current, {
      opacity: 0,
      y: 40,
    }, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: formRef.current,
        start: 'top 85%',
      },
    })
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }, [])

  const validate = useCallback(() => {
    const e = {}
    if (!form.name || form.name.length < 2 || form.name.length > 50) {
      e.name = 'Name must be 2-50 characters'
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Valid email required'
    }
    if (!form.subject || form.subject.length < 5 || form.subject.length > 100) {
      e.subject = 'Subject must be 5-100 characters'
    }
    if (!form.message || form.message.length < 10 || form.message.length > 1000) {
      e.message = 'Message must be 10-1000 characters'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [form])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('sending')
    try {
      const res = await fetch(API_ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }, [form, validate])

  return (
    <section id="contact" className="relative py-16 md:py-24 px-6 overflow-hidden aurora-bg">
      {/* Morphing signal shape */}
      <div
        className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] morph-shape pointer-events-none opacity-[0.01]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,255,163,0.06), rgba(0,212,255,0.03), transparent 70%)',
          filter: 'blur(60px)',
          animationDelay: '10s',
        }}
      />

      {/* Synaptic flash */}
      <div className="absolute inset-0 synaptic-flash pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(0,255,163,0.025), transparent 60%)', animationDelay: '4s' }}
      />

      {/* Background — animated glow blobs */}
      <motion.div
        animate={{ x: [-30, 30, -30], y: [-20, 20, -20], scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.02] blur-[120px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />
      <motion.div
        animate={{ x: [25, -25, 25], y: [15, -15, 15], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-purple-500/[0.02] blur-[110px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />
      <motion.div
        animate={{ x: [-20, 20, -20], scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
        className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-pink-500/[0.015] blur-[90px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />

      {/* Floating decorative dots */}
      <div className="absolute top-[12%] left-[10%] w-1 h-1 rounded-full bg-cyan-400/20 hero-float-1 pointer-events-none" style={{ boxShadow: '0 0 8px rgba(0,212,255,0.3)' }} />
      <div className="absolute top-[45%] right-[8%] w-1.5 h-1.5 rounded-full bg-purple-400/15 hero-float-2 pointer-events-none" style={{ boxShadow: '0 0 10px rgba(168,85,247,0.25)' }} />
      <div className="absolute bottom-[18%] left-[25%] w-1 h-1 rounded-full bg-pink-400/20 hero-float-4 pointer-events-none" style={{ boxShadow: '0 0 8px rgba(255,45,85,0.25)' }} />
      <div className="absolute bottom-[35%] right-[20%] w-2 h-2 border border-cyan-400/6 rotate-45 hero-float-3 pointer-events-none" />

      <div className="max-w-4xl mx-auto">
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
            <span className="text-sm font-mono uppercase tracking-[0.4em] text-shimmer"><span className="scene-chapter mr-1">V</span> Signal Protocol</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10" />
          </motion.div>

          <h2 ref={headingRef} className="font-display text-4xl md:text-6xl font-bold text-white" style={{ perspective: '800px' }}>
            {'Contact'.split('').map((char, i) => (
              <span key={i} className="contact-char inline-block" style={{ transformStyle: 'preserve-3d' }}>
                {char}
              </span>
            ))}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Form side */}
          <div ref={formRef} className="md:col-span-3 relative">
            <div className="relative rounded-2xl border border-white/[0.04] bg-white/[0.008] p-8 overflow-hidden animate-border-glow backdrop-blur-sm">
              <ElectricCanvas />

              <form onSubmit={handleSubmit} className="relative z-10 space-y-2">
                <FormField label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
                <FormField label="Email" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} />
                <FormField label="Subject" name="subject" value={form.subject} onChange={handleChange} error={errors.subject} />
                <FormField label="Message" type="textarea" name="message" value={form.message} onChange={handleChange} error={errors.message} rows={4} />

                <div className="pt-4">
                  <motion.button
                    type="submit"
                    disabled={status === 'sending'}
                    whileHover={{ scale: 1.03, y: -2, boxShadow: '0 0 30px rgba(0,212,255,0.15)' }}
                    whileTap={{ scale: 0.96 }}
                    className="relative w-full py-3.5 rounded-lg font-mono text-sm uppercase tracking-[0.3em] border overflow-hidden group disabled:opacity-40 transition-all duration-500 magnetic-glow"
                    style={{ borderColor: 'rgba(0, 212, 255, 0.2)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    {/* Sweep effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <span className="relative z-10">
                      {status === 'idle' && 'Transmit Message'}
                      {status === 'sending' && 'Transmitting...'}
                      {status === 'success' && '✓ Message Sent'}
                      {status === 'error' && '✕ Retry'}
                    </span>
                  </motion.button>
                </div>
              </form>

              {/* Success overlay */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-void/80 backdrop-blur-sm rounded-2xl"
                  >
                    {/* Particle burst effect */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                        animate={{
                          scale: [0, 1, 0],
                          x: Math.cos((i / 12) * Math.PI * 2) * 80,
                          y: Math.sin((i / 12) * Math.PI * 2) * 80,
                          opacity: [1, 0.8, 0],
                        }}
                        transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: ['#00d4ff', '#a855f7', '#00ffa3', '#ff2d55'][i % 4],
                          boxShadow: `0 0 8px ${['#00d4ff', '#a855f7', '#00ffa3', '#ff2d55'][i % 4]}60`,
                        }}
                      />
                    ))}

                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], boxShadow: ['0 0 15px rgba(0,255,163,0.1)', '0 0 40px rgba(0,255,163,0.2)', '0 0 15px rgba(0,255,163,0.1)'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-14 h-14 mx-auto mb-4 rounded-full border border-green-400/30 flex items-center justify-center bg-green-400/5"
                      >
                        <span className="text-green-400/70 text-xl">✓</span>
                      </motion.div>
                      <p className="font-mono text-sm text-white/50 uppercase tracking-[0.3em]">Message Transmitted</p>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="mt-3 h-[1px] w-32 mx-auto origin-center bg-gradient-to-r from-transparent via-green-400/20 to-transparent"
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Info side */}
          <div className="md:col-span-2 space-y-4">
            {contactInfo.map((info, i) => (
              <InfoCard key={info.label} info={info} index={i} />
            ))}

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="pt-6"
            >
              <p className="text-sm font-mono uppercase tracking-[0.3em] text-white/50 mb-4">Connect</p>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
                className="flex gap-3"
              >
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={{
                      hidden: { opacity: 0, scale: 0 },
                      visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200 } },
                    }}
                    whileHover={{ y: -3, scale: 1.05 }}
                    className="w-10 h-10 rounded-lg border border-white/[0.04] bg-white/[0.015] flex items-center justify-center hover:border-white/[0.08] transition-all duration-300 group"
                  >
                    <span className="text-sm font-mono text-white/50 group-hover:text-white/70 transition-colors">
                      {link.label.slice(0, 2).toUpperCase()}
                    </span>
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
