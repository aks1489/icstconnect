import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Check, BookX } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getIcon } from '../../utils/iconMapper'

interface Topic {
    id: number
    title: string
    description: string
    order_index: number
    is_cleared: boolean // Derived state
}

interface Course {
    id: number
    course_name: string
    color: string
    icon: string
}

export default function ManageClass() {
    const { courseId } = useParams()
    const [course, setCourse] = useState<Course | null>(null)
    const [topics, setTopics] = useState<Topic[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (courseId) {
            fetchCourseDetails()
        }
    }, [courseId])

    const fetchCourseDetails = async () => {
        try {
            // 1. Fetch Course Info
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('id, course_name, color, icon')
                .eq('id', courseId)
                .single()

            if (courseError) throw courseError
            setCourse(courseData)

            // 2. Fetch Topics
            const { data: topicsData, error: topicsError } = await supabase
                .from('topics')
                .select('*')
                .eq('course_id', courseId)
                .order('order_index')

            if (topicsError) throw topicsError

            // 3. Fetch Cleared Status (This would check the offline_course_progress table)
            const { data: progressData, error: progressError } = await supabase
                .from('offline_course_progress')
                .select('topic_id, is_completed')
                .eq('course_id', courseId)

            if (progressError && progressError.code !== 'PGRST116') {
                console.error('Error fetching progress', progressError) // Suppress single not found
            }

            const completedTopicIds = new Set(progressData?.filter(p => p.is_completed).map(p => p.topic_id) || [])

            const mergedTopics = topicsData.map(topic => ({
                ...topic,
                is_cleared: completedTopicIds.has(topic.id)
            }))

            setTopics(mergedTopics)
        } catch (error) {
            console.error('Error loading class details:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleTopicCompletion = async (topicId: number, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus

            // Optimistic Update
            setTopics(topics.map(t => t.id === topicId ? { ...t, is_cleared: newStatus } : t))

            // Update DB
            const { error } = await supabase
                .from('offline_course_progress')
                .upsert({
                    course_id: parseInt(courseId!),
                    topic_id: topicId,
                    is_completed: newStatus,
                    completed_at: newStatus ? new Date().toISOString() : null,
                    updated_by: (await supabase.auth.getUser()).data.user?.id
                }, { onConflict: 'course_id, topic_id' })

            if (error) throw error

            // TODO: Trigger a function to update all student enrollments? 
            // For now, we assume the student dashboard calculates progress simply by COUNTing cleared topics in this table vs total topics

        } catch (error) {
            console.error('Error updating topic:', error)
            alert('Failed to update status')
            // Revert
            setTopics(topics.map(t => t.id === topicId ? { ...t, is_cleared: currentStatus } : t))
        }
    }

    if (loading) return <div className="p-8 text-center">Loading class details...</div>
    if (!course) return <div className="p-8 text-center">Course not found</div>

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link to="/teacher/active-classes" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Classes
                </Link>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white ${(course.color || '').split(' ')[1]?.replace('bg-', 'bg-') || 'bg-indigo-600'}`}>
                        {(() => {
                            const Icon = getIcon(course.icon)
                            return <Icon size={24} />
                        })()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{course.course_name}</h1>
                        <p className="text-slate-500">Manage Syllabus & Progress</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700">Course Syllabus</h3>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {topics.filter(t => t.is_cleared).length} / {topics.length} Cleared
                    </span>
                </div>

                <div className="divide-y divide-slate-100">
                    {topics.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <BookX className="mx-auto text-4xl mb-2 opacity-50" size={40} />
                            <p>No topics found for this course.</p>
                        </div>
                    ) : (
                        topics.map((topic, index) => (
                            <div key={topic.id} className={`p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors ${topic.is_cleared ? 'bg-emerald-50/30' : ''}`}>
                                <div className="pt-1">
                                    <button
                                        onClick={() => toggleTopicCompletion(topic.id, topic.is_cleared)}
                                        className={`
                                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                            ${topic.is_cleared
                                                ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                                                : 'border-slate-300 text-transparent hover:border-emerald-400'
                                            }
                                        `}
                                    >
                                        <Check className="text-sm font-bold" size={14} />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Topic {index + 1}</span>
                                        {topic.is_cleared && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Cleared</span>
                                        )}
                                    </div>
                                    <h4 className={`font-semibold ${topic.is_cleared ? 'text-slate-600' : 'text-slate-800'}`}>
                                        {topic.title}
                                    </h4>
                                    {topic.description && (
                                        <p className="text-sm text-slate-500 mt-1">{topic.description}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
