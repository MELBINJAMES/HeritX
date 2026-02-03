import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#dc2626', background: '#fef2f2', height: '100vh' }}>
                    <h1>🛑 Something went wrong.</h1>
                    <h2 style={{ color: '#333' }}>{this.state.error?.toString()}</h2>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#555' }}>
                        {this.state.errorInfo?.componentStack}
                    </details>
                    <button onClick={() => window.location.href = '/'} style={{ marginTop: '2rem', padding: '1rem', cursor: 'pointer' }}>Go Home</button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
