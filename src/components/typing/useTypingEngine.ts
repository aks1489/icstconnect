import React, { useState, useEffect, useCallback } from 'react';
import { getRandomWords } from './words';

export type TestState = 'waiting' | 'start' | 'finished';

export default function useTypingEngine(initialTime: number = 30) {
  const [state, setState] = useState<TestState>('waiting');
  const [words, setWords] = useState<string>('');
  const [typed, setTyped] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);

  // Allow updating time from parent
  useEffect(() => {
    if (state === 'waiting') {
      setTimeLeft(initialTime);
    }
  }, [initialTime, state]);

  // Initialize words
  useEffect(() => {
    setWords(getRandomWords(50).join(' '));
  }, []);

  // Timer logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (state === 'start' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && state === 'start') {
      setState('finished');
    }
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  // Handle keystrokes
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
    }

    if (state === 'finished') return;
    
    // Ignore modifier keys
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
      if (e.key === 'Backspace') {
        setTyped((prev) => prev.slice(0, -1));
      }
      return;
    }

    if (state === 'waiting') {
      setState('start');
    }

    const newChar = e.key;
    const currentIndex = typed.length;
    
    // Check if we reached the end of the text or are getting close
    // Since we render based on characters, let's keep a healthy buffer of ~100 characters ahead.
    if (words.length - currentIndex < 100) {
       setWords(prev => prev + ' ' + getRandomWords(20).join(' '));
    }

    setTotalKeystrokes((prev) => prev + 1);
    
    if (newChar !== words[currentIndex]) {
      setErrors((prev) => prev + 1);
    }

    setTyped((prev) => prev + newChar);

  }, [state, typed, words]);


  const resetTest = useCallback(() => {
    setState('waiting');
    setTyped('');
    setTimeLeft(initialTime);
    setErrors(0);
    setTotalKeystrokes(0);
    setWords(getRandomWords(50).join(' '));
  }, [initialTime]);

  const calculateWPM = () => {
    if (totalKeystrokes === 0) return 0;
    const timeElapsed = initialTime - timeLeft;
    if (timeElapsed === 0) return 0;
    
    // Standard WPM calculation: (total characters / 5) / time in minutes
    const grossWpm = (typed.length / 5) / (timeElapsed / 60);
    // Net WPM: gross calculation minus errors per minute (simplified)
    const errorRate = errors / (timeElapsed / 60);
    const netWpm = Math.max(0, grossWpm - errorRate);
    
    return state === 'finished' ? netWpm : grossWpm; // Only net WPM when finished
  };

  const calculateAccuracy = () => {
    if (totalKeystrokes === 0) return 100;
    return Math.max(0, ((totalKeystrokes - errors) / totalKeystrokes) * 100);
  };

  return {
    state,
    words,
    typed,
    timeLeft,
    errors,
    totalKeystrokes,
    wpm: calculateWPM(),
    accuracy: calculateAccuracy(),
    resetTest,
    setWords,
    handleKeyDown
  };
}
