console.log('This is the background page.');
console.log('Put the background scripts here.');

async function fetchHuggingFace(endpoint, apiKey, payload) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('API error');
  return response.json();
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  chrome.storage.sync.get(['apiKey', 'summarization', 'grammar', 'search'], async (settings) => {
    const apiKey = settings.apiKey;
    if (!apiKey) {
      sendResponse({ error: 'No API key set. Please set it in the Options page.' });
      return;
    }
    try {
      if (message.action === 'summarize' && settings.summarization) {
        // Call Hugging Face summarization endpoint
        const data = await fetchHuggingFace('facebook/bart-large-cnn', apiKey, { inputs: message.text });
        sendResponse({ summary: data[0]?.summary_text || 'No summary.' });
        return;
      }
      if (message.action === 'fixGrammar' && settings.grammar) {
        // Call Hugging Face grammar correction endpoint (using a T5 model as example)
        const data = await fetchHuggingFace('vennify/t5-base-grammar-correction', apiKey, { inputs: message.text });
        sendResponse({ fixed: data[0]?.generated_text || 'No correction.' });
        return;
      }
      if (message.action === 'search' && settings.search) {
        // Call Hugging Face question-answering endpoint (using distilbert as example)
        const data = await fetchHuggingFace('deepset/roberta-base-squad2', apiKey, { inputs: { question: message.query, context: message.context || '' } });
        sendResponse({ answer: data[0]?.answer || 'No answer.' });
        return;
      }
      sendResponse({ error: 'Feature disabled or unknown action.' });
    } catch (err) {
      sendResponse({ error: err.message || 'API error' });
    }
  });
  return true; // Keep the message channel open for async response
});
