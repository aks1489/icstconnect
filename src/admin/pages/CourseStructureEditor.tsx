import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Book, Plus, GripVertical, Pencil, Trash2, X, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'

interface Topic {
    id: number
    title: string
    description: string
    sort_order: number
}

interface Module {
    id: number
    title: string
    description: string
    sort_order: number
    topics: Topic[]
}

export default function CourseStructureEditor() {
    const { id } = useParams()
    const [modules, setModules] = useState<Module[]>([])
    const [loading, setLoading] = useState(true)
    const [courseName, setCourseName] = useState('')

    // Edit States
    const [editingModule, setEditingModule] = useState<Module | null>(null)
    const [showModuleModal, setShowModuleModal] = useState(false)

    const [activeModuleId, setActiveModuleId] = useState<number | null>(null)
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false)

    // Form States (Implicitly handled via uncontrolled inputs in original, keeping consistent)

    useEffect(() => {
        if (id) {
            fetchStructure()
        }
    }, [id])

    const fetchStructure = async () => {
        try {
            setLoading(true)
            // Fetch Course Details
            const { data: course } = await supabase
                .from('courses')
                .select('course_name')
                .eq('id', id)
                .single()

            if (course) setCourseName(course.course_name)

            // 1. Fetch Modules
            const { data: modulesData, error: modulesError } = await supabase
                .from('course_modules')
                .select('*')
                .eq('course_id', id)
                .order('sort_order', { ascending: true })

            if (modulesError) throw modulesError

            if (!modulesData || modulesData.length === 0) {
                setModules([])
                return
            }

            // 2. Fetch Topics for these modules
            const moduleIds = modulesData.map(m => m.id)
            const { data: topicsData, error: topicsError } = await supabase
                .from('course_topics')
                .select('*')
                .in('module_id', moduleIds)
                .order('sort_order', { ascending: true })

            if (topicsError) throw topicsError

            // 3. Merge Topics into Modules
            const sortedModules = modulesData.map(m => ({
                ...m,
                topics: topicsData?.filter(t => t.module_id === m.id) || []
            }))

            setModules(sortedModules)
        } catch (error) {
            console.error('Error fetching structure:', error)
        } finally {
            setLoading(false)
        }
    }

    // --- Module Handlers ---

    const handleSaveModule = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const title = formData.get('title') as string
        const description = formData.get('description') as string

        try {
            if (editingModule) {
                await supabase
                    .from('course_modules')
                    .update({ title, description })
                    .eq('id', editingModule.id)
            } else {
                await supabase
                    .from('course_modules')
                    .insert({
                        course_id: id,
                        title,
                        description,
                        sort_order: modules.length
                    })
            }
            setShowModuleModal(false)
            setEditingModule(null)
            fetchStructure()
        } catch (error) {
            console.error('Error saving module:', error)
            alert('Failed to save module')
        }
    }

    const handleDeleteModule = async (moduleId: number) => {
        if (!confirm('Delete this module? All topics will be deleted.')) return
        try {
            await supabase.from('course_modules').delete().eq('id', moduleId)
            fetchStructure()
        } catch (error) {
            console.error('Error deleting module:', error)
        }
    }

    // --- Topic Handlers ---

    const handleSaveTopic = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeModuleId) return

        const formData = new FormData(e.target as HTMLFormElement)
        const title = formData.get('title') as string
        const description = formData.get('description') as string

        try {
            const currentModule = modules.find(m => m.id === activeModuleId)
            const currentTopicsCount = currentModule?.topics.length || 0

            if (editingTopic) {
                await supabase
                    .from('course_topics')
                    .update({ title, description })
                    .eq('id', editingTopic.id)
            } else {
                await supabase
                    .from('course_topics')
                    .insert({
                        module_id: activeModuleId,
                        title,
                        description,
                        sort_order: currentTopicsCount
                    })
            }
            setIsTopicModalOpen(false)
            setEditingTopic(null)
            fetchStructure()
        } catch (error) {
            console.error('Error saving topic:', error)
            alert('Failed to save topic')
        }
    }

    const handleDeleteTopic = async (topicId: number) => {
        if (!confirm('Delete this topic?')) return
        try {
            await supabase.from('course_topics').delete().eq('id', topicId)
            fetchStructure()
        } catch (error) {
            console.error('Error deleting topic:', error)
        }
    }

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, type } = result

        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        if (type === 'module') {
            const newModules = Array.from(modules)
            const [removed] = newModules.splice(source.index, 1)
            newModules.splice(destination.index, 0, removed)

            setModules(newModules)

            try {
                const upsertData = newModules.map((m, index) => ({
                    id: m.id,
                    course_id: Number(id),
                    title: m.title,
                    description: m.description,
                    sort_order: index
                }))

                const { error } = await supabase
                    .from('course_modules')
                    .upsert(upsertData, { onConflict: 'id' })

                if (error) throw error
            } catch (error) {
                console.error('Error reordering modules:', error)
                alert('Failed to save module order.')
                fetchStructure()
            }
        } else if (type === 'topic') {
            const newModules = [...modules]
            const sourceModuleIndex = newModules.findIndex(m => m.id.toString() === source.droppableId)
            const destModuleIndex = newModules.findIndex(m => m.id.toString() === destination.droppableId)

            const sourceModule = newModules[sourceModuleIndex]
            const destModule = newModules[destModuleIndex]

            // Copy topics arrays
            const sourceTopics = [...sourceModule.topics]
            const destTopics = sourceModuleIndex === destModuleIndex ? sourceTopics : [...destModule.topics]

            // Move topic
            const [movedTopic] = sourceTopics.splice(source.index, 1)
            destTopics.splice(destination.index, 0, movedTopic)

            // Update state
            newModules[sourceModuleIndex] = { ...sourceModule, topics: sourceTopics }
            if (sourceModuleIndex !== destModuleIndex) {
                newModules[destModuleIndex] = { ...destModule, topics: destTopics }
            }

            setModules(newModules)

            // Persist to DB
            try {
                // We need to update topics in the destination module (new sort orders + potentially new module_id)
                // And if different module, update source module topics (new sort orders)

                const updates: any[] = []

                // Prepare updates for destination module topics
                destTopics.forEach((t, index) => {
                    updates.push({
                        id: t.id,
                        module_id: destModule.id, // Ensure correct module_id
                        title: t.title, // upsert needs required fields usually, or we use update match? 
                        // Supabase upsert requires all NOT NULL columns if it's inserting, but here rows exist. 
                        // Ideally we just update. But batch update in Supabase JS is ID-based upsert.
                        // We must include all non-default fields that might be required? 
                        // In our schema: module_id, title are NOT NULL.
                        description: t.description,
                        sort_order: index
                    })
                })

                // If source is different, also update source module topics to close gaps
                if (sourceModuleIndex !== destModuleIndex) {
                    sourceTopics.forEach((t, index) => {
                        updates.push({
                            id: t.id,
                            module_id: sourceModule.id,
                            title: t.title,
                            description: t.description,
                            sort_order: index
                        })
                    })
                }

                const { error } = await supabase
                    .from('course_topics')
                    .upsert(updates, { onConflict: 'id' })

                if (error) throw error
            } catch (error) {
                console.error('Error reordering topics:', error)
                alert('Failed to save topic order.')
                fetchStructure()
            }
        }
    }

    const initiateEditModule = (module: Module) => {
        setEditingModule(module)
        setShowModuleModal(true)
    }

    const initiateEditTopic = (moduleId: number, topic: Topic) => {
        setActiveModuleId(moduleId)
        setEditingTopic(topic)
        setIsTopicModalOpen(true)
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading structure...</div>

    return (
        <div className="max-w-5xl mx-auto p-6 md:pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link to="/admin/courses" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Courses
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {courseName ? `${courseName} - Structure` : 'Course Structure'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Drag and drop modules and topics to reorder</p>
                </div>
                <button
                    onClick={() => {
                        setEditingModule(null)
                        setShowModuleModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} />
                    Add Module
                </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="modules" type="module">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-6"
                        >
                            {modules.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <Book className="text-2xl" size={32} />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-800 mb-2">Structure is empty</h3>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start by creating your first module to organize topics.</p>
                                    <button
                                        onClick={() => {
                                            setEditingModule(null)
                                            setShowModuleModal(true)
                                        }}
                                        className="text-indigo-600 font-bold hover:text-indigo-700"
                                    >
                                        Create First Module &rarr;
                                    </button>
                                </div>
                            ) : (
                                modules.map((module, index) => (
                                    <Draggable key={module.id} draggableId={module.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500 rotate-1 z-50' : 'shadow-sm hover:shadow-md'}`}
                                            >
                                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                                                        >
                                                            <GripVertical size={18} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-800">{module.title}</h3>
                                                            {module.description && <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => initiateEditModule(module)}
                                                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all flex items-center justify-center"
                                                            title="Edit Module"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteModule(module.id)}
                                                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-all flex items-center justify-center"
                                                            title="Delete Module"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-4">
                                                    {/* Topics List */}
                                                    <Droppable droppableId={module.id.toString()} type="topic">
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className={`space-y-2 pl-11 min-h-[10px] ${snapshot.isDraggingOver ? 'bg-indigo-50/50 rounded-lg transition-colors ring-2 ring-indigo-100 ring-dashed' : ''}`}
                                                            >
                                                                {module.topics && module.topics.length > 0 ? (
                                                                    module.topics.map((topic, tIndex) => (
                                                                        <Draggable key={topic.id} draggableId={`topic-${topic.id}`} index={tIndex}>
                                                                            {(provided, snapshot) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    {...provided.dragHandleProps}
                                                                                    className={`flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 bg-white z-50' : ''}`}
                                                                                >
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white border-slate-200 text-slate-500'}`}>
                                                                                            {snapshot.isDragging ? <GripVertical size={14} /> : (tIndex + 1)}
                                                                                        </div>
                                                                                        <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-700">{topic.title}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <button
                                                                                            onClick={() => initiateEditTopic(module.id, topic)}
                                                                                            className="p-1.5 rounded text-slate-400 hover:text-indigo-600"
                                                                                        >
                                                                                            <Pencil size={14} />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleDeleteTopic(topic.id)}
                                                                                            className="p-1.5 rounded text-slate-400 hover:text-rose-600"
                                                                                        >
                                                                                            <X size={14} />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-sm text-slate-400 italic py-2">No topics yet. Drag one here or add new.</div>
                                                                )}
                                                                {provided.placeholder}

                                                                <button
                                                                    onClick={() => {
                                                                        setEditingTopic(null)
                                                                        setActiveModuleId(module.id)
                                                                        setIsTopicModalOpen(true)
                                                                    }}
                                                                    className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 py-1 px-2 rounded hover:bg-indigo-50 w-fit transition-colors"
                                                                >
                                                                    <Plus size={14} />
                                                                    Add Topic
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Module Modal */}
            {showModuleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModuleModal(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{editingModule ? 'Edit Module' : 'New Module'}</h2>
                        <form onSubmit={handleSaveModule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Module Title</label>
                                <input name="title" required defaultValue={editingModule?.title} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="e.g. Introduction to React" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                                <textarea name="description" rows={2} defaultValue={editingModule?.description} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Brief overview..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModuleModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Module</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Topic Modal */}
            {isTopicModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsTopicModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{editingTopic ? 'Edit Topic' : 'New Topic'}</h2>
                        <form onSubmit={handleSaveTopic} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Topic Title</label>
                                <input name="title" required defaultValue={editingTopic?.title} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="e.g. Components & Props" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                                <textarea name="description" rows={3} defaultValue={editingTopic?.description} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="What will be covered?" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsTopicModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Topic</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
