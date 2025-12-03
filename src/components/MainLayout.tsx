import React, { useState } from 'react'
import { NavigationHeader, NavigationFooter } from './NavBar'
import AuthModal from './AuthModal'

interface MainLayoutProps {
    children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

    const handleLoginClick = () => {
        setAuthMode('login')
        setShowAuthModal(true)
    }

    return (
        <div className="app-shell">
            <header className="app-header">
                <NavigationHeader onLoginClick={handleLoginClick} />
            </header>

            <main className="app-main">
                {children}
            </main>

            <footer className="app-footer">
                <NavigationFooter onLoginClick={handleLoginClick} />
            </footer>

            <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
        </div>
    )
}

export default MainLayout
