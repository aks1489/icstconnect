/**
 * ICST Connect — Typing Practice Web Worker
 * Offloads live CPM, WPM, accuracy, streak, and grade calculations off the main UI thread.
 * As specified in Master Engineering Instructions Section 23.
 */

export interface TypingCalcInput {
    originalText: string
    typedText: string
    elapsedSeconds: number
}

export interface TypingCalcOutput {
    wpm: number
    netWpm: number
    cpm: number
    accuracy: number
    correctChars: number
    incorrectChars: number
    totalTyped: number
    grade: 'Master' | 'Pro' | 'Intermediate' | 'Beginner' | 'Novice'
}

self.onmessage = (e: MessageEvent<TypingCalcInput>) => {
    const { originalText, typedText, elapsedSeconds } = e.data

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

    const minutes = Math.max(elapsedSeconds / 60, 0.01) // Prevent division by zero
    const grossWpm = Math.round((totalTyped / 5) / minutes)
    const netWpm = Math.max(0, Math.round(((correctChars / 5) - (incorrectChars / 5)) / minutes))
    const cpm = Math.round(correctChars / minutes)
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100

    let grade: TypingCalcOutput['grade'] = 'Novice'
    if (netWpm >= 70 && accuracy >= 95) grade = 'Master'
    else if (netWpm >= 50 && accuracy >= 90) grade = 'Pro'
    else if (netWpm >= 35 && accuracy >= 85) grade = 'Intermediate'
    else if (netWpm >= 20) grade = 'Beginner'

    const result: TypingCalcOutput = {
        wpm: grossWpm,
        netWpm,
        cpm,
        accuracy,
        correctChars,
        incorrectChars,
        totalTyped,
        grade
    }

    self.postMessage(result)
}
