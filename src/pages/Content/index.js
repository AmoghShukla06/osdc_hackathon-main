import { printLine } from './modules/print';
import './modules/clippy';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

// Inject Tailwind CSS for Clippy overlay
const style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.runtime.getURL('clippy/clippy.styles.css');
document.head.appendChild(style);

// Create Clippy overlay root
const clippyRoot = document.createElement('div');
clippyRoot.id = 'clippy-overlay-root';
clippyRoot.className = 'fixed bottom-8 right-8 z-[99999] flex flex-col items-end';
clippyRoot.innerHTML = `
  <div class="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center space-y-2 animate-bounce">
    <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
      <!-- Placeholder for Clippy animation -->
      <span class="text-5xl">🤖</span>
    </div>
    <div class="flex space-x-2">
      <button class="clippy-summarize px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Summarize</button>
      <button class="clippy-grammar px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Fix Grammar</button>
    </div>
    <input class="clippy-search border rounded px-2 py-1 w-32" placeholder="Ask Clippy..." />
  </div>
`;
document.body.appendChild(clippyRoot);

// Accessibility: Add ARIA roles and labels
clippyRoot.setAttribute('role', 'region');
clippyRoot.setAttribute('aria-label', 'Clippy AI Assistant');

// Focus management: Focus search input on overlay click
clippyRoot.addEventListener('click', () => {
  const input = clippyRoot.querySelector('.clippy-search');
  if (input) input.focus();
});

// Keyboard navigation: Allow closing overlay with Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    clippyRoot.style.display = 'none';
  }
});

// Helper to get selected text
function getSelectedText() {
  return window.getSelection().toString();
}

// Show loading state in Clippy
function setClippyLoading(isLoading) {
  const clippyFace = document.querySelector('#clippy-overlay-root .w-24');
  if (clippyFace) {
    clippyFace.innerHTML = isLoading ? '<span class="text-5xl animate-spin">🤔</span>' : '<span class="text-5xl">🤖</span>';
  }
}

// Visually hidden error/result for screen readers
function showClippyResult(result) {
  let resultDiv = document.getElementById('clippy-result');
  if (!resultDiv) {
    resultDiv = document.createElement('div');
    resultDiv.id = 'clippy-result';
    resultDiv.className = 'mt-2 p-2 bg-gray-100 rounded text-sm max-w-xs break-words';
    resultDiv.setAttribute('aria-live', 'polite');
    resultDiv.setAttribute('role', 'status');
    document.querySelector('#clippy-overlay-root .flex-col').appendChild(resultDiv);
  }
  resultDiv.textContent = result;
}

// Summarize button
const summarizeBtn = document.querySelector('.clippy-summarize');
summarizeBtn.addEventListener('click', async () => {
  const text = getSelectedText();
  if (!text) {
    showClippyResult('Select some text to summarize!');
    return;
  }
  setClippyLoading(true);
  chrome.runtime.sendMessage({ action: 'summarize', text }, (response) => {
    setClippyLoading(false);
    if (response?.error) {
      showClippyResult('Error: ' + response.error);
    } else {
      showClippyResult(response?.summary || 'Summary coming soon...');
    }
  });
});

// Fix Grammar button
const grammarBtn = document.querySelector('.clippy-grammar');
grammarBtn.addEventListener('click', async () => {
  const text = getSelectedText();
  if (!text) {
    showClippyResult('Select some text to fix!');
    return;
  }
  setClippyLoading(true);
  chrome.runtime.sendMessage({ action: 'fixGrammar', text }, (response) => {
    setClippyLoading(false);
    if (response?.error) {
      showClippyResult('Error: ' + response.error);
    } else {
      showClippyResult(response?.fixed || 'Fixed text coming soon...');
    }
    // Optionally replace selected text inline (not implemented yet)
  });
});

// Search input
const searchInput = document.querySelector('.clippy-search');
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (!query) return;
    setClippyLoading(true);
    chrome.runtime.sendMessage({ action: 'search', query }, (response) => {
      setClippyLoading(false);
      if (response?.error) {
        showClippyResult('Error: ' + response.error);
      } else {
        showClippyResult(response?.answer || 'Answer coming soon...');
      }
    });
  }
});
