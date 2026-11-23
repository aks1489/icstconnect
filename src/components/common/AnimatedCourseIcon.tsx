import React from 'react';

interface AnimatedCourseIconProps {
    type: 'code' | 'data' | 'finance' | 'hardware' | 'general' | 'design' | 'office';
    color?: string;
    className?: string;
}

const AnimatedCourseIcon: React.FC<AnimatedCourseIconProps> = ({ type, color = "blue", className = "" }) => {
    // Color mapping
    const getColorClasses = (c: string) => {
        const colors: Record<string, string> = {
            blue: 'text-blue-500',
            purple: 'text-purple-500',
            green: 'text-green-500',
            orange: 'text-orange-500',
            red: 'text-red-500',
            pink: 'text-pink-500',
            cyan: 'text-cyan-500',
            indigo: 'text-indigo-500',
            emerald: 'text-emerald-500',
            yellow: 'text-yellow-500',
            slate: 'text-slate-500'
        };
        return colors[c] || 'text-blue-500';
    };

    const textColor = getColorClasses(color.replace(/text-|-500/g, ''));

    const renderIcon = () => {
        switch (type) {
            case 'code': // Web Dev cases
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path
                            d="M16 18L22 12L16 6"
                            className="course-icon-chevron-right"
                        />
                        <path
                            d="M8 6L2 12L8 18"
                            className="course-icon-chevron-left"
                        />
                        <circle
                            cx="12" cy="12" r="3"
                            fill="currentColor"
                            stroke="none"
                            className="opacity-20 course-icon-pulse"
                        />
                    </svg>
                );
            case 'data': // Data Science / DCA
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path
                            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3"
                            className="course-icon-draw"
                        />
                        <path
                            d="M21 12H16"
                            className="course-icon-slide-left"
                        />
                        <rect
                            x="9" y="8" width="8" height="8" rx="1"
                            className="course-icon-spin"
                        />
                        <circle
                            cx="12" cy="12" r="2"
                            fill="currentColor"
                            stroke="none"
                            className="course-icon-pulse-fast"
                        />
                    </svg>
                );
            case 'finance': // Tally / Accounting
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path
                            d="M12 1V23"
                            className="course-icon-draw"
                        />
                        <path
                            d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
                            className="course-icon-draw-delayed"
                        />
                    </svg>
                );
            case 'hardware': // Hardware / Networking
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect
                            x="2" y="2" width="20" height="8" rx="2" ry="2"
                            className="course-icon-float-top"
                        />
                        <rect
                            x="2" y="14" width="20" height="8" rx="2" ry="2"
                            className="course-icon-float-bottom"
                        />
                        <line
                            x1="6" y1="6" x2="6.01" y2="6"
                            strokeWidth="3"
                            className="course-icon-blink"
                        />
                        <line
                            x1="6" y1="18" x2="6.01" y2="18"
                            strokeWidth="3"
                            className="course-icon-blink-delayed"
                        />
                    </svg>
                );
            case 'office': // Office / Diploma
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect
                            x="4" y="4" width="16" height="16" rx="2"
                            className="course-icon-float"
                        />
                        <path
                            d="M9 4V20"
                            className="course-icon-draw-grid-1"
                        />
                        <path
                            d="M15 4V20"
                            className="course-icon-draw-grid-2"
                        />
                        <path
                            d="M4 9H20"
                            className="course-icon-draw-grid-3"
                        />
                    </svg>
                );
            case 'design': // DTP / Design
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle
                            cx="12" cy="12" r="10"
                            className="course-icon-spin-slow"
                        />
                        <path
                            d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"
                            className="course-icon-fade-pulse"
                        />
                    </svg>
                );
            default: // General / Book
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path
                            d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                            className="course-icon-draw"
                        />
                        <path
                            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                            className="course-icon-float"
                        />
                    </svg>
                );
        }
    };

    return (
        <div className={`relative ${className}`}>
            <style>{`
                .course-icon-chevron-right {
                    animation: courseIconChevR 3s ease-in-out infinite alternate;
                }
                .course-icon-chevron-left {
                    animation: courseIconChevL 3s ease-in-out infinite alternate;
                }
                .course-icon-pulse {
                    transform-box: fill-box;
                    transform-origin: center;
                    animation: courseIconPulse 2s ease-in-out infinite alternate;
                }
                .course-icon-pulse-fast {
                    transform-box: fill-box;
                    transform-origin: center;
                    animation: courseIconPulse 1.5s ease-in-out infinite alternate;
                }
                .course-icon-spin {
                    transform-box: fill-box;
                    transform-origin: center;
                    animation: courseIconSpin 10s linear infinite;
                }
                .course-icon-spin-slow {
                    transform-box: fill-box;
                    transform-origin: center;
                    animation: courseIconSpin 20s linear infinite;
                }
                .course-icon-blink {
                    animation: courseIconBlink 1s ease-in-out infinite alternate;
                }
                .course-icon-blink-delayed {
                    animation: courseIconBlink 1s ease-in-out 0.5s infinite alternate;
                }
                .course-icon-float {
                    transform-box: fill-box;
                    transform-origin: center;
                    animation: courseIconFloat 3s ease-in-out infinite alternate;
                }
                .course-icon-float-top {
                    animation: courseIconFloatTop 3s ease-in-out infinite alternate;
                }
                .course-icon-float-bottom {
                    animation: courseIconFloatBottom 3s ease-in-out 0.3s infinite alternate;
                }
                .course-icon-draw {
                    stroke-dasharray: 60;
                    stroke-dashoffset: 0;
                    animation: courseIconDraw 3s ease-in-out infinite alternate;
                }
                .course-icon-draw-delayed {
                    stroke-dasharray: 80;
                    stroke-dashoffset: 0;
                    animation: courseIconDraw 3s ease-in-out 0.5s infinite alternate;
                }
                .course-icon-draw-grid-1 {
                    animation: courseIconFloat 2.5s ease-in-out infinite alternate;
                }
                .course-icon-draw-grid-2 {
                    animation: courseIconFloat 2.5s ease-in-out 0.2s infinite alternate;
                }
                .course-icon-draw-grid-3 {
                    animation: courseIconFloat 2.5s ease-in-out 0.4s infinite alternate;
                }
                .course-icon-slide-left {
                    animation: courseIconSlide 2s ease-in-out infinite alternate;
                }
                .course-icon-fade-pulse {
                    animation: courseIconBlink 2s ease-in-out infinite alternate;
                }

                @keyframes courseIconChevR {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(2px); }
                }
                @keyframes courseIconChevL {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-2px); }
                }
                @keyframes courseIconPulse {
                    0% { transform: scale(0.85); opacity: 0.5; }
                    100% { transform: scale(1.15); opacity: 1; }
                }
                @keyframes courseIconSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes courseIconBlink {
                    0% { opacity: 0.25; }
                    100% { opacity: 1; }
                }
                @keyframes courseIconFloat {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-1.5px); }
                }
                @keyframes courseIconFloatTop {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-1px); }
                }
                @keyframes courseIconFloatBottom {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(1px); }
                }
                @keyframes courseIconDraw {
                    0% { stroke-dashoffset: 30; opacity: 0.6; }
                    100% { stroke-dashoffset: 0; opacity: 1; }
                }
                @keyframes courseIconSlide {
                    0% { transform: translateX(2px); opacity: 0.6; }
                    100% { transform: translateX(0); opacity: 1; }
                }
            `}</style>
            <div className={`absolute inset-0 bg-current opacity-10 blur-xl rounded-full scale-150 ${textColor}`}></div>
            {renderIcon()}
        </div>
    );
};

export default AnimatedCourseIcon;
