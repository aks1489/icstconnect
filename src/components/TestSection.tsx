

const TestSection = () => {
    return (
        <section className="py-5 bg-primary text-white position-relative overflow-hidden" id="onlinetest">
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
            <div className="container position-relative z-1 text-center">
                <h2 className="display-4 fw-bold mb-4">Ready to Test Your Skills?</h2>
                <p className="lead mb-5 opacity-75 mx-auto" style={{ maxWidth: '700px' }}>
                    Take our online assessment to evaluate your knowledge and get certified. Join thousands of students who have already proven their expertise.
                </p>
                <button className="btn btn-light btn-lg px-5 py-3 rounded-pill text-primary fw-bold shadow-lg hover-scale">
                    Start Online Test <i className="bi bi-arrow-right ms-2"></i>
                </button>
            </div>
        </section>
    )
}

export default TestSection
