import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Clock, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Test, TestQuestion } from '../types'

const TestPlayer = () => {
    const { testId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isStudentPortal = location.pathname.includes('/student')
    const backPath = isStudentPortal ? '/student/tests' : '/online-test'

    const [loading, setLoading] = useState(true)
    const [test, setTest] = useState<Test | null>(null)
    const [questions, setQuestions] = useState<TestQuestion[]>([])

    // Test State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({})

    // Result State
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [score, setScore] = useState(0)

    // Timer State
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        if (test && !isSubmitted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        handleSubmit()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [test, isSubmitted, timeLeft])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    useEffect(() => {
        fetchTestDetails()
    }, [testId])

    const fetchTestDetails = async () => {
        if (!testId) return

        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Fetch Test Metadata
            const { data: testData, error: tError } = await supabase
                .from('tests')
                .select('*')
                .eq('id', testId)
                .single()

            if (tError || !testData) throw new Error('Test not found')

            // 2. Access Control Check
            if (testData.access_type === 'private') {
                if (!user) {
                    alert('You must be logged in to access this private test.')
                    return navigate('/login')
                }

                // Check Enrollment
                const { data: enrollment } = await supabase
                    .from('enrollments')
                    .select('id')
                    .eq('student_id', user.id)
                    .eq('course_id', testData.course_id)
                    .single()

                if (!enrollment) {
                    alert('You are not enrolled in the course for this test.')
                    return navigate(backPath)
                }
            }

            setTest(testData)
            setTimeLeft(testData.duration_minutes * 60)

            // 3. Fetch Questions & Options
            const { data: qs, error: qError } = await supabase
                .from('questions')
                .select(`
                    id,
                    text,
                    type,
                    order_index,
                    marks,
                    options (
                        id,
                        text,
                        is_correct,
                        order_index
                    )
                `)
                .eq('test_id', testId)
                .order('order_index', { ascending: true })

            if (qError) throw qError

            // Format specific data if needed (e.g. sorting options)
            const formattedQuestions = qs?.map(q => ({
                ...q,
                test_id: testId as string, // Ensure test_id is present
                options: q.options?.sort((a: any, b: any) => a.order_index - b.order_index) || []
            })) as TestQuestion[] || []

            setQuestions(formattedQuestions)

        } catch (error) {
            console.error('Error loading test:', error)
            navigate(backPath)
        } finally {
            setLoading(false)
        }
    }

    const currentQuestion = questions[currentQuestionIndex]
    const totalQuestions = questions.length
    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0

    const handleOptionSelect = (optionIndex: number) => {
        if (isSubmitted || !currentQuestion) return
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionIndex
        }))
    }

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const handleSubmit = () => {
        let calculatedScore = 0
        questions.forEach(q => {
            const selectedIdx = selectedAnswers[q.id]
            if (selectedIdx !== undefined && q.options[selectedIdx]?.is_correct) {
                calculatedScore += (q.marks || 1) // Default to 1 if no marks or simple count
            }
        })
        setScore(calculatedScore)
        setIsSubmitted(true)
        // Ideally save result to DB here
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        )
    }

    if (!test || questions.length === 0) return null

    // --- RESULTS VIEW ---
    if (isSubmitted) {
        const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0) // Assuming 1 mark default for simple % calc if necessary
        // Or simpler: just count correct answers if ignoring marks for now? The mock used 'score' as count.
        // Let's use simple count of correct answers matching the mock logic which tracked correct count.
        // BUT logic above adds `q.marks`. Let's assume 1 mark per question for now to match UI "Score X / TotalQuestions"
        // Update: calculatedScore above adds marks. Let's normalize to count just for the UI logic if requested, 
        // OR just stick to marks. The UI shows "Score: X / TotalQuestions". 
        // If marks can be > 1, this UI is slightly misleading. 
        // I will assume simple 1 mark per question for now to keep it consistent with "Score / Total".

        // Re-calcing specifically for "Count" display if needed. 
        // Actually, let's treat `score` as total marks obtained.

        const percentage = Math.round((score / totalMarks) * 100)
        let message = ''
        let color = ''

        if (percentage >= 80) {
            message = 'Excellent! You have mastered this topic.'
            color = 'text-emerald-600'
        } else if (percentage >= 50) {
            message = 'Good job! But there is room for improvement.'
            color = 'text-blue-600'
        } else {
            message = 'Keep practicing. You can do better!'
            color = 'text-rose-600'
        }

        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100"
                >
                    <div className="w-24 h-24 rounded-full bg-slate-50 mx-auto mb-6 flex items-center justify-center shadow-inner">
                        <span className={`text-4xl font-bold ${color}`}>{percentage}%</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Test Completed</h2>
                    <p className="text-slate-500 mb-8">{message}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Score</p>
                            <p className="text-xl font-bold text-slate-900">{score} / {totalMarks}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status</p>
                            <p className={`text-xl font-bold ${percentage >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {percentage >= 50 ? 'Passed' : 'Failed'}
                            </p>
                        </div>
                    </div>

                    <Link
                        to={backPath}
                        className="block w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-indigo-600 transition-colors shadow-lg hover:shadow-indigo-200"
                    >
                        Back to Tests
                    </Link>
                </motion.div>
            </div>
        )
    }

    // --- TEST PLAYER VIEW ---
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Question {currentQuestionIndex + 1} <span className="text-slate-300">/</span> {totalQuestions}
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-slate-900 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
                            <Clock className="text-indigo-500" size={18} />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full mb-8 overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Question Card */}
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 md:p-10 mb-8 border border-white"
                >
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-snug">
                        {currentQuestion.text}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswers[currentQuestion.id] === index
                            return (
                                <button
                                    key={option.id || index}
                                    onClick={() => handleOptionSelect(index)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md shadow-indigo-100'
                                        : 'border-slate-100 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                                        ? 'border-indigo-600 bg-indigo-600'
                                        : 'border-slate-300 group-hover:border-slate-400'
                                        }`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <span className="font-semibold">{option.text}</span>
                                </button>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${currentQuestionIndex === 0
                            ? 'text-slate-300 cursor-not-allowed hidden'
                            : 'text-slate-600 hover:bg-white hover:shadow-sm'
                            }`}
                    >
                        <ArrowLeft size={20} /> Previous
                    </button>

                    {currentQuestionIndex === totalQuestions - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
                        >
                            Submit Test
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            Next <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TestPlayer
