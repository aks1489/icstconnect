import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-slate-950 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Something went wrong</h2>
                        <p className="text-gray-600 dark:text-slate-300 mb-4">The application encountered an error and could not load.</p>
                        <div className="bg-gray-100 dark:bg-slate-800/80 p-4 rounded overflow-auto max-h-64 mb-4">
                            <code className="text-sm text-red-800 dark:text-red-300">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors font-semibold"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
