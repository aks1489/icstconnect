import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { X, Code, Laptop, Database, Globe, Palette, Video, Bot, ShieldCheck } from 'lucide-react'

interface CreateCourseModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        course_name: '',
        short_code: '',
        description: '',
        icon: 'Code',
        color: 'text-indigo-600 bg-indigo-50',
        duration: '6 Months',
        category: 'Development',
        tags: [] as string[]
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
        { id: 'Code', Icon: Code },
        { id: 'Laptop', Icon: Laptop },
        { id: 'Database', Icon: Database },
        { id: 'Globe', Icon: Globe },
        { id: 'Palette', Icon: Palette },
        { id: 'Video', Icon: Video },
        { id: 'Bot', Icon: Bot },
        { id: 'ShieldCheck', Icon: ShieldCheck }
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
                short_code: '',
                description: '',
                icon: 'Code',
                color: 'text-indigo-600 bg-indigo-50',
                duration: '6 Months',
                category: 'Development',
                tags: []
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
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">Short Code</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={formData.short_code}
                                onChange={(e) => setFormData({ ...formData, short_code: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-bold uppercase tracking-wide"
                                placeholder="e.g. AWD"
                            />
                        </div>
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                            >
                                <option value="Development">Development</option>
                                <option value="Design">Design</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Business">Business</option>
                                <option value="IT & Software">IT & Software</option>
                                <option value="Office Productivity">Office Productivity</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                            >
                                {['3 Months', '6 Months', '12 Months', '18 Months', '24 Months'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>


                    {/* Tag Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tags <span className="text-slate-400 font-normal text-xs">(Enter to add)</span>
                        </label>
                        <div className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all bg-white min-h-[50px] flex flex-wrap gap-2 items-center">
                            {(formData.tags || []).map((tag, index) => (
                                <span key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newTags = [...formData.tags]
                                            newTags.splice(index, 1)
                                            setFormData({ ...formData, tags: newTags })
                                        }}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault()
                                        const val = e.currentTarget.value.trim()
                                        if (val && !formData.tags.includes(val)) {
                                            setFormData({
                                                ...formData,
                                                tags: [...formData.tags, val]
                                            })
                                            e.currentTarget.value = ''
                                        }
                                    } else if (e.key === 'Backspace' && !e.currentTarget.value && formData.tags.length > 0) {
                                        const newTags = [...formData.tags]
                                        newTags.pop()
                                        setFormData({ ...formData, tags: newTags })
                                    }
                                }}
                                className="flex-1 min-w-[80px] bg-transparent outline-none text-slate-700 placeholder-slate-400 text-sm"
                                placeholder={formData.tags.length ? "" : "Add tags..."}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                        <div className="grid grid-cols-4 gap-2">
                            {commonIcons.map(({ id, Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: id })}
                                    className={`
                                                h-10 rounded-lg border transition-all flex items-center justify-center
                                                ${formData.icon === id
                                            ? 'bg-slate-800 text-white border-slate-800'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                                        }
                                            `}
                                >
                                    <Icon size={20} />
                                </button>
                            ))}
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
                </form >
            </div >
        </div >
    )
}
