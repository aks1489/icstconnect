import React, { useState } from 'react'
import { NavigationHeader, NavigationFooter } from '../NavBar'
import AuthModal from '../../auth/AuthModal'

import Footer from '../Footer/Footer'

interface MainLayoutProps {
    children: React.ReactNode
}

import { useAuth } from '../../../contexts/AuthContext'

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [showAuthModal, setShowAuthModal] = useState(false)
    const { user, profile } = useAuth()

    const handleLoginClick = () => {
        setShowAuthModal(true)
    }

    // Combine user and profile for role access
    const authUser = user ? { ...user, role: profile?.role } : null

    return (
        <div className="app-shell">
            <header className="app-header">
                <NavigationHeader onLoginClick={handleLoginClick} user={authUser} />
            </header>

            <main className="app-main pb-[60px] lg:pb-0">
                {children}
            </main>

            <Footer />

            <div className="lg:hidden">
                <NavigationFooter onLoginClick={handleLoginClick} user={authUser} />
            </div>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    )
}

export default MainLayout
