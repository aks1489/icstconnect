

const StatsSection = () => {
    const stats = [
        { count: '5000+', label: 'Students Trained', icon: 'bi-people-fill' },
        { count: '95%', label: 'Placement Rate', icon: 'bi-graph-up-arrow' },
        { count: '25+', label: 'Courses Offered', icon: 'bi-book-fill' },
        { count: '15+', label: 'Years Experience', icon: 'bi-calendar-check-fill' }
    ]

    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="row g-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="col-md-3 col-sm-6 text-center">
                            <div className="p-4 bg-white rounded shadow-sm h-100 hover-lift transition-all">
                                <i className={`bi ${stat.icon} display-4 text-primary mb-3 d-block`}></i>
                                <h2 className="fw-bold text-dark mb-1">{stat.count}</h2>
                                <p className="text-muted mb-0">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StatsSection
