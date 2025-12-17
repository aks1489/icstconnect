import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Skeleton from '../components/ui/Skeleton'
import { api, type Test } from '../services/api'
import { Clock, HelpCircle, ArrowRight } from 'lucide-react'
import { getIcon } from '../utils/iconMapper'

const OnlineTest = () => {
    const [loading, setLoading] = useState(true)
    const [tests, setTests] = useState<Test[]>([])

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const data = await api.getTests()
                setTests(data)
            } catch (error) {
                console.error('Error fetching tests:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTests()
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Online Assessment</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Evaluate your skills with our curated practice tests. Choose a topic and start your journey to mastery.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-80">
                                <Skeleton className="w-14 h-14 rounded-xl mb-6" />
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full mb-6 flex-grow" />
                                <div className="flex items-center gap-4 mb-6">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        ))
                    ) : (
                        tests.map((test) => (
                            <div key={test.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-${test.color}-50 text-${test.color}-600`}>
                                    {(() => {
                                        const Icon = getIcon(test.icon)
                                        return <Icon className="text-2xl" size={28} />
                                    })()}
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2">{test.title}</h3>
                                <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-grow">
                                    {test.description}
                                </p>

                                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-6">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} /> {test.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <HelpCircle size={14} /> {test.questions} Qs
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full bg-slate-100 text-slate-600`}>
                                        {test.difficulty}
                                    </span>
                                </div>

                                <Link
                                    to={`/online-test/${test.id}`}
                                    className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                                >
                                    Start Test <ArrowRight size={16} />
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default OnlineTest
