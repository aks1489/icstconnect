/**
 * ICST Chowberia — Motion & Animation Engine
 * Powered by Anime.js v4
 * 
 * Rules:
 * - Content is complete at rest (visible without JS / before observer fires).
 * - Full respect for prefers-reduced-motion.
 * - Components call these helpers; scoped to container roots.
 */

import { animate, createTimeline, stagger } from 'animejs'

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Scroll-triggered element entrance with smooth upward drift
 */
export const revealOnScroll = (
  target: HTMLElement | string,
  options: {
    translateY?: number
    duration?: number
    delay?: number
    threshold?: number
  } = {}
) => {
  if (typeof window === 'undefined' || prefersReducedMotion()) return () => { }

  const elements =
    typeof target === 'string'
      ? Array.from(document.querySelectorAll<HTMLElement>(target))
      : [target]

  if (!elements.length) return () => { }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          obs.unobserve(el)

          animate(el, {
            translateY: [options.translateY ?? 16, 0],
            opacity: [0.7, 1],
            duration: options.duration ?? 600,
            delay: options.delay ?? 0,
            ease: 'outExpo'
          })
        }
      })
    },
    { threshold: options.threshold ?? 0.15 }
  )

  elements.forEach((el) => observer.observe(el))

  return () => {
    observer.disconnect()
  }
}

/**
 * Staggered entrance for lists/cards
 */
export const staggerIn = (
  container: HTMLElement | null,
  childSelector: string,
  staggerMs: number = 60
) => {
  if (!container || typeof window === 'undefined' || prefersReducedMotion()) return

  const children = Array.from(container.querySelectorAll<HTMLElement>(childSelector))
  if (!children.length) return

  animate(children, {
    translateY: [16, 0],
    opacity: [0.7, 1],
    duration: 500,
    delay: stagger(staggerMs),
    ease: 'outExpo'
  })
}

/**
 * Counter tween for numbers (e.g. "200+")
 */
export const animateCounter = (
  targetEl: HTMLElement | null,
  targetNumber: number,
  options: {
    duration?: number
    suffix?: string
    prefix?: string
  } = {}
) => {
  if (!targetEl || typeof window === 'undefined') return
  if (prefersReducedMotion()) {
    targetEl.innerText = `${options.prefix ?? ''}${targetNumber}${options.suffix ?? ''}`
    return
  }

  const obj = { val: 0 }
  animate(obj, {
    val: targetNumber,
    duration: options.duration ?? 1200,
    ease: 'outExpo',
    onUpdate: () => {
      if (targetEl) {
        targetEl.innerText = `${options.prefix ?? ''}${Math.round(obj.val)}${options.suffix ?? ''}`
      }
    }
  })
}

/**
 * Gentle magnetic spring feedback for interactive buttons
 */
export const springPress = (el: HTMLElement) => {
  if (typeof window === 'undefined' || prefersReducedMotion()) return
  animate(el, {
    scale: [1, 0.96, 1],
    duration: 250,
    ease: 'outQuad'
  })
}

export { animate, createTimeline, stagger }
