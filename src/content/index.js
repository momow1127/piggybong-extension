// ===========================================
// content.js - Piggy Bong Floating Button
// Automatically injected into all pages
// ===========================================

import { createFloatingButton, updateButtonState, isButtonCreated } from './ui/floatingButton.js';
import { showPiggyBongModal } from './ui/modal.js';

(function() {
  'use strict';

  // Check if button already exists (prevent duplicates)
  if (document.getElementById('piggybong-floating-btn')) {
    return;
  }

  // ===========================================
  // Main Initialization with Cart Detection
  // ===========================================

  function initializePiggyBong() {
    console.log('🐷 Piggy Bong: Initializing floating button...');

    // Show button on all pages (reliable across all K-pop shops)
    createFloatingButton(showPiggyBongModal);
    updateButtonState();

    console.log('🐷 Piggy Bong: Button ready!');
  }

  // ===========================================
  // MutationObserver for Dynamic Cart Detection
  // ===========================================

  let reCheckTimeout = null;

  function scheduleReCheck() {
    // Debounce: only re-check after 2 seconds of no mutations
    clearTimeout(reCheckTimeout);
    reCheckTimeout = setTimeout(() => {
      console.log('🐷 Re-checking state...');

      // If button doesn't exist yet, create it (for dynamic page loads)
      if (!isButtonCreated) {
        console.log('🐷 Page loaded dynamically - creating button now!');
        createFloatingButton(showPiggyBongModal);
        updateButtonState();
      }

      // If button exists, update its state (for cart changes)
      if (isButtonCreated) {
        updateButtonState();
      }
    }, 2000);
  }

  // Watch for DOM changes (for AJAX cart updates)
  const observer = new MutationObserver((mutations) => {
    // Only care about meaningful changes (text/structure)
    const hasSignificantChange = mutations.some(mutation =>
      mutation.type === 'childList' ||
      (mutation.type === 'characterData' && mutation.target.textContent.length > 10)
    );

    if (hasSignificantChange) {
      scheduleReCheck();
    }
  });

  // Start observing after DOM is ready
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    console.log('🐷 MutationObserver started - watching for dynamic cart updates');
  }

  // Initial check on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePiggyBong);
  } else {
    initializePiggyBong();
  }

  console.log('🐷 Piggy Bong: Content script loaded');

  // Listen for messages from toolbar to trigger floating button click or close modal
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openModal") {
      console.log('🐷 Received openModal message from toolbar');

      // Check if modal is already open
      const existingModal = document.getElementById('piggybong-modal') || document.getElementById('piggybong-onboarding-modal');

      if (existingModal) {
        // Modal is open, close it
        console.log('🐷 Modal already open, closing it');
        existingModal.classList.add('closing');
        setTimeout(() => existingModal.remove(), 300);
        sendResponse({ success: true, action: 'closed' });
      } else {
        // Modal is not open, check if floating button exists
        let floatingBtn = document.getElementById('piggybong-floating-btn');

        // If button doesn't exist yet, create it first (user clicked toolbar before button loaded)
        if (!floatingBtn && !isButtonCreated) {
          console.log('🐷 Button not created yet, creating it now...');
          createFloatingButton(showPiggyBongModal);
          updateButtonState();
          floatingBtn = document.getElementById('piggybong-floating-btn');
        }

        if (floatingBtn) {
          // Directly trigger the modal instead of clicking button (to avoid empty cart handler)
          console.log('🐷 Triggering modal directly...');
          const pageText = document.body.innerText || '';
          const pageUrl = window.location.href;
          showPiggyBongModal(pageText, pageUrl);
          sendResponse({ success: true, action: 'opened' });
        } else {
          console.error('🐷 Floating button could not be created!');
          sendResponse({ success: false, error: 'Button could not be created' });
        }
      }
    }
    return true; // Keep message channel open for async response
  });
})();
