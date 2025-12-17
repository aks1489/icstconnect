import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react'

// Mock Data for Tests
const TEST_DATA = {
    'react-basics': {
        title: 'React.js Fundamentals',
        questions: [
            {
                id: 1,
                text: 'What is the primary purpose of React?',
                options: ['Server-side logic', 'Database management', 'Building user interfaces', 'Operating system'],
                correct: 2
            },
            {
                id: 2,
                text: 'Which hook is used to manage state in a functional component?',
                options: ['useEffect', 'useState', 'useContext', 'useReducer'],
                correct: 1
            },
            {
                id: 3,
                text: 'What is JSX?',
                options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript XSL'],
                correct: 0
            }
        ]
    },
    'js-es6': {
        title: 'JavaScript ES6+',
        questions: [
            {
                id: 1,
                text: 'Which keyword is used to declare a constant variable?',
                options: ['var', 'let', 'const', 'static'],
                correct: 2
            },
            {
                id: 2,
                text: 'What does the arrow function syntax => provide?',
                options: ['New scope', 'Lexical scoping of "this"', 'Faster execution', 'None of the above'],
                correct: 1
            }
        ]
    },
    'html-css': {
        title: 'HTML5 & CSS3 Mastery',
        questions: [
            {
                id: 1,
                text: 'Which HTML tag is used for the largest heading?',
                options: ['<heading>', '<h6>', '<h1>', '<head>'],
                correct: 2
            },
            {
                id: 2,
                text: 'Which CSS property controls text size?',
                options: ['font-style', 'text-size', 'font-size', 'text-style'],
                correct: 2
            }
        ]
    }
}

const TestPlayer = () => {
    const { testId } = useParams()
    const navigate = useNavigate()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [score, setScore] = useState(0)

    const test = TEST_DATA[testId as keyof typeof TEST_DATA]

    useEffect(() => {
        if (!test) {
            navigate('/online-test')
        }
    }, [test, navigate])

    if (!test) return null

    const currentQuestion = test.questions[currentQuestionIndex]
    const totalQuestions = test.questions.length
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

    const handleOptionSelect = (optionIndex: number) => {
        if (isSubmitted) return
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
        test.questions.forEach(q => {
            if (selectedAnswers[q.id] === q.correct) {
                calculatedScore++
            }
        })
        setScore(calculatedScore)
        setIsSubmitted(true)
    }

    if (isSubmitted) {
        const percentage = Math.round((score / totalQuestions) * 100)
        let message = ''
        let color = ''

        if (percentage >= 80) {
            message = 'Excellent! You have mastered this topic.'
            color = 'text-green-600'
        } else if (percentage >= 50) {
            message = 'Good job! But there is room for improvement.'
            color = 'text-blue-600'
        } else {
            message = 'Keep practicing. You can do better!'
            color = 'text-red-600'
        }

        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-24 h-24 rounded-full bg-slate-50 mx-auto mb-6 flex items-center justify-center">
                        <span className={`text-4xl font-bold ${color}`}>{percentage}%</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Test Completed</h2>
                    <p className="text-slate-500 mb-8">{message}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-slate-50">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Score</p>
                            <p className="text-xl font-bold text-slate-900">{score} / {totalQuestions}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Correct</p>
                            <p className="text-xl font-bold text-green-600">{score}</p>
                        </div>
                    </div>

                    <Link
                        to="/online-test"
                        className="block w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                    >
                        Back to Tests
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>
                        <p className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100 flex items-center gap-2">
                            <Clock className="text-slate-400" size={16} />
                            14:59
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10 mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-8 leading-snug">
                        {currentQuestion.text}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${selectedAnswers[currentQuestion.id] === index
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-slate-100 hover:border-slate-300 text-slate-600'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedAnswers[currentQuestion.id] === index
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-slate-300 group-hover:border-slate-400'
                                    }`}>
                                    {selectedAnswers[currentQuestion.id] === index && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className="font-medium">{option}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${currentQuestionIndex === 0
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <ArrowLeft size={20} /> Previous
                    </button>

                    {currentQuestionIndex === totalQuestions - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                            Submit Test
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
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
