import { useState } from 'react';

const NavBar = () => {
    const [activeLink, setActiveLink] = useState('Home');

    const handleLinkClick = (linkName: string) => {
        setActiveLink(linkName);
    };

    const navLinks = ['Home', 'Courses', 'Results', 'Notifications'];

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 d-none d-lg-block">
                <div className="container">
                    {/* Left: Logo */}
                    <a className="navbar-brand fw-bold text-dark" href="#">
                        <i className="bi bi-bootstrap-fill me-2 text-primary"></i>
                        Logo
                    </a>

                    {/* Center: Navigation Links */}
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                            {navLinks.map((link) => (
                                <li className="nav-item" key={link}>
                                    <a
                                        className={`nav-link mx-2 nav-link-custom ${activeLink === link ? 'active' : ''}`}
                                        href="#"
                                        onClick={() => handleLinkClick(link)}
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* Right: Account Section */}
                        <div className="d-flex">
                            <a href="#" className="btn btn-outline-dark rounded-pill px-4">
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navbar */}
            <nav className="navbar fixed-bottom navbar-light bg-white shadow-lg d-lg-none border-top">
                <div className="container-fluid d-flex justify-content-around py-2">
                    <a className={`nav-link text-center ${activeLink === 'Home' ? 'text-primary' : 'text-dark'}`} href="#" onClick={() => handleLinkClick('Home')}>
                        <i className="bi bi-house fs-4"></i>
                        <div className="small" style={{ fontSize: '0.7rem' }}>Home</div>
                    </a>
                    <a className={`nav-link text-center ${activeLink === 'Courses' ? 'text-primary' : 'text-dark'}`} href="#" onClick={() => handleLinkClick('Courses')}>
                        <i className="bi bi-book fs-4"></i>
                        <div className="small" style={{ fontSize: '0.7rem' }}>Courses</div>
                    </a>
                    <a className={`nav-link text-center ${activeLink === 'Results' ? 'text-primary' : 'text-dark'}`} href="#" onClick={() => handleLinkClick('Results')}>
                        <i className="bi bi-bar-chart fs-4"></i>
                        <div className="small" style={{ fontSize: '0.7rem' }}>Results</div>
                    </a>
                    <a className={`nav-link text-center ${activeLink === 'Notifications' ? 'text-primary' : 'text-dark'}`} href="#" onClick={() => handleLinkClick('Notifications')}>
                        <i className="bi bi-bell fs-4"></i>
                        <div className="small" style={{ fontSize: '0.7rem' }}>Notifs</div>
                    </a>
                    <a className="nav-link text-dark text-center" href="#">
                        <i className="bi bi-person fs-4"></i>
                        <div className="small" style={{ fontSize: '0.7rem' }}>Login</div>
                    </a>
                </div>
            </nav>
        </>
    );
};

export default NavBar;
