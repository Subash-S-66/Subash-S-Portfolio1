import React, { useRef, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { skillGroups, highlights } from '../data/skills'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  SKILLS — Quantum Proficiency Matrix v5
 *  -------------------------------------------------------
 *  - SVG circular progress rings with glow
 *  - Animated percentage counters
 *  - Skill group cards with 3D entrance
 *  - Hex-grid highlights
 *  - Per-character heading animation
 *  - Animated corner accents
 *  - Particle canvas background
 *  - Group color theming
 * ═══════════════════════════════════════════════════════════════ */

const groupColors = ['#00d4ff', '#a855f7', '#ff2d55', '#00ffa3']

/* ───── SVG Circular Progress Ring ───── */
/* Variants for parent-controlled stagger (avoids per-skill IntersectionObserver) */
const skillItemVariants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -30 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { delay: i * 0.08, type: 'spring', stiffness: 200, damping: 16 },
  }),
}

function CircularProgress({ skill, groupIndex, index, isVisible }) {
  const [progress, setProgress] = useState(0)
  const color = groupColors[groupIndex % groupColors.length]
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  useEffect(() => {
    if (!isVisible) return
    const obj = { val: 0 }
    const tween = gsap.to(obj, {
      val: skill.level,
      duration: 2,
      delay: index * 0.15,
      ease: 'power2.out',
      onUpdate: () => setProgress(Math.round(obj.val)),
    })
    return () => tween.kill()
  }, [isVisible, skill.level, index])

  return (
    <motion.div
      custom={index}
      variants={skillItemVariants}
      whileHover={{ scale: 1.15, y: -6 }}
      className="flex flex-col items-center gap-2 group"
    >
      {/* CSS float instead of per-frame JS animate */}
      <div
        className="relative"
        style={{ animation: `tech-float ${3 + index * 0.3}s ease-in-out infinite`, animationDelay: `${index * 0.4}s` }}
      >
        <svg width="72" height="72" viewBox="0 0 72 72" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="3"
          />
          {/* Progress arc */}
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.1s linear',
              filter: `drop-shadow(0 0 6px ${color}60)`,
            }}
          />
          {/* Glow circle behind the progress */}
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.1s linear',
              filter: `blur(3px)`,
              opacity: 0.25,
            }}
          />
        </svg>

        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono font-semibold" style={{ color: `${color}90` }}>
            {progress}
          </span>
        </div>

        {/* Pulse dot at progress tip — CSS-only pulse */}
        {progress > 10 && (
          <div
            className="absolute w-1.5 h-1.5 rounded-full animate-soft-pulse"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`,
              top: `${36 - (radius + 1) * Math.cos((progress / 100) * Math.PI * 2 - Math.PI / 2) - 3}px`,
              left: `${36 + (radius + 1) * Math.sin((progress / 100) * Math.PI * 2 - Math.PI / 2) - 3}px`,
            }}
          />
        )}
      </div>

      <span className="text-sm text-white/55 text-center group-hover:text-white/70 transition-colors duration-300 leading-tight max-w-[80px]">
        {skill.name}
      </span>
    </motion.div>
  )
}

/* ───── Skill Group Card ───── */
function SkillGroupCard({ group, groupIndex }) {
  const cardRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const color = groupColors[groupIndex % groupColors.length]

  useEffect(() => {
    if (!cardRef.current) return
    const trigger = ScrollTrigger.create({
      trigger: cardRef.current,
      start: 'top 88%',
      onEnter: () => setIsVisible(true),
    })

    gsap.fromTo(cardRef.current, {
      opacity: 0,
      y: 60,
      rotateY: groupIndex % 2 === 0 ? -10 : 10,
    }, {
      opacity: 1,
      y: 0,
      rotateY: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 88%',
      },
    })

    return () => trigger.kill()
  }, [groupIndex])

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
      className="relative rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 group hover:border-white/[0.08] transition-colors duration-500 overflow-hidden shimmer-on-hover"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-l border-t rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: `${color}30` }} />
      <div className="absolute top-0 right-0 w-6 h-6 border-r border-t rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: `${color}30` }} />

      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {/* Group header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div
          className="w-8 h-8 rounded-lg border flex items-center justify-center"
          style={{ borderColor: `${color}25`, backgroundColor: `${color}05`, animation: 'spin 20s linear infinite' }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-white group-hover:text-white transition-colors">{group.title}</h3>
          <span className="text-sm font-mono text-white/45">{group.items.length} skills</span>
        </div>
      </div>

      {/* Circular progress rings grid — single observer drives all children */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-2 gap-4 relative z-10"
      >
        {group.items.map((skill, i) => (
          <CircularProgress
            key={skill.name}
            skill={skill}
            groupIndex={groupIndex}
            index={i}
            isVisible={isVisible}
          />
        ))}
      </motion.div>

      {/* Bottom accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
        style={{ background: `linear-gradient(to right, ${color}40, transparent)` }}
      />
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const Skills = () => {
  const headingRef = useRef(null)

  // Heading character animation
  useEffect(() => {
    if (!headingRef.current) return
    const chars = headingRef.current.querySelectorAll('.skill-char')
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

  return (
    <section id="skills" className="relative py-16 md:py-24 px-6 overflow-hidden aurora-bg">
      {/* Morphing neural shape */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] morph-shape pointer-events-none opacity-[0.015]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.06), rgba(0,212,255,0.03), transparent 70%)',
          filter: 'blur(70px)',
          animationDelay: '5s',
        }}
      />

      {/* Synaptic flash */}
      <div className="absolute inset-0 synaptic-flash pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(168,85,247,0.03), transparent 60%)', animationDelay: '2s' }}
      />

      {/* Background */}
      <motion.div
        animate={{ x: [-40, 40, -40], y: [-20, 20, -20], scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.02] blur-[120px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />
      <motion.div
        animate={{ x: [30, -30, 30], y: [15, -15, 15], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/[0.02] blur-[110px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />
      <motion.div
        animate={{ x: [-20, 20, -20], scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-pink-500/[0.015] blur-[90px] pointer-events-none"
        style={{ willChange: 'transform' }}
      />

      {/* Floating decorative dots */}
      <div className="absolute top-[10%] right-[10%] w-1 h-1 rounded-full bg-cyan-400/20 hero-float-1 pointer-events-none" style={{ boxShadow: '0 0 8px rgba(0,212,255,0.3)' }} />
      <div className="absolute top-[50%] left-[5%] w-1.5 h-1.5 rounded-full bg-purple-400/15 hero-float-2 pointer-events-none" style={{ boxShadow: '0 0 10px rgba(168,85,247,0.25)' }} />
      <div className="absolute bottom-[20%] right-[15%] w-1 h-1 rounded-full bg-green-400/20 hero-float-4 pointer-events-none" style={{ boxShadow: '0 0 8px rgba(0,255,163,0.25)' }} />
      <div className="absolute top-[30%] left-[20%] w-2 h-2 border border-cyan-400/6 rotate-45 hero-float-3 pointer-events-none" />

      <div className="max-w-5xl mx-auto">
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
            <span className="text-sm font-mono uppercase tracking-[0.4em] text-shimmer"><span className="scene-chapter mr-1">IV</span> Neural Mapping</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10" />
          </motion.div>

          <h2 ref={headingRef} className="font-display text-4xl md:text-6xl font-bold text-white" style={{ perspective: '800px' }}>
            {'Skills'.split('').map((char, i) => (
              <span key={i} className="skill-char inline-block" style={{ transformStyle: 'preserve-3d' }}>
                {char}
              </span>
            ))}
          </h2>
        </div>

        {/* Skill groups grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {skillGroups.map((group, i) => (
            <SkillGroupCard key={group.title} group={group} groupIndex={i} />
          ))}
        </div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm font-mono uppercase tracking-[0.4em] text-white/50 mb-6">Development Highlights</p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            className="flex flex-wrap justify-center gap-3"
          >
            {highlights.map((h, i) => (
              <motion.div
                key={h}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 18 } } }}
                whileHover={{ y: -6, scale: 1.08, boxShadow: `0 0 20px ${groupColors[i % groupColors.length]}15` }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.04] bg-white/[0.02] group shimmer-on-hover magnetic-glow"
              >
                {/* Colored dot */}
                <div className="relative">
                  <div className="w-1.5 h-1.5 rounded-full" style={{
                    backgroundColor: groupColors[i % groupColors.length],
                    boxShadow: `0 0 6px ${groupColors[i % groupColors.length]}40`
                  }} />
                </div>
                <span className="text-sm text-white/50 group-hover:text-white/65 transition-colors">{h}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Skills
