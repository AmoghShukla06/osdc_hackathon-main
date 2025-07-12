import React from "react";
import { createRoot } from "react-dom/client";

import Popup from "./Popup";
import "./index.css";
import "./Popup.css";

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
    console.error("Popup Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="popup-container dark">
          <div className="loading-container">
            <h2>Something went wrong</h2>
            <p>Please try refreshing the extension.</p>
            <button onClick={() => window.location.reload()}>Refresh</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the popup
const container = document.getElementById("app-container");
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <Popup />
    </ErrorBoundary>
  );
} else {
  console.error("App container not found");
}
