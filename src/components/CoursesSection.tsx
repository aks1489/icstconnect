

const CoursesSection = () => {
    const courses = [
        {
            title: 'Web Development',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1744&q=80',
            description: 'Master HTML, CSS, JavaScript, React, and Node.js to build modern web applications.',
            duration: '6 Months',
            level: 'Beginner to Advanced'
        },
        {
            title: 'Data Science',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
            description: 'Learn Python, Data Analysis, Machine Learning, and AI concepts.',
            duration: '8 Months',
            level: 'Intermediate'
        },
        {
            title: 'Digital Marketing',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1630&q=80',
            description: 'Become an expert in SEO, SEM, Social Media Marketing, and Content Strategy.',
            duration: '4 Months',
            level: 'Beginner'
        },
        {
            title: 'Graphic Design',
            image: 'https://images.unsplash.com/photo-1626785774573-4b7993125651?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
            description: 'Unleash your creativity with Photoshop, Illustrator, and InDesign.',
            duration: '3 Months',
            level: 'Beginner'
        }
    ]

    return (
        <section className="py-5 bg-light" id="courses">
            <div className="container">
                <div className="text-center mb-5">
                    <h6 className="text-primary fw-bold text-uppercase">Our Courses</h6>
                    <h2 className="display-5 fw-bold">Explore Our Popular Courses</h2>
                </div>
                <div className="row g-4">
                    {courses.map((course, index) => (
                        <div key={index} className="col-md-6 col-lg-3">
                            <div className="card h-100 border-0 shadow-sm overflow-hidden hover-lift transition-all">
                                <div className="position-relative">
                                    <img src={course.image} className="card-img-top" alt={course.title} style={{ height: '200px', objectFit: 'cover' }} />
                                    <span className="position-absolute top-0 end-0 bg-primary text-white px-3 py-1 m-2 rounded-pill small fw-bold">
                                        {course.duration}
                                    </span>
                                </div>
                                <div className="card-body p-4">
                                    <h5 className="card-title fw-bold mb-3">{course.title}</h5>
                                    <p className="card-text text-muted small mb-3">{course.description}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="badge bg-light text-dark border">{course.level}</span>
                                        <a href="#" className="text-primary text-decoration-none fw-bold small">Details <i className="bi bi-arrow-right"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CoursesSection
