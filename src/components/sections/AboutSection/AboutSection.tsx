
const AboutSection = () => {
    return (
        <section className="py-20 lg:py-28 bg-white relative overflow-hidden" id="about">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="w-full lg:w-1/2 relative">
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full -z-10"></div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 rounded-full -z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                            className="w-full rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
                            alt="About ICST"
                        />
                    </div>
                    <div className="w-full lg:w-1/2">
                        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            About Us
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900 leading-tight">
                            Empowering the <span className="text-blue-600">Next Generation</span> of Tech Leaders
                        </h2>
                        <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                            Institute of Computer Science and Technology (ICST) - Chowberia is a premier institution dedicated to providing high-quality computer education and training.
                        </p>
                        <p className="text-slate-500 mb-10 leading-relaxed">
                            Our mission is to bridge the gap between academic learning and industry requirements. We offer a wide range of courses designed to equip students with the skills needed to succeed in the ever-evolving tech landscape.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                                    <i className="bi bi-patch-check-fill text-xl"></i>
                                </div>
                                <div>
                                    <h6 className="text-lg font-bold text-slate-900 mb-1">Certified Courses</h6>
                                    <p className="text-sm text-slate-500">Industry recognized certifications upon completion.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-purple-100 text-purple-600 rounded-xl shadow-sm">
                                    <i className="bi bi-people-fill text-xl"></i>
                                </div>
                                <div>
                                    <h6 className="text-lg font-bold text-slate-900 mb-1">Expert Mentors</h6>
                                    <p className="text-sm text-slate-500">Learn directly from experienced industry professionals.</p>
                                </div>
                            </div>
                        </div>

                        <button className="px-8 py-3 rounded-full bg-slate-900 text-white font-semibold shadow-lg hover:bg-slate-800 hover:-translate-y-1 transition-all">
                            Read More
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
