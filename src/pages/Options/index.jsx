import React from "react";
import { createRoot } from "react-dom/client";
import Options from "./Options";
import "./index.css";
import "./Options.css";

// Error boundary for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Options Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="options-container">
          <div className="loading-screen">
            <h2>Something went wrong</h2>
            <p>Please try refreshing the page or reopening the options.</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 16px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "16px"
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the options page
const container = document.getElementById("app-container");
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <Options title="Clippy AI" />
    </ErrorBoundary>
  );
} else {
  console.error("App container not found");
}
