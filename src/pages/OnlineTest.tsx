import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Clock, HelpCircle, ArrowRight, Lock, Globe, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Test } from '../types'

import { useAuth } from '../contexts/AuthContext'

interface OnlineTestProps {
    isStudentPortal?: boolean
}

const OnlineTest = ({ isStudentPortal = false }: OnlineTestProps) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [tests, setTests] = useState<Test[]>([])
    const [filter, setFilter] = useState<'all' | 'public' | 'my-courses'>('all')

    const basePath = isStudentPortal ? '/student/tests' : '/online-test'

    useEffect(() => {
        fetchTests()
    }, [user]) // Re-run if user changes (e.g. login/logout)

    const fetchTests = async () => {
        try {
            setLoading(true)

            // Prepare promises for parallel execution
            const promises: Promise<any>[] = [
                supabase
                    .from('tests')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })
            ]

            // If user logged in, fetch enrollments in parallel
            if (user) {
                promises.push(
                    supabase
                        .from('enrollments')
                        .select('course_id')
                        .eq('student_id', user.id)
                )
            }

            // Execute all requests
            const results = await Promise.all(promises)

            // Extract Tests
            const { data: allTests, error: testError } = results[0]
            if (testError) throw testError

            let visibleTests = allTests || []

            // Extract Enrollments & Filter if user exists
            if (user && results[1]) {
                const { data: enrollments } = results[1]
                const enrolledCourseIds = new Set(enrollments?.map((e: any) => String(e.course_id)) || [])

                visibleTests = visibleTests.filter((test: Test) => {
                    if (test.access_type === 'public') return true
                    return test.course_id && enrolledCourseIds.has(String(test.course_id))
                })
            } else {
                // Guest: Show only Public
                visibleTests = visibleTests.filter((t: Test) => t.access_type === 'public')
            }

            setTests(visibleTests)

        } catch (error) {
            console.error('Error fetching tests:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTests = tests.filter(test => {
        if (filter === 'all') return true
        if (filter === 'public') return test.access_type === 'public'
        if (filter === 'my-courses') return test.access_type === 'private'
        return true
    })

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mb-4">
                        Assessment Zone
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                        Test Your Knowledge
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Challenge yourself with our interactive quizzes. Track your progress, identify gaps, and master your subjects.
                    </p>

                    {/* Filter Tabs */}
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit mx-auto mt-8">
                        {['all', 'public', 'my-courses'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === f
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    } capitalize`}
                            >
                                {f.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 bg-white rounded-3xl shadow-sm border border-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : filteredTests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HelpCircle className="text-slate-400" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No tests found</h3>
                        <p className="text-slate-500 mt-2">Try changing filters or come back later.</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredTests.map((test) => (
                            <motion.div
                                key={test.id}
                                variants={item}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="bg-white rounded-3xl p-1 shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group flex flex-col h-full"
                            >
                                <div className="p-7 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`
                                            w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold
                                            bg-gradient-to-br 
                                            ${test.difficulty === 'easy' ? 'from-emerald-100 to-emerald-50 text-emerald-600' : ''}
                                            ${test.difficulty === 'medium' ? 'from-amber-100 to-amber-50 text-amber-600' : ''}
                                            ${test.difficulty === 'hard' ? 'from-rose-100 to-rose-50 text-rose-600' : ''}
                                            ${test.difficulty === 'expert' ? 'from-violet-100 to-violet-50 text-violet-600' : ''}
                                        `}>
                                            {test.title.charAt(0)}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${test.access_type === 'public'
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {test.access_type === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                                            <span className="capitalize">{test.access_type}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {test.title}
                                    </h3>

                                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                                        {test.description || 'Test your knowledge on this topic.'}
                                    </p>

                                    {test.course_name && (
                                        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 p-2 rounded-lg w-fit">
                                            <BookOpen size={14} /> {test.course_name}
                                        </div>
                                    )}

                                    <div className="mt-auto grid grid-cols-2 gap-4 text-xs font-bold text-slate-400 border-t border-slate-100 pt-6">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-indigo-400" />
                                            {test.duration_minutes} Mins
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <HelpCircle size={16} className="text-indigo-400" />
                                            Qns
                                        </div>
                                    </div>

                                    <Link
                                        to={`${basePath}/${test.id}`}
                                        className="mt-6 w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 group-hover:shadow-indigo-200"
                                    >
                                        Start Challenge <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default OnlineTest
