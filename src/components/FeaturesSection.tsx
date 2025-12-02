

const FeaturesSection = () => {
    const features = [
        {
            title: 'Expert Faculty',
            description: 'Learn from industry experts with years of real-world experience.',
            icon: 'bi-person-badge-fill'
        },
        {
            title: 'Hands-on Training',
            description: 'Practical learning with live projects and assignments.',
            icon: 'bi-laptop-fill'
        },
        {
            title: 'Placement Assistance',
            description: 'Dedicated support to help you land your dream job.',
            icon: 'bi-briefcase-fill'
        },
        {
            title: 'Flexible Learning',
            description: 'Online and offline classes to suit your schedule.',
            icon: 'bi-clock-fill'
        }
    ]

    return (
        <section className="py-5" id="features">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="fw-bold display-5 mb-3">Why Choose Us?</h2>
                    <p className="text-muted lead mx-auto" style={{ maxWidth: '700px' }}>
                        We provide top-notch education and training to help you succeed in the competitive IT industry.
                    </p>
                </div>
                <div className="row g-4">
                    {features.map((feature, index) => (
                        <div key={index} className="col-md-6 col-lg-3">
                            <div className="card h-100 border-0 shadow-sm text-center p-4 hover-scale transition-all">
                                <div className="mb-4">
                                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle" style={{ width: '80px', height: '80px' }}>
                                        <i className={`bi ${feature.icon} fs-1`}></i>
                                    </div>
                                </div>
                                <h4 className="fw-bold mb-3">{feature.title}</h4>
                                <p className="text-muted mb-0">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
