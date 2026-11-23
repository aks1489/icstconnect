import React from 'react'
import { Link } from 'react-router-dom'
import { IconHome as Home, IconBook as Book, IconInfoCircle as Info, IconSparkles as Sparkles, IconAlertTriangle as AlertTriangle } from '@tabler/icons-react'
import SEOHead from '../components/common/SEOHead'

const NotFound: React.FC = () => {
  return (
    <>
      <SEOHead
        title="404 - Page Not Found | ICST Chowberia"
        description="The page you are looking for does not exist or has been moved. Explore courses, certifications, and student resources at ICST Chowberia."
        canonicalPath="/404"
        noindex={true}
      />

      <div className="min-h-[80vh] flex items-center justify-center pt-28 pb-20 px-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-sm font-semibold animate-in fade-in zoom-in-95 duration-300">
            <AlertTriangle size={18} />
            <span>404 Error: Resource Not Found</span>
          </div>

          {/* Heading */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Oops! Page Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
              The page you are trying to reach may have been moved, renamed, or is temporarily unavailable. Let us help you get back on track.
            </p>
          </div>

          {/* Direct Helpful Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-sky-600 text-white font-semibold hover:bg-slate-800 dark:hover:bg-sky-500 shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all duration-200 no-underline"
            >
              <Home size={18} />
              <span>Return to Home</span>
            </Link>

            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 no-underline"
            >
              <Book size={18} />
              <span>Browse Courses</span>
            </Link>
          </div>

          {/* Quick Hub Links */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-700">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-4">
              Explore Popular Portals
            </h2>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link to="/scholarships" className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5">
                <Sparkles size={15} /> Scholarships
              </Link>
              <Link to="/about" className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5">
                <Info size={15} /> About ICST
              </Link>
              <Link to="/connect" className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline hover:scale-105 active:scale-95 transition-all duration-200">
                Contact & Hub
              </Link>
              <Link to="/online-test" className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline hover:scale-105 active:scale-95 transition-all duration-200">
                Practice Tests
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NotFound
