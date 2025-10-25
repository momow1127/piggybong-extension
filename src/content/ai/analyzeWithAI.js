// ===========================================
// Piggy Bong - AI-Powered Analysis with Gemini Nano
// Version: v8.0-gemini-nano-hybrid
// ===========================================

import { PersonalizationHelper, CartHistoryHelper } from "../utils/personalization.js";

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

  // New pattern-based fields
  safe.patternInsight = ai.patternInsight ? cleanText(ai.patternInsight) : null;
  safe.futureOpportunity = ai.futureOpportunity ? cleanText(ai.futureOpportunity) : null;

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

    // Determine priority badge and reasoning
    let priority, reasoning, score;

    if (lineupMatch && typeMatch) {
      priority = 'Top Priority';
      reasoning = 'Perfect match - Your lineup + Priority type';
      score = 5;
    } else if (lineupMatch) {
      priority = 'Core Lineup';
      reasoning = 'Your favorite group - Expanding collection';
      score = 3;
    } else if (typeMatch) {
      priority = 'Discovery';
      reasoning = 'Discovering new groups through your preferred items';
      score = 2;
    } else {
      priority = 'Multi-Stan';
      reasoning = 'Broadening horizons beyond your core collection';
      score = 1;
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

  // 📊 Save current cart to history
  if (productInfo.items && productInfo.items.length > 0) {
    CartHistoryHelper.saveCartSnapshot(productInfo.items, productInfo.total);
    console.log("📊 Cart snapshot saved to history");
  }

  // 📊 Analyze cart history patterns
  const patterns = CartHistoryHelper.analyzePatterns();
  if (patterns) {
    console.log("📊 Cart patterns detected:", {
      totalCarts: patterns.totalCarts,
      topArtists: Object.keys(patterns.artistFrequency).slice(0, 3),
      abandonedItems: patterns.abandonedItems.length
    });
  }

  // 🎯 HYBRID APPROACH: JavaScript for badges (accurate), AI for insights (natural language)
  console.log("🐷 Using hybrid approach: JS for badges, AI for insights");

  // Step 1: Use JavaScript for 100% accurate badge classification
  const classifiedItems = analyzeItemsWithJavaScript(productInfo.items, userGroups, priorityTypes);
  console.log("✅ JavaScript badge classification:", classifiedItems.map(i => `${i.name.substring(0, 30)}... → ${i.priority}`));

  // Step 2: Try to use AI for natural language insights only
  try {
    console.log("🐷 Requesting AI insights (overallInsight, futureOpportunity)...");

    // Send message to background.js which has access to AI
    const response = await chrome.runtime.sendMessage({
      action: "analyzeWithAI",
      data: {
        items: productInfo.items,
        classifiedItems, // 📊 Send pre-classified items so AI knows the correct badges
        userGroups,
        priorityTypes,
        patterns // 📊 Include pattern analysis
      }
    });

    if (response.success && response.result) {
      console.log("🐷 ✅ AI insights received from background");

      // Merge: Use JS badges + AI insights
      return validateAIResult({
        items: classifiedItems, // ✅ Use JavaScript-classified badges (100% accurate)
        overallInsight: response.result.overallInsight,
        futureOpportunity: response.result.futureOpportunity,
        priorityTip: response.result.priorityTip || "Focus on lineup matches first, then explore new groups at your pace",
        patternInsight: response.result.patternInsight || null
      });
    } else {
      console.warn("🐷 ⚠️ Background AI failed:", response.error);
      console.warn("🐷 Using JavaScript-only fallback");
      return useJavaScriptFallback(productInfo, userGroups, priorityTypes, patterns);
    }

  } catch (error) {
    console.error("🐷 ❌ Failed to communicate with background:", error);
    console.warn("🐷 Using JavaScript-only fallback");
    return useJavaScriptFallback(productInfo, userGroups, priorityTypes, patterns);
  }
}

// Helper function for JavaScript fallback
function useJavaScriptFallback(productInfo, userGroups, priorityTypes, patterns) {
  const analyzedItems = analyzeItemsWithJavaScript(
    productInfo.items,
    userGroups,
    priorityTypes
  );

  const lineupText = userGroups.join(', ');
  const typesText = priorityTypes.length > 0 ? ` and ${priorityTypes.join(', ')} items` : '';

  // Generate pattern-based insights
  let patternInsight = null;
  let futureOpportunity = null;

  if (patterns) {
    // Check for abandoned items in current cart
    const currentItemNames = productInfo.items.map(item => item.name.toLowerCase());
    const abandonedInCart = patterns.abandonedItems.filter(abandoned =>
      currentItemNames.some(current => current.includes(abandoned.name.toLowerCase()))
    );

    if (abandonedInCart.length > 0) {
      patternInsight = `💭 You've added "${abandonedInCart[0].name}" ${abandonedInCart[0].timesAdded} times before but never purchased. Trust your instincts!`;
    }

    // Check for lineup mismatches
    if (patterns.lineupMismatch && patterns.lineupMismatch.length > 0) {
      const topMismatch = patterns.lineupMismatch[0];
      const freq = patterns.artistFrequency[topMismatch];
      patternInsight = patternInsight || `📊 Your cart history shows ${freq}x ${topMismatch} items, but they're not in your lineup. Consider adding them!`;
    }

    // Suggest waiting based on seasonal patterns
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const peakMonths = Object.entries(patterns.seasonalPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([month]) => month);

    if (peakMonths.length > 0 && !peakMonths.includes(currentMonth)) {
      futureOpportunity = `🎯 Your collecting pattern peaks in ${peakMonths.join(' and ')}. Save your budget for then when ${lineupText} typically release new content!`;
    }
  }

  return validateAIResult({
    items: analyzedItems,
    overallInsight: `Your cart has ${analyzedItems.length} items! Focus on ${lineupText}${typesText} to build your collection.`,
    priorityTip: `Start with ${lineupText} items${priorityTypes.length > 0 ? ` and ${priorityTypes.join(', ')} types` : ''} first.`,
    patternInsight,
    futureOpportunity
  });
}
