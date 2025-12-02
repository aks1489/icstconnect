import React, { useState } from 'react';

interface AuthModalProps {
    show: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, initialMode = 'login' }) => {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="modal-header border-0 p-4 pb-0">
                            <h5 className="modal-title fw-bold text-primary">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4">
                            <form>
                                {!isLogin && (
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Full Name</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><i className="bi bi-person"></i></span>
                                            <input type="text" className="form-control bg-light border-start-0" placeholder="John Doe" />
                                        </div>
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Email Address</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope"></i></span>
                                        <input type="email" className="form-control bg-light border-start-0" placeholder="name@example.com" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small text-muted">Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock"></i></span>
                                        <input type="password" className="form-control bg-light border-start-0" placeholder="••••••••" />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm">
                                    {isLogin ? 'Log In' : 'Sign Up'}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p className="small text-muted mb-0">
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                                    <button
                                        className="btn btn-link btn-sm text-decoration-none fw-bold ms-1"
                                        onClick={() => setIsLogin(!isLogin)}
                                    >
                                        {isLogin ? 'Sign Up' : 'Log In'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthModal;
