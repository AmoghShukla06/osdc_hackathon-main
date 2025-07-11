// Inject Clippy overlay with static image and UI controls
(function injectClippy() {
  if (document.getElementById('clippy-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'clippy-overlay';
  overlay.className = 'clippy-overlay';
  overlay.innerHTML = `
    <div class="clippy-draggable">
      <img src="${chrome.runtime.getURL('icon-128.png')}" alt="Clippy" class="clippy-img clippy-idle" id="clippy-img" />
      <div class="clippy-controls">
        <button id="clippy-summarize" class="clippy-btn">Summarize</button>
        <button id="clippy-grammar" class="clippy-btn">Fix Grammar</button>
        <input id="clippy-search-input" class="clippy-input" placeholder="Ask Clippy..." />
        <button id="clippy-search" class="clippy-btn">Search</button>
      </div>
    </div>
    <div id="clippy-response" class="clippy-response"></div>
  `;
  document.body.appendChild(overlay);

  // Make overlay draggable
  let isDragging = false, offsetX = 0, offsetY = 0;
  const dragElem = overlay.querySelector('.clippy-draggable');
  dragElem.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - overlay.offsetLeft;
    offsetY = e.clientY - overlay.offsetTop;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      overlay.style.left = `${e.clientX - offsetX}px`;
      overlay.style.top = `${e.clientY - offsetY}px`;
    }
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  const responseDiv = document.getElementById('clippy-response');
  const clippyImg = document.getElementById('clippy-img');

  function setClippyState(state) {
    clippyImg.classList.remove('clippy-idle', 'clippy-thinking', 'clippy-speaking');
    clippyImg.classList.add(`clippy-${state}`);
  }

  // Helper to get selected text or fallback to page text
  function getSelectedTextOrPage() {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      return selection.toString();
    }
    return document.body.innerText.slice(0, 2000);
  }

  // Summarize button
  document.getElementById('clippy-summarize').onclick = () => {
    const text = getSelectedTextOrPage();
    responseDiv.textContent = 'Summarizing...';
    setClippyState('thinking');
    chrome.runtime.sendMessage({ action: 'summarize', text }, (res) => {
      if (res && res.summary) {
        responseDiv.textContent = res.summary;
        setClippyState('speaking');
      } else {
        responseDiv.textContent = res && res.error ? res.error : 'No summary.';
        setClippyState('idle');
      }
      setTimeout(() => setClippyState('idle'), 2000);
    });
  };

  // Fix Grammar button
  document.getElementById('clippy-grammar').onclick = () => {
    const text = getSelectedTextOrPage();
    responseDiv.textContent = 'Fixing grammar...';
    setClippyState('thinking');
    chrome.runtime.sendMessage({ action: 'fixGrammar', text }, (res) => {
      if (res && res.fixed) {
        // Optionally replace selected text inline
        if (window.getSelection && window.getSelection().toString().trim()) {
          const selection = window.getSelection();
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(res.fixed));
        }
        responseDiv.textContent = res.fixed;
        setClippyState('speaking');
      } else {
        responseDiv.textContent = res && res.error ? res.error : 'No correction.';
        setClippyState('idle');
      }
      setTimeout(() => setClippyState('idle'), 2000);
    });
  };

  // Search button
  document.getElementById('clippy-search').onclick = () => {
    const query = document.getElementById('clippy-search-input').value;
    if (!query.trim()) {
      responseDiv.textContent = 'Please enter a search query.';
      setClippyState('idle');
      return;
    }
    responseDiv.textContent = 'Searching...';
    setClippyState('thinking');
    // Use page context for search
    const context = document.body.innerText.slice(0, 2000);
    chrome.runtime.sendMessage({ action: 'search', query, context }, (res) => {
      if (res && res.answer) {
        responseDiv.textContent = res.answer;
        setClippyState('speaking');
      } else {
        responseDiv.textContent = res && res.error ? res.error : 'No answer.';
        setClippyState('idle');
      }
      setTimeout(() => setClippyState('idle'), 2000);
    });
  };
})(); 