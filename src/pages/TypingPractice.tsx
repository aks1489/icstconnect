import { useState, useEffect } from 'react';
import TypingTest, { TYPING_LEVELS } from '../components/typing/TypingTest';
import { ArrowLeft, Lock, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

export default function TypingPractice() {
  // We'll store unlocked levels an array of numbers (the durations)
  // 10s is always unlocked.
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => {
    const saved = localStorage.getItem('icst_typing_unlocked');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [10];
      }
    }
    return [10];
  });

  const [currentLevel, setCurrentLevel] = useState<number>(10);

  // Save to localstorage when it changes
  useEffect(() => {
    localStorage.setItem('icst_typing_unlocked', JSON.stringify(unlockedLevels));
  }, [unlockedLevels]);

  const handleTestComplete = (passed: boolean) => {
    if (passed) {
       // Find the next level index
       const currentIndex = TYPING_LEVELS.indexOf(currentLevel);
       if (currentIndex < TYPING_LEVELS.length - 1) {
          const nextLevel = TYPING_LEVELS[currentIndex + 1];
          if (!unlockedLevels.includes(nextLevel)) {
             setUnlockedLevels(prev => [...prev, nextLevel]);
          }
       }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col p-8 w-full">
      {/* Branding Header */}
      <header className="flex w-full justify-between items-center mb-10 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3 no-underline group">
           <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl shadow-sm" />
           <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-tight text-slate-900">ICST</span>
              <span className="text-[0.65rem] font-medium tracking-wider uppercase text-slate-500">Chowberia</span>
           </div>
        </Link>
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-start mt-4 max-w-5xl mx-auto">
        
        {/* Level Selector */}
        <div className="flex flex-col items-center w-full max-w-2xl mb-12">
           <div className="flex items-center gap-2 mb-6">
              <Trophy size={20} className="text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-700">Typing Challenge</h2>
           </div>
           
           <div className="flex gap-4 p-2 bg-white rounded-full shadow-sm border border-slate-100">
             {TYPING_LEVELS.map((level) => {
                const isUnlocked = unlockedLevels.includes(level);
                const isActive = currentLevel === level;
                
                return (
                  <button
                     key={level}
                     onClick={() => {
                        if (isUnlocked) setCurrentLevel(level);
                     }}
                     disabled={!isUnlocked}
                     className={`
                        relative flex items-center justify-center min-w-[80px] h-10 px-4 rounded-full text-sm font-medium transition-all duration-200
                        ${isActive 
                           ? 'bg-indigo-600 text-white shadow-md' 
                           : isUnlocked 
                              ? 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                              : 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200'
                        }
                     `}
                  >
                     {isUnlocked ? (
                        `${level}s`
                     ) : (
                        <div className="flex items-center gap-1.5 opacity-70">
                           <Lock size={14} />
                           {level}s
                        </div>
                     )}
                  </button>
                )
             })}
           </div>
        </div>

        {/* Typing Engine */}
        {/* We key it by currentLevel so changing levels completely resets the engine state */}
        <TypingTest 
           key={currentLevel} 
           duration={currentLevel} 
           onComplete={handleTestComplete} 
        />
      </main>
      
      <footer className="mt-16 pb-8 text-center text-sm text-slate-500 font-medium">
         <p>Focus on typing. Time will start automatically upon your first keystroke.</p>
      </footer>
    </div>
  );
}
