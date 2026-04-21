import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback renderer */
  fallback?: (error: Error, info: ErrorInfo | null) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
}

/**
 * React Error Boundary — catches rendering errors, lifecycle errors,
 * and constructor errors in the entire child tree.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Or with a custom fallback:
 *   <ErrorBoundary fallback={(err) => <MyFallback error={err} />}>
 *     <App />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, info: null };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ error, info });
    // Log to console in development
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary] Caught error:", error);
      console.error("[ErrorBoundary] Component stack:", info.componentStack);
    }
  }

  /** Reset the boundary so children can re-render */
  reset(): void {
    this.setState({ hasError: false, error: null, info: null });
  }

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.info);
      }
      return (
        <DefaultErrorFallback
          error={this.state.error}
          info={this.state.info}
          onReset={() => this.reset()}
        />
      );
    }
    return this.props.children;
  }
}

// ─── Default Fallback UI ────────────────────────────────────────────

interface DefaultErrorFallbackProps {
  error: Error;
  info?: ErrorInfo | null;
}

function DefaultErrorFallback({
  error,
  onReset,
}: DefaultErrorFallbackProps & { onReset: () => void }) {
  console.error("Error caught by boundary:", error.message);
  return (
    <div className="error-fallback">
      <div className="error-fallback-content">
        <div className="error-icon">⚠️</div>
        <h2>Application Error</h2>
        <p className="error-message">{error.message}</p>
        {error.stack && (
          <details className="error-details">
            <summary>Stack Trace</summary>
            <pre>{error.stack}</pre>
          </details>
        )}
        <div className="error-actions">
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            Reload Page
          </button>
          <button type="button" className="btn-secondary" onClick={onReset}>
            Try to recover
          </button>
        </div>
      </div>
    </div>
  );
}
