import React from 'react';

const Popup = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 min-w-[240px] min-h-[140px] bg-gray-900 text-white rounded">
      <img src={chrome.runtime.getURL('icon-128.png')} alt="Clippy" className="w-12 h-12 mb-2" />
      <h2 className="text-lg font-bold mb-1">Clippy AI Assistant</h2>
      <ul className="text-sm mb-2 text-left list-disc list-inside">
        <li>Summarize selected or page text using AI</li>
        <li>Fix grammar in your writing instantly</li>
        <li>Ask questions and get contextual answers</li>
        <li>Customize features in Options</li>
      </ul>
      <a
        href="options.html"
        className="text-blue-400 underline text-sm mt-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Options
      </a>
    </div>
  );
};

export default Popup;
