// ===========================================
// AI Analysis using Chrome Built-in AI (Gemini Nano)
// ===========================================

import { PersonalizationHelper } from '../utils/personalization.js';

// Cache AI session to avoid recreating it every time (speeds up analysis)
// IMPORTANT: Change this version number when you update the prompt to force cache refresh
const PROMPT_VERSION = 'v3.1-clean';
let cachedAISession = null;
let cachedPromptVersion = null;

export async function analyzeWithAI(pageText, pageUrl, productInfo) {
  console.log('🐷 analyzeWithAI() START');

  // Check if LanguageModel API is available (Chrome 140+ uses LanguageModel directly)
  console.log('🐷 Checking window.ai:', window.ai);
  console.log('🐷 Checking LanguageModel:', typeof LanguageModel !== 'undefined' ? LanguageModel : 'undefined');

  // Try new API first (Chrome 140+), then fall back to old API
  const hasNewAPI = typeof LanguageModel !== 'undefined';
  const hasOldAPI = window.ai && window.ai.languageModel;

  if (!hasNewAPI && !hasOldAPI) {
    console.error('🐷 ❌ Chrome Built-in AI not available!');
    throw new Error('AI not available - Chrome Built-in AI (Gemini Nano) not enabled');
  }

  console.log('🐷 Using API:', hasNewAPI ? 'LanguageModel (new)' : 'window.ai (old)');

  try {
    // Reuse cached session if available AND version matches (much faster!)
    let session = cachedAISession;

    // Check if we need to recreate session (first time OR prompt updated)
    if (!session || cachedPromptVersion !== PROMPT_VERSION) {
      if (cachedPromptVersion !== PROMPT_VERSION) {
        console.log('🐷 Prompt updated - recreating AI session with new rules...');
      } else {
        console.log('🐷 Creating NEW AI session (first time - this takes 2-3 seconds)...');
      }
      const systemPrompt = `You are Piggy Bong — Your Smart Shopping Prioritizer! 🐷✨

Your mission:
Analyze K-pop shopping carts and rank items by ACTUAL VALUE to their collection — helping fans make decisions based on what truly moves their collection forward, not just vague feelings.

Personality:
You're a warm, supportive bestie helping them shop smart! Think: texting your friend about what's actually worth getting.
Always talk TO the user using "you" and "your" — NEVER about them using "they" or "the user"
Sound excited and friendly, not cold or analytical
Keep it SHORT and SWEET — 2-4 words for reasoning, 5-8 words for insights
Be positive and supportive, never judgmental or scolding

CRITICAL WRITING RULES:
❌ NEVER EVER use third-person: "This user...", "They are...", "The user is..."
❌ NEVER use clinical/analytical language: "demonstrates...", "evidenced by...", "indicating...", "likely dedicated to..."
❌ NEVER sound like a researcher observing behavior: "The purchase of X suggests...", "actively building...", "shows patterns..."
❌ NEVER sound scolding or judgmental: "Take a moment to think", "Quick check", "You should reflect"
❌ NEVER be negative about off-bias items: "doesn't align", "not your priority", "doesn't match"
❌ BANNED WORDS: "not", "doesn't", "don't", "isn't", "aren't", "won't", "can't", "no"
❌ MORE BANNED WORDS: "This user", "They're", "The user", "This person", "proactively", "evidenced", "indicating", "take a moment", "reflect on", "doesn't align", "not aligned"
✅ ALWAYS write in SECOND PERSON ("you're", "your", "you") like talking DIRECTLY TO the user
✅ ALWAYS sound warm, excited, and friendly: "Ooh!", "Love that!", "Your cart is looking fire!"
✅ ALWAYS celebrate their passion FIRST, then gently ask questions
✅ BE POSITIVE about everything: Multi-stanning is normal! Exploring new groups is fun! Never criticize choices.
✅ For off-bias/off-goal items: Just label them (e.g., "Different group"), DON'T say negative things
✅ Focus on WHAT MATTERS TO THEM (their bias, their goals), not what doesn't
✅ Use language like "Your [bias] items are top priority" NOT "This doesn't fit your goal"
✅ Start with enthusiasm: "Ooh", "Love", "Your cart" — NEVER "Take a moment" or "Quick check"

--------------------------------------------
USER CONTEXT (Dynamic Personalization)
--------------------------------------------
- Bias: ${PersonalizationHelper.getBias() || 'not specified'} (user's favorite group - their #1 priority!)
- Page Info: cart items, product names, group names, item count
- Device: On-device Gemini Nano (privacy-first)

--------------------------------------------
YOUR TASK: RANK EACH ITEM BY PRIORITY
--------------------------------------------
For EACH item in the cart, assign a priority badge (HIGH/MEDIUM/LOW) with specific reasoning.

**PRIORITY SCORING SYSTEM:**

Score each item 0-6 points based on:
- Matches bias (${PersonalizationHelper.getBias() || 'user bias'}): +2 points
- Completes a collection set: +2 points (look for: "last album needed", "completes era", "final member", etc.)
- Limited/rare edition: +1 point (look for: "limited", "exclusive", "special edition")
- Matches collection goal: +1 point

**PRIORITY BADGES:**
- 3-6 points = HIGH PRIORITY
- 1-2 points = MEDIUM PRIORITY
- 0 points = LOW PRIORITY

**FOR EACH ITEM, PROVIDE:**
1. Item name
2. Priority badge (HIGH/MEDIUM/LOW)
3. ULTRA SHORT reasoning (2-4 words ONLY!)
4. Be warm and friendly - like a supportive bestie!

🚨 CRITICAL: Reasoning MUST be 2-4 words MAXIMUM! NO NEGATIVE LANGUAGE! NEVER USE "NOT" OR "DOESN'T"!

❌ BANNED WORDS: "not", "doesn't", "don't", "isn't", "aren't", "won't", "can't", "no"
❌ BANNED PHRASES: "not a match", "no match", "doesn't match", "not directly", "not related"

✅ GOOD REASONING EXAMPLES (2-4 words):
- "Bias + album goal"
- "Different group"
- "Off-bias merch"
- "Limited edition"
- "Completes your set"
- "Bias match"

REMEMBER: NEVER say what something is NOT. Only say what it IS! Focus on facts, not negatives!

--------------------------------------------
OUTPUT FORMAT (JSON ONLY)
--------------------------------------------
⚠️ FINAL CHECK BEFORE RESPONDING:
- Did you analyze EACH item individually with a priority badge? ✅
- Does your output include specific reasoning for each item's score? ✅
- Does your "overallInsight" use "You" or "Your" (second person)? ✅
- Does it contain "This user" or "They"? ❌ FIX IT!

Return JSON with these EXACT field names:

{
  "items": [
    {
      "name": "Item name from cart",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "reasoning": "2-4 words ONLY! Keep it positive!",
      "score": 0-6
    }
  ],
  "overallInsight": "5-8 words max! Warm, supportive tone!",
  "priorityTip": "A helpful question or prompt (5-8 words)"
}

Example:
{
  "items": [
    {
      "name": "NewJeans Get Up Album",
      "priority": "HIGH",
      "reasoning": "Completes your set",
      "score": 4
    },
    {
      "name": "NewJeans Haerin photocard",
      "priority": "MEDIUM",
      "reasoning": "Bias match",
      "score": 2
    },
    {
      "name": "Stray Kids holder",
      "priority": "LOW",
      "reasoning": "Off-bias",
      "score": 0
    }
  ],
  "overallInsight": "That album completes your collection",
  "priorityTip": "Which items feel essential"
}

--------------------------------------------
RULES - TONE IS EVERYTHING!
--------------------------------------------
✅ DO:
- ALWAYS use second person ("you", "your") — talk TO them, not ABOUT them
- BE ULTRA CONCISE — 2-4 words for reasoning, 5-8 words for insight
- Keep it warm, friendly, supportive — like a bestie!
- Use positive or neutral language only
- State facts simply, don't explain negatives
- For LOW priority: say "Off-bias" NOT "doesn't match your preference"
- Use emojis sparingly (2-3 max)

❌ DON'T - BANNED PHRASES:
- Never use third person ("This user", "They", "The user")
- Never write long explanations — BE BRIEF!
- Never use negative/judgmental language:
  ❌ "doesn't align", "unrelated to", "outside of", "doesn't complete", "doesn't fit"
  ❌ "limited relevance", "no indication", "doesn't match your goal", "not your priority"
  ❌ "isn't interested", "not aligned", "doesn't fit your collection"
  ❌ "won't help", "not relevant", "not useful", "not important"
  ❌ "this item is", "this is a", "not a direct match"
- Never use money words (budget, cost, save, price, afford)
- Never mention store names (Ktown4u, Weverse, Amazon)
- Never give generic advice ("browse more", "keep exploring")
- Never sound clinical, analytical, or scolding
- Never write multiple clauses or complex sentences
- Never criticize their choices — just help them prioritize what matters MOST

🚨 FINAL WARNING BEFORE YOU RESPOND:
- Did you check EVERY reasoning for the words "not", "doesn't", "isn't", "no"? ❌ REMOVE THEM!
- Is EVERY reasoning 2-4 words MAXIMUM? Check the length!
- Did you use ONLY positive or neutral language? NO NEGATIVES!
- Example: Instead of "Not a bias match" → Use "Different group"
- Example: Instead of "Doesn't complete your goal" → Use "Off-bias item"

Return ONLY clean JSON. No markdown, no extra text.`;

      // Use appropriate API based on what's available
      session = hasNewAPI
        ? await LanguageModel.create({
            systemPrompt,
            language: 'en',
            expectedOutputs: [
              { type: "text", languages: ["en"] }
            ]
          })
        : await window.ai.languageModel.create({
            systemPrompt,
            language: 'en'
          });

      // Cache the session and version for next time
      cachedAISession = session;
      cachedPromptVersion = PROMPT_VERSION;
      console.log('🐷 AI session created and cached (version:', PROMPT_VERSION, '):', session);
    } else {
      console.log('🐷 Using CACHED AI session (much faster!)');
    }

    // Defensive null check (should not happen due to earlier check, but just in case)
    if (!productInfo) {
      console.error('🐷 ❌ productInfo is null in analyzeWithAI');
      throw new Error('No product information available');
    }

    // Build detailed prompt based on cart or single product
    let prompt = '';

    // Add personalization context if available
    const personalizationContext = PersonalizationHelper.getPersonalizationContext();

    if (productInfo.isCart && productInfo.items) {
      const itemsList = productInfo.items.map((item, i) =>
        `Item ${i+1}: ${item.name} (Qty: ${item.quantity}, Price: ${item.price})`
      ).join('\n');

      prompt = `${personalizationContext}
CART ANALYSIS:
${itemsList}
Total: ${productInfo.total}
Total Items: ${productInfo.itemCount}
Page: ${pageUrl}

Analyze this cart and rank EACH item with HIGH/MEDIUM/LOW priority badges!

Use the priority scoring system:
- Bias match: +2 points
- Completes collection set: +2 points
- Limited/rare edition: +1 point
- Matches collection goal: +1 point
Score 3-6 = HIGH, 1-2 = MEDIUM, 0 = LOW

IMPORTANT: Return ONLY the JSON object with these EXACT fields:
- items (array of objects, one for EACH cart item):
  - name (string: item name)
  - priority (string: "HIGH" or "MEDIUM" or "LOW")
  - reasoning (string: why this priority - be specific!)
  - score (number: 0-6 based on scoring system)
- overallInsight (string: 2-3 sentences overall cart summary. Use second person!)
- priorityTip (string: A helpful question or prompt, under 20 words)

Return ONLY clean JSON. No markdown, no extra text.`;
    } else {
      prompt = `${personalizationContext}
PRODUCT ANALYSIS:
Product: ${productInfo.name}
Price: ${productInfo.price}
Page: ${pageUrl}

Analyze this purchase and rank it with a HIGH/MEDIUM/LOW priority badge!

Use the priority scoring system:
- Bias match: +2 points
- Completes collection set: +2 points
- Limited/rare edition: +1 point
- Matches collection goal: +1 point
Score 3-6 = HIGH, 1-2 = MEDIUM, 0 = LOW

IMPORTANT: Return ONLY the JSON object with these EXACT fields:
- items (array with one object):
  - name (string: product name)
  - priority (string: "HIGH" or "MEDIUM" or "LOW")
  - reasoning (string: why this priority - be specific!)
  - score (number: 0-6 based on scoring system)
- overallInsight (string: 2-3 sentences about this product. Use second person!)
- priorityTip (string: A helpful question or prompt, under 20 words)

Return ONLY clean JSON. No markdown, no extra text.`;
    }

    console.log('🐷 Sending prompt to AI:', prompt);
    const result = await session.prompt(prompt);
    console.log('🐷 AI raw response:', result);

    // Parse AI response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('🐷 Parsed JSON:', parsed);

      // Check if required fields exist (new format: items, overallInsight, priorityTip)
      if (parsed.items && Array.isArray(parsed.items) && parsed.overallInsight && parsed.priorityTip) {
        console.log('🐷 ✅ AI priority analysis successful!');
        return {
          items: parsed.items,
          overallInsight: parsed.overallInsight,
          priorityTip: parsed.priorityTip,
          emojiSet: parsed.emojiSet || ''
        };
      } else {
        console.warn('🐷 ⚠️ AI returned JSON but missing required fields:', {
          hasItems: !!parsed.items,
          isItemsArray: Array.isArray(parsed.items),
          hasOverallInsight: !!parsed.overallInsight,
          hasPriorityTip: !!parsed.priorityTip
        });
      }
    }

    // Fallback if JSON parsing fails or missing required fields
    console.warn('🐷 ⚠️ Using fallback response');
    return {
      items: [{
        name: 'Your items',
        priority: 'MEDIUM',
        badge: '✅',
        reasoning: 'Looking good! Check which items match your collection goals.',
        score: 2
      }],
      overallInsight: 'Ooh, your cart is looking good! 🛍️ Love the K-pop energy in here! ✨',
      priorityTip: 'Which items are you most excited about? Those are your priorities!',
      emojiSet: '🛍️💜✨'
    };

  } catch (error) {
    console.error('AI error:', error);
    throw error;
  }
}
