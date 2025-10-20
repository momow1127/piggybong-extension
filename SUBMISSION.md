# Piggy Bong - Devpost Submission Text

## Tagline (50 characters max)
AI companion for mindful K-pop collecting

## Inspiration

As K-pop fans ourselves, we've experienced the anxiety of FOMO-driven purchases. Every comeback brings limited editions, exclusive photocards, and multiple album versions. It's easy to lose sight of your collection goals in the excitement.

We wanted to create something that helps fans pause and reflect—not by judging their choices, but by helping them understand if a purchase aligns with their genuine collecting priorities or is driven by momentary impulse.

## What it does

Piggy Bong is a Chrome Extension that appears on K-pop shopping sites with a simple question: "Should I Buy This?"

When clicked, it uses Chrome's built-in Gemini Nano AI to analyze the purchase and provide:

1. **Priority Assessment** - A 0-100 score showing if this is a collection goal or FOMO buy
2. **Transparent Reasoning** - Clear explanation of WHY it gave that score
3. **Supportive Reflection** - Non-judgmental guidance aligned with K-pop collecting culture
4. **Visual Meter** - Phia-style visual showing where the purchase falls on the priority spectrum

The extension only appears on K-pop shopping sites and uses a non-disruptive top-right panel that doesn't block checkout pages.

## How we built it

**Tech Stack:**
- Chrome Extension (Manifest V3)
- Chrome's Prompt API with Gemini Nano
- Vanilla JavaScript (no frameworks for lightweight performance)
- Content script injection for floating button UI

**Key Implementation Details:**

1. **AI Integration**: We use the Prompt API with a carefully crafted system prompt that gives Gemini Nano the personality of "Piggy Bong," a K-pop Collection Alignment Specialist. The prompt instructs the AI to avoid financial shame language and instead focus on collection goals.

2. **Structured Responses**: The AI returns JSON with `priorityLevel`, `reasoning`, and `reflection` fields, which we parse and display in a user-friendly format.

3. **Multi-Currency Detection**: We built regex patterns to detect prices in USD, KRW (₩ and 원), EUR, and GBP to work across international K-pop shops.

4. **Context-Aware Injection**: Using `content_scripts` in manifest.json, we inject the floating button only on specific K-pop shopping domains.

5. **Privacy-First**: All AI processing happens on-device with Gemini Nano. No user data leaves the browser.

## Challenges we ran into

**1. AI Response Consistency**
Getting structured JSON responses from Gemini Nano was tricky. We had to carefully design the system prompt with examples and use regex to extract JSON from conversational responses.

**2. Product Info Extraction**
K-pop shopping sites have wildly different HTML structures. We built a flexible extraction system using multiple price patterns and fallback to page title for product names.

**3. UI Balance**
Finding the right balance between visibility (needs to be noticed) and non-intrusiveness (can't block checkout) took several iterations. We settled on a compact top-right panel inspired by Phia's design.

**4. Cultural Tone**
Crafting AI responses that feel supportive rather than judgmental required careful prompt engineering. We had to teach the AI K-pop fan terminology and collecting culture.

## Accomplishments that we're proud of

✅ **First-of-its-kind** application of on-device AI for emotional/behavioral analysis in collecting
✅ **Transparent AI reasoning** - users see exactly why they got their score
✅ **Culturally-aware** - respects K-pop fan terminology and avoids financial shame
✅ **Privacy-safe** - everything happens on-device, no tracking
✅ **Polished UX** - follows proven patterns from successful shopping assistants

## What we learned

- How to design effective system prompts for Gemini Nano
- The importance of transparent AI reasoning for user trust
- Content script injection patterns for Chrome extensions
- Cultural sensitivity in AI prompt design
- Structured data extraction from conversational AI responses

## What's next for Piggy Bong

**Short-term:**
- Multi-language support (Korean, Japanese) using Chrome's Translator API
- Wishlist tracking to compare purchases against saved collection goals
- More K-pop shopping site support

**Long-term:**
- Browser-based spending insights (using local storage only)
- "Still want this after 24 hours?" reminder feature
- Extend pattern to other collecting communities (trading cards, sneakers, fashion)
- Community-sourced collection priority patterns (anonymous, privacy-safe)

## APIs Used

**Prompt API (LanguageModel API)** - Chrome's built-in AI

We chose the Prompt API because our use case requires custom system prompts, structured JSON responses, and context-aware decision-making rather than simple text summarization.

## Built With

- Chrome Prompt API
- Gemini Nano
- JavaScript
- HTML5
- CSS3
- Chrome Extension APIs (Manifest V3)

---

## Additional Notes for Judges

**Testing Instructions**: Please see README.md for detailed setup instructions including enabling Gemini Nano in Chrome Canary.

**Key Files to Review**:
- `content.js` lines 214-275: AI integration with Prompt API
- `content.js` lines 159-190: Multi-currency product extraction
- `manifest.json` lines 23-39: Context-aware site targeting

**Demo Sites**: Visit ktown4u.com or weverse.io after installing to see the extension in action.

Thank you for considering Piggy Bong for the Chrome Built-in AI Challenge 2025! 🐷✨
