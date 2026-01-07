import React from 'react';
import { motion } from 'framer-motion';

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

    // Shared transition props
    const floatTransition = {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const
    };

    const pulseTransition = {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const
    };

    const renderIcon = () => {
        switch (type) {
            case 'code': // Web Dev cases
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path
                            d="M16 18L22 12L16 6"
                            initial={{ x: 0 }}
                            animate={{ x: [0, 2, 0] }}
                            transition={floatTransition}
                        />
                        <motion.path
                            d="M8 6L2 12L8 18"
                            initial={{ x: 0 }}
                            animate={{ x: [0, -2, 0] }}
                            transition={floatTransition}
                        />
                        <motion.circle
                            cx="12" cy="12" r="3"
                            initial={{ scale: 0.8, opacity: 0.5 }}
                            animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
                            transition={pulseTransition}
                            fill="currentColor"
                            stroke="none"
                            className="opacity-20"
                        />
                    </svg>
                );
            case 'data': // Data Science / DCA
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path
                            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" as const }}
                        />
                        <motion.path
                            d="M21 12H16"
                            initial={{ x: 5, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        />
                        <motion.rect
                            x="9" y="8" width="8" height="8" rx="1"
                            animate={{ rotate: [0, 90, 180, 270, 360] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" as const }}
                        />
                        <motion.circle
                            cx="12" cy="12" r="2"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={pulseTransition}
                            fill="currentColor"
                            stroke="none"
                        />
                    </svg>
                );
            case 'finance': // Tally / Accounting
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path
                            d="M12 1V23"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5 }}
                        />
                        <motion.path
                            d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 0.5 }}
                        />
                    </svg>
                );
            case 'hardware': // Hardware / Networking
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <motion.rect
                            x="2" y="2" width="20" height="8" rx="2" ry="2"
                            initial={{ y: -5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.rect
                            x="2" y="14" width="20" height="8" rx="2" ry="2"
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                        <motion.line
                            x1="6" y1="6" x2="6.01" y2="6"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            strokeWidth="3"
                        />
                        <motion.line
                            x1="6" y1="18" x2="6.01" y2="18"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                            strokeWidth="3"
                        />
                    </svg>
                );
            case 'office': // Office / Diploma
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <motion.rect
                            x="4" y="4" width="16" height="16" rx="2"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={floatTransition}
                        />
                        <motion.path
                            d="M9 4V20"
                            initial={{ height: 0 }}
                            animate={{ height: 16 }}
                            transition={{ duration: 1 }}
                        />
                        <motion.path
                            d="M15 4V20"
                            initial={{ height: 0 }}
                            animate={{ height: 16 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        />
                        <motion.path
                            d="M4 9H20"
                            initial={{ width: 0 }}
                            animate={{ width: 16 }}
                            transition={{ duration: 1, delay: 0.4 }}
                        />
                    </svg>
                );
            case 'design': // DTP / Design
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <motion.circle
                            cx="12" cy="12" r="10"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" as const }}
                        />
                        <motion.path
                            d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </svg>
                );
            default: // General / Book
                return (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${textColor}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path
                            d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                        />
                        <motion.path
                            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        />
                    </svg>
                );
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className={`absolute inset-0 bg-current opacity-10 blur-xl rounded-full scale-150 ${textColor}`}></div>
            {renderIcon()}
        </div>
    );
};

export default AnimatedCourseIcon;
