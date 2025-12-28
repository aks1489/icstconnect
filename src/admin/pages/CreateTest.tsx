import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Save, Layout, Clock, Globe, Lock, BookOpen } from 'lucide-react'
import QuestionEditor from '../../components/admin/QuestionEditor'
import type { Test, TestQuestion } from '../../types'

export default function CreateTest() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [courses, setCourses] = useState<any[]>([])

    // Core Test Settings
    const [testData, setTestData] = useState<Partial<Test>>({
        title: '',
        description: '',
        duration_minutes: 30,
        difficulty: 'medium',
        access_type: 'private',
        is_active: true
    })

    const [questions, setQuestions] = useState<TestQuestion[]>([])

    // Fetch Courses for Dropdown
    useEffect(() => {
        const fetchCourses = async () => {
            const { data } = await supabase.from('courses').select('id, course_name')
            if (data) setCourses(data)
        }
        fetchCourses()
    }, [])

    const handleSave = async () => {
        if (!testData.title) return alert('Please enter a test title')
        if (questions.length === 0) return alert('Please add at least one question')

        // Validate Questions
        for (const q of questions) {
            if (!q.text) return alert('All questions must have text')
            if (q.options.some(o => !o.text)) return alert('All options must have text')
            if (!q.options.some(o => o.is_correct)) return alert('Each question must have one correct answer')
        }

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // 1. Create Test
            const { data: test, error: testError } = await supabase
                .from('tests')
                .insert({
                    ...testData,
                    created_by: user.id
                })
                .select()
                .single()

            if (testError) throw testError

            // 2. Create Questions
            const questionsToInsert = questions.map((q, idx) => ({
                test_id: test.id,
                text: q.text,
                type: q.type,
                order_index: idx + 1,
                marks: q.marks
            }))

            const { data: insertedQuestions, error: qError } = await supabase
                .from('questions')
                .insert(questionsToInsert)
                .select()

            if (qError) throw qError

            // 3. Create Options (Mapping back to correct question IDs)
            // This relies on the order being preserved or matching logic. 
            // Ideally we insert one by one or batch carefully.
            // For simplicity/robustness in this "single batch" context:

            const optionsToInsert = []
            // We match inserted questions by order_index since we saved them relative to `questions` array
            // Optimization: sort insertedQuestions by order_index to match `questions` array order
            const sortedInsertedQuestions = insertedQuestions.sort((a, b) => a.order_index - b.order_index)

            for (let i = 0; i < questions.length; i++) {
                const qId = sortedInsertedQuestions[i].id
                const originalOptions = questions[i].options

                optionsToInsert.push(...originalOptions.map((opt, optIdx) => ({
                    question_id: qId,
                    text: opt.text,
                    is_correct: opt.is_correct,
                    order_index: optIdx + 1
                })))
            }

            const { error: oError } = await supabase
                .from('options')
                .insert(optionsToInsert)

            if (oError) throw oError

            navigate('/admin/tests') // Or teacher/tests

        } catch (error: any) {
            console.error('Error creating test:', error)
            alert('Failed to create test: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800">Create New Test</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Saving...' : <><Save size={18} /> Publish Test</>}
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

                {/* 1. Test Details Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Layout className="text-indigo-500" size={20} /> Test Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Test Title</label>
                            <input
                                type="text"
                                value={testData.title}
                                onChange={e => setTestData({ ...testData, title: e.target.value })}
                                placeholder="e.g. React.js Fundamentals - Level 1"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-lg"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Description</label>
                            <textarea
                                value={testData.description || ''}
                                onChange={e => setTestData({ ...testData, description: e.target.value })}
                                rows={3}
                                placeholder="Brief description of what this test covers..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <BookOpen size={16} /> Related Course
                            </label>
                            <select
                                value={testData.course_id || ''}
                                onChange={e => {
                                    // Use loose equality to match string value with potential number ID
                                    const course = courses.find(c => c.id == e.target.value)
                                    setTestData({
                                        ...testData,
                                        course_id: e.target.value,
                                        course_name: course?.course_name || ''
                                    })
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 hover:border-indigo-300 outline-none transition-all bg-white"
                            >
                                <option value="">Select a Course (Optional)</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.course_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Clock size={16} /> Duration (Minutes)
                            </label>
                            <input
                                type="number"
                                value={testData.duration_minutes}
                                onChange={e => setTestData({ ...testData, duration_minutes: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Difficulty</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['easy', 'medium', 'hard'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setTestData({ ...testData, difficulty: level as any })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${testData.difficulty === level
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Access Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setTestData({ ...testData, access_type: 'private' })}
                                    className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${testData.access_type === 'private'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                        }`}
                                >
                                    <Lock size={20} />
                                    <div className="text-left leading-tight">
                                        <div className="font-bold">Private</div>
                                        <div className="text-xs opacity-70">Students Only</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setTestData({ ...testData, access_type: 'public' })}
                                    className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${testData.access_type === 'public'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                        }`}
                                >
                                    <Globe size={20} />
                                    <div className="text-left leading-tight">
                                        <div className="font-bold">Public</div>
                                        <div className="text-xs opacity-70">Everyone</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Question Editor */}
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 px-1">
                        <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">Q</span>
                        Test Questions ({questions.length})
                    </h2>
                    <QuestionEditor
                        questions={questions}
                        onChange={setQuestions}
                    />
                </div>

            </div>
        </div>
    )
}
