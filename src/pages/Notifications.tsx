import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Skeleton from '../components/ui/Skeleton'
import { api, type Notification } from '../services/api'
import { getIcon } from '../utils/iconMapper'
import { Bell, Calendar, ChevronRight } from 'lucide-react'

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.3
            }
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-outfit flex items-center justify-center gap-3">
                            <Bell className="text-blue-600 animate-bounce" />
                            Notifications & Updates
                        </h1>
                        <p className="text-slate-500 text-lg">Stay informed about the latest news, announcements, and events.</p>
                    </motion.div>
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
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            <AnimatePresence>
                                {notifications.map((notification) => {
                                    const Icon = getIcon(notification.icon)
                                    return (
                                        <motion.div
                                            key={notification.id}
                                            variants={itemVariants}
                                            whileHover={{
                                                scale: 1.02,
                                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)'
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-colors duration-300 relative overflow-hidden group cursor-pointer"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full -mr-16 -mt-16 transition-opacity group-hover:opacity-50 opacity-0 pointer-events-none"></div>

                                            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                                                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${notification.bgColor} ${notification.color} transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-sm`}>
                                                    <Icon size={24} />
                                                </div>

                                                <div className="flex-grow">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                            {notification.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full whitespace-nowrap w-fit">
                                                            <Calendar size={12} />
                                                            {notification.date}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed text-base">
                                                        {notification.message}
                                                    </p>

                                                    <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                                        <span className="text-blue-600 text-sm font-semibold flex items-center gap-1">
                                                            Read more <ChevronRight size={16} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </motion.div>
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
