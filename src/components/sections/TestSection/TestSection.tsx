
const TestSection = () => {
    return (
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden" id="onlinetest">
            {/* Background Patterns */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm font-semibold mb-6 border border-white/20">
                    🎓 Get Certified
                </div>
                <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">Ready to Test Your Skills?</h2>
                <p className="text-xl lg:text-2xl mb-12 opacity-90 max-w-3xl mx-auto font-light leading-relaxed">
                    Take our online assessment to evaluate your knowledge and get certified. Join thousands of students who have already proven their expertise.
                </p>
                <button className="bg-white text-blue-600 px-10 py-4 rounded-full text-lg font-bold shadow-2xl hover:scale-105 hover:shadow-white/20 transition-all duration-300 flex items-center gap-3 mx-auto group">
                    Start Online Test
                    <i className="bi bi-arrow-right transform group-hover:translate-x-1 transition-transform"></i>
                </button>
            </div>
        </section>
    )
}

export default TestSection
