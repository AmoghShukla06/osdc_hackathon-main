import React, { useEffect, useState, useCallback } from "react";
import "./Options.css";

interface Settings {
  apiKey: string;
  summarization: boolean;
  grammar: boolean;
  search: boolean;
  theme: "light" | "dark" | "system";
  autoSummarize: boolean;
  summaryLength: "short" | "medium" | "long";
  grammarLevel: "basic" | "advanced";
  notifications: boolean;
  shortcuts: boolean;
  contextMenu: boolean;
  language: string;
  maxTokens: number;
  temperature: number;
}

const defaultSettings: Settings = {
  apiKey: "",
  summarization: true,
  grammar: true,
  search: true,
  theme: "system",
  autoSummarize: false,
  summaryLength: "medium",
  grammarLevel: "basic",
  notifications: true,
  shortcuts: true,
  contextMenu: true,
  language: "en",
  maxTokens: 150,
  temperature: 0.7,
};

type StatusType = "success" | "error" | "warning" | "info" | "";

interface StatusMessage {
  type: StatusType;
  message: string;
}

const Options: React.FC<{ title: string }> = ({ title }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [status, setStatus] = useState<StatusMessage>({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.sync.get(defaultSettings);
        setSettings(result as Settings);
      } catch (error) {
        showStatus("error", "Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const { theme } = settings;
      const root = document.documentElement;
      
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.className = prefersDark ? "dark" : "light";
      } else {
        root.className = theme;
      }
    };
    
    applyTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (settings.theme === "system") {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings.theme]);

  const showStatus = useCallback((type: StatusType, message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 3000);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
               type === "number" ? parseFloat(value) : value,
    }));
  };

  const validateSettings = (): boolean => {
    if (settings.apiKey.trim() === "") {
      showStatus("warning", "API Key is required for AI features");
      return false;
    }
    
    if (settings.maxTokens < 50 || settings.maxTokens > 500) {
      showStatus("error", "Max tokens must be between 50 and 500");
      return false;
    }
    
    if (settings.temperature < 0 || settings.temperature > 1) {
      showStatus("error", "Temperature must be between 0 and 1");
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateSettings()) return;
    
    setIsSaving(true);
    try {
      await chrome.storage.sync.set(settings);
      showStatus("success", "Settings saved successfully!");
      
      // Notify background script about settings change
      chrome.runtime.sendMessage({ 
        action: "settingsUpdated", 
        settings 
      });
    } catch (error) {
      showStatus("error", "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      setSettings(defaultSettings);
      showStatus("info", "Settings reset to default values");
    }
  };

  const testApiKey = async () => {
    if (!settings.apiKey.trim()) {
      showStatus("warning", "Please enter an API key first");
      return;
    }
    
    setIsSaving(true);
    try {
      // Simulate API test (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      showStatus("success", "API key is valid!");
    } catch (error) {
      showStatus("error", "Invalid API key");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "features", label: "Features", icon: "🚀" },
    { id: "advanced", label: "Advanced", icon: "🔧" },
    { id: "about", label: "About", icon: "ℹ️" },
  ];

  if (isLoading) {
    return (
      <div className="options-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="options-container">
      <header className="options-header">
        <div className="header-content">
          <img 
            src={chrome.runtime.getURL("icon-128.png")} 
            alt="Clippy AI" 
            className="logo"
          />
          <div className="header-text">
            <h1>Clippy AI Settings</h1>
            <p>Customize your AI assistant experience</p>
          </div>
        </div>
      </header>

      <nav className="options-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="options-main">
        {activeTab === "general" && (
          <section className="settings-section">
            <h2>General Settings</h2>
            
            <div className="setting-group">
              <label className="setting-label">
                <span className="label-text">Theme</span>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleInputChange}
                  className="setting-select"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </label>
            </div>

            <div className="setting-group">
              <label className="setting-label">
                <span className="label-text">Language</span>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleInputChange}
                  className="setting-select"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                </select>
              </label>
            </div>

            <div className="setting-group">
              <label className="setting-label">
                <span className="label-text">Hugging Face API Key</span>
                <div className="input-group">
                  <input
                    type="password"
                    name="apiKey"
                    value={settings.apiKey}
                    onChange={handleInputChange}
                    placeholder="Enter your Hugging Face API key"
                    className="setting-input"
                  />
                  <button
                    onClick={testApiKey}
                    disabled={isSaving}
                    className="test-button"
                  >
                    {isSaving ? "Testing..." : "Test"}
                  </button>
                </div>
                <span className="input-help">
                  Required for AI features. Get your key from{" "}
                  <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">
                    Hugging Face
                  </a>
                </span>
              </label>
            </div>

            <div className="setting-group">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleInputChange}
                    className="setting-checkbox"
                  />
                  <span className="checkbox-text">Enable notifications</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="shortcuts"
                    checked={settings.shortcuts}
                    onChange={handleInputChange}
                    className="setting-checkbox"
                  />
                  <span className="checkbox-text">Enable keyboard shortcuts</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="contextMenu"
                    checked={settings.contextMenu}
                    onChange={handleInputChange}
                    className="setting-checkbox"
                  />
                  <span className="checkbox-text">Show context menu</span>
                </label>
              </div>
            </div>
          </section>
        )}

        {activeTab === "features" && (
          <section className="settings-section">
            <h2>AI Features</h2>
            
            <div className="feature-card">
              <div className="feature-header">
                <h3>📝 Summarization</h3>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="summarization"
                    checked={settings.summarization}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p className="feature-description">
                Automatically generate summaries of web pages and selected text
              </p>
              {settings.summarization && (
                <div className="feature-options">
                  <label className="setting-label">
                    <span className="label-text">Summary Length</span>
                    <select
                      name="summaryLength"
                      value={settings.summaryLength}
                      onChange={handleInputChange}
                      className="setting-select"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="autoSummarize"
                      checked={settings.autoSummarize}
                      onChange={handleInputChange}
                      className="setting-checkbox"
                    />
                    <span className="checkbox-text">Auto-summarize pages</span>
                  </label>
                </div>
              )}
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <h3>✏️ Grammar Correction</h3>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="grammar"
                    checked={settings.grammar}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p className="feature-description">
                Fix grammar and improve writing quality in real-time
              </p>
              {settings.grammar && (
                <div className="feature-options">
                  <label className="setting-label">
                    <span className="label-text">Correction Level</span>
                    <select
                      name="grammarLevel"
                      value={settings.grammarLevel}
                      onChange={handleInputChange}
                      className="setting-select"
                    >
                      <option value="basic">Basic</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <h3>🔍 Smart Search</h3>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="search"
                    checked={settings.search}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p className="feature-description">
                Get contextual answers and search assistance
              </p>
            </div>
          </section>
        )}

        {activeTab === "advanced" && (
          <section className="settings-section">
            <h2>Advanced Settings</h2>
            
            <div className="setting-group">
              <label className="setting-label">
                <span className="label-text">Max Tokens</span>
                <input
                  type="number"
                  name="maxTokens"
                  value={settings.maxTokens}
                  onChange={handleInputChange}
                  min="50"
                  max="500"
                  className="setting-input"
                />
                <span className="input-help">
                  Maximum number of tokens for AI responses (50-500)
                </span>
              </label>
            </div>

            <div className="setting-group">
              <label className="setting-label">
                <span className="label-text">Temperature</span>
                <input
                  type="number"
                  name="temperature"
                  value={settings.temperature}
                  onChange={handleInputChange}
                  min="0"
                  max="1"
                  step="0.1"
                  className="setting-input"
                />
                <span className="input-help">
                  Controls randomness in AI responses (0.0-1.0)
                </span>
              </label>
            </div>

            <div className="danger-zone">
              <h3>⚠️ Danger Zone</h3>
              <button
                onClick={handleReset}
                className="reset-button"
              >
                Reset All Settings
              </button>
            </div>
          </section>
        )}

        {activeTab === "about" && (
          <section className="settings-section">
            <h2>About Clippy AI</h2>
            
            <div className="about-card">
              <div className="about-header">
                <img 
                  src={chrome.runtime.getURL("icon-128.png")} 
                  alt="Clippy AI" 
                  className="about-logo"
                />
                <div>
                  <h3>Clippy AI Assistant</h3>
                  <p>Version 1.0.0</p>
                </div>
              </div>
              
              <div className="about-content">
                <p>
                  Your intelligent browsing companion powered by advanced AI. 
                  Clippy AI helps you summarize content, fix grammar, and get 
                  contextual answers while browsing the web.
                </p>
                
                <div className="about-links">
                  <a href="#" className="about-link">📚 Documentation</a>
                  <a href="#" className="about-link">🐛 Report Issues</a>
                  <a href="#" className="about-link">💡 Suggest Features</a>
                  <a href="#" className="about-link">⭐ Rate Extension</a>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="options-footer">
        <div className="footer-actions">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="save-button"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
        
        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
      </footer>
    </div>
  );
};

export default Options;
