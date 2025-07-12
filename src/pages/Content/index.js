import { printLine } from "./modules/print";
import "./modules/clippy";

console.log("Content script works!");
console.log("Must reload extension for modifications to take effect.");

printLine("Using the 'printLine' function from the Print Module");

// The CSS is already injected via manifest.json content_scripts
// No need to manually inject it here

// The Clippy overlay and functionality is now handled by the clippy.js module
// This ensures a single, consistent implementation with proper cross-device compatibility

// Add keyboard navigation: Allow closing overlay with Escape
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const overlay = document.getElementById("clippy-overlay");
    if (overlay) {
      overlay.style.display =
        overlay.style.display === "none" ? "block" : "none";
    }
  }
});

// Add global accessibility support
document.addEventListener("DOMContentLoaded", () => {
  // Ensure proper focus management
  const overlay = document.getElementById("clippy-overlay");
  if (overlay) {
    overlay.setAttribute("role", "region");
    overlay.setAttribute("aria-label", "Clippy AI Assistant");

    // Add focus trap for better accessibility
    const focusableElements = overlay.querySelectorAll(
      'button, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      overlay.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              e.preventDefault();
              lastFocusable.focus();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              e.preventDefault();
              firstFocusable.focus();
            }
          }
        }
      });
    }
  }
});
