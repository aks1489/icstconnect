import type { ReactNode } from 'react';

interface TestLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function TestLayout({ children }: TestLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden font-inter selection:bg-indigo-100 selection:text-indigo-900 transition-colors">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-slate-950 opacity-50" />

                {/* Gradient Blobs */}
                <div
                    style={{ animation: 'testBlob1 20s linear infinite' }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 dark:bg-purple-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 dark:opacity-20 will-change-transform"
                />

                <div
                    style={{ animation: 'testBlob2 15s linear infinite 2s' }}
                    className="absolute top-20 -left-20 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 dark:opacity-20 will-change-transform"
                />

                <div
                    style={{ animation: 'testBlob3 18s linear infinite 1s' }}
                    className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-200 dark:bg-pink-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 dark:opacity-20 will-change-transform"
                />
            </div>

            <style>{`
                @keyframes testBlob1 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(100px, -50px) scale(1.2); }
                }
                @keyframes testBlob2 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(-80px, 50px) scale(1.1); }
                }
                @keyframes testBlob3 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(50px, 50px) scale(1.3); }
                }
            `}</style>

            {/* Content Content - Centered and Focused */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
