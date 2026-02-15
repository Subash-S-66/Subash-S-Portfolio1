import React, { useState, useEffect, useCallback, memo } from 'react'
import { motion } from 'framer-motion'

/**
 * SceneIndicator — Sidebar chapter navigation
 *
 * Shows the current "scene" (section) as a chapter in the
 * Neural Awakening narrative. Each scene has a roman numeral
 * and a thematic label. A connecting line with energy pulse
 * provides visual continuity.
 */
const scenes = [
  { id: 'home', label: 'INIT', numeral: 'I' },
  { id: 'about', label: 'IDENTITY', numeral: 'II' },
  { id: 'projects', label: 'ARCHIVES', numeral: 'III' },
  { id: 'skills', label: 'NEURAL', numeral: 'IV' },
  { id: 'contact', label: 'SIGNAL', numeral: 'V' },
]

const SceneIndicator = memo(() => {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      for (let i = scenes.length - 1; i >= 0; i--) {
        const el = document.getElementById(scenes[i].id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= window.innerHeight * 0.5) {
            setActive(i)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToScene = useCallback((id) => {
    const el = document.getElementById(id)
    if (el && window.__portfolioLenis) {
      window.__portfolioLenis.scrollTo(el, { offset: -80, duration: 1.6 })
    }
  }, [])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed left-5 top-1/2 -translate-y-1/2 z-[50] hidden lg:flex flex-col items-center"
    >
      {/* Connecting line with energy pulse */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px]">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
        <motion.div
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 w-full h-6"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.2), transparent)',
          }}
        />
      </div>

      {scenes.map((scene, i) => (
        <motion.button
          key={scene.id}
          onClick={() => scrollToScene(scene.id)}
          className="relative py-3.5 px-2 group"
          whileHover={{ x: 3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Node dot */}
          <div className="relative">
            <motion.div
              animate={i === active ? {
                scale: [1, 1.5, 1],
                boxShadow: [
                  '0 0 4px rgba(0,212,255,0.2)',
                  '0 0 14px rgba(0,212,255,0.5)',
                  '0 0 4px rgba(0,212,255,0.2)',
                ],
              } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${
                i === active
                  ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.4)]'
                  : i < active
                    ? 'bg-white/15'
                    : 'bg-white/[0.06]'
              }`}
            />
          </div>

          {/* Label — shows on hover */}
          <div className="absolute left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <span className="text-[9px] font-mono text-cyan-400/50">{scene.numeral}</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
                {scene.label}
              </span>
            </div>
          </div>

          {/* Active label (always visible for current scene) */}
          {i === active && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
            >
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-cyan-400/35">
                {scene.numeral}
              </span>
            </motion.div>
          )}
        </motion.button>
      ))}
    </motion.div>
  )
})

SceneIndicator.displayName = 'SceneIndicator'
export default SceneIndicator
