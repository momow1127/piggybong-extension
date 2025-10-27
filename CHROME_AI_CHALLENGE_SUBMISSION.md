# Piggy Bong - K-Pop Fan Shopping Companion

**Chrome AI Challenge 2025 Submission**

---

## Inspiration

As a K-pop fan myself, I've experienced the universal struggle: you're on a K-pop merchandise site, your cart is overflowing with albums, photocards, and lightsticks from multiple groups, and you're staring at a total that's way over budget. Your heart says "buy it all," but your wallet says "make choices."

I watched friends agonize over these decisions—screenshot their carts, post in group chats asking "should I get this?"—and realized we needed something better. Not a generic shopping assistant that just finds coupons, but a companion that **understands K-pop fan culture**: bias lines, photocard collecting, multi-stan struggles, and the unique joy (and financial pressure) of supporting multiple groups.

The inspiration struck: What if we could use **Chrome's built-in AI** to create a privacy-first shopping assistant that speaks our language? No sending cart data to external servers, no judgment about buying your 5th version of the same album—just honest, personalized guidance from an AI that gets it.

**Piggy Bong** (a playful nod to the "lightstick" concept every fandom knows) was born: your personal K-pop shopping companion that helps you stay true to your collection goals while being realistic about your budget.

---

## What it does

**Piggy Bong** is a Chrome extension that analyzes your K-pop shopping cart and provides **AI-powered insights** to help you make informed purchasing decisions. Here's what makes it special:

### 🎯 Core Features

**1. Smart Cart Analysis**
- Detects K-pop items in your cart (albums, photocards, lightsticks, merch)
- Uses **Chrome's Prompt API (Gemini Nano)** to analyze items against your preferences
- Identifies which items align with your favorite groups and collection priorities
- Provides personalized recommendations with clear reasoning

**2. Visual Priority System**
- Color-coded badges (green = Must-have, yellow = Nice-to-have, gray = Can skip)
- WCAG AAA compliant (7:1+ contrast ratios) for accessibility
- Clear visual hierarchy helps you quickly identify priorities

**3. Pattern Recognition**
- Tracks your cart history over time
- Identifies repeat items you keep adding but never buy
- Suggests when you might be impulse shopping vs. genuinely wanting something

**4. Smart Fan Tips**
- AI-generated contextual advice based on your cart composition
- Detects if you're buying from non-priority groups
- Gentle nudges about budget allocation
- Celebrates when your cart aligns perfectly with your goals

**5. Privacy-First Design**
- **All AI processing happens on-device** using Chrome's built-in Prompt API
- **Zero external API calls** for analysis
- All data stored locally in your browser
- No tracking, no data collection, no server uploads

### 🛠️ Technical Highlights

**Hybrid AI Architecture:**
- **JavaScript handles facts**: Item parsing, price calculations, pattern detection
- **AI handles creativity**: Personalized insights, tone, cultural context
- Result: Fast, reliable, and genuinely helpful recommendations

**Just-in-Time Onboarding:**
- Button appears on all K-pop shopping sites
- Only asks for preferences when you're ready to analyze your cart
- Industry best practice for higher user engagement

**Cultural Sensitivity:**
- Uses authentic K-pop terminology (bias, photocard, lineup, multi-stan)
- Supportive tone that never judges your fandom choices
- Celebrates your passion while being realistic about budgets

---

## How we built it

### Technology Stack

**Chrome Extension (Manifest V3)**
- Content scripts for cart detection and UI injection
- Service worker for background processing
- Modern modular architecture

**AI Integration**
- **Chrome Prompt API (Gemini Nano)** for on-device analysis
- Graceful fallback to simulated analysis if API unavailable
- Hybrid approach: JavaScript for facts, AI for insights

**Frontend**
- Vanilla JavaScript (no frameworks) for speed
- CSS3 with drag-and-drop floating button
- WCAG AAA accessibility compliance

**Build System**
- esbuild for module bundling
- Clean component architecture
- Development and production builds

### Development Process

**1. Research Phase**
- Studied existing shopping assistants (Honey, Rakuten, Capital One Shopping)
- Analyzed K-pop fan shopping behavior and pain points
- Researched Chrome AI API capabilities and limitations

**2. Architecture Design**
- Designed hybrid AI approach (JavaScript + AI)
- Planned privacy-first data flow
- Created modular component structure

**3. Implementation**
- Built core cart detection and item parsing
- Integrated Chrome Prompt API with fallback handling
- Developed visual badge system with WCAG AAA compliance
- Implemented pattern recognition for cart history
- Created Just-in-Time onboarding flow

**4. UX Refinement**
- Iterated on button placement and behavior
- Simplified empty cart messaging
- Refined AI prompts for cultural authenticity
- Added drag-and-drop functionality for user control

**5. Testing & Polish**
- Tested across multiple K-pop shopping sites
- Validated accessibility with contrast checkers
- Refined AI output tone and accuracy
- Prepared demo flow for video submission

---

## Challenges we ran into

### 1. **Chrome Prompt API Limitations**

**Challenge**: The Prompt API is experimental and not available on all Chrome versions/systems.

**Solution**: Built a **graceful fallback system** that simulates AI analysis using rule-based logic. Users get value even if the AI API isn't available, and we detect/notify when the full AI experience is ready.

**Code snippet**:
```javascript
async function analyzeWithAI(cartItems, preferences) {
  // Try Chrome Prompt API first
  if (window.ai && window.ai.languageModel) {
    try {
      const session = await window.ai.languageModel.create({
        systemPrompt: "You are a K-pop fan shopping assistant..."
      });
      return await session.prompt(analysisPrompt);
    } catch (error) {
      console.warn('Gemini Nano unavailable, using fallback');
    }
  }

  // Fallback to rule-based analysis
  return simulateAIAnalysis(cartItems, preferences);
}
```

### 2. **Cart Detection Across Different Sites**

**Challenge**: K-pop shopping sites have wildly different HTML structures, URL patterns, and cart implementations (ktown4u, choicemusicla, musicplaza, etc.).

**Initial approach**: Detect cart pages using URL patterns + page content indicators.

**Problem**: Home pages often have "Shopping Cart" in navigation menus, causing false positives.

**Final solution**: **Show button on ALL pages** (like Honey/Rakuten do). This ensures reliability across different site architectures and lets fans use it whenever they want advice.

### 3. **Balancing AI Creativity with Factual Accuracy**

**Challenge**: AI can hallucinate details about items (making up group names, prices, etc.).

**Solution**: **Hybrid architecture**
- JavaScript handles all facts: item names, prices, groups, categories
- AI only generates insights, tone, and personalization based on verified facts
- AI prompt explicitly instructs: "Base your analysis ONLY on the provided data"

**Result**: Zero hallucinations in testing, while maintaining helpful, personalized tone.

### 4. **Privacy vs. Functionality Trade-off**

**Challenge**: Shopping assistants typically send data to servers for processing, but that raises privacy concerns.

**Solution**: **On-device AI processing** using Chrome's Prompt API
- All analysis happens locally
- No external API calls
- localStorage for user preferences
- Transparent data usage (users can see exactly what's stored)

**Trade-off**: Slightly less powerful than GPT-4, but **100% private** and instant (no network latency).

### 5. **UI/UX for Empty Cart State**

**Challenge**: What should happen when users click the button but have an empty cart?

**Initial attempt**: Long explanation with "How it works" numbered list.

**User feedback**: Too wordy, not relatable.

**Final solution**: Short, friendly message:
```
Your cart is empty

Add items to your cart first! Then share your favorite groups
and what you collect, and I'll help you decide when you want it all.
```

Uses relatable language ("when you want it all") that K-pop fans understand deeply.

### 6. **Button Text That Resonates**

**Challenge**: Original text "Should I Buy This?" sounded judgmental/discouraging.

**Iterations**:
- ❌ "Help me choose! 💜" - Doesn't work for first-time users
- ❌ "Tell me your bias 💜" - Too specific
- ❌ "Set my Fan priority" - Too vague

**Final solution**: Two-line layout
```
Piggy Bong
K-pop Fan Companion
```

Simple, clear, not judgmental, works for all users.

---

## Accomplishments that we're proud of

### 🏆 **1. Successfully Integrated Chrome's Experimental Prompt API**

This is cutting-edge technology! We're among the first to build a real-world shopping assistant using **on-device AI**. The hybrid approach (JavaScript + AI) works beautifully and serves as a model for future privacy-first AI applications.

### 🎨 **2. WCAG AAA Accessibility Compliance**

Our badge system isn't just pretty—it's **7:1+ contrast ratio** compliant, making it accessible to users with visual impairments. We proved you can have beautiful design AND meet the highest accessibility standards.

### 🔒 **3. Privacy-First Architecture**

In an era of data breaches and privacy concerns, we built something that **never sends your shopping data anywhere**. Everything stays on your device. This is what ethical AI looks like.

### 🌏 **4. Cultural Authenticity**

We didn't just slap "K-pop" on a generic shopping tool. We:
- Use authentic terminology (bias, photocard, lineup, multi-stan)
- Understand fan culture (album versions, photocard collecting)
- Maintain a supportive, non-judgmental tone
- Celebrate fandom passion while being realistic about budgets

### ⚡ **5. Pattern Recognition Without Machine Learning**

Our cart history tracking identifies **repeat items you never buy** using pure JavaScript logic—no complex ML models needed. Sometimes the simplest solution is the most effective.

### 🎯 **6. Just-in-Time Onboarding That Actually Works**

Following industry best practices from Honey and Rakuten, we only ask for preferences when users need them. Result: Higher engagement, less friction, better UX.

### 🚀 **7. Clean, Modular Architecture**

Despite being a solo project, we maintained professional coding standards:
- Separation of concerns (UI, AI, utilities)
- esbuild for production bundling
- No external dependencies beyond Chrome APIs
- Easy to extend and maintain

---

## What we learned

### 💡 **1. Chrome's Built-in AI is Production-Ready (With Caveats)**

**The Good:**
- Gemini Nano is surprisingly capable for personalized recommendations
- On-device processing is **fast** (no network latency)
- Privacy benefits are huge

**The Challenges:**
- Still experimental (availability varies by Chrome version/system)
- Need robust fallbacks for reliability
- Prompt engineering is critical to avoid hallucinations

**Key Insight**: Hybrid approaches (AI + traditional logic) give you the best of both worlds.

### 🎨 **2. Accessibility Shouldn't Be an Afterthought**

We designed badges with WCAG AAA compliance from day one. It wasn't harder—it just required using proper color contrast tools. **Lesson**: Accessibility is easier when you build it in from the start, not bolt it on later.

### 🌍 **3. Cultural Context Makes or Breaks Niche Products**

Generic shopping assistants fail K-pop fans because they don't understand:
- Why someone would buy 4 versions of the same album
- The emotional significance of bias merchandise
- The multi-stan budgeting struggle

**Lesson**: Deep cultural understanding creates genuine value. You can't fake authenticity.

### 🔧 **4. Privacy and Functionality Aren't Opposites**

Traditional wisdom: "Send data to powerful servers for best results."

Our approach: "Process everything on-device with Chrome's built-in AI."

**Result**: We didn't sacrifice functionality for privacy. We got both.

**Lesson**: With modern browser APIs, you can build privacy-respecting tools that are just as powerful as cloud-based alternatives.

### 🎯 **5. UX Patterns from Industry Leaders Work**

We studied Honey, Rakuten, and Capital One Shopping. Their patterns (floating button, just-in-time onboarding, visual badges) work because they've been tested with millions of users.

**Lesson**: Don't reinvent the wheel. Learn from industry leaders, then adapt for your specific use case.

### 🧠 **6. AI Prompt Engineering is an Art Form**

Getting Gemini Nano to produce helpful, non-judgmental, culturally authentic recommendations required **dozens of prompt iterations**:

❌ **Bad prompt**: "Analyze this cart"
- Result: Generic, robotic output

✅ **Good prompt**: "You are a supportive K-pop fan friend helping another fan make smart shopping decisions. Never judge their choices, just help them prioritize..."
- Result: Warm, helpful, culturally aware recommendations

**Lesson**: The quality of AI output is 80% prompt engineering, 20% model capability.

### 📊 **7. Pattern Recognition Doesn't Always Need ML**

Our cart history feature identifies repeat items using simple JavaScript:
```javascript
if (itemAppearsInMultipleCarts && neverPurchased) {
  return "You've added this before but didn't buy it. Still want it?";
}
```

No TensorFlow, no neural networks—just logic.

**Lesson**: Solve problems with the simplest tool that works. Don't use ML because it's trendy; use it when it's the right tool.

### 🚀 **8. Solo Projects Can Have Professional Architecture**

Even as a one-person team, we maintained:
- Modular code structure
- Proper build pipeline
- Documentation
- Accessibility standards
- Professional commit messages

**Lesson**: Good engineering practices aren't just for big teams. They make YOUR life easier too.

---

## What's next for Piggy Bong - K-Pop Fan Shopping Companion

### 🎯 **Short-term Enhancements (Next 3 months)**

**1. Multi-language Support**
- Korean, Japanese, Chinese translations
- Auto-detect user language
- K-pop terms stay authentic in original language

**2. Budget Tracking**
- Set monthly K-pop spending limits
- Track purchases over time
- Visual dashboard of spending by group/category
- Budget alerts when approaching limits

**3. Release Calendar Integration**
- Sync with upcoming K-pop releases
- "Save for [Group] comeback in 2 weeks" suggestions
- Pre-order reminders
- Price comparison across sites

**4. Enhanced Pattern Recognition**
- Seasonal buying patterns (comeback seasons vs. quiet periods)
- Impulse buying detection (late-night shopping alerts)
- "You usually buy albums but not merch" insights
- Group preference drift tracking

### 🚀 **Medium-term Goals (6-12 months)**

**5. Community Features**
- Anonymous aggregate insights: "80% of fans prioritized this item"
- Trending items in your favorite groups
- "Other multi-stans who like [Group A] also collect from [Group B]"
- Privacy-preserving: No personal data shared, only anonymized patterns

**6. Price Drop Alerts**
- Track items you skipped due to price
- Notify when they go on sale
- Historical price data
- Best time to buy insights

**7. Collection Management**
- Track what you already own
- Avoid duplicate purchases
- Wishlist integration
- Photocard checklist for collectors

**8. Browser Sync**
- Encrypted sync across devices
- Same preferences on desktop/laptop/tablet
- Optional cloud backup with end-to-end encryption

### 🌟 **Long-term Vision (1-2 years)**

**9. Expanded Site Support**
- Auto-detect ANY K-pop shopping site (not just major ones)
- Support for international sites (Korean, Japanese sellers)
- eBay/Mercari integration for secondhand items
- Group order coordination tools

**10. Advanced AI Features** (as Chrome AI API matures)
- Image recognition for photocard identification
- Voice input: "Should I buy this BTS album?"
- Real-time price negotiation suggestions for auctions
- Personalized comeback budget planning

**11. Fandom-Specific Customization**
- Template preferences for different fandoms
- Concert ticket budget planning
- Fan event expense tracking
- Birthday fundraiser coordination

**12. Financial Wellness Integration**
- Partner with budgeting apps (Mint, YNAB)
- "Entertainment" budget category tracking
- Savings goal integration: "Save $50/month for [Group] tour tickets"
- Financial literacy resources for young fans

### 🔬 **Research & Exploration**

**13. Browser Compatibility**
- Edge, Brave, Opera support (Chromium-based)
- Safari extension (different architecture)
- Mobile browser extension (if APIs allow)

**14. Open Source Contributions**
- Publish core pattern recognition logic as library
- Share WCAG AAA badge system as reusable component
- Create Chrome AI integration tutorials
- Build community of contributors

**15. Academic Research**
- Study K-pop fan financial decision-making patterns
- Publish findings on ethical AI in e-commerce
- Partner with consumer behavior researchers
- Contribute to responsible AI guidelines

---

### 🎯 **Success Metrics We'll Track**

- **User Engagement**: How often fans use Piggy Bong per shopping session
- **Decision Quality**: % of users who report feeling more confident about purchases
- **Privacy Trust**: User surveys on data privacy comfort levels
- **Cart Accuracy**: % of items correctly categorized and analyzed
- **Financial Impact**: Self-reported budget adherence improvements
- **Cultural Authenticity**: Fan feedback on tone and terminology accuracy

---

### 💬 **We Want YOUR Input!**

Piggy Bong is built by fans, for fans. As we grow, we want to hear from YOU:

- What features would help you most?
- Which K-pop shopping sites should we support next?
- How can we make the AI insights more helpful?
- What privacy concerns do you have?

**Join the conversation**: [GitHub Issues](https://github.com/yourusername/piggybong-extension/issues)

---

### 🙏 **Thank You**

Thank you to the **Chrome AI Challenge 2025** organizers for pushing the boundaries of what's possible with browser-based AI. This challenge inspired us to build something that's not just technically innovative, but genuinely helpful to a community we love.

To the **K-pop fan community**: This is for you. May your carts be thoughtful, your budgets be respected, and your collections bring you joy. 💜

---

**Piggy Bong**: Because every fan deserves a shopping companion that gets it.

🐷 **Stay fan, stay smart, stay happy.**

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Chrome AI Team** for the Prompt API
- **K-pop fan community** for inspiration and feedback
- **Open source contributors** for tools and libraries used
- **You** for considering Piggy Bong for the Chrome AI Challenge 2025

---

_Built with 💜 by a multi-stan who's been there, done that, bought 5 versions of the album._
