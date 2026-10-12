import React, { useState, useEffect, useCallback } from 'react'
import { getRandomWords } from './words'
import { useTypingWorker } from '../../hooks/useTypingWorker'

export type TestState = 'waiting' | 'start' | 'finished'

export default function useTypingEngine(initialTime: number = 30) {
  const [state, setState] = useState<TestState>('waiting')
  const [words, setWords] = useState<string>(() => getRandomWords(50).join(' '))
  const [typed, setTyped] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [prevInitialTime, setPrevInitialTime] = useState(initialTime)
  const [errors, setErrors] = useState(0)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)

  // Adjust state when initialTime prop changes while in waiting state
  if (state === 'waiting' && initialTime !== prevInitialTime) {
    setPrevInitialTime(initialTime)
    setTimeLeft(initialTime)
  }

  // Dedicated Typing Web Worker with automatic synchronous fallback
  const { metrics: workerMetrics, calculate: calculateInWorker, reset: resetWorkerMetrics } = useTypingWorker()

  // Timer logic with single interval per test run
  useEffect(() => {
    if (state !== 'start') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setState('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [state])

  // Trigger worker offload whenever typed text or timer changes
  useEffect(() => {
    if (state === 'start' || state === 'finished') {
      const elapsed = Math.max(1, initialTime - timeLeft)
      calculateInWorker(words, typed, elapsed)
    }
  }, [typed, timeLeft, words, initialTime, state, calculateInWorker])

  // Handle keystrokes
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ') {
      e.preventDefault()
    }

    if (state === 'finished') return

    // Ignore modifier keys
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
      if (e.key === 'Backspace') {
        setTyped((prev) => prev.slice(0, -1))
      }
      return
    }

    if (state === 'waiting') {
      setState('start')
    }

    const newChar = e.key
    const currentIndex = typed.length

    // Buffer words if approaching end
    if (words.length - currentIndex < 100) {
      setWords(prev => prev + ' ' + getRandomWords(20).join(' '))
    }

    setTotalKeystrokes((prev) => prev + 1)

    if (newChar !== words[currentIndex]) {
      setErrors((prev) => prev + 1)
    }

    setTyped((prev) => prev + newChar)
  }, [state, typed, words])

  const resetTest = useCallback(() => {
    setState('waiting')
    setTyped('')
    setTimeLeft(initialTime)
    setErrors(0)
    setTotalKeystrokes(0)
    setWords(getRandomWords(50).join(' '))
    resetWorkerMetrics()
  }, [initialTime, resetWorkerMetrics])

  // Compute metrics preferring worker output with synchronous instantaneous fallback
  const wpm = workerMetrics.totalTyped > 0 ? workerMetrics.netWpm : (() => {
    if (totalKeystrokes === 0) return 0
    const timeElapsed = initialTime - timeLeft
    if (timeElapsed === 0) return 0
    const grossWpm = (typed.length / 5) / (timeElapsed / 60)
    const errorRate = errors / (timeElapsed / 60)
    return Math.max(0, Math.round(grossWpm - errorRate))
  })()

  const accuracy = workerMetrics.totalTyped > 0 ? workerMetrics.accuracy : (() => {
    if (totalKeystrokes === 0) return 100
    return Math.max(0, Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100))
  })()

  return {
    state,
    words,
    typed,
    timeLeft,
    errors,
    totalKeystrokes,
    wpm,
    accuracy,
    grade: workerMetrics.grade,
    cpm: workerMetrics.cpm,
    resetTest,
    setWords,
    handleKeyDown
  }
}
