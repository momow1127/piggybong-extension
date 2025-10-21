// Background service worker - triggers modal when toolbar icon is clicked

chrome.action.onClicked.addListener(async (tab) => {
  console.log('🐷 Toolbar icon clicked, sending message to content script');

  // Try sending message first
  chrome.tabs.sendMessage(tab.id, { action: "openModal" }, async (response) => {
    if (chrome.runtime.lastError) {
      console.log('🐷 Content script not loaded, injecting now...');

      // Inject content script if not already loaded
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });

        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['floating-button.css']
        });

        // Wait a bit for script to initialize
        setTimeout(() => {
          // Try sending message again
          chrome.tabs.sendMessage(tab.id, { action: "openModal" }, (response2) => {
            if (chrome.runtime.lastError) {
              console.error('🐷 Still failed:', chrome.runtime.lastError.message);
            } else {
              console.log('🐷 Modal triggered successfully:', response2);
            }
          });
        }, 500);
      } catch (error) {
        console.error('🐷 Failed to inject content script:', error);
      }
    } else {
      console.log('🐷 Modal triggered successfully:', response);
    }
  });
});
