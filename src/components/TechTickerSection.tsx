

const TechTickerSection = () => {
    const techs = [
        { name: 'React', icon: 'bi-filetype-jsx', color: '#61DAFB' },
        { name: 'Bootstrap', icon: 'bi-bootstrap-fill', color: '#7952B3' },
        { name: 'Node.js', icon: 'bi-filetype-js', color: '#339933' },
        { name: 'TailwindCSS', icon: 'bi-wind', color: '#06B6D4' },
        { name: 'TypeScript', icon: 'bi-filetype-tsx', color: '#3178C6' },
        { name: 'MongoDB', icon: 'bi-database-fill', color: '#47A248' },
        { name: 'Express', icon: 'bi-server', color: '#000000' },
        { name: 'Next.js', icon: 'bi-triangle-fill', color: '#000000' }
    ]

    return (
        <section className="py-4 bg-white border-bottom overflow-hidden">
            <div className="container-fluid">
                <div className="d-flex align-items-center overflow-hidden">
                    <div className="d-flex align-items-center gap-5 animate-marquee">
                        {/* Duplicate the list to create seamless loop */}
                        {[...techs, ...techs, ...techs].map((tech, index) => (
                            <div key={index} className="d-flex align-items-center gap-2 text-nowrap opacity-75 hover-opacity-100 transition-all">
                                <i className={`bi ${tech.icon} fs-3`} style={{ color: tech.color }}></i>
                                <span className="fw-bold fs-5 text-dark">{tech.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style>
                {`
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .hover-opacity-100:hover {
                    opacity: 1 !important;
                    transform: scale(1.05);
                }
                `}
            </style>
        </section>
    )
}

export default TechTickerSection
