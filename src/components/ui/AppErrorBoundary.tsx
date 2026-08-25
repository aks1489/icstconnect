import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { IconAlertTriangle, IconRefresh, IconCopy, IconCheck, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { getErrorDefinition } from '../../utils/errorCodes'
import { errorLoggingService } from '../../services/errorLoggingService'
import type { LoggedErrorPayload } from '../../services/errorLoggingService'

interface Props {
    children: ReactNode
    fallbackTitle?: string
    fallbackMessage?: string
    isContainer?: boolean
    onReset?: () => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
    loggedPayload: LoggedErrorPayload | null
    copied: boolean
    showDetails: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            loggedPayload: null,
            copied: false,
            showDetails: false
        }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const loggedPayload = errorLoggingService.logError(
            error,
            { isContainer: this.props.isContainer },
            errorInfo.componentStack || undefined
        )
        this.setState({ errorInfo, loggedPayload })
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            loggedPayload: null,
            copied: false,
            showDetails: false
        })
        if (this.props.onReset) {
            this.props.onReset()
        }
    }

    handleCopyDiagnostics = () => {
        const text = JSON.stringify(this.state.loggedPayload, null, 2)
        navigator.clipboard.writeText(text).then(() => {
            this.setState({ copied: true })
            setTimeout(() => this.setState({ copied: false }), 3000)
        })
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children
        }

        const errorDef = getErrorDefinition(this.state.error)
        const correlationId = this.state.loggedPayload?.correlationId || 'N/A'

        if (this.props.isContainer) {
            // Widget / Container Level Fallback
            return (
                <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 backdrop-blur-md text-slate-800 dark:text-slate-200 animate-in fade-in duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 shrink-0">
                            <IconAlertTriangle size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                                    {this.props.fallbackTitle || errorDef.title}
                                </h3>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 font-semibold">
                                    {errorDef.code}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                                {this.props.fallbackMessage || errorDef.userMessage}
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={this.handleReset}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-sm transition-colors"
                                >
                                    <IconRefresh size={14} />
                                    <span>Try Again</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={this.handleCopyDiagnostics}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                                >
                                    {this.state.copied ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
                                    <span>{this.state.copied ? 'Copied' : 'Copy Code'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        // Full Page / Route Level Fallback
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-xl w-full p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-6 shadow-inner">
                        <IconAlertTriangle size={32} />
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 mb-3">
                        <span>Code: {errorDef.code}</span>
                        <span>•</span>
                        <span>ID: {correlationId}</span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {errorDef.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
                        {errorDef.userMessage} {errorDef.suggestedAction}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                        <button
                            type="button"
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md hover:shadow-blue-500/25 transition-all"
                        >
                            <IconRefresh size={18} />
                            <span>Reload Component</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => window.location.href = '/'}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm transition-all"
                        >
                            <span>Return to Home</span>
                        </button>
                        <button
                            type="button"
                            onClick={this.handleCopyDiagnostics}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm transition-all"
                            title="Copy error details to clipboard for technical support"
                        >
                            {this.state.copied ? <IconCheck size={18} className="text-emerald-500" /> : <IconCopy size={18} />}
                            <span>{this.state.copied ? 'Copied Diagnostics' : 'Copy Diagnostics'}</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                        <span>{this.state.showDetails ? 'Hide technical details' : 'Show technical details'}</span>
                        {this.state.showDetails ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                    </button>

                    {this.state.showDetails && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-300 text-left font-mono text-xs overflow-x-auto max-h-48 border border-slate-800">
                            <p className="font-bold text-red-400 mb-1">{this.state.error?.toString()}</p>
                            <pre className="text-[11px] opacity-80 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default AppErrorBoundary
