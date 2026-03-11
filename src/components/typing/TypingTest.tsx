import { useState, useEffect, useRef } from 'react';
import { RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import useTypingEngine from './useTypingEngine';

// Levels in seconds
export const TYPING_LEVELS = [10, 20, 60, 90];
export const TARGET_WPM = 10;
export const TARGET_ACCURACY = 95;

interface TypingTestProps {
  duration: number;
  onComplete?: (passed: boolean, wpm: number, accuracy: number) => void;
}

export default function TypingTest({ duration, onComplete }: TypingTestProps) {
  const {
    state,
    words,
    timeLeft,
    typed,
    errors,
    totalKeystrokes,
    wpm,
    accuracy,
    resetTest,
    handleKeyDown
  } = useTypingEngine(duration);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  // Focus the hidden input nicely
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [duration]); // Refocus if duration changes

  // Trigger completion callback when test finishes
  useEffect(() => {
    if (state === 'finished' && onComplete) {
      const finalWpm = Math.round(wpm);
      const finalAcc = Math.round(accuracy);
      const passed = finalWpm >= TARGET_WPM && finalAcc >= TARGET_ACCURACY;
      onComplete(passed, finalWpm, finalAcc);
    }
  }, [state, onComplete, wpm, accuracy]);

  // Track the height of the caret to determine line index
  useEffect(() => {
    if (activeCharRef.current) {
      // Find relative top offset within the scrolling container
      const offsetTop = activeCharRef.current.offsetTop;
      
      // Calculate which line index we are on (assuming line height ~3rem/48px)
      // Since it's responsive and could vary slightly, dividing by ~48px gives a decent estimate.
      const estimatedLineHeight = 48; // 3rem = 48px
      const currentLine = Math.floor(offsetTop / estimatedLineHeight);
      
      if (currentLine !== activeLineIndex) {
         setActiveLineIndex(currentLine);
      }
    }
  }, [typed, activeLineIndex]);

  const finalWpm = Math.round(wpm);
  const finalAcc = Math.round(accuracy);
  const passed = finalWpm >= TARGET_WPM && finalAcc >= TARGET_ACCURACY;

  return (
    <div 
      className="flex flex-col items-center w-full max-w-4xl mx-auto outline-none py-10"
      tabIndex={0}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {state === 'start' && (
        <div className="text-indigo-600 text-3xl mb-8 font-mono font-bold tracking-wider">
          {timeLeft}s
        </div>
      )}
      {state === 'waiting' && <div className="h-[44px] mb-8" />}

      {state === 'finished' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center w-full mt-4 bg-white p-10 sm:p-12 rounded-2xl shadow-sm border border-slate-100"
        >
          {/* Success / Fail Banner */}
          <div className={`flex items-center gap-2 mb-8 px-5 py-2 rounded-full font-medium ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
             <span>
               {passed ? 'Level Passed!' : `Failed. Need ${TARGET_WPM} WPM & ${TARGET_ACCURACY}% Acc.`}
             </span>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-16 text-center mb-10 w-full max-w-md">
            <div className={`flex flex-col items-center p-6 rounded-xl ${finalWpm >= TARGET_WPM ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className="text-slate-500 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">WPM</span>
              <span className={`text-5xl sm:text-6xl font-black ${finalWpm >= TARGET_WPM ? 'text-green-600' : 'text-red-600'}`}>
                {finalWpm}
              </span>
              <span className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">Goal: {TARGET_WPM}</span>
            </div>
            <div className={`flex flex-col items-center p-6 rounded-xl ${finalAcc >= TARGET_ACCURACY ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className="text-slate-500 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">Accuracy</span>
              <span className={`text-5xl sm:text-6xl font-black ${finalAcc >= TARGET_ACCURACY ? 'text-green-600' : 'text-red-600'}`}>
                {finalAcc}%
              </span>
               <span className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">Goal: {TARGET_ACCURACY}%</span>
            </div>
          </div>
          
          <div className="flex gap-12 text-slate-600 mb-10 text-sm">
            <div className="flex flex-col items-center">
              <span className="mb-1 text-slate-400 font-medium">Keystrokes</span>
              <span className="text-lg font-bold text-slate-700">{totalKeystrokes}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-1 text-slate-400 font-medium">Errors</span>
              <span className="text-lg font-bold text-red-500">{errors}</span>
            </div>
          </div>

          <button 
            onClick={() => {
              resetTest();
              setActiveLineIndex(0);
              containerRef.current?.focus();
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium"
          >
            <RotateCcw size={18} />
            Try Again
          </button>
        </motion.div>
      ) : (
        <>
          {/* 3-line view container */}
          <div 
            className="relative w-full overflow-hidden" 
            style={{ height: 'calc(3 * 3rem)' }} // Approx 3 lines of text given our line-height/font-size
          >
             <motion.div 
               className="text-2xl sm:text-3xl leading-relaxed sm:leading-[3rem] font-mono relative w-full select-none"
               animate={{ y: `-${activeLineIndex > 1 ? (activeLineIndex - 1) * 3 : 0}rem` }}
               transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
             >
              {words.split('').map((char: string, index: number) => {
                let colorClass = 'text-slate-400'; // default untyped color
                let isError = false;

                if (index < typed.length) {
                  if (typed[index] === char) {
                    colorClass = 'text-slate-900 font-medium'; // correct typed color
                  } else {
                    colorClass = 'text-red-500'; // error color
                    isError = true;
                  }
                }

                // We attach a ref to the active character (our caret position)
                const isActive = index === typed.length;

                return (
                  <span 
                    key={index} 
                    className="relative"
                    ref={isActive ? activeCharRef : null}
                  >
                    {/* Caret */}
                    {isActive && (
                       <motion.span 
                          animate={{ opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="absolute left-0 top-[10%] bottom-[10%] w-[3px] bg-indigo-600 rounded-full"
                       />
                    )}
                    {/* Character */}
                    <span 
                      className={`transition-colors duration-100 ${colorClass} ${isError && char === ' ' ? 'bg-red-200' : ''}`}
                    >
                      {char}
                    </span>
                  </span>
                );
              })}
              
              {/* Caret at the very end */}
              {typed.length === words.length && (
                <motion.span 
                  ref={activeCharRef}
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="absolute w-[3px] h-[80%] top-[10%] bg-indigo-600 rounded-full"
                />
              )}
            </motion.div>
          </div>

          <div className="mt-16 flex justify-center">
             <button 
              onClick={() => {
                resetTest();
                setActiveLineIndex(0);
                containerRef.current?.focus();
              }}
              className="flex items-center justify-center p-3 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600/50"
              title="Restart Test"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
