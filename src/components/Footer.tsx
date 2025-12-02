

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-5 pb-4">
            <div className="container">
                <div className="row g-4">
                    <div className="col-lg-4 col-md-6">
                        <h3 className="fw-bold mb-3">ICST - Chowberia</h3>
                        <p className="text-secondary mb-4">
                            Empowering students with future-ready IT skills. Join us to shape your career in technology.
                        </p>
                        <div className="d-flex gap-3">
                            <a href="#" className="text-white fs-5"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="text-white fs-5"><i className="bi bi-twitter-x"></i></a>
                            <a href="#" className="text-white fs-5"><i className="bi bi-instagram"></i></a>
                            <a href="#" className="text-white fs-5"><i className="bi bi-linkedin"></i></a>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-6">
                        <h5 className="fw-bold mb-3">Quick Links</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-white">Home</a></li>
                            <li className="mb-2"><a href="#about" className="text-secondary text-decoration-none hover-white">About Us</a></li>
                            <li className="mb-2"><a href="#courses" className="text-secondary text-decoration-none hover-white">Courses</a></li>
                            <li className="mb-2"><a href="#gallery" className="text-secondary text-decoration-none hover-white">Gallery</a></li>
                        </ul>
                    </div>
                    <div className="col-lg-2 col-md-6">
                        <h5 className="fw-bold mb-3">Courses</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-white">Web Development</a></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-white">Data Science</a></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-white">Digital Marketing</a></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-white">Graphic Design</a></li>
                        </ul>
                    </div>
                    <div className="col-lg-4 col-md-6">
                        <h5 className="fw-bold mb-3">Contact Info</h5>
                        <ul className="list-unstyled text-secondary">
                            <li className="mb-3 d-flex">
                                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                                <span>Chowberia, West Bengal, India</span>
                            </li>
                            <li className="mb-3 d-flex">
                                <i className="bi bi-envelope-fill me-2 text-primary"></i>
                                <span>info@icstchowberia.com</span>
                            </li>
                            <li className="mb-3 d-flex">
                                <i className="bi bi-telephone-fill me-2 text-primary"></i>
                                <span>+91 98765 43210</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <hr className="border-secondary my-4" />
                <div className="text-center text-secondary">
                    <p className="mb-0">&copy; {new Date().getFullYear()} ICST - Chowberia. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
