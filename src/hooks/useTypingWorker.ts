import { useState, useEffect, useRef, useCallback } from 'react'
import type { TypingCalcOutput } from '../workers/typingCalculator.worker'

export function useTypingWorker() {
    const workerRef = useRef<Worker | null>(null)
    const isWorkerAvailableRef = useRef(false)
    const [metrics, setMetrics] = useState<TypingCalcOutput>({
        wpm: 0,
        netWpm: 0,
        cpm: 0,
        accuracy: 100,
        correctChars: 0,
        incorrectChars: 0,
        totalTyped: 0,
        grade: 'Novice'
    })

    useEffect(() => {
        // Instantiate Web Worker with Vite URL support and fallback protection
        if (typeof window !== 'undefined' && 'Worker' in window) {
            try {
                const worker = new Worker(
                    new URL('../workers/typingCalculator.worker.ts', import.meta.url),
                    { type: 'module' }
                )

                worker.onmessage = (e: MessageEvent<TypingCalcOutput>) => {
                    setMetrics(e.data)
                }

                worker.onerror = (err) => {
                    console.warn('Typing worker runtime warning, reverting to synchronous fallback:', err)
                    isWorkerAvailableRef.current = false
                }

                workerRef.current = worker
                isWorkerAvailableRef.current = true
            } catch (err) {
                console.warn('Web Worker creation not supported or restricted, using synchronous fallback:', err)
                isWorkerAvailableRef.current = false
            }
        }

        return () => {
            workerRef.current?.terminate()
            workerRef.current = null
        }
    }, [])

    // Synchronous fallback calculation if worker is unavailable
    const fallbackCalculate = (originalText: string, typedText: string, elapsedSeconds: number): TypingCalcOutput => {
        const totalTyped = typedText.length
        let correctChars = 0
        let incorrectChars = 0

        for (let i = 0; i < totalTyped; i++) {
            if (i < originalText.length && typedText[i] === originalText[i]) {
                correctChars++
            } else {
                incorrectChars++
            }
        }

        const minutes = Math.max(elapsedSeconds / 60, 0.01)
        const grossWpm = Math.round((totalTyped / 5) / minutes)
        const netWpm = Math.max(0, Math.round(((correctChars / 5) - (incorrectChars / 5)) / minutes))
        const cpm = Math.round(correctChars / minutes)
        const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100

        let grade: TypingCalcOutput['grade'] = 'Novice'
        if (netWpm >= 70 && accuracy >= 95) grade = 'Master'
        else if (netWpm >= 50 && accuracy >= 90) grade = 'Pro'
        else if (netWpm >= 35 && accuracy >= 85) grade = 'Intermediate'
        else if (netWpm >= 20) grade = 'Beginner'

        return {
            wpm: grossWpm,
            netWpm,
            cpm,
            accuracy,
            correctChars,
            incorrectChars,
            totalTyped,
            grade
        }
    }

    const calculate = useCallback((originalText: string, typedText: string, elapsedSeconds: number) => {
        if (workerRef.current && isWorkerAvailableRef.current) {
            workerRef.current.postMessage({
                originalText,
                typedText,
                elapsedSeconds
            })
        } else {
            // Immediate fallback
            const fallbackResult = fallbackCalculate(originalText, typedText, elapsedSeconds)
            setMetrics(fallbackResult)
        }
    }, [])

    const reset = useCallback(() => {
        setMetrics({
            wpm: 0,
            netWpm: 0,
            cpm: 0,
            accuracy: 100,
            correctChars: 0,
            incorrectChars: 0,
            totalTyped: 0,
            grade: 'Novice'
        })
    }, [])

    return { metrics, calculate, reset }
}

export default useTypingWorker
