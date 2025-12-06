
const StatsSection = () => {
    const stats = [
        { count: '5000+', label: 'Students Trained', icon: 'bi-people-fill' },
        { count: '95%', label: 'Placement Rate', icon: 'bi-graph-up-arrow' },
        { count: '25+', label: 'Courses Offered', icon: 'bi-book-fill' },
        { count: '15+', label: 'Years Experience', icon: 'bi-calendar-check-fill' }
    ]

    return (
        <section className="py-20 bg-slate-900 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="group">
                            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 text-center group-hover:-translate-y-2">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <i className={`bi ${stat.icon} text-3xl text-white`}></i>
                                </div>
                                <h2 className="text-4xl font-bold text-white mb-2">{stat.count}</h2>
                                <p className="text-slate-400 font-medium tracking-wide uppercase text-sm">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StatsSection
