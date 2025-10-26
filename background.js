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
// 🎯 HYBRID APPROACH: Only generates insights, NOT badge classification
// Badge classification is done by JavaScript in content script for 100% accuracy
async function analyzeWithGeminiNano(data) {
  const { items, userGroups, priorityTypes, patterns, classifiedItems } = data;

  console.log("🐷 Checking for AI in background (NEW 2025 API)...");

  // Use the NEW LanguageModel API (2025 syntax - replaces window.ai)
  let LanguageModelAPI = null;

  // Try to access LanguageModel (might need a moment to initialize)
  if (typeof LanguageModel !== 'undefined') {
    LanguageModelAPI = LanguageModel;
    console.log("🐷 ✅ Found global LanguageModel API");
  } else if (typeof self.LanguageModel !== 'undefined') {
    LanguageModelAPI = self.LanguageModel;
    console.log("🐷 ✅ Found self.LanguageModel API");
  } else if (typeof globalThis.LanguageModel !== 'undefined') {
    LanguageModelAPI = globalThis.LanguageModel;
    console.log("🐷 ✅ Found globalThis.LanguageModel API");
  } else {
    // Wait a bit and try again (API might still be initializing)
    console.log("🐷 ⏳ LanguageModel not ready, waiting 100ms...");
    await new Promise(resolve => setTimeout(resolve, 100));

    if (typeof LanguageModel !== 'undefined') {
      LanguageModelAPI = LanguageModel;
      console.log("🐷 ✅ Found LanguageModel after waiting");
    }
  }

  if (!LanguageModelAPI) {
    throw new Error("Gemini Nano not available - LanguageModel API not found. Make sure flags are enabled in chrome://flags");
  }

  // Check availability (NEW API - replaces capabilities())
  console.log("🐷 Checking LanguageModel.availability()...");
  const availability = await LanguageModelAPI.availability();
  console.log("🐷 Availability status:", availability);

  if (availability === "unavailable") {
    throw new Error("Gemini Nano model is unavailable on this device");
  }

  if (availability === "downloading") {
    throw new Error("Gemini Nano model is currently downloading. Please wait a few minutes and try again.");
  }

  if (availability === "downloadable") {
    throw new Error("Gemini Nano model needs to be downloaded. Go to chrome://components and click 'Check for update' on 'Optimization Guide On Device Model'");
  }

  // Create AI session (NEW API - direct call)
  console.log("🐷 Creating LanguageModel session...");
  const session = await LanguageModelAPI.create({
    temperature: 0.1, // Lower = faster, more deterministic
    topK: 1,          // Lower = faster, less creative
  });

  // Build prompt - INSIGHTS ONLY (badges already classified by JavaScript)
  const lineupText = userGroups.join(', ');
  const typesText = priorityTypes.length > 0 ? priorityTypes.join(', ') : 'none selected';

  // Build list showing items with their pre-classified badges
  const itemsWithBadges = classifiedItems.map((item, i) =>
    `${i + 1}. ${item.name} [${item.priority}]`
  ).join('\n');

  // DEBUG: Log what we're sending to AI
  console.log('🐷 DEBUG - Data being sent to AI:');
  console.log('  userGroups:', lineupText);
  console.log('  priorityTypes:', typesText);
  console.log('  classifiedItems:', classifiedItems.map(i => `${i.name.substring(0, 30)}... → ${i.priority}`));

  // Build pattern context section (simplified for speed)
  const isFirstCart = !patterns || patterns.totalCarts < 2;
  let patternContext = '';

  if (!isFirstCart) {
    const topArtist = Object.entries(patterns.artistFrequency)
      .sort((a, b) => b[1] - a[1])[0];

    const peakMonth = Object.entries(patterns.seasonalPatterns)
      .sort((a, b) => b[1] - a[1])[0];

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const abandoned = patterns.abandonedItems[0];

    patternContext = `\nHistory: ${patterns.totalCarts} carts. Top: ${topArtist[0]}. Peak: ${peakMonth[0]}, now: ${currentMonth}.`;

    if (abandoned) {
      patternContext += ` Abandoned: "${abandoned.name}" (${abandoned.timesAdded}x).`;
    }
  }

  // Different prompts for first-time vs returning users
  let prompt;

  if (isFirstCart) {
    // FIRST CART: Explain badges first, then give advice
    prompt = `You help K-pop fans understand their shopping cart.

Fan's favorite groups: ${lineupText}
Fan's priority types: ${typesText}

Cart items (already classified):
${itemsWithBadges}

Badge meanings:
- "Top Priority" = Matches your lineup AND priority types (buy this first!)
- "Core Lineup" = Your favorite group, but different item type
- "Discovery" = Your preferred item type, but exploring new groups
- "Multi-Stan" = Exploring beyond your usual favorites

TASK: Explain the badges in THIS cart, then give shopping advice.

IMPORTANT: Sound natural, not like AI!
- Use "you/your" (talk directly to them)
- NO dashes, NO hyphens, NO bullet points, NO corporate speak
- Short sentences. Period. Like texting a friend.
- Connect thoughts with periods, not dashes.

"overallInsight" (MAX 2 sentences - keep it SHORT):
  1. Count badges + explain why (based on lineup)
  2. Give quick actionable advice ONLY if needed

Good examples (SHORT & PUNCHY):
- "Three Top Priority NewJeans items. Perfect for your lineup!"
- "Two Top Priority, one Multi-Stan. If budget is tight, prioritize your lineup first."
- "All Discovery badges. You're exploring outside your lineup today!"
- "Mix of Top Priority and Multi-Stan. Your lineup items are the safe bets."

Bad examples (TOO LONG):
- "You have three Top Priority items in your cart. That's awesome because they all feature NewJeans..."
- Long explanations with multiple sentences about each item

JSON only:
{"overallInsight":"MAX 2 sentences"}`;
  } else {
    // RETURNING USER: Compare to patterns, explain badges, give advice
    prompt = `You help K-pop fans understand their shopping cart.

Fan's favorite groups: ${lineupText}
Fan's priority types: ${typesText}
${patternContext}

Cart items (already classified):
${itemsWithBadges}

Badge meanings:
- "Top Priority" = Matches your lineup AND priority types (buy this first!)
- "Core Lineup" = Your favorite group, but different item type
- "Discovery" = Your preferred item type, but exploring new groups
- "Multi-Stan" = Exploring beyond your usual favorites

TASK: Analyze badges in THIS cart compared to their history. Give shopping advice.

IMPORTANT: Sound natural, not like AI!
- Use "you/your" (talk directly to them)
- NO dashes, NO hyphens, NO bullet points, NO corporate speak
- Short sentences. Period. Like texting a friend.
- Connect thoughts with periods, not dashes.

"overallInsight" (MAX 2 sentences - keep it SHORT):
  1. Count badges + explain (Top Priority? Multi-Stan? Discovery?)
  2. Give quick actionable advice ONLY if needed

Good examples (SHORT & PUNCHY):
- "Two Top Priority, one Multi-Stan. If budget is tight, focus on your lineup first."
- "All Discovery badges. You're exploring outside your lineup today!"
- "Three Top Priority items. Everything matches your lineup perfectly!"
- "Mix of Top Priority and Multi-Stan. Your lineup items are the safe bets."

Bad examples (TOO LONG):
- "You have three Top Priority items in your cart. That's awesome because they all feature..."
- Multiple sentences explaining each item type

JSON only:
{"overallInsight":"MAX 2 sentences"}`;
  }

  console.log("🐷 Sending prompt to AI (insights only)...");
  console.log('🐷 DEBUG - Full prompt:');
  console.log(prompt);
  console.log('🐷 DEBUG - End of prompt\n');

  const aiResponse = await session.prompt(prompt);
  console.log("🐷 AI response received:", aiResponse.substring(0, 100));
  console.log('🐷 DEBUG - Full AI response:');
  console.log(aiResponse);
  console.log('🐷 DEBUG - End of AI response\n');

  // Parse JSON
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
  const aiInsights = JSON.parse(jsonStr);

  // DEBUG: Log parsed insights
  console.log('🐷 DEBUG - Parsed AI insights:');
  console.log('  overallInsight:', aiInsights.overallInsight);

  session.destroy();

  // Return only overallInsight (futureOpportunity is generated by JavaScript)
  return {
    overallInsight: aiInsights.overallInsight,
    priorityTip: "Focus on lineup matches first, then explore new groups at your pace"
  };
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
