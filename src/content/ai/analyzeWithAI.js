// ===========================================
// Piggy Bong - AI-Powered Analysis with Gemini Nano
// Version: v8.0-gemini-nano-hybrid
// ===========================================

import { PersonalizationHelper } from "../utils/personalization.js";

const PROMPT_VERSION = "v8.0-gemini-nano-hybrid";

function cleanText(t) {
  return (t || "")
    .replace(/[\[\(\{].*?[\]\)\}]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.!?,])/g, "$1")
    .trim();
}

function validateAIResult(ai) {
  const safe = { ...ai };
  safe.items = (ai.items || []).map((it) => ({
    name: it.name || "Unnamed item",
    priority: it.priority || "MEDIUM",
    reasoning: cleanText(it.reasoning || "Collection addition - Building your K-pop treasure"),
    score: it.score ?? 3,
  }));
  safe.overallInsight = cleanText(
    ai.overallInsight ||
      "Building your collection thoughtfully! Each item adds unique value to your K-pop journey"
  );
  safe.priorityTip =
    ai.priorityTip ||
    "Focus on lineup matches first, then explore new groups at your pace";
  return safe;
}

// JavaScript fallback for when AI is unavailable
function analyzeItemsWithJavaScript(items, lineup, priorityTypes) {
  console.log("🔍 Using JavaScript fallback analysis");

  return items.map(item => {
    const itemNameLower = item.name.toLowerCase();

    // Check if item matches any lineup group
    const lineupMatch = lineup.find(group =>
      itemNameLower.includes(group.toLowerCase())
    );

    // Check if item matches any priority type
    const typeMatch = priorityTypes.find(type => {
      if (type === 'lightstick') return itemNameLower.includes('light stick') || itemNameLower.includes('lightstick');
      if (type === 'album') return itemNameLower.includes('album');
      if (type === 'seasongreetings') return itemNameLower.includes('season') || itemNameLower.includes('greeting');
      if (type === 'photocard') return itemNameLower.includes('photocard') || itemNameLower.includes('photo card');
      if (type === 'concert') return itemNameLower.includes('concert') || itemNameLower.includes('show');
      if (type === 'merchandise') return itemNameLower.includes('merchandise') || itemNameLower.includes('merch');
      return false;
    });

    // Determine priority and reasoning
    let priority, reasoning, score;

    if (lineupMatch && typeMatch) {
      priority = 'HIGH';
      reasoning = 'Perfect match - Your lineup + Priority type';
      score = 5;
    } else if (lineupMatch) {
      priority = 'MEDIUM';
      reasoning = 'Core lineup - Expanding your collection';
      score = 3;
    } else if (typeMatch) {
      priority = 'MEDIUM';
      reasoning = 'Priority type - Exploring new groups';
      score = 3;
    } else {
      priority = 'MEDIUM';
      reasoning = 'Multi-stan opportunity - Broadening horizons';
      score = 3;
    }

    return {
      name: item.name,
      priority,
      reasoning,
      score
    };
  });
}

// -------------------------------------------
// Main Function - Uses Gemini Nano AI
// -------------------------------------------
export async function analyzeWithAI(pageText, pageUrl, productInfo) {
  console.log("🐷 analyzeWithAI() START - Using Gemini Nano Prompt API");

  // Get user preferences
  const lineup = PersonalizationHelper.getLineup();
  const priority = PersonalizationHelper.getPriority();
  const legacyBias = PersonalizationHelper.getBias();
  const userGroups = lineup.length > 0 ? lineup : (legacyBias ? [legacyBias] : ['NewJeans']);
  const priorityTypes = priority && priority.types ? priority.types : [];

  console.log("🔍 User preferences:", { lineup: userGroups, priorityTypes });

  // Try to use Gemini Nano AI via background service worker
  try {
    console.log("🐷 Sending AI request to background service worker...");

    // Send message to background.js which has access to AI
    const response = await chrome.runtime.sendMessage({
      action: "analyzeWithAI",
      data: {
        items: productInfo.items,
        userGroups,
        priorityTypes
      }
    });

    if (response.success) {
      console.log("🐷 ✅ AI analysis from background received");
      return validateAIResult(response.result);
    } else {
      console.warn("🐷 ⚠️ Background AI failed:", response.error);
      console.warn("🐷 Using JavaScript fallback");
      return useJavaScriptFallback(productInfo, userGroups, priorityTypes);
    }

  } catch (error) {
    console.error("🐷 ❌ Failed to communicate with background:", error);
    console.warn("🐷 Using JavaScript fallback");
    return useJavaScriptFallback(productInfo, userGroups, priorityTypes);
  }
}

// Helper function for JavaScript fallback
function useJavaScriptFallback(productInfo, userGroups, priorityTypes) {
  const analyzedItems = analyzeItemsWithJavaScript(
    productInfo.items,
    userGroups,
    priorityTypes
  );

  const lineupText = userGroups.join(', ');
  const typesText = priorityTypes.length > 0 ? ` and ${priorityTypes.join(', ')} items` : '';

  return validateAIResult({
    items: analyzedItems,
    overallInsight: `Your cart has ${analyzedItems.length} items! Focus on ${lineupText}${typesText} to build your collection.`,
    priorityTip: `Start with ${lineupText} items${priorityTypes.length > 0 ? ` and ${priorityTypes.join(', ')} types` : ''} first.`
  });
}
