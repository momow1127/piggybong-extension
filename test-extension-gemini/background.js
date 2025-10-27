// Test Gemini Nano in service worker context

console.log("🔍 Service Worker Started");
console.log("Testing Gemini Nano API availability...");

// Check all possible API endpoints
console.log("self.ai:", typeof self.ai);
console.log("self.ai?.languageModel:", typeof self.ai?.languageModel);
console.log("ai (global):", typeof globalThis.ai);
console.log("chrome.aiOriginTrial:", typeof chrome?.aiOriginTrial);

// Try to use the API
async function testGeminiInServiceWorker() {
  try {
    let aiAPI = null;

    if (self.ai && self.ai.languageModel) {
      aiAPI = self.ai.languageModel;
      console.log("✅ Found self.ai.languageModel");
    } else if (typeof ai !== 'undefined' && ai.languageModel) {
      aiAPI = ai.languageModel;
      console.log("✅ Found global ai.languageModel");
    } else if (chrome.aiOriginTrial && chrome.aiOriginTrial.languageModel) {
      aiAPI = chrome.aiOriginTrial.languageModel;
      console.log("✅ Found chrome.aiOriginTrial.languageModel");
    } else {
      console.error("❌ No AI API found in service worker");
      return;
    }

    console.log("🔍 Checking capabilities...");
    const capabilities = await aiAPI.capabilities();
    console.log("✅ Capabilities:", capabilities);

    if (capabilities.available === "no") {
      console.error("❌ AI not available on this device");
      return;
    }

    console.log("🔍 Creating session...");
    const session = await aiAPI.create({
      temperature: 0.5,
      topK: 3
    });
    console.log("✅ Session created!");

    console.log("🔍 Sending test prompt...");
    const response = await session.prompt("Say 'Hello from service worker!' in exactly those words.");
    console.log("✅ AI Response:", response);

    session.destroy();
    console.log("✅ Gemini Nano is working in service worker!");

  } catch (error) {
    console.error("❌ Error testing Gemini:", error);
  }
}

// Test on install
chrome.runtime.onInstalled.addListener(() => {
  console.log("🔍 Extension installed, testing Gemini...");
  testGeminiInServiceWorker();
});

// Test on startup
testGeminiInServiceWorker();

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "testGemini") {
    testGeminiInServiceWorker().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});
