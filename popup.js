// ==================================================
// popup.js - Triggers the floating button modal
// ==================================================

const runCheckBtn = document.getElementById("runCheckBtn");
const reportContainer = document.getElementById("report-container");

// When button is clicked, send message to content script to open the modal
runCheckBtn.addEventListener("click", () => {
  console.log('🐷 Popup button clicked');

  // Send message to content script to open the modal on the page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      reportContainer.textContent = "Error: Could not find active tab.";
      return;
    }

    const activeTab = tabs[0];
    console.log('🐷 Sending openModal message to tab:', activeTab.id);

    // Send message to content script to trigger the floating button modal
    chrome.tabs.sendMessage(activeTab.id, { action: "openModal" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('🐷 Message sending failed:', chrome.runtime.lastError.message);
        reportContainer.textContent = "Please refresh the page and try again.";
      } else {
        console.log('🐷 Modal triggered successfully, response:', response);
        // Close the popup after triggering the modal
        window.close();
      }
    });
  });
});
