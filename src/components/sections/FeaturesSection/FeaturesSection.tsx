
const FeaturesSection = () => {
    const features = [
        {
            title: 'Expert Faculty',
            description: 'Learn from industry experts with years of real-world experience.',
            icon: 'bi-person-badge-fill',
            color: 'bg-blue-50 text-blue-600'
        },
        {
            title: 'Hands-on Training',
            description: 'Practical learning with live projects and assignments.',
            icon: 'bi-laptop-fill',
            color: 'bg-purple-50 text-purple-600'
        },
        {
            title: 'Placement Assistance',
            description: 'Dedicated support to help you land your dream job.',
            icon: 'bi-briefcase-fill',
            color: 'bg-green-50 text-green-600'
        },
        {
            title: 'Flexible Learning',
            description: 'Online and offline classes to suit your schedule.',
            icon: 'bi-clock-fill',
            color: 'bg-orange-50 text-orange-600'
        }
    ]

    return (
        <section className="py-20 bg-white" id="features">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900">Why Choose Us?</h2>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto">
                        We provide top-notch education and training to help you succeed in the competitive IT industry.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="group">
                            <div className="bg-white rounded-2xl p-8 text-center h-full border border-slate-100 hover:shadow-xl hover:border-transparent hover:-translate-y-2 transition-all duration-300">
                                <div className="mb-6 inline-block">
                                    <div className={`w-20 h-20 flex items-center justify-center rounded-2xl ${feature.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                        <i className={`bi ${feature.icon} text-4xl`}></i>
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h4>
                                <p className="text-slate-500 mb-0 leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
