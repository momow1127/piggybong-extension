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

  // Handle futureOpportunity as object or string
  if (ai.futureOpportunity) {
    if (typeof ai.futureOpportunity === 'object') {
      safe.futureOpportunity = {
        text: cleanText(ai.futureOpportunity.text),
        suggestPreferenceUpdate: ai.futureOpportunity.suggestPreferenceUpdate || false,
        artistName: ai.futureOpportunity.artistName || null
      };
    } else {
      safe.futureOpportunity = {
        text: cleanText(ai.futureOpportunity),
        suggestPreferenceUpdate: false,
        artistName: null
      };
    }
  } else {
    safe.futureOpportunity = null;
  }

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

  // Sort items by priority score (Top Priority first, Multi-Stan last)
  classifiedItems.sort((a, b) => b.score - a.score);
  console.log("✅ Items sorted by priority:", classifiedItems.map(i => `${i.priority} (${i.score}): ${i.name.substring(0, 30)}...`));

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

      // Generate Smart Fan Tip from actual data (JavaScript, not AI)
      const futureOpportunity = generateSmartFanTip(patterns, productInfo.items, userGroups);
      console.log("🐷 Smart Fan Tip generated:", futureOpportunity);

      // Merge: Use JS badges + JS Smart Fan Tip + AI Overall Insight
      return validateAIResult({
        items: classifiedItems, // ✅ JavaScript-classified badges (100% accurate)
        overallInsight: response.result.overallInsight, // ✅ AI-generated insight (creative)
        futureOpportunity, // ✅ JavaScript-generated tip (factual, no hallucination)
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

// Generate Smart Fan Tip from actual cart history data (no AI hallucination)
function generateSmartFanTip(patterns, currentItems, userGroups) {
  // First-time user tip
  if (!patterns || patterns.totalCarts < 2) {
    return {
      text: "This is your first cart! Keep shopping and I'll learn your patterns. I'll spot which artists you love and when you shop most.",
      suggestPreferenceUpdate: false,
      artistName: null
    };
  }

  const userGroupsLower = userGroups.map(g => g.toLowerCase());

  // Priority 1: Abandoned items in current cart
  const currentItemNames = currentItems.map(item => item.name.toLowerCase());
  const abandonedInCart = patterns.abandonedItems.filter(abandoned =>
    currentItemNames.some(current => current.includes(abandoned.name.toLowerCase()))
  );

  if (abandonedInCart.length > 0) {
    const item = abandonedInCart[0];
    // Extract artist from item name (e.g., "BIGBANG - [COM 전용] Big Bang..." → "BIGBANG")
    const artistMatch = item.name.match(/^([A-Za-z\s&]+)/);
    const itemLabel = artistMatch ? artistMatch[1].trim() : 'this';

    // Check if artist is NOT in lineup (suggest preference update)
    const artistNotInLineup = itemLabel !== 'this' &&
                              !userGroupsLower.some(group =>
                                itemLabel.toLowerCase().includes(group) ||
                                group.includes(itemLabel.toLowerCase())
                              );

    return {
      text: artistNotInLineup && item.timesAdded >= 3
        ? `${itemLabel} added ${item.timesAdded} times but not in your lineup. Want to add them?`
        : `${itemLabel} added ${item.timesAdded} times. Just get it!`,
      suggestPreferenceUpdate: artistNotInLineup && item.timesAdded >= 3,
      artistName: artistNotInLineup ? itemLabel : null
    };
  }

  // Priority 2: Peak month is current month
  const peakMonth = Object.entries(patterns.seasonalPatterns)
    .sort((a, b) => b[1] - a[1])[0];
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

  if (peakMonth && peakMonth[0] === currentMonth && patterns.totalCarts >= 3) {
    return {
      text: `${currentMonth} is your peak shopping month. You're on schedule!`,
      suggestPreferenceUpdate: false,
      artistName: null
    };
  }

  // Priority 3: Top artist pattern
  const topArtist = Object.entries(patterns.artistFrequency)
    .sort((a, b) => b[1] - a[1])[0];

  if (topArtist && topArtist[1] >= 3) {
    const percentage = Math.round((topArtist[1] / patterns.totalCarts) * 100);

    // Check if top artist is NOT in lineup
    const artistNotInLineup = !userGroupsLower.some(group =>
      topArtist[0].toLowerCase().includes(group) ||
      group.includes(topArtist[0].toLowerCase())
    );

    return {
      text: artistNotInLineup
        ? `${topArtist[0]} shows up in ${percentage}% of your carts but not in your lineup. Want to add them?`
        : `${topArtist[0]} shows up in ${percentage}% of your carts. Dedicated!`,
      suggestPreferenceUpdate: artistNotInLineup,
      artistName: artistNotInLineup ? topArtist[0] : null
    };
  }

  // Priority 4: Type collector insight
  const topType = Object.entries(patterns.typeFrequency)
    .sort((a, b) => b[1] - a[1])[0];

  if (topType && topType[1] >= 3) {
    return {
      text: `You collect ${topType[0]}s!`,
      suggestPreferenceUpdate: false,
      artistName: null
    };
  }

  return null;
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

  // Generate Smart Fan Tip from actual data (JavaScript, not AI)
  const futureOpportunity = generateSmartFanTip(patterns, productInfo.items, userGroups);

  return validateAIResult({
    items: analyzedItems,
    overallInsight: `Your cart has ${analyzedItems.length} items! Focus on ${lineupText}${typesText} to build your collection.`,
    priorityTip: `Start with ${lineupText} items${priorityTypes.length > 0 ? ` and ${priorityTypes.join(', ')} types` : ''} first.`,
    patternInsight: null,
    futureOpportunity
  });
}
