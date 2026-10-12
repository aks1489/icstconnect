import { useState, useEffect } from 'react';
import TypingTest, { TYPING_LEVELS } from '../components/typing/TypingTest';
import { IconArrowLeft as ArrowLeft, IconLock as Lock, IconTrophy as Trophy } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import ThemeToggle from '../components/ui/ThemeToggle';
import SEOHead from '../components/common/SEOHead';

const EXPIRY_MS = 3 * 60 * 1000; // 3 minutes

export default function TypingPractice() {
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => {
    const saved = localStorage.getItem('icst_typing_unlocked');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.levels && parsed.timestamp) {
           const now = new Date().getTime();
           if (now - parsed.timestamp < EXPIRY_MS) {
              return parsed.levels;
           }
        }
      } catch {
        return [10];
      }
    }
    return [10];
  });
  
  const [currentLevel, setCurrentLevel] = useState<number>(10);

  // Save to localstorage with timestamp when it changes
  useEffect(() => {
    const data = {
       levels: unlockedLevels,
       timestamp: new Date().getTime()
    };
    localStorage.setItem('icst_typing_unlocked', JSON.stringify(data));
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans flex flex-col p-8 w-full">
      <SEOHead
        title="Typing Speed Test & Accuracy Tutor Online | ICST Chowberia"
        description="Practice touch typing with timed tests (10s to 120s), track words per minute (WPM), accuracy, and unlock higher skill tiers at ICST Chowberia."
        canonicalPath="/typing-practice"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Typing Practice', path: '/typing-practice' }
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'ICST Interactive Typing Tutor',
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'All'
        }}
      />

      {/* Branding Header */}
      <header className="flex w-full justify-between items-center mb-8 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3 no-underline group">
           <img
             src={logo}
             alt="ICST Chowberia Official Institute Logo"
             width={40}
             height={40}
             className="w-10 h-10 rounded-xl shadow-sm"
           />
           <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-tight text-slate-900 dark:text-white">ICST</span>
              <span className="text-[0.65rem] font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400">Chowberia</span>
           </div>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors no-underline">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="max-w-5xl mx-auto w-full mb-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 no-underline transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">Typing Practice</span>
        </nav>
      </div>

      <main className="flex-1 w-full flex flex-col items-center justify-start mt-2 max-w-5xl mx-auto">
        {/* Single Semantic H1 Tag */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Interactive Typing Speed Test & Practice
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
            Test your keystroke accuracy, track real-time WPM, and unlock progressive speed challenge tiers.
          </p>
        </div>

        {/* Level Selector */}
        <div className="flex flex-col items-center w-full max-w-2xl mb-12">
           <div className="flex items-center gap-2 mb-4">
              <Trophy size={20} className="text-amber-500" />
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">Select Duration Challenge</h2>
           </div>
           
           <div className="flex gap-4 p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
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
                        relative flex items-center justify-center min-w-[80px] h-10 px-4 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                        ${isActive 
                           ? 'bg-indigo-600 text-white shadow-md' 
                           : isUnlocked 
                              ? 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white' 
                              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800'
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
      
      <footer className="mt-16 pb-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
         <p>Focus on typing. Time will start automatically upon your first keystroke.</p>
      </footer>
    </div>
  );
}
