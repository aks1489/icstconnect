import React, { useState } from 'react'
import { NavigationHeader, NavigationFooter } from '../NavBar'
import AuthModal from '../../ui/AuthModal'

import Footer from '../Footer/Footer'

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

            <main className="app-main pb-[60px] lg:pb-0">
                {children}
            </main>

            <Footer />

            <div className="lg:hidden">
                <NavigationFooter onLoginClick={handleLoginClick} />
            </div>

            <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
        </div>
    )
}

export default MainLayout
