import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
                    <h1 style={{ color: '#e91e63' }}>Something went wrong.</h1>
                    <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
