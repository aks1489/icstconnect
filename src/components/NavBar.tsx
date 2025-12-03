import React from 'react'

interface NavigationProps {
    onLoginClick: () => void
}

export const NavigationHeader: React.FC<NavigationProps> = ({ onLoginClick }) => {
    return (
        <>
            {/* Mobile & Tablet Top Bar (< 992px) */}
            <div className="d-lg-none">
                <nav className="navbar bg-white shadow-sm px-3" style={{ height: '60px', zIndex: 1030 }}>
                    <div className="d-flex align-items-center w-100">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '35px', height: '35px', fontSize: '1rem', fontWeight: 'bold' }}>
                            I
                        </div>
                        <div className="d-flex flex-column">
                            <span className="fw-bold text-primary lh-1" style={{ fontSize: '1rem' }}>ICST - Chowberia</span>
                            <span className="text-muted small" style={{ fontSize: '0.65rem' }}>Institute of Computer Science and Technology</span>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Desktop Navigation (>= 992px) */}
            <div className="d-none d-lg-block">
                <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
                    <div className="container">
                        <a className="navbar-brand d-flex align-items-center" href="#">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                I
                            </div>
                            <div className="d-flex flex-column">
                                <span className="fw-bold text-primary lh-1">ICST - Chowberia</span>
                                <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Institute of Computer Science and Technology</span>
                            </div>
                        </a>
                        <div className="collapse navbar-collapse">
                            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                                <li className="nav-item">
                                    <a className="nav-link nav-link-custom active" aria-current="page" href="#">Home</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link nav-link-custom" href="#courses">Courses</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link nav-link-custom" href="#notifications">Notifications</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link nav-link-custom" href="#gallery">Gallery</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link nav-link-custom" href="#onlinetest">Online Test</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link nav-link-custom" href="#about">About Us</a>
                                </li>
                                <li className="nav-item ms-lg-3">
                                    <button className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={onLoginClick}>
                                        <i className="bi bi-person-circle"></i>
                                        <span>Login</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </>
    )
}

export const NavigationFooter: React.FC<NavigationProps> = ({ onLoginClick }) => {
    return (
        <div className="d-lg-none">
            <nav className="navbar bg-white border-top shadow-lg" style={{
                height: 'auto',
                minHeight: '60px',
                paddingBottom: 'env(safe-area-inset-bottom)',
                zIndex: 1030,
                width: '100%'
            }}>
                <div className="container-fluid h-100">
                    <div className="d-flex justify-content-evenly align-items-center w-100 h-100 py-2">
                        <a href="#" className="text-decoration-none text-secondary d-flex flex-column align-items-center">
                            <i className="bi bi-house-door fs-4"></i>
                        </a>
                        <a href="#courses" className="text-decoration-none text-secondary d-flex flex-column align-items-center">
                            <i className="bi bi-book fs-4"></i>
                        </a>
                        <a href="#notifications" className="text-decoration-none text-secondary d-flex flex-column align-items-center">
                            <i className="bi bi-bell fs-4"></i>
                        </a>
                        <a href="#gallery" className="text-decoration-none text-secondary d-flex flex-column align-items-center">
                            <i className="bi bi-image fs-4"></i>
                        </a>
                        <a href="#onlinetest" className="text-decoration-none text-secondary d-flex flex-column align-items-center">
                            <i className="bi bi-laptop fs-4"></i>
                        </a>
                        <a href="#about" className="text-decoration-none text-secondary d-flex flex-column align-items-center">
                            <i className="bi bi-info-circle fs-4"></i>
                        </a>
                        <button className="btn btn-link text-decoration-none text-secondary p-0 d-flex flex-column align-items-center" onClick={onLoginClick}>
                            <i className="bi bi-person-circle fs-4"></i>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    )
}


