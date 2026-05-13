'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  end: number
  duration?: number
  pauseDuration?: number
  loop?: boolean
}

export function AnimatedCounter({
  end,
  duration = 3500,
  pauseDuration = 5000,
  loop = false,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let animationFrame: number
    let loopTimer: ReturnType<typeof setTimeout>

    const animate = () => {
      const startTime = performance.now()

      const tick = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * end))

        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick)
        } else {
          setCount(end)
          if (loop) {
            loopTimer = setTimeout(() => {
              setCount(0)
              animate()
            }, pauseDuration)
          }
        }
      }

      animationFrame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate()
        } else {
          cancelAnimationFrame(animationFrame)
          clearTimeout(loopTimer)
          if (loop) setCount(0)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationFrame)
      clearTimeout(loopTimer)
    }
  }, [end, duration, pauseDuration, loop])

  return <span ref={ref}>{count}</span>
}
