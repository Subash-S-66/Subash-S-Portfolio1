import React, { useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  CUSTOM CURSOR — Lightweight v6
 *  -------------------------------------------------------
 *  - Dot follows mouse instantly (no lag)
 *  - Outer ring follows with smooth lerp
 *  - Hover morph effect on interactive elements
 *  - Click scale pulse
 *  - No canvas, no particles — pure CSS transforms for perf
 *  - Touch device detection (usage-based, not capability)
 * ═══════════════════════════════════════════════════════════════ */

const CustomCursor = () => {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const glowRef = useRef(null)
  const trailRefs = useRef([])
  const mouse = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const trailPositions = useRef(Array.from({ length: 5 }, () => ({ x: -100, y: -100 })))
  const isHovering = useRef(false)
  const isDown = useRef(false)
  const isTouchDevice = useRef(false)
  const rafRef = useRef(null)
  const velocity = useRef({ x: 0, y: 0 })
  const prevMouse = useRef({ x: -100, y: -100 })

  /* ───── Detect touch (usage-based only) ───── */
  useEffect(() => {
    const onTouch = () => { isTouchDevice.current = true }
    const onMouse = () => { isTouchDevice.current = false }
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('mousemove', onMouse, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  /* ───── Mouse events ───── */
  useEffect(() => {
    const onMove = (e) => {
      velocity.current.x = e.clientX - prevMouse.current.x
      velocity.current.y = e.clientY - prevMouse.current.y
      prevMouse.current.x = e.clientX
      prevMouse.current.y = e.clientY

      mouse.current.x = e.clientX
      mouse.current.y = e.clientY

      // Move dot IMMEDIATELY in the event handler — zero lag
      const dotEl = dotRef.current
      if (dotEl) {
        const stretch = Math.min(Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2) * 0.015, 0.4)
        const angle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI)
        dotEl.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px) scale(${isDown.current ? 2 : 1 + stretch}, ${isDown.current ? 2 : 1 - stretch * 0.5}) rotate(${angle}deg)`
      }

      // Glow follows
      const glowEl = glowRef.current
      if (glowEl) {
        glowEl.style.transform = `translate(${e.clientX - 60}px, ${e.clientY - 60}px)`
        const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2)
        glowEl.style.opacity = `${Math.min(0.08 + speed * 0.003, 0.2)}`
      }
    }
    const onDown = () => {
      isDown.current = true
      if (dotRef.current) dotRef.current.style.transform = `translate(${mouse.current.x - 4}px, ${mouse.current.y - 4}px) scale(2)`
      if (ringRef.current) ringRef.current.style.opacity = '0.3'
    }
    const onUp = () => {
      isDown.current = false
      if (dotRef.current) dotRef.current.style.transform = `translate(${mouse.current.x - 4}px, ${mouse.current.y - 4}px) scale(1)`
      if (ringRef.current) ringRef.current.style.opacity = '1'
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  /* ───── Hover detection ───── */
  useEffect(() => {
    const selectors = 'a, button, input, textarea, [role="button"], .magnetic, [data-cursor]'

    const enterHandler = () => {
      isHovering.current = true
      const ringEl = ringRef.current
      if (ringEl) {
        ringEl.style.width = '56px'
        ringEl.style.height = '56px'
        ringEl.style.borderRadius = '30%'
        ringEl.style.borderColor = 'rgba(168, 85, 247, 0.5)'
        ringEl.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.15), inset 0 0 20px rgba(168, 85, 247, 0.05)'
      }
      const dotEl = dotRef.current
      if (dotEl) {
        dotEl.style.backgroundColor = 'rgba(168, 85, 247, 0.9)'
        dotEl.style.boxShadow = '0 0 10px rgba(168, 85, 247, 0.4)'
      }
    }
    const leaveHandler = () => {
      isHovering.current = false
      const ringEl = ringRef.current
      if (ringEl) {
        ringEl.style.width = '40px'
        ringEl.style.height = '40px'
        ringEl.style.borderRadius = '50%'
        ringEl.style.borderColor = 'rgba(0, 212, 255, 0.4)'
        ringEl.style.boxShadow = '0 0 12px rgba(0, 212, 255, 0.08)'
      }
      const dotEl = dotRef.current
      if (dotEl) {
        dotEl.style.backgroundColor = 'rgba(0, 212, 255, 0.9)'
        dotEl.style.boxShadow = '0 0 6px rgba(0, 212, 255, 0.3)'
      }
    }

    const attached = new WeakSet()
    const attach = (el) => {
      if (attached.has(el)) return
      attached.add(el)
      el.addEventListener('mouseenter', enterHandler)
      el.addEventListener('mouseleave', leaveHandler)
    }

    document.querySelectorAll(selectors).forEach(attach)

    let debounceTimer
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        document.querySelectorAll(selectors).forEach(attach)
      }, 200)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(debounceTimer)
      observer.disconnect()
    }
  }, [])

  /* ───── Ring follow loop + trail (lightweight — efficient transforms) ───── */
  useEffect(() => {
    const animate = () => {
      if (isTouchDevice.current) {
        if (dotRef.current) dotRef.current.style.opacity = '0'
        if (ringRef.current) ringRef.current.style.opacity = '0'
        if (glowRef.current) glowRef.current.style.opacity = '0'
        trailRefs.current.forEach(t => { if (t) t.style.opacity = '0' })
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      // Ring lerps toward mouse
      const lerp = isHovering.current ? 0.18 : 0.14
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * lerp
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * lerp

      const ringEl = ringRef.current
      if (ringEl) {
        const size = isHovering.current ? 56 : 40
        const rotation = isHovering.current ? 45 : 0
        const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2)
        const ringScale = 1 + Math.min(speed * 0.003, 0.15)
        ringEl.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px) rotate(${rotation}deg) scale(${ringScale})`
      }

      // Trail particles
      for (let i = trailPositions.current.length - 1; i > 0; i--) {
        trailPositions.current[i].x += (trailPositions.current[i - 1].x - trailPositions.current[i].x) * 0.3
        trailPositions.current[i].y += (trailPositions.current[i - 1].y - trailPositions.current[i].y) * 0.3
      }
      trailPositions.current[0].x += (mouse.current.x - trailPositions.current[0].x) * 0.5
      trailPositions.current[0].y += (mouse.current.y - trailPositions.current[0].y) * 0.5

      trailRefs.current.forEach((t, i) => {
        if (t) {
          const pos = trailPositions.current[i]
          const trailScale = 1 - i * 0.15
          const trailOpacity = 0.25 - i * 0.04
          t.style.transform = `translate(${pos.x - 2}px, ${pos.y - 2}px) scale(${trailScale})`
          t.style.opacity = `${trailOpacity}`
        }
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <>
      {/* Ambient glow — soft radial light following cursor */}
      <div
        ref={glowRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9996,
          opacity: 0,
          willChange: 'transform',
        }}
      />
      {/* Trail particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          ref={el => { trailRefs.current[i] = el }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: i % 2 === 0 ? 'rgba(0, 212, 255, 0.4)' : 'rgba(168, 85, 247, 0.4)',
            pointerEvents: 'none',
            zIndex: 9997,
            opacity: 0,
            willChange: 'transform',
          }}
        />
      ))}
      {/* Outer ring — follows with smooth delay */}
      <div ref={ringRef} className="cursor-ring" />
      {/* Inner dot — follows mouse instantly */}
      <div ref={dotRef} className="cursor-dot" />
    </>
  )
}

export default CustomCursor
