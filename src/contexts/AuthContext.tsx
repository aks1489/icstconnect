import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
    session: Session | null
    user: User | null
    profile: any | null
    loading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
    isAdmin: boolean
    isTeacher: boolean
    isProfileComplete: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    // Using a ref to track the last seen access token to prevent redundant updates
    const accessTokenRef = useRef<string | null>(null)

    useEffect(() => {
        let mounted = true

        // Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                if (session) {
                    accessTokenRef.current = session.access_token
                    setSession(session)
                    setUser(session.user)
                    // Initial load: keep loading true until profile is fetched
                    fetchProfile(session.user.id).finally(() => {
                        if (mounted) setLoading(false)
                    })
                } else {
                    setLoading(false)
                }
            }
        })

        // Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return

            const newAccessToken = session?.access_token ?? null

            // If the token hasn't changed, ignore the update (prevents tab-switch re-renders)
            if (newAccessToken === accessTokenRef.current) {
                return
            }

            accessTokenRef.current = newAccessToken
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                // Background update: Do NOT set loading to true to avoid UI flash
                // Just update the profile silently
                fetchProfile(session.user.id)
            } else {
                // User signed out
                setProfile(null)
                setLoading(false)
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const fetchProfile = async (userId: string) => {
        try {
            // Removed setLoading(true) to prevent full page loaders on background refreshes
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
            } else {
                setProfile(data)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const signOut = async () => {
        accessTokenRef.current = null // Reset token tracking
        await supabase.auth.signOut()
        setProfile(null)
    }

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id)
        }
    }

    const value = useMemo(() => ({
        session,
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
        isAdmin: profile?.role === 'admin',
        isTeacher: profile?.role === 'teacher',
        isProfileComplete: !!(profile && profile.full_name && profile.father_name && profile.address && profile.pincode && profile.dob)
    }), [session, user, profile, loading])

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
