import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function CourseForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = !!id

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(isEditing)
    const [formData, setFormData] = useState({
        course_name: '',
        description: '',
        icon: 'bi-code-square',
        color: 'text-indigo-600 bg-indigo-50'
    })

    const colorThemes = [
        { label: 'Indigo', value: 'text-indigo-600 bg-indigo-50', preview: 'bg-indigo-50 border-indigo-200' },
        { label: 'Emerald', value: 'text-emerald-600 bg-emerald-50', preview: 'bg-emerald-50 border-emerald-200' },
        { label: 'Rose', value: 'text-rose-600 bg-rose-50', preview: 'bg-rose-50 border-rose-200' },
        { label: 'Amber', value: 'text-amber-600 bg-amber-50', preview: 'bg-amber-50 border-amber-200' },
        { label: 'Blue', value: 'text-blue-600 bg-blue-50', preview: 'bg-blue-50 border-blue-200' },
        { label: 'Violet', value: 'text-violet-600 bg-violet-50', preview: 'bg-violet-50 border-violet-200' },
        { label: 'Cyan', value: 'text-cyan-600 bg-cyan-50', preview: 'bg-cyan-50 border-cyan-200' },
        { label: 'Slate', value: 'text-slate-600 bg-slate-50', preview: 'bg-slate-50 border-slate-200' },
    ]

    const commonIcons = [
        'bi-code-square', 'bi-laptop', 'bi-database', 'bi-globe',
        'bi-palette', 'bi-camera-video', 'bi-robot', 'bi-shield-lock',
        'bi-graph-up', 'bi-cpu', 'bi-phone', 'bi-cloud'
    ]

    useEffect(() => {
        if (isEditing) {
            fetchCourse()
        }
    }, [id])

    const fetchCourse = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            if (data) {
                setFormData({
                    course_name: data.course_name || '',
                    description: data.description || '',
                    icon: data.icon || 'bi-code-square',
                    color: data.color || 'text-indigo-600 bg-indigo-50'
                })
            }
        } catch (error) {
            console.error('Error fetching course:', error)
            alert('Failed to load course details')
            navigate('/admin/courses')
        } finally {
            setFetching(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isEditing) {
                const { error } = await supabase
                    .from('courses')
                    .update(formData)
                    .eq('id', id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('courses')
                    .insert(formData)

                if (error) throw error
            }

            navigate('/admin/courses')
        } catch (error) {
            console.error('Error saving course:', error)
            alert('Failed to save course')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Link to="/admin/courses" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 transition-colors">
                    <i className="bi bi-arrow-left"></i>
                    Back to Courses
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">
                    {isEditing ? 'Edit Course' : 'Create New Course'}
                </h1>
                <p className="text-slate-500 mt-1">
                    {isEditing ? 'Update your course details below.' : 'Fill in the details to publish a new course.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Course Title</label>
                            <input
                                type="text"
                                required
                                value={formData.course_name}
                                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                                placeholder="e.g. Advanced React Patterns"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                            <textarea
                                rows={4}
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="What will students learn in this course?"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100"></div>

                    {/* Visuals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Theme Color</label>
                            <div className="grid grid-cols-4 gap-3">
                                {colorThemes.map((theme) => (
                                    <button
                                        key={theme.label}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: theme.value })}
                                        className={`
                                            h-12 rounded-xl border-2 transition-all
                                            ${theme.preview}
                                            ${formData.color === theme.value ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'}
                                        `}
                                        title={theme.label}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Icon</label>
                            <div className="grid grid-cols-6 gap-2">
                                {commonIcons.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon })}
                                        className={`
                                            h-10 rounded-lg border transition-all flex items-center justify-center
                                            ${formData.icon === icon
                                                ? 'bg-slate-800 text-white border-slate-800'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                                            }
                                        `}
                                    >
                                        <i className={`bi ${icon}`}></i>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Or Custom Icon Class</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                                    placeholder="bi-..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Live Preview</label>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm w-full max-w-sm mx-auto overflow-hidden">
                            <div className={`h-24 ${(formData.color || '').split(' ')[1] || 'bg-slate-100'} p-4 relative`}>
                                <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center absolute -bottom-6 left-6">
                                    <i className={`bi ${formData.icon} text-xl ${(formData.color || '').split(' ')[0] || 'text-slate-600'}`}></i>
                                </div>
                            </div>
                            <div className="pt-8 p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-2">
                                    {formData.course_name || 'Course Title'}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-2">
                                    {formData.description || 'Course description will appear here...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Link
                        to="/admin/courses"
                        className="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-600/20 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        {loading ? 'Saving...' : (isEditing ? 'Update Course' : 'Publish Course')}
                    </button>
                </div>
            </form>
        </div>
    )
}
