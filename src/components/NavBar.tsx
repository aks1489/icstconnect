import { useState } from 'react';

const NavBar = () => {
    const [activeLink, setActiveLink] = useState('Home');

    const handleLinkClick = (linkName: string) => {
        setActiveLink(linkName);
    };

    const navLinks = [
        { name: 'Home', className: 'text-primary', icon: 'bi-house' },
        { name: 'Courses', className: 'text-success', icon: 'bi-book' },
        { name: 'Results', className: 'text-danger', icon: 'bi-bar-chart' },
        { name: 'Notifications', className: 'text-warning', icon: 'bi-bell' }
    ];

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 d-none d-lg-block">
                <div className="container">
                    {/* Left: Logo */}
                    <a className="navbar-brand fw-bold text-dark" href="#">
                        <i className="bi bi-bootstrap-fill me-2" style={{ color: 'var(--primary-color)' }}></i>
                        Logo
                    </a>

                    {/* Center: Navigation Links */}
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                            {navLinks.map((link) => (
                                <li className="nav-item" key={link.name}>
                                    <a
                                        className={`nav-link mx-2 nav-link-custom ${link.className} ${activeLink === link.name ? 'fw-bold bg-light' : ''}`}
                                        href="#"
                                        onClick={() => handleLinkClick(link.name)}
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* Right: Account Section */}
                        <div className="d-flex">
                            <a href="#" className="btn btn-outline-primary rounded-pill px-4">
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navbar */}
            <nav className="navbar fixed-bottom navbar-light bg-white shadow-lg d-lg-none border-top">
                <div className="container-fluid d-flex justify-content-around py-2">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            className={`nav-link text-center mobile-nav-link ${link.className} ${activeLink === link.name ? 'fw-bold bg-light' : ''}`}
                            href="#"
                            onClick={() => handleLinkClick(link.name)}
                        >
                            <i className={`bi ${link.icon} fs-4`}></i>
                            <div className="small" style={{ fontSize: '0.7rem' }}>{link.name}</div>
                        </a>
                    ))}
                    <a className="nav-link text-center mobile-nav-link text-primary" href="#">
                        <i className="bi bi-person fs-4"></i>
                        <div className="small" style={{ fontSize: '0.7rem' }}>Login</div>
                    </a>
                </div>
            </nav>
        </>
    );
};

export default NavBar;
