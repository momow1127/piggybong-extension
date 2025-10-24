// Background service worker - handles AI analysis and toolbar clicks

// ===========================================
// AI Analysis Handler (Gemini Nano)
// ===========================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeWithAI") {
    console.log("🐷 Background: Received AI analysis request");

    // Run AI analysis in background (has access to window.ai)
    analyzeWithGeminiNano(request.data)
      .then(result => {
        console.log("🐷 Background: AI analysis complete");
        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error("🐷 Background: AI analysis failed:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep channel open for async response
  }
});

// AI Analysis Function
async function analyzeWithGeminiNano(data) {
  const { items, userGroups, priorityTypes } = data;

  console.log("🐷 Checking for AI in background...");
  console.log("  - self.ai:", !!self.ai);
  console.log("  - self.ai?.languageModel:", !!(self.ai && self.ai.languageModel));
  console.log("  - chrome.aiOriginTrial:", !!chrome.aiOriginTrial);
  console.log("  - ai (global):", typeof ai !== 'undefined' ? !!ai : false);

  // Try multiple API endpoints (Chrome is still experimenting)
  let aiAPI = null;

  if (self.ai && self.ai.languageModel) {
    aiAPI = self.ai.languageModel;
    console.log("🐷 Using self.ai.languageModel");
  } else if (typeof ai !== 'undefined' && ai.languageModel) {
    aiAPI = ai.languageModel;
    console.log("🐷 Using global ai.languageModel");
  } else if (chrome.aiOriginTrial && chrome.aiOriginTrial.languageModel) {
    aiAPI = chrome.aiOriginTrial.languageModel;
    console.log("🐷 Using chrome.aiOriginTrial.languageModel");
  }

  if (!aiAPI) {
    throw new Error("Gemini Nano not available - no API endpoint found");
  }

  const capabilities = await aiAPI.capabilities();
  console.log("🐷 AI capabilities:", capabilities);

  if (capabilities.available === "no") {
    throw new Error("AI not available on this device");
  }

  // Create AI session
  console.log("🐷 Creating AI session...");
  const session = await aiAPI.create({
    temperature: 0.3,
    topK: 3,
  });

  // Build prompt
  const itemsList = items.map((item, i) => `${i + 1}. ${item.name}`).join('\n');
  const lineupText = userGroups.join(', ');
  const typesText = priorityTypes.length > 0 ? priorityTypes.join(', ') : 'none selected';

  const prompt = `You are Piggy Bong, a supportive K-pop shopping assistant.

USER'S PREFERENCES:
- Lineup (favorite groups): ${lineupText}
- Priority item types: ${typesText}

CART ITEMS:
${itemsList}

TASK: Analyze each item. An item is HIGH priority ONLY if:
1. The artist/group name matches one of the lineup groups AND
2. The item type matches one of the priority types

Otherwise, it's MEDIUM priority.

REASONING RULES:
- If BOTH artist and type match → "Perfect match - Your lineup + Priority type"
- If artist matches but type doesn't → "Core lineup - Expanding your collection"
- If type matches but artist doesn't → "Priority type - Exploring new groups"
- If neither match → "Multi-stan opportunity - Broadening horizons"

Return ONLY valid JSON (no other text):
{
  "items": [
    {"name": "item name", "priority": "HIGH or MEDIUM", "reasoning": "reason", "score": 5 or 3}
  ],
  "overallInsight": "Encouraging message about their ${items.length} items and preferences",
  "priorityTip": "Tip focusing on ${lineupText} and ${typesText}"
}`;

  console.log("🐷 Sending prompt to AI...");
  const aiResponse = await session.prompt(prompt);
  console.log("🐷 AI response received:", aiResponse.substring(0, 100));

  // Parse JSON
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
  const aiResult = JSON.parse(jsonStr);

  session.destroy();
  return aiResult;
}

// ===========================================
// Toolbar Icon Click Handler
// ===========================================
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
