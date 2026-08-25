import { useState, useEffect, useRef, useCallback } from 'react'
import type { TypingCalcOutput } from '../workers/typingCalculator.worker'

export function useTypingWorker() {
    const workerRef = useRef<Worker | null>(null)
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
        // Instantiate Web Worker with Vite URL support
        workerRef.current = new Worker(
            new URL('../workers/typingCalculator.worker.ts', import.meta.url),
            { type: 'module' }
        )

        workerRef.current.onmessage = (e: MessageEvent<TypingCalcOutput>) => {
            setMetrics(e.data)
        }

        return () => {
            workerRef.current?.terminate()
        }
    }, [])

    const calculate = useCallback((originalText: string, typedText: string, elapsedSeconds: number) => {
        if (!workerRef.current) return
        workerRef.current.postMessage({
            originalText,
            typedText,
            elapsedSeconds
        })
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
