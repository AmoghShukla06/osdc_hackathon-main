<img src="src/assets/img/icon-128.png" width="64"/>

# Clippy AI Chrome Extension

A Chrome Extension that injects a floating, animated Clippy assistant onto every page. Clippy can summarize, fix grammar, and answer questions using Hugging Face AI models. Built with React, Tailwind CSS, and Manifest V3.

## Features
- Floating, animated Clippy overlay on every page
- Summarize selected text using Hugging Face summarization
- Fix grammar of selected text using Hugging Face grammar correction
- Ask questions and get contextual answers from Hugging Face models
- Options page (React) to set your Hugging Face API key and toggle features
- All UI styled with Tailwind CSS
- Accessibility and keyboard navigation support

## Setup & Development
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start development server:**
   ```bash
   npm start
   ```
3. **Build for production:**
   ```bash
   NODE_ENV=production npm run build
   ```
4. **Load the extension in Chrome:**
   - Go to `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked" and select the `build` folder

## Usage
- Click the Clippy overlay on any page to use Summarize, Fix Grammar, or Search.
- Set your Hugging Face API key and toggle features in the Options page.

## Privacy
- Your Hugging Face API key is stored securely using `chrome.storage.sync` and never shared with web pages.
- Only the text you select or enter is sent to Hugging Face for processing.

## Accessibility
- Clippy overlay is keyboard accessible and screen reader friendly.
- Press `Escape` to hide the overlay.

## License
MIT
