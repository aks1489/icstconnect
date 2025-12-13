import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface CreateCourseModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        course_name: '',
        description: '',
        icon: 'bi-code-square',
        color: 'text-indigo-600 bg-indigo-50',
        duration_months: 6
    })

    const colorThemes = [
        { label: 'Indigo', value: 'text-indigo-600 bg-indigo-50', preview: 'bg-indigo-50 border-indigo-200' },
        { label: 'Emerald', value: 'text-emerald-600 bg-emerald-50', preview: 'bg-emerald-50 border-emerald-200' },
        { label: 'Rose', value: 'text-rose-600 bg-rose-50', preview: 'bg-rose-50 border-rose-200' },
        { label: 'Amber', value: 'text-amber-600 bg-amber-50', preview: 'bg-amber-50 border-amber-200' },
        { label: 'Blue', value: 'text-blue-600 bg-blue-50', preview: 'bg-blue-50 border-blue-200' },
        { label: 'Violet', value: 'text-violet-600 bg-violet-50', preview: 'bg-violet-50 border-violet-200' },
    ]

    const commonIcons = [
        'bi-code-square', 'bi-laptop', 'bi-database', 'bi-globe',
        'bi-palette', 'bi-camera-video', 'bi-robot', 'bi-shield-lock'
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('courses')
                .insert(formData)

            if (error) throw error

            setFormData({
                course_name: '',
                description: '',
                icon: 'bi-code-square',
                color: 'text-indigo-600 bg-indigo-50',
                duration_months: 6
            })
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error saving course:', error)
            alert('Failed to save course')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-800">Create New Course</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                        <i className="bi bi-x-lg text-xs"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Course Title</label>
                        <input
                            type="text"
                            required
                            value={formData.course_name}
                            onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                            placeholder="e.g. Advanced Web Development"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea
                            rows={3}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            placeholder="Brief description of the course..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Months)</label>
                            <select
                                value={formData.duration_months}
                                onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                            >
                                {[3, 6, 12, 18, 24].map(months => (
                                    <option key={months} value={months}>{months} Months</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                            <div className="grid grid-cols-4 gap-2">
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
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Theme Color</label>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {colorThemes.map((theme) => (
                                <button
                                    key={theme.label}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: theme.value })}
                                    className={`
                                        w-12 h-12 flex-shrink-0 rounded-xl border-2 transition-all
                                        ${theme.preview}
                                        ${formData.color === theme.value ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'}
                                    `}
                                    title={theme.label}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
                        >
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
