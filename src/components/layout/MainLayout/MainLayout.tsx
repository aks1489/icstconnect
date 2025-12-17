import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
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
    const navigate = useNavigate()
    const location = useLocation()

    const handleLoginClick = () => {
        setShowAuthModal(true)
    }

    // Listen for Password Recovery event
    React.useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/reset-password')
            }
        })

        // Check URL hash directly (Fallback)
        const isRecovery = window.location.hash.includes('type=recovery')
        if (isRecovery) {
            navigate('/reset-password')
        }

        return () => subscription.unsubscribe()
    }, [navigate])

    // Combine user and profile for role access
    const authUser = user ? { ...user, role: profile?.role } : null

    // Check if we are on admin or teacher login pages
    const isRestrictedAuthPage = ['/admin/login', '/teacher/login'].includes(location.pathname);

    return (
        <div className="app-shell">
            <header className="app-header">
                <NavigationHeader onLoginClick={handleLoginClick} user={authUser} />
            </header>

            <main className="app-main">
                {children}
            </main>

            {!isRestrictedAuthPage && (
                <>
                    <div className="pb-[60px] lg:pb-0 bg-slate-900">
                        <Footer />
                    </div>
                    <div className="lg:hidden">
                        <NavigationFooter onLoginClick={handleLoginClick} user={authUser} />
                    </div>
                </>
            )}

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    )
}

export default MainLayout
