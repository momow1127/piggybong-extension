# Piggy Bong - K-Pop Shopping Companion
## Project Story for Devpost Submission

---

## Inspiration
K-pop fans know the feeling. A new merch drop appears, everything says "limited edition," and before you think twice, your cart is full. I've been there too. Those moments come from excitement and FOMO, not from what truly matters to your collection.

I wanted to build something that helps fans pause for a few seconds before checkout: a gentle, supportive companion that helps them see **which items actually match their priorities** — their bias, their collection goals, what truly matters to them. Powered by Chrome's local AI, Piggy Bong ranks cart items by priority, helping fans focus on what moves their collection forward.

---

## What it does
Piggy Bong is a Chrome extension that quietly activates while fans browse K-pop shopping sites like Weverse or Ktown4u. It reads your cart items and, using Chrome's built-in Gemini Nano AI, **ranks each item by priority (HIGH/MEDIUM/LOW)** based on:

- **Your bias** (favorite K-pop group)
- **Collection goals** (albums, photocards, limited editions)
- **What completes your sets**

Each item gets a priority badge and short reasoning like "Bias + album goal" or "Different group." The AI also provides an encouraging overall insight like "That NewJeans album is top priority" — helping fans see clearly what matters most to them without judgment.

---

## How we built it
Built with **Chrome's Prompt API** and **Gemini Nano AI**, Piggy Bong runs fully on-device for privacy.

**Technical highlights:**
- **Smart cart extraction**: Parses product names, prices, and quantities from different K-pop store formats
- **Priority scoring system**: 0-6 point scale based on bias match, collection completion, limited editions
- **Warm AI personality**: Custom system prompt designed to sound like a supportive bestie, not a cold chatbot
- **Session caching**: First analysis takes 3-5 seconds, subsequent clicks take 1-2 seconds
- **Multi-stan friendly**: Never judgmental about off-bias items — just helps prioritize

The UI is intentionally minimal and friendly: a floating button, quick analysis, and compact priority badges that let the insight speak for itself.

---

## Challenges we ran into
**Dynamic HTML parsing**: Each K-pop store has different structures — ktown4u uses Tailwind classes, Weverse has different markup. I built site-specific extractors with generic fallbacks to handle this variety.

**Emotional tone engineering**: The AI kept generating cold, analytical text like "This item doesn't align with your collection goal." I had to refine the system prompt extensively with banned phrases, good/bad examples, and explicit tone rules to make it sound warm and supportive.

**Multi-stanning culture**: K-pop fans often love multiple groups. The AI needed to be positive about exploring other groups while still helping fans prioritize — saying "Different group" instead of "Doesn't match your bias."

**Brevity vs clarity**: Getting the AI to produce 2-4 word reasoning instead of long sentences required adding critical reminders and examples directly in the prompt showing exact bad vs good phrases.

---

## Accomplishments that we're proud of
Piggy Bong now runs **entirely on-device** — no data collection, no cloud calls, completely private. It feels personal, instant, and supportive.

The experience shows how Chrome's local AI can deliver **contextual, emotionally intelligent insights** right in the browser, helping users pause and reflect in the middle of excitement. The priority system makes it immediately clear what matters most without feeling judgmental.

I'm especially proud of the **cultural sensitivity** — using K-pop fan language naturally, being positive about multi-stanning, and focusing on priorities rather than budget.

---

## What we learned
**Designing emotional AI** means finding the line between helpful and judgmental. Even a 2-4 word label like "Different group" vs "Doesn't match your goal" completely changes how supportive it feels.

I learned that **prompt engineering is an iterative art** — you need explicit rules, banned phrases, good/bad examples, and constant testing to get the tone right. What seems obvious to humans isn't always clear to AI.

I also learned how to make **Chrome's new on-device AI capabilities feel human and purposeful** — not just technical. The key is treating AI as a personality, not just a processing engine.

---

## What's next for Piggy Bong - K-Pop Fan Shopping Companion
**Smart personalization**: Learn from each user's collection patterns over time — if they always buy limited editions, automatically boost those in priority.

**Collection tracking**: A "Fan Reflection Log" showing how their priorities evolve — turning impulsive shopping into a mindful fan journey with insights like "You've focused on NewJeans albums this month!"

**Multi-store expansion**: Add more K-pop stores globally and improve extraction accuracy with machine learning.

**Community insights**: Anonymous aggregated data showing patterns like "90% of NewJeans fans prioritize albums over merch" — helping fans understand their collecting style.

**Multi-language support**: Korean, Japanese, Chinese interfaces for international fans using Chrome's Translator API.

---

**Built with ❤️ for the K-pop collecting community**
