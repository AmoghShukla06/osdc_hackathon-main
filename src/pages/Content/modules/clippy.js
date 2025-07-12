// Inject Clippy overlay with static image and UI controls
(function injectClippy() {
  console.log('Clippy injection starting...');
  
  // Wait for DOM to be ready
  function initializeClippy() {
    if (document.getElementById('clippy-overlay')) {
      console.log('Clippy overlay already exists');
      return;
    }

    console.log('Creating clippy overlay...');
    const overlay = document.createElement('div');
    overlay.id = 'clippy-overlay';
    overlay.className = 'clippy-overlay';
    overlay.innerHTML = `
      <div class="clippy-header">
        <div class="clippy-drag-handle" title="Drag to move">
          <span class="clippy-drag-dots">⋮⋮</span>
        </div>
        <button id="clippy-close" class="clippy-close-btn" title="Close Clippy">×</button>
      </div>
      <div class="clippy-content">
        <div class="clippy-avatar">
          <img src="${chrome.runtime.getURL('icon-128.png')}" alt="Clippy" class="clippy-img clippy-idle" id="clippy-img" />
        </div>
        <div class="clippy-controls">
          <button id="clippy-summarize" class="clippy-btn">
            <span class="clippy-btn-icon">📝</span>
            <span class="clippy-btn-text">Summarize</span>
          </button>
          <button id="clippy-grammar" class="clippy-btn">
            <span class="clippy-btn-icon">✏️</span>
            <span class="clippy-btn-text">Fix Grammar</span>
          </button>
          <div class="clippy-search-container">
            <input id="clippy-search-input" class="clippy-input" placeholder="Ask Clippy..." />
            <button id="clippy-search" class="clippy-btn clippy-search-btn">
              <span class="clippy-btn-icon">🔍</span>
            </button>
          </div>
        </div>
      </div>
      <div id="clippy-response" class="clippy-response"></div>
    `;
    
    // Ensure body exists before appending
    if (!document.body) {
      console.log('Body not ready, waiting...');
      setTimeout(initializeClippy, 100);
      return;
    }
    
    document.body.appendChild(overlay);
    console.log('Clippy overlay added to body');

    // Make overlay draggable with improved cross-device compatibility
    let isDragging = false, offsetX = 0, offsetY = 0;
    const dragElem = overlay.querySelector('.clippy-drag-handle');
    
    // Get current position considering both fixed positioning and transforms
    function getCurrentPosition() {
      const rect = overlay.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top
      };
    }
    
    // Set position using transform for better performance and compatibility
    function setPosition(x, y) {
      // Get viewport dimensions (handles different browsers)
      const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      
      // Get overlay dimensions with fallback
      const overlayWidth = overlay.offsetWidth || 300;
      const overlayHeight = overlay.offsetHeight || 400;
      
      // Add padding to prevent overlay from touching screen edges
      const padding = 10;
      
      // Constrain to viewport bounds with padding
      x = Math.max(padding, Math.min(x, viewportWidth - overlayWidth - padding));
      y = Math.max(padding, Math.min(y, viewportHeight - overlayHeight - padding));
      
      // Store position for animations
      overlay.style.setProperty('--clippy-x', x + 'px');
      overlay.style.setProperty('--clippy-y', y + 'px');
      
      // Use transform for better performance and compatibility
      overlay.style.transform = `translate(${x}px, ${y}px)`;
    }
    
    // Mouse events
    dragElem.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      const currentPos = getCurrentPosition();
      offsetX = e.clientX - currentPos.x;
      offsetY = e.clientY - currentPos.y;
      document.body.style.userSelect = 'none';
      overlay.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        setPosition(e.clientX - offsetX, e.clientY - offsetY);
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      document.body.style.userSelect = '';
      overlay.style.cursor = '';
    });
    
    // Touch events for mobile and trackpad support
    dragElem.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDragging = true;
      const touch = e.touches[0];
      const currentPos = getCurrentPosition();
      offsetX = touch.clientX - currentPos.x;
      offsetY = touch.clientY - currentPos.y;
      document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('touchmove', (e) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        setPosition(touch.clientX - offsetX, touch.clientY - offsetY);
      }
    });
    
    document.addEventListener('touchend', () => {
      isDragging = false;
      document.body.style.userSelect = '';
    });
    
    // Initialize position to bottom-right corner with margin
    const initializePosition = () => {
      // Get viewport dimensions (handles different browsers)
      const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      
      // Get overlay dimensions with fallback
      const overlayWidth = overlay.offsetWidth || 300;
      const overlayHeight = overlay.offsetHeight || 400;
      
      // Calculate margin based on screen size
      const margin = Math.min(20, Math.max(10, viewportWidth * 0.02));
      
      // Position at bottom-right corner
      const x = viewportWidth - overlayWidth - margin;
      const y = viewportHeight - overlayHeight - margin;
      
      setPosition(x, y);
      console.log(`Clippy positioned at: ${x}, ${y} (viewport: ${viewportWidth}x${viewportHeight})`);
    };
    
    // Wait for overlay to be fully rendered to get correct dimensions
    setTimeout(initializePosition, 100);

    // Handle window resize to keep overlay within bounds
    window.addEventListener('resize', () => {
      if (!isDragging) {
        const currentPos = getCurrentPosition();
        setPosition(currentPos.x, currentPos.y);
      }
    });

    // Handle orientation change on mobile devices
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        if (!isDragging) {
          const currentPos = getCurrentPosition();
          setPosition(currentPos.x, currentPos.y);
        }
        // Re-initialize position after orientation change
        setTimeout(initializePosition, 200);
      }, 100);
    });
    
    // Add close button functionality with animation
    const closeBtn = document.getElementById('clippy-close');
    closeBtn.addEventListener('click', () => {
      overlay.classList.add('clippy-overlay-hide');
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.classList.remove('clippy-overlay-hide');
      }, 200);
      console.log('Clippy overlay closed');
    });
    
    // Add keyboard shortcut to reopen (Ctrl+Shift+C)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        if (overlay.style.display === 'none') {
          overlay.style.display = 'block';
          overlay.classList.add('clippy-overlay-show');
          initializePosition();
          setTimeout(() => {
            overlay.classList.remove('clippy-overlay-show');
          }, 300);
          console.log('Clippy overlay reopened with Ctrl+Shift+C');
        }
      }
    });
    
    // Add initial show animation
    overlay.classList.add('clippy-overlay-show');
    setTimeout(() => {
      overlay.classList.remove('clippy-overlay-show');
    }, 300);

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
  }

  // Check if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeClippy);
  } else {
    initializeClippy();
  }
  
  // Fallback - also try after a short delay
  setTimeout(initializeClippy, 500);
})(); 