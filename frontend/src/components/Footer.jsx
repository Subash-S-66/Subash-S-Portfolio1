import React, { useRef, useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Github, Linkedin, Instagram } from 'lucide-react'
import { personalInfo, socialLinks, navItems } from '../data/personal'

const socialIconMap = {
  GitHub: Github,
  LinkedIn: Linkedin,
  Instagram: Instagram,
}

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  FOOTER — Quantum Systems Footer v5
 *  -------------------------------------------------------
 *  - Particle constellation canvas separator
 *  - Navigation links with hover underline sweep
 *  - Social links with spring entrance
 *  - Copyright with current year
 *  - Back-to-top via Lenis
 *  - HUD-style decorative accents
 *  - Scroll-triggered entrance
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Constellation Canvas Separator (visibility-gated) ───── */
function ConstellationSeparator() {
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

    const stars = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.5 + 0.3,
      pulse: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.5 ? 190 : 280,
    }))

    const animate = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      stars.forEach(s => {
        s.x += s.vx
        s.y += s.vy
        s.pulse += 0.02
        if (s.x < 0 || s.x > w) s.vx *= -1
        if (s.y < 0 || s.y > h) s.vy *= -1

        const alpha = 0.1 + Math.sin(s.pulse) * 0.06
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        const clr = s.hue === 190 ? `rgba(0, 212, 255, ${alpha})` : `rgba(168, 85, 247, ${alpha})`
        ctx.fillStyle = clr
        ctx.fill()

        // Glow halo around stars
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2)
        const glowClr = s.hue === 190 ? `rgba(0, 212, 255, ${alpha * 0.15})` : `rgba(168, 85, 247, ${alpha * 0.15})`
        ctx.fillStyle = glowClr
        ctx.fill()
      })

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(stars[i].x, stars[i].y)
            ctx.lineTo(stars[j].x, stars[j].y)
            const lineAlpha = 0.04 * (1 - dist / 120)
            ctx.strokeStyle = `rgba(0, 212, 255, ${lineAlpha})`
            ctx.lineWidth = 0.6
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
      className="w-full h-32 opacity-60"
    />
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const Footer = () => {
  const footerRef = useRef(null)

  const scrollToTop = useCallback(() => {
    if (window.__portfolioLenis) {
      window.__portfolioLenis.scrollTo(0, { duration: 2 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const scrollTo = useCallback((href) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el && window.__portfolioLenis) {
      window.__portfolioLenis.scrollTo(el, { offset: -80, duration: 1.2 })
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Entrance animation
  useEffect(() => {
    if (!footerRef.current) return
    gsap.fromTo(footerRef.current, {
      opacity: 0,
      y: 30,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: footerRef.current,
        start: 'top 95%',
      },
    })
  }, [])

  return (
    <footer className="relative aurora-bg">
      {/* Constellation separator */}
      <ConstellationSeparator />

      <div ref={footerRef} className="relative px-6 pb-12">
        {/* Top divider */}
        <div className="max-w-5xl mx-auto mb-12">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400/[0.08] to-transparent origin-center"
          />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            {/* Brand */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-display text-2xl font-semibold text-white/70 mb-3"
              >
                {personalInfo.name.split(' ')[0]}
                <motion.span
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-cyan-400/60"
                >.</motion.span>
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-sm text-white/50 leading-relaxed max-w-[280px]"
              >
                {personalInfo.tagline}
              </motion.p>
            </div>

            {/* Navigation */}
            <div>
              <p className="text-sm font-mono uppercase tracking-[0.3em] text-white/60 mb-4">Navigation</p>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-2"
              >
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    variants={{
                      hidden: { opacity: 0, x: -15 },
                      visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 18 } },
                    }}
                    onClick={() => scrollTo(item.href)}
                    whileHover={{ x: 6, color: 'rgba(255,255,255,0.5)' }}
                    className="block text-sm text-white/50 hover:text-white/70 transition-colors duration-300 relative group neon-underline"
                  >
                    {item.label}
                    <span className="absolute -bottom-0.5 left-0 h-[1px] bg-gradient-to-r from-cyan-400/20 to-purple-400/20 w-0 group-hover:w-full transition-all duration-400" />
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Social */}
            <div>
              <p className="text-sm font-mono uppercase tracking-[0.3em] text-white/60 mb-4">Connect</p>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                className="flex gap-3"
              >
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={{
                      hidden: { opacity: 0, scale: 0, rotate: -10 },
                      visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 250, damping: 14 } },
                    }}
                    whileHover={{ y: -4, scale: 1.1, boxShadow: '0 0 15px rgba(0,212,255,0.15)' }}
                    whileTap={{ scale: 0.92 }}
                    className="w-10 h-10 rounded-lg border border-white/[0.1] flex items-center justify-center hover:border-cyan-400/[0.3] transition-all duration-300 group magnetic-glow"
                  >
                    {(() => {
                      const Icon = socialIconMap[link.label]
                      return Icon
                        ? <Icon size={18} className="text-white/60 group-hover:text-cyan-400/70 transition-colors" />
                        : <span className="text-sm font-mono text-white/60 group-hover:text-cyan-400/70 transition-colors">{link.label.slice(0, 2).toUpperCase()}</span>
                    })()}
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Bottom bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.03]"
          >
            <p className="text-sm font-mono text-white/50">
              © {new Date().getFullYear()} {personalInfo.name}
            </p>

            {/* Back to top */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -3, color: 'rgba(0,212,255,0.4)' }}
              whileTap={{ scale: 0.92 }}
              className="flex items-center gap-2 text-sm font-mono text-white/50 hover:text-white/70 transition-colors duration-300 group magnetic-glow"
            >
              <span className="uppercase tracking-[0.2em]">Back to top</span>
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-xs group-hover:text-cyan-400/50"
              >
                ↑
              </motion.span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
