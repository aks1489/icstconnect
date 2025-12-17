import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Check } from 'lucide-react'

interface Topic {
    id: number
    title: string
    description: string
    sort_order: number
    completed?: boolean
}

interface Module {
    id: number
    title: string
    sort_order: number
    topics: Topic[]
}

export default function StudentProgressTracker() {
    const { studentId, courseId } = useParams()
    const [modules, setModules] = useState<Module[]>([])
    const [studentData, setStudentData] = useState<any>(null)
    const [courseData, setCourseData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (studentId && courseId) {
            fetchData()
        }
    }, [studentId, courseId])

    const fetchData = async () => {
        try {
            setLoading(true)

            // 1. Fetch Student & Course Info
            const { data: student } = await supabase.from('profiles').select('*').eq('id', studentId).single()
            const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single()
            setStudentData(student)
            setCourseData(course)

            // 2. Fetch Modules
            const { data: modulesData } = await supabase
                .from('course_modules')
                .select('*')
                .eq('course_id', courseId)
                .order('sort_order', { ascending: true })

            let allTopics: any[] = []

            if (modulesData && modulesData.length > 0) {
                const moduleIds = modulesData.map(m => m.id)
                const { data: topicsData } = await supabase
                    .from('course_topics')
                    .select('*')
                    .in('module_id', moduleIds)
                    .order('sort_order', { ascending: true })

                allTopics = topicsData || []
            }

            // 3. Fetch Student Progress
            const { data: progressData } = await supabase
                .from('student_topic_progress')
                .select('topic_id, status')
                .eq('student_id', studentId)
                .eq('status', 'completed')

            const completedTopicIds = new Set(progressData?.map(p => p.topic_id))

            // Merge Data
            const mergedModules = modulesData?.map((m: any) => ({
                ...m,
                topics: allTopics
                    .filter(t => t.module_id === m.id)
                    .map((t: any) => ({
                        ...t,
                        completed: completedTopicIds.has(t.id)
                    }))
            })) || []

            setModules(mergedModules)

        } catch (error) {
            console.error('Error loading data:', error)
            alert('Failed to load progress data')
        } finally {
            setLoading(false)
        }
    }

    const toggleTopicCompletion = async (topicId: number, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                // Delete progress entry
                await supabase
                    .from('student_topic_progress')
                    .delete()
                    .eq('student_id', studentId)
                    .eq('topic_id', topicId)
            } else {
                // Insert progress entry
                await supabase
                    .from('student_topic_progress')
                    .insert({
                        student_id: studentId,
                        topic_id: topicId,
                        status: 'completed',
                        completed_by: (await supabase.auth.getUser()).data.user?.id
                    })
            }

            // Update local state
            setModules(prev => prev.map(m => ({
                ...m,
                topics: m.topics.map(t =>
                    t.id === topicId ? { ...t, completed: !currentStatus } : t
                )
            })))

            // Recalculate and update overall progress in enrollments
            updateEnrollmentProgress()

        } catch (error) {
            console.error('Error updating status:', error)
            alert('Failed to update status')
        }
    }

    const updateEnrollmentProgress = async () => {
        try {
            // Count total topics for this course (server-side would be better but doing client-side for now)


            // Simpler: Use the modules state we already have for total count
            const localTotalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0)

            if (localTotalTopics > 0) {
                // Fetch actual completed count from DB to be sure
                const { data: pData } = await supabase
                    .from('student_topic_progress')
                    .select('topic_id')
                    .eq('student_id', studentId)
                    .eq('status', 'completed')

                // Filter to ensure we only count topics from this course
                const topicIdsInCourse = new Set(modules.flatMap(m => m.topics.map(t => t.id)))
                const courseCompletedCount = pData?.filter(p => topicIdsInCourse.has(p.topic_id)).length || 0

                const newProgress = Math.round((courseCompletedCount / localTotalTopics) * 100)

                await supabase
                    .from('enrollments')
                    .update({ progress: newProgress })
                    .match({ student_id: studentId, course_id: courseId })
            }
        } catch (err) {
            console.error('Error syncing progress:', err)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading progress...</div>

    const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0)
    const completedTopics = modules.reduce((acc, m) => acc + m.topics.filter(t => t.completed).length, 0)
    const progressPercentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-6">
                <Link to="/teacher/active-classes" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Active Classes
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                            {studentData?.avatar_url ? (
                                <img src={studentData.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-bold text-slate-500">{studentData?.full_name?.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">{studentData?.full_name}</h1>
                            <p className="text-slate-500">
                                Course: <span className="font-semibold text-indigo-600">{courseData?.course_name}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-6">
                        <h2 className="font-bold text-slate-800 mb-4">Course Progress</h2>

                        <div className="flex items-center justify-center relative w-40 h-40 mx-auto mb-4">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#ecf0f1"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#6366f1"
                                    strokeWidth="3"
                                    strokeDasharray={`${progressPercentage}, 100`}
                                    className="drop-shadow-md"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-3xl font-bold text-slate-800">{progressPercentage}%</span>
                                <span className="text-xs text-slate-500 uppercase font-semibold">Completed</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                <span className="text-slate-500">Total Topics</span>
                                <span className="font-semibold text-slate-800">{totalTopics}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                <span className="text-slate-500">Completed</span>
                                <span className="font-semibold text-emerald-600">{completedTopics}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2">
                                <span className="text-slate-500">Remaining</span>
                                <span className="font-semibold text-amber-600">{totalTopics - completedTopics}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Modules */}
                <div className="lg:col-span-2 space-y-6">
                    {modules.map((module) => (
                        <div key={module.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 p-4 border-b border-slate-200">
                                <h3 className="font-bold text-slate-800">{module.title}</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {module.topics.map((topic) => (
                                    <div key={topic.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleTopicCompletion(topic.id, topic.completed || false)}>
                                        <div className={`
                                            w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                            ${topic.completed
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'border-slate-300 text-transparent hover:border-emerald-500'
                                            }
                                        `}>
                                            <Check size={14} />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium transition-colors ${topic.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                {topic.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
