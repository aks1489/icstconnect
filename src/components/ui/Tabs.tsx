import React, { createContext, useContext, useId } from 'react'

interface TabsContextValue {
    activeTab: string
    onTabChange: (value: string) => void
    baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

export interface TabsProps {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
    className?: string
}

export const Tabs: React.FC<TabsProps> = ({
    value,
    onValueChange,
    children,
    className = ''
}) => {
    const baseId = useId()

    return (
        <TabsContext.Provider value={{ activeTab: value, onTabChange: onValueChange, baseId }}>
            <div className={`w-full ${className}`}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '', ...props }) => {
    return (
        <div
            role="tablist"
            className={`inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
    children: React.ReactNode
    icon?: React.ReactNode
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
    value,
    children,
    icon,
    className = '',
    ...props
}) => {
    const context = useContext(TabsContext)
    if (!context) throw new Error('TabsTrigger must be used within Tabs')

    const isActive = context.activeTab === value
    const tabId = `${context.baseId}-tab-${value}`
    const panelId = `${context.baseId}-panel-${value}`

    return (
        <button
            role="tab"
            id={tabId}
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            onClick={() => context.onTabChange(value)}
            className={`
                inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 select-none
                ${isActive
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2572AB]
                ${className}
            `}
            {...props}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
        </button>
    )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
    children: React.ReactNode
}

export const TabsContent: React.FC<TabsContentProps> = ({
    value,
    children,
    className = '',
    ...props
}) => {
    const context = useContext(TabsContext)
    if (!context) throw new Error('TabsContent must be used within Tabs')

    const isActive = context.activeTab === value
    const tabId = `${context.baseId}-tab-${value}`
    const panelId = `${context.baseId}-panel-${value}`

    if (!isActive) return null

    return (
        <div
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId}
            tabIndex={0}
            className={`mt-4 focus-visible:outline-none ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

export default Tabs
