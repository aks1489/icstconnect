import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-sm font-semibold"
          >
            <AlertTriangle size={18} />
            <span>404 Error: Resource Not Found</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Oops! Page Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
              The page you are trying to reach may have been moved, renamed, or is temporarily unavailable. Let us help you get back on track.
            </p>
          </motion.div>

          {/* Direct Helpful Action Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-sky-600 text-white font-semibold hover:bg-slate-800 dark:hover:bg-sky-500 shadow-lg shadow-slate-900/20 transition-all no-underline"
            >
              <Home size={18} />
              <span>Return to Home</span>
            </Link>

            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all no-underline"
            >
              <Book size={18} />
              <span>Browse Courses</span>
            </Link>
          </motion.div>

          {/* Quick Hub Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-8 border-t border-slate-200 dark:border-slate-800"
          >
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-4">
              Explore Popular Portals
            </h2>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link to="/scholarships" className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline transition-colors flex items-center gap-1.5">
                <Sparkles size={15} /> Scholarships
              </Link>
              <Link to="/about" className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline transition-colors flex items-center gap-1.5">
                <Info size={15} /> About ICST
              </Link>
              <Link to="/connect" className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline transition-colors">
                Contact & Hub
              </Link>
              <Link to="/online-test" className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline transition-colors">
                Practice Tests
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default NotFound
