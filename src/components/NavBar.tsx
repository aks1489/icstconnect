import { useState } from 'react'
import AuthModal from './AuthModal'

const NavBar = () => {
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

    const handleLoginClick = () => {
        setAuthMode('login')
        setShowAuthModal(true)
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
                <div className="container">
                    <a className="navbar-brand d-flex align-items-center" href="#">
                        {/* Logo Placeholder */}
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            I
                        </div>
                        <div className="d-flex flex-column">
                            <span className="fw-bold text-primary lh-1">ICST - Chowberia</span>
                            <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Institute of Computer Science and Technology</span>
                        </div>
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
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
                                <button className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={handleLoginClick}>
                                    <i className="bi bi-person-circle"></i>
                                    <span>Login</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
        </>
    )
}

export default NavBar
