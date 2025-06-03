// Create a new file: src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: false }; // Return false to prevent re-rendering on ResizeObserver errors
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log("caught error", error);
    if (!error.message.includes("ResizeObserver loop")) {
      console.error("Uncaught error:", error, errorInfo);
      this.setState({ hasError: true });
    }
  }

  public render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
