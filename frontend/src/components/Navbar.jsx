import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion'
import gsap from 'gsap'
import { personalInfo, navItems } from '../data/personal'

/* ═══════════════════════════════════════════════════════════════
 *  NAVBAR — Quantum Navigation Interface v5
 *  -------------------------------------------------------
 *  - Text scramble decode on hover (cypher effect)
 *  - Scroll progress indicator bar
 *  - Active section detection
 *  - Mobile hamburger with spring menu
 *  - Smooth scroll via Lenis
 *  - Delayed entrance after loader (3.4s)
 *  - Backdrop blur + gradient border
 *  - Resume link
 *  - Scroll-based background transitions
 * ═══════════════════════════════════════════════════════════════ */

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

function useTextScramble(text, isHovered) {
  const [display, setDisplay] = useState(text)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!isHovered) {
      setDisplay(text)
      return
    }

    let iteration = 0
    let lastTime = 0
    const interval = 45 // ms per decoded character

    const scramble = (timestamp) => {
      if (timestamp - lastTime < interval) {
        frameRef.current = requestAnimationFrame(scramble)
        return
      }
      lastTime = timestamp

      setDisplay(
        text.split('').map((char, i) => {
          if (i < iteration) return text[i]
          return chars[Math.floor(Math.random() * chars.length)]
        }).join('')
      )

      iteration += 1

      if (iteration <= text.length) {
        frameRef.current = requestAnimationFrame(scramble)
      } else {
        setDisplay(text)
      }
    }

    frameRef.current = requestAnimationFrame(scramble)
    return () => cancelAnimationFrame(frameRef.current)
  }, [isHovered, text])

  return display
}

/* ───── Nav Link with Scramble ───── */
function NavLink({ item, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)
  const scrambled = useTextScramble(item.label, hovered)

  return (
    <motion.button
      onClick={() => onClick(item.href)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -2 }}
      className="relative group py-2 px-1 neon-underline"
    >
      <span className={`text-sm font-mono uppercase tracking-[0.2em] transition-colors duration-300 ${
        isActive ? 'text-white/85' : 'text-white/55 group-hover:text-white/75'
      }`}>
        {scrambled}
      </span>

      {/* Active indicator with glow */}
      <motion.div
        initial={false}
        animate={{
          scaleX: isActive ? 1 : 0,
          opacity: isActive ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="absolute -bottom-0 left-0 right-0 h-[1px] origin-center"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(0, 212, 255, 0.4), transparent)',
          boxShadow: isActive ? '0 0 8px rgba(0, 212, 255, 0.2)' : 'none',
        }}
      />
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollYProgress } = useScroll()

  // Delayed entrance after loader
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3400)
    return () => clearTimeout(timer)
  }, [])

  // Scroll detection
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)

      // Active section detection
      const sections = navItems.map(item => item.href.replace('#', ''))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = useCallback((href) => {
    setMobileOpen(false)
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el && window.__portfolioLenis) {
      window.__portfolioLenis.scrollTo(el, { offset: -80, duration: 1.2 })
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -80, opacity: 0, filter: 'blur(10px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed top-0 left-0 right-0 z-[100]"
        >
          {/* Scroll progress bar with glow */}
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="absolute top-0 left-0 right-0 h-[1px] origin-left z-10"
          >
            <div className="w-full h-full bg-gradient-to-r from-cyan-400/50 via-purple-400/50 to-pink-400/50" style={{ boxShadow: '0 0 10px rgba(0,212,255,0.3)' }} />
          </motion.div>

          <nav className={`transition-all duration-700 ${
            scrolled
              ? 'bg-void/70 backdrop-blur-2xl border-b border-white/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
              : 'bg-transparent'
          }`}>
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
              {/* Logo */}
              <motion.button
                onClick={() => scrollTo('#home')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="font-display text-base font-semibold text-white/70 hover:text-white/90 transition-colors relative group"
              >
                {personalInfo.name.split(' ')[0]}
                <span className="text-cyan-400/50">.</span>

                {/* Glitch layer */}
                <span className="absolute inset-0 text-cyan-400/0 group-hover:text-cyan-400/25 transition-colors font-display text-base font-semibold" style={{ transform: 'translate(1px, -1px)', clipPath: 'inset(0 0 50% 0)' }}>
                  {personalInfo.name.split(' ')[0]}<span>.</span>
                </span>
              </motion.button>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item, i) => (
                  <NavLink
                    key={item.label}
                    item={item}
                    isActive={activeSection === item.href.replace('#', '')}
                    onClick={scrollTo}
                  />
                ))}

                {/* Resume button */}
                {personalInfo.resumeUrl && (
                  <motion.a
                    href={personalInfo.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="text-sm font-mono uppercase tracking-[0.25em] text-white/60 hover:text-white/80 border border-white/[0.08] hover:border-white/[0.12] px-4 py-1.5 rounded-md transition-all duration-300"
                  >
                    Resume
                  </motion.a>
                )}
              </div>

              {/* Mobile hamburger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden relative w-7 h-7 flex flex-col items-end justify-center gap-1.5"
              >
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 5, width: '100%' } : { rotate: 0, y: 0, width: '100%' }}
                  className="block h-[1px] bg-white/30 origin-right"
                  style={{ width: '100%' }}
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
                  className="block h-[1px] bg-white/20"
                  style={{ width: '70%' }}
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -5, width: '100%' } : { rotate: 0, y: 0, width: '60%' }}
                  className="block h-[1px] bg-white/25 origin-right"
                />
              </motion.button>
            </div>
          </nav>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, filter: 'blur(6px)' }}
                animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
                exit={{ opacity: 0, height: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="md:hidden bg-void/95 backdrop-blur-2xl border-b border-white/[0.04] overflow-hidden"
              >
                <div className="px-6 py-6 space-y-1">
                  {navItems.map((item, i) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 18 }}
                      onClick={() => scrollTo(item.href)}
                      className={`block w-full text-left py-2.5 text-sm font-mono uppercase tracking-[0.2em] transition-colors ${
                        activeSection === item.href.replace('#', '') ? 'text-white/75' : 'text-white/55'
                      }`}
                    >
                      <span className="text-white/40 mr-3">0{i + 1}</span>
                      {item.label}
                    </motion.button>
                  ))}

                  {personalInfo.resumeUrl && (
                    <motion.a
                      href={personalInfo.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="inline-block mt-4 text-sm font-mono uppercase tracking-[0.25em] text-white/60 border border-white/[0.08] px-4 py-2 rounded-md"
                    >
                      Resume ↗
                    </motion.a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  )
}

export default Navbar

