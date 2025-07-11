import React, { useEffect, useState } from 'react';
import './Options.css';

const defaultSettings = {
  apiKey: '',
  summarization: true,
  grammar: true,
  search: true,
};

type Settings = typeof defaultSettings;

const Options: React.FC<{ title: string }> = ({ title }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [status, setStatus] = useState('');

  useEffect(() => {
    chrome.storage.sync.get(defaultSettings, (result) => {
      setSettings(result as Settings);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    chrome.storage.sync.set(settings, () => {
      setStatus('Settings saved!');
      setTimeout(() => setStatus(''), 1500);
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col space-y-4">
      <h1 className="text-2xl font-bold mb-2">{title} Page</h1>
      <label className="block">
        <span className="text-gray-700">Hugging Face API Key</span>
        <input
          type="password"
          name="apiKey"
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          value={settings.apiKey}
          onChange={handleChange}
          placeholder="Enter your Hugging Face API key"
        />
      </label>
      <div className="flex flex-col space-y-2">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="summarization"
            checked={settings.summarization}
            onChange={handleChange}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2">Enable Summarization</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="grammar"
            checked={settings.grammar}
            onChange={handleChange}
            className="form-checkbox h-5 w-5 text-green-600"
          />
          <span className="ml-2">Enable Grammar Correction</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="search"
            checked={settings.search}
            onChange={handleChange}
            className="form-checkbox h-5 w-5 text-purple-600"
          />
          <span className="ml-2">Enable Search</span>
        </label>
      </div>
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Save Settings
      </button>
      {status && <div className="text-green-600 mt-2">{status}</div>}
    </div>
  );
};

export default Options;
