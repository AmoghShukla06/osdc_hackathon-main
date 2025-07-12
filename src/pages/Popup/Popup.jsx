import React, { useState, useEffect } from "react";

const Popup = () => {
  const [theme, setTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(true);
  const [extensionStatus, setExtensionStatus] = useState("active");

  // Initialize popup state
  useEffect(() => {
    // Simulate loading state
    setTimeout(() => setIsLoading(false), 500);

    // Load theme from storage
    chrome.storage.sync.get(["theme"], (result) => {
      if (result.theme) {
        setTheme(result.theme);
      }
    });
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    chrome.storage.sync.set({ theme: newTheme });
  };

  // Quick actions
  const quickActions = [
    {
      id: "summarize",
      icon: "📝",
      title: "Summarize Page",
      description: "Get AI summary of current page",
      action: () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "summarize" });
          window.close();
        });
      },
    },
    {
      id: "grammar",
      icon: "✏️",
      title: "Fix Grammar",
      description: "Correct grammar in selected text",
      action: () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "fixGrammar" });
          window.close();
        });
      },
    },
    {
      id: "ask",
      icon: "❓",
      title: "Ask Question",
      description: "Get contextual answers",
      action: () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "askQuestion" });
          window.close();
        });
      },
    },
  ];

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
    window.close();
  };

  if (isLoading) {
    return (
      <div className={`popup-container ${theme}`}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Clippy AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`popup-container ${theme}`}>
      {/* Header */}
      <header className="popup-header">
        <div className="header-content">
          <img
            src={chrome.runtime.getURL("icon-128.png")}
            alt="Clippy AI"
            className="logo"
          />
          <div className="header-text">
            <h1>Clippy AI</h1>
            <span className={`status-badge ${extensionStatus}`}>
              {extensionStatus === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="action-button"
              onClick={action.action}
              title={action.description}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-title">{action.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-overview">
        <h2>Features</h2>
        <ul className="features-list">
          <li>
            <span className="feature-icon">🤖</span>
            <span>AI-powered text analysis</span>
          </li>
          <li>
            <span className="feature-icon">📊</span>
            <span>Smart summarization</span>
          </li>
          <li>
            <span className="feature-icon">✨</span>
            <span>Grammar correction</span>
          </li>
          <li>
            <span className="feature-icon">🎯</span>
            <span>Contextual assistance</span>
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="popup-footer">
        <button className="settings-button" onClick={openOptions}>
          <span className="settings-icon">⚙️</span>
          Settings
        </button>
        <div className="version-info">
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default Popup;
