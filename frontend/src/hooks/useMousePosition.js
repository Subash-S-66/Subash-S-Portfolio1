import { useState, useEffect, useCallback } from 'react'

/**
 * Tracks the mouse position and provides normalised coordinates (-1 to 1).
 * Uses requestAnimationFrame for smooth updates without blocking the main thread.
 */
export default function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [normalised, setNormalised] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    setPosition({ x: e.clientX, y: e.clientY })
    setNormalised({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return { position, normalised }
}
