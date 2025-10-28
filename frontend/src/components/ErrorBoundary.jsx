import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[200px] flex items-center justify-center">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Something went wrong! </strong>
                        <span className="block sm:inline">
                            {this.state.error?.message || 'Please try refreshing the page.'}
                        </span>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;