import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { IconPlus as Plus, IconTrash as Trash2, IconGripVertical as GripVertical, IconCircleCheck as CheckCircle2, IconCircle as Circle } from '@tabler/icons-react'
import type { TestQuestion } from '../../types'

interface QuestionEditorProps {
    questions: TestQuestion[];
    onChange: (questions: TestQuestion[]) => void;
}

export default function QuestionEditor({ questions, onChange }: QuestionEditorProps) {

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const items = Array.from(questions)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        // Update order_index for all items
        const updatedItems = items.map((item, index) => ({
            ...item,
            order_index: index + 1
        }))

        onChange(updatedItems)
    }

    // Helper to generate IDs (safe for non-secure contexts where crypto might be missing)
    const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

    const addQuestion = () => {
        const newQuestion: TestQuestion = {
            id: generateId(),
            test_id: '',
            text: '',
            type: 'multiple-choice',
            order_index: questions.length + 1,
            marks: 1,
            options: Array(4).fill(null).map((_, i) => ({
                id: generateId(), // Unique ID for key
                question_id: '',
                text: '',
                is_correct: i === 0, // Default first option correct
                order_index: i + 1
            }))
        }
        onChange([...questions, newQuestion])
    }

    const removeQuestion = (index: number) => {
        const newQuestions = questions.filter((_, i) => i !== index)
        onChange(newQuestions)
    }

    const updateQuestion = (index: number, field: keyof TestQuestion, value: any) => {
        const newQuestions = [...questions]
        newQuestions[index] = { ...newQuestions[index], [field]: value }
        onChange(newQuestions)
    }

    const updateOption = (qIndex: number, oIndex: number, text: string) => {
        const newQuestions = [...questions]
        newQuestions[qIndex].options[oIndex].text = text
        onChange(newQuestions)
    }

    const setCorrectOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions]
        newQuestions[qIndex].options = newQuestions[qIndex].options.map((opt, i) => ({
            ...opt,
            is_correct: i === oIndex
        }))
        onChange(newQuestions)
    }

    return (
        <div className="space-y-8">
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="questions">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                            {questions.map((question, index) => (
                                <Draggable key={question.id} draggableId={question.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-all"
                                        >
                                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
                                                <div {...provided.dragHandleProps} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-grab active:cursor-grabbing">
                                                    <GripVertical size={20} />
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={question.text}
                                                    onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                                                    placeholder="Enter Question Text..."
                                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                                                />
                                                <button
                                                    onClick={() => removeQuestion(index)}
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 p-2 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {question.options.map((option, oIndex) => (
                                                    <div key={option.id} className="relative group/option">
                                                        <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${option.is_correct
                                                            ? 'border-green-500 dark:border-emerald-600 bg-green-50 dark:bg-emerald-950/30'
                                                            : 'border-slate-100 dark:border-slate-800 focus-within:border-indigo-200 dark:focus-within:border-indigo-600/50 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                                                            }`}>
                                                            <button
                                                                onClick={() => setCorrectOption(index, oIndex)}
                                                                className={`shrink-0 transition-colors ${option.is_correct ? 'text-green-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600 hover:text-green-400'}`}
                                                                title="Mark as correct answer"
                                                            >
                                                                {option.is_correct ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                            </button>
                                                            <input
                                                                type="text"
                                                                value={option.text}
                                                                onChange={(e) => updateOption(index, oIndex, e.target.value)}
                                                                placeholder={`Option ${oIndex + 1}`}
                                                                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <button
                onClick={addQuestion}
                className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 font-semibold hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all flex items-center justify-center gap-2"
            >
                <Plus size={20} /> Add New Question
            </button>
        </div>
    )
}
