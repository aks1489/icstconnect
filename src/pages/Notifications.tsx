
import { useState, useEffect } from 'react'
import Skeleton from '../components/ui/Skeleton'
import { api, type Notification } from '../services/api'

const Notifications = () => {
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await api.getNotifications()
                setNotifications(data)
            } catch (error) {
                console.error('Error fetching notifications:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [])



    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Notifications & Updates</h1>
                    <p className="text-slate-500 text-lg">Stay informed about the latest news, announcements, and events.</p>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6">
                                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                                <div className="flex-grow">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-5 w-24 rounded-full" />
                                    </div>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        ))
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row gap-6"
                            >
                                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${notification.bgColor} ${notification.color}`}>
                                    <i className={`bi ${notification.icon} text-xl`}></i>
                                </div>

                                <div className="flex-grow">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">{notification.title}</h3>
                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap w-fit">
                                            {notification.date}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-sm">
                        Showing {notifications.length} recent notifications
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Notifications
