import React, { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Loader from './components/Loader'
import CustomCursor from './components/CustomCursor'
import GrainOverlay from './components/GrainOverlay'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import NeuralPathways from './components/NeuralPathways'
import SceneIndicator from './components/SceneIndicator'

// Lazy load heavy sections — only mount when needed
const About = lazy(() => import('./components/About'))
const Projects = lazy(() => import('./components/Projects'))
const Skills = lazy(() => import('./components/Skills'))
const Contact = lazy(() => import('./components/Contact'))
import Footer from './components/Footer'

gsap.registerPlugin(ScrollTrigger)

/* ───── Neural Awakening — Scroll-driven consciousness gradient ───── */
function CinematicBackground() {
  const { scrollYProgress } = useScroll()
  // Evolving consciousness colors: cold initialization → warm awareness
  const hue1 = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [200, 220, 260, 290, 180, 200])
  const hue2 = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [180, 240, 200, 320, 260, 180])
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '60%'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['100%', '20%'])
  // Third orb appears mid-scroll for depth
  const orb3Opacity = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.8], [0, 0.02, 0.025, 0])
  const orb3Y = useTransform(scrollYProgress, [0, 1], ['30%', '70%'])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full blur-[140px] opacity-[0.025]"
        style={{
          top: y1,
          left: '10%',
          background: useTransform(hue1, h => `hsl(${h}, 80%, 50%)`),
          willChange: 'transform',
        }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.02]"
        style={{
          bottom: y2,
          right: '5%',
          background: useTransform(hue2, h => `hsl(${h}, 70%, 45%)`),
          willChange: 'transform',
        }}
      />
      {/* Third consciousness orb — emerges mid-story */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[110px]"
        style={{
          top: orb3Y,
          left: '45%',
          opacity: orb3Opacity,
          background: 'hsl(160, 70%, 50%)',
          willChange: 'transform',
        }}
      />
    </div>
  )
}

/* ───── Scene Reveal — Each section enters as a unique chapter ───── */
const sceneConfigs = [
  // Scene II (About): rises from beneath with subtle forward tilt
  { yFrom: 100, scaleFrom: 0.94, rotateXFrom: 3, rotateYFrom: 0, perspective: 1200, stiffness: 55 },
  // Scene III (Projects): rotates in from the side like a portal
  { yFrom: 80, scaleFrom: 0.88, rotateXFrom: 0, rotateYFrom: -4, perspective: 1000, stiffness: 50 },
  // Scene IV (Skills): emerges upward with neural pulse feel
  { yFrom: 120, scaleFrom: 0.92, rotateXFrom: -2, rotateYFrom: 0, perspective: 1400, stiffness: 60 },
  // Scene V (Contact): settles in from above like a signal landing
  { yFrom: 60, scaleFrom: 0.96, rotateXFrom: 2, rotateYFrom: 0, perspective: 1000, stiffness: 65 },
]

function SceneReveal({ children, scene = 0 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.25'] })
  const config = sceneConfigs[scene] || sceneConfigs[0]

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [config.yFrom, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [config.scaleFrom, 1])
  const rotateX = useTransform(scrollYProgress, [0, 1], [config.rotateXFrom, 0])
  const rotateY = useTransform(scrollYProgress, [0, 1], [config.rotateYFrom, 0])

  const springY = useSpring(y, { stiffness: config.stiffness, damping: 22 })
  const springScale = useSpring(scale, { stiffness: config.stiffness, damping: 22 })
  const springRotateX = useSpring(rotateX, { stiffness: config.stiffness, damping: 25 })
  const springRotateY = useSpring(rotateY, { stiffness: config.stiffness, damping: 25 })

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        y: springY,
        scale: springScale,
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: config.perspective,
      }}
    >
      {/* Scene transition energy line */}
      <div className="scene-transition-line mx-auto max-w-5xl" />
      {children}
    </motion.div>
  )
}

/* ───── Parallax perspective wrapper — subtle camera motion (throttled) ───── */
function CameraMotion({ children }) {
  const ref = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [0.4, -0.4]), { stiffness: 40, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-0.4, 0.4]), { stiffness: 40, damping: 30 })

  useEffect(() => {
    let ticking = false
    const handleMouse = (e) => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        mouseX.set(e.clientX / window.innerWidth - 0.5)
        mouseY.set(e.clientY / window.innerHeight - 0.5)
        ticking = false
      })
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  )
}

/**
 * Root application component.
 * Orchestrates the cinematic loader, smooth scroll system,
 * custom cursor, and all section components.
 */
function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const mainRef = useRef(null)

  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true)
  }, [])

  // Initialise Lenis smooth scroll + GSAP ScrollTrigger (cinema-grade inertia)
  useEffect(() => {
    if (!isLoaded) return

    const lenis = new Lenis({
      smoothWheel: true,
      duration: 1.6,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      lerp: 0.075,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    window.__portfolioLenis = lenis

    let rafId = 0
    const frame = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)

    lenis.on('scroll', ScrollTrigger.update)

    // Cinematic section-snapping hints — subtle parallax depth for each section
    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => {
      gsap.fromTo(section, {
        '--section-progress': 0,
      }, {
        '--section-progress': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    return () => {
      delete window.__portfolioLenis
      ScrollTrigger.getAll().forEach((t) => t.kill())
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [isLoaded])

  // Wake up backend on site load
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        await fetch('/api/health', { method: 'GET' })
        console.log('Backend wakeup request sent to /api/health')
      } catch (error) {
        console.log('Backend wakeup failed (this is normal if backend is starting):', error.message)
      }
    }
    wakeUpBackend()
  }, [])

  return (
    <>
      {/* Cinematic intro loader */}
      <AnimatePresence>{!isLoaded && <Loader onComplete={handleLoadComplete} />}</AnimatePresence>

      {/* Custom animated cursor */}
      <CustomCursor />

      {/* Film grain texture overlay */}
      <GrainOverlay />

      {/* Animated gradient background */}
      {isLoaded && <CinematicBackground />}

      {/* Neural pathways — signature visual motif */}
      {isLoaded && <NeuralPathways />}

      {/* Scene chapter indicator */}
      {isLoaded && <SceneIndicator />}

      {/* Main content */}
      <CameraMotion>
        <div ref={mainRef} className="relative min-h-screen overflow-x-hidden bg-[#030014]">
          <Navbar />
          <main>
            <Hero />
            <Suspense fallback={null}>
              <SceneReveal scene={0}><About /></SceneReveal>
              <SceneReveal scene={1}><Projects /></SceneReveal>
              <SceneReveal scene={2}><Skills /></SceneReveal>
              <SceneReveal scene={3}><Contact /></SceneReveal>
            </Suspense>
          </main>
          <Footer />
        </div>
      </CameraMotion>
    </>
  )
}

export default App
