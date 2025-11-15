import React, { PureComponent } from 'react';

class ErrorBoundary extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
    
    // Bind methods for better performance
    this.handleReset = this.handleReset.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Uncaught error in React tree:', error, errorInfo);
    
    // Update state with error info and increment counter
    this.setState(prevState => ({ 
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Optional: Send to logging service (e.g., Sentry, LogRocket)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset() {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback(error, this.handleReset, this.handleReload)
          : fallback;
      }

      // Generate error message once
      const errorMessage = error ? String(error.stack || error) : 'Unknown error';
      const componentStack = errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-700">
                The application encountered an error. Please try again.
              </p>
              {errorCount > 1 && (
                <p className="text-sm text-orange-600 mt-2">
                  This error has occurred {errorCount} times.
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-center mb-6">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
                  Show Error Details
                </summary>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-600 mb-1">
                      Error Message:
                    </h3>
                    <pre className="text-xs bg-red-50 p-3 rounded overflow-auto max-h-40 text-red-800 border border-red-200">
                      {errorMessage}
                    </pre>
                  </div>
                  {componentStack && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-600 mb-1">
                        Component Stack:
                      </h3>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40 text-gray-700">
                        {componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {process.env.NODE_ENV === 'production' && (
              <p className="text-xs text-gray-500 text-center mt-4">
                If this problem persists, please contact support.
              </p>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;