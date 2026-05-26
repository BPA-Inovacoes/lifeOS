import { Component, type ErrorInfo, type ReactNode } from "react";

import { RouteErrorFallback } from "@/components/RouteErrorFallback";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[LifeOS] ErrorBoundary", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <RouteErrorFallback error={this.state.error} onRetry={this.handleRetry} />
        )
      );
    }
    return this.props.children;
  }
}
