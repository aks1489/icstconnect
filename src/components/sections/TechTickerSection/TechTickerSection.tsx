
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
        <section className="py-8 bg-white border-y border-slate-100 overflow-hidden">
            <div className="w-full">
                <div className="flex items-center overflow-hidden relative">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>

                    <div className="flex items-center gap-16 animate-marquee py-2">
                        {/* Duplicate the list to create seamless loop */}
                        {[...techs, ...techs, ...techs, ...techs].map((tech, index) => (
                            <div key={index} className="flex items-center gap-3 whitespace-nowrap group cursor-default">
                                <i className={`bi ${tech.icon} text-3xl text-slate-300 group-hover:text-[color:var(--tech-color)] transition-colors duration-300`} style={{ '--tech-color': tech.color } as React.CSSProperties}></i>
                                <span className="font-bold text-lg text-slate-400 group-hover:text-slate-800 transition-colors duration-300">{tech.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style>
                {`
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                `}
            </style>
        </section>
    )
}

export default TechTickerSection
