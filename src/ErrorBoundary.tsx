import { Component, type ReactNode } from "react";

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

  componentDidCatch(error: Error, info: ErrorInfo): void {
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

  render(): ReactNode {
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
}

function DefaultErrorFallback({ error }: DefaultErrorFallbackProps) {
  console.error("Error caught by boundary:", error.message);
  return null;
}
