

const AboutSection = () => {
    return (
        <section className="py-5" id="about">
            <div className="container">
                <div className="row align-items-center g-5">
                    <div className="col-lg-6">
                        <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" className="img-fluid rounded-4 shadow-lg" alt="About ICST" />
                    </div>
                    <div className="col-lg-6">
                        <h6 className="text-primary fw-bold text-uppercase mb-2">About Us</h6>
                        <h2 className="display-5 fw-bold mb-4">Empowering the Next Generation of Tech Leaders</h2>
                        <p className="lead text-muted mb-4">
                            Institute of Computer Science and Technology (ICST) - Chowberia is a premier institution dedicated to providing high-quality computer education and training.
                        </p>
                        <p className="text-muted mb-4">
                            Our mission is to bridge the gap between academic learning and industry requirements. We offer a wide range of courses designed to equip students with the skills needed to succeed in the ever-evolving tech landscape.
                        </p>
                        <div className="row g-4 mb-4">
                            <div className="col-sm-6">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0 btn-lg-square bg-primary bg-opacity-10 text-primary rounded-circle me-3">
                                        <i className="bi bi-check-lg fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold">Certified Courses</h6>
                                        <p className="mb-0 small text-muted">Industry recognized</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0 btn-lg-square bg-primary bg-opacity-10 text-primary rounded-circle me-3">
                                        <i className="bi bi-person-video3 fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold">Expert Mentors</h6>
                                        <p className="mb-0 small text-muted">Learn from the best</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary px-4 py-2 rounded-pill">
                            Read More
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
