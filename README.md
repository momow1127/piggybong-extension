# 🐷 Piggy Bong - K-pop Collection Alignment Specialist

> An AI-powered Chrome Extension that helps K-pop fans make mindful collection decisions using Chrome's built-in Gemini Nano AI.

**Submission for Google Chrome Built-in AI Challenge 2025**

---

## 🎯 Problem We're Solving

K-pop fans face a unique challenge: **FOMO-driven impulse buying**. With constant limited editions, multiple album versions, and exclusive merchandise drops, fans often struggle to distinguish between genuine collection goals and emotional impulses.

**Piggy Bong** acts as a supportive companion that helps fans pause and reflect before making purchases, promoting mindful collecting without judgment.

---

## ✨ Features

### 🤖 AI-Powered Priority Assessment
- Uses **Chrome's Prompt API** with Gemini Nano for on-device, privacy-safe analysis
- Evaluates purchases on a 0-100 scale: Collection Goal → FOMO Buy
- Provides transparent reasoning explaining the priority score

### 📊 Visual Priority Meter
- Phia-style visual meter showing where purchases fall on the FOMO spectrum
- Color-coded badges (green/yellow/red) for quick assessment
- Clear "Why This Score?" explanation for transparency

### 💭 Supportive Guidance
- Warm, non-judgmental reflections tailored to K-pop collecting culture
- Avoids financial shame language (no "budget," "expensive," "afford")
- Uses collection-positive terms: "priority," "collection goals," "must-haves"

### 🎨 Non-Disruptive UX
- Context-aware: Only appears on K-pop shopping sites
- Compact top-right panel (doesn't block checkout pages)
- Floating "Should I Buy This?" button with Piggy Bong branding

---

## 🛠 Chrome Built-in AI API Used

### **Prompt API** ✅

We use the **Prompt API** (LanguageModel API) because our use case requires:

1. **Custom System Prompt** - Piggy Bong's personality and cultural context
2. **Structured JSON Responses** - Priority levels, reasoning, and reflections
3. **Context-Aware Decision Making** - Understanding FOMO vs genuine collection goals
4. **Conversational Guidance** - Supportive, culturally-aware recommendations

**Why not Summarizer API?** - We need decision-making analysis, not just text summarization.

---

## 🚀 Installation & Testing Instructions for Judges

### Prerequisites

1. **Chrome Canary** (required for Gemini Nano access)
   - Download: https://www.google.com/chrome/canary/

2. **Enable Gemini Nano AI**
   ```
   Step 1: Open chrome://flags/#optimization-guide-on-device-model
   Step 2: Select "Enabled BypassPerfRequirement"
   Step 3: Open chrome://flags/#prompt-api-for-gemini-nano
   Step 4: Select "Enabled"
   Step 5: Relaunch Chrome Canary
   Step 6: Open chrome://components/
   Step 7: Find "Optimization Guide On Device Model" and click "Check for update"
   Step 8: Wait for download (may take several minutes)
   ```

3. **Activate Prompt API**
   ```
   Step 1: Open chrome://on-device-internals/
   Step 2: Find "PromptApi" setting
   Step 3: Set to "true"
   Step 4: Verify status shows "Ready"
   ```

### Install Extension

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/piggybong-extension.git
   cd piggybong-extension
   ```

2. Load extension in Chrome Canary:
   ```
   Step 1: Open chrome://extensions/
   Step 2: Enable "Developer mode" (top-right toggle)
   Step 3: Click "Load unpacked"
   Step 4: Select the piggybong-extension folder
   Step 5: Verify "Piggy Bong" extension appears in list
   ```

### Testing the Extension

1. **Visit a K-pop shopping site** (extension only activates on these domains):
   - https://www.ktown4u.com/
   - https://weverse.io/
   - https://cokodive.com/
   - https://musicplaza.com/
   - https://yesasia.com/

2. **Look for the floating button** in the bottom-right corner:
   - Purple gradient button with Piggy Bong logo
   - Text reads "Should I Buy This?"

3. **Click the button** to trigger AI analysis:
   - Compact panel slides in from top-right
   - Loading spinner appears while AI processes
   - Results display in ~3-5 seconds

4. **Review AI Analysis**:
   - **Product Card**: Extracted product name and price
   - **Priority Meter**: Visual 0-100 scale with indicator
   - **Badge**: Collection Priority / Consider Carefully / FOMO Alert
   - **Why This Score?**: AI's reasoning for the priority level
   - **Reflection**: Supportive guidance based on analysis

5. **Close the panel**:
   - Click the X button in header
   - Click outside the panel (on the overlay)

### Troubleshooting

**Issue: Button doesn't appear**
- Check you're on a supported K-pop shopping site
- Verify extension is enabled in chrome://extensions/
- Reload the page

**Issue: "AI not available" error**
- Verify PromptApi is set to "true" at chrome://on-device-internals/
- Check Gemini Nano is downloaded at chrome://components/
- Restart Chrome Canary

**Issue: "Price not found"**
- This is expected behavior if the page doesn't display prices clearly
- AI will still provide analysis based on product context

---

## 📁 Project Structure

```
piggybong-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── content.js             # Main logic: button injection, AI analysis
├── floating-button.css    # Styling for button and panel
├── popup.html            # Browser popup (fallback UI)
├── popup.js              # Popup logic
├── styles.css            # Popup styling
├── piggybong.png         # Extension logo
├── LICENSE               # MIT License
└── README.md             # This file
```

### Key Files

- **content.js** (lines 207-275): AI integration with Prompt API
- **content.js** (lines 159-190): Multi-currency product extraction
- **floating-button.css** (lines 88-131): Compact panel styling
- **manifest.json** (lines 23-39): K-pop site targeting

---

## 🎨 Design Philosophy

### UX Pattern: Context-Aware Shopping Assistant
We follow the proven pattern used by successful shopping extensions (Honey, Phia, Rakuten):
- ✅ Floating button for high visibility
- ✅ Appears only on relevant sites (not disruptive)
- ✅ Compact side panel (doesn't block checkout)
- ✅ One-click access to insights

### Cultural Sensitivity
- Uses K-pop fan terminology ("bias," "photocard," "collection")
- Avoids financial shame language
- Focuses on alignment with collecting goals, not budget
- Warm, supportive tone (never judgmental)

### Privacy-First
- All AI processing happens **on-device** with Gemini Nano
- No data sent to external servers
- No user tracking or analytics
- No login required

---

## 🏆 Why Piggy Bong for Chrome AI Challenge 2025

### Innovation
- **First-of-its-kind** K-pop collecting assistant
- **Novel use case** for Prompt API: emotional/behavioral analysis
- **Cultural expertise** embedded in AI system prompt

### Technical Excellence
- Multi-currency price detection (USD, KRW, EUR, GBP, 원)
- Structured JSON response parsing with fallback handling
- Context-aware content script injection
- Transparent AI reasoning ("Why This Score?" section)

### User Impact
- Addresses real problem faced by millions of K-pop fans
- Promotes healthier collecting habits
- Privacy-safe (no data leaves device)
- Accessible (free, no signup required)

### Scalability
- Pattern extends to other collecting communities (trading cards, sneakers, etc.)
- Multi-language support possible (Korean, Japanese, Chinese)
- Additional APIs could enhance features (Translator for Korean sites)

---

## 🔮 Future Enhancements

- **Wishlist Tracking**: Compare purchases against saved collection goals
- **Spending Insights**: Monthly collection priority trends (local storage)
- **Community Features**: Anonymous FOMO pattern insights
- **Multi-Language**: Korean/Japanese support using Translator API
- **Smart Reminders**: "Still want this after 24 hours?" prompts

---

## 👥 Team

[Your Name/Team Name Here]

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- Google Chrome Team for the Built-in AI Challenge 2025
- K-pop fan community for inspiring this project
- Phia for UX inspiration

---

## 📞 Contact

- **Email**: [Your Email]
- **Devpost**: [Your Devpost Profile]
- **Demo Video**: [YouTube/Vimeo Link]

---

**Built with ❤️ for the K-pop collecting community**
