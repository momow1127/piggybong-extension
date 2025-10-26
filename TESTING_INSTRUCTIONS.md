# Piggy Bong - Testing Instructions

**Chrome AI Challenge 2025 Submission**

---

## 🎯 What Problem Is This Submission Addressing?

### The Core Problem

**K-pop fans face a unique and emotionally challenging shopping dilemma**: When browsing merchandise sites, they fall in love with everything (albums, photocards, lightsticks, clothing) from multiple groups, fill their carts with items totaling hundreds of dollars, and then face an agonizing decision: *"What do I actually buy?"*

### Why This Problem Matters

**1. Financial Pressure**
- K-pop fans (especially younger fans, students) have limited budgets
- Supporting multiple groups (multi-stans) compounds the problem
- New releases are constant (comebacks, special editions, concerts)
- FOMO drives impulse purchases that strain finances

**2. Emotional Conflict**
- Fans feel guilty choosing one group over another
- Fear of missing limited editions creates urgency
- Social pressure from fan communities to "support" groups
- Decision paralysis leads to abandoned carts or regretful purchases

**3. Current Solutions Fall Short**
- **Generic shopping assistants** (Honey, Rakuten): Only find coupons, don't understand K-pop fan priorities
- **Price comparison tools**: Help find deals but don't address the "which item" question
- **Friends/group chats**: Asking "should I buy this?" gets biased responses or adds social pressure
- **Spreadsheets**: Some fans track collections, but it's manual and doesn't integrate with shopping

### Why Existing AI Assistants Don't Help

- **ChatGPT/Claude**: Require copying cart details, privacy concerns, no real-time integration
- **Server-based AI**: Sending shopping data externally raises privacy red flags
- **Generic advice**: AI without K-pop cultural context gives irrelevant suggestions

### The Gap We're Filling

**What K-pop fans need**: A **privacy-first, culturally-aware shopping companion** that:
1. Understands K-pop terminology and collecting culture
2. Provides personalized recommendations based on their bias/preferences
3. Helps prioritize items when budget < desire
4. Never judges their fandom choices
5. Keeps all data private (no external servers)

### How Piggy Bong Solves This

**Using Chrome's Built-in AI (Prompt API)**, we created a shopping assistant that:

✅ **Analyzes carts in real-time** - No manual data entry
✅ **Runs on-device** - Zero privacy concerns, instant results
✅ **Speaks K-pop language** - Bias, photocard, lineup, multi-stan
✅ **Provides clear priorities** - Visual badges (Must-have, Nice-to-have, Skip)
✅ **Learns patterns** - Tracks repeat items you never buy (impulse detection)
✅ **Supportive tone** - Celebrates your passion, helps you be realistic

### Real-World Impact

**For fans**:
- Reduce financial stress from K-pop shopping
- Feel confident about purchase decisions
- Stay true to collection goals
- Avoid buyer's remorse

**For the Chrome AI ecosystem**:
- Demonstrates **privacy-first AI** in e-commerce
- Showcases **hybrid AI approach** (JavaScript facts + AI insights)
- Proves **on-device AI** can compete with cloud-based solutions
- Model for **culturally-aware AI applications**

---

## 🧪 Quick Start Testing Guide

### Prerequisites

**Chrome Browser Setup:**
- Chrome Canary 128+ (for Gemini Nano support)
- Enable Chrome AI:
  1. Go to `chrome://flags/#optimization-guide-on-device-model`
  2. Select "Enabled BypassPerfRequirement"
  3. Go to `chrome://flags/#prompt-api-for-gemini-nano`
  4. Enable "Enabled"
  5. Restart Chrome
  6. Visit `chrome://components/` → Find "Optimization Guide On Device Model" → Click "Check for update"
  7. Wait for Gemini Nano to download (may take 5-10 minutes)

**Installation:**
1. Download extension from GitHub: https://github.com/momow1127/piggybong-extension
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `piggybong-extension` folder
6. Look for floating button on K-pop shopping sites

---

## 🎬 Simple 9-Step Test Flow

**1. Install the Extension**
   - Load unpacked via Chrome Developer Mode
   - Extension icon appears in toolbar

**2. Go to a K-pop Shopping Site**
   - Visit: ktown4u.com, weverse.io, choicemusicla.com, musicplaza.com, or kpoptown.com
   - Floating "Piggy Bong" button appears in bottom-right corner

**3. Add Items to Your Cart**
   - Add 3-5 K-pop items (albums, photocards, lightsticks)
   - Mix items from different groups for best demo

**4. Click the Piggy Bong Floating Button**
   - Button disappears
   - Modal slides in from right side

**5. Set Your Preferences (First Time Only)**
   - Enter your favorite K-pop groups (e.g., "NewJeans", "BLACKPINK", "SHINee")
   - Select priority item types (Albums, Photocards, Lightstick, etc.)
   - Click "Save & Continue"

**6. Wait for AI Analysis (3-5 seconds)**
   - "Analyzing your cart..." loading screen appears
   - Gemini Nano AI generates personalized insights

**7. Review Your Priority Report**
   - Each item gets a priority badge:
     - **Top Priority** - Matches your lineup perfectly
     - **Discovery** - New groups outside your collection
     - **Multi-Stan** - Items from multiple groups
     - **Core Lineup** - Essential for your collection
   - Overall Insight explains badges (e.g., "Three Top Priority NewJeans items. Perfect for your lineup!")
   - Smart Fan Tip shows shopping patterns (if available)

**8. Edit Preferences Anytime**
   - Click settings gear icon (top-right of modal)
   - Update lineup or priorities
   - Click "Save Changes" → Re-analyzes with new preferences
   - Or click back button (←) → Returns to cached analysis

**9. Make Your Decision**
   - Focus on Top Priority items if budget is tight
   - Discovery items = exploring new groups
   - Close modal → Button reappears

---

## 🎯 Try Demo Mode (No Cart Needed)

**For quick testing without adding items:**

1. Clear your cart (or start with empty cart)
2. Click floating button
3. See "Smart Shopping Starts Here" modal
4. Click **"Try Demo"** button
5. See mock analysis with NewJeans, aespa, BLACKPINK items
6. Click "Set My Preferences" to customize
7. Add real items to test with your own preferences

---

### Test Scenario 1: New User Experience (Empty Cart)

**Goal**: Test onboarding flow and empty cart handling

**Steps**:
1. **Clear all data** (simulate new user):
   - Open DevTools Console (F12)
   - Run:
     ```javascript
     localStorage.clear();
     console.log('✅ All user data cleared');
     location.reload();
     ```

2. **Navigate to supported K-pop site**:
   - ktown4u.com
   - choicemusicla.com
   - musicplaza.com
   - Or any K-pop merchandise site

3. **Verify floating button appears**:
   - Look for "Piggy Bong" button in bottom-right corner
   - Button should show:
     - 🐷 Logo
     - "Piggy Bong" (title)
     - "K-pop Fan Companion" (subtitle)
     - Drag handle (6 dots, visible on hover)

4. **Test empty cart behavior**:
   - Ensure shopping cart is empty
   - Click the "Piggy Bong" button
   - **Expected result**:
     - Button disappears
     - Modal appears with:
       - 🛒 icon
       - "Your cart is empty" heading
       - Clear message: "Add items to your cart first! Then share your favorite groups and what you collect, and I'll help you decide when you want it all."
       - "Got it!" button

5. **Close empty cart modal**:
   - Click "Got it!" button
   - **Expected result**:
     - Modal closes
     - Floating button reappears in same position

**✅ Success Criteria**:
- Button appears on all pages (not just cart pages)
- Empty cart modal shows friendly, non-judgmental message
- Button hide/show behavior works correctly
- No console errors

---

### Test Scenario 2: First-Time Analysis (With Items in Cart)

**Goal**: Test just-in-time onboarding and AI analysis

**Steps**:
1. **Add items to cart**:
   - Browse ktown4u.com or choicemusicla.com
   - Add 5-8 K-pop items to cart:
     - Mix of albums, photocards, lightsticks, merch
     - Include items from different groups (e.g., BTS, BLACKPINK, Stray Kids)
     - Vary price points ($10-$50 items)

2. **Navigate to cart page** (or stay on any page):
   - Cart should show items
   - Floating button should still be visible

3. **Click "Piggy Bong" button**:
   - **Expected result**:
     - Button disappears
     - Onboarding modal appears (first-time users)
     - Modal shows:
       - "Welcome! Let's personalize your experience"
       - Favorite groups input (chips UI)
       - Collection priorities checkboxes (Albums, Photocards, Lightsticks, etc.)
       - "Analyze My Cart" button

4. **Fill in preferences**:
   - **Favorite groups**: Type "BTS", click chip to add. Add 2-3 groups.
   - **What do you collect?**: Check 2-3 options (e.g., Albums, Photocards)
   - Click "Analyze My Cart"

5. **Verify AI analysis**:
   - **Expected result**:
     - Onboarding modal closes
     - Analysis modal appears showing:
       - Cart items listed with details (name, price, group)
       - Color-coded badges:
         - 🟢 **Must-have** (green) - Items matching your favorites
         - 🟡 **Nice-to-have** (yellow) - Secondary priorities
         - ⚪ **Can skip** (gray) - Items from non-priority groups
       - AI-generated reasoning for each badge
       - **Smart Fan Tips** section at top with personalized insights
       - Total cart value
       - Close button (×)

6. **Verify badge accuracy**:
   - Items from your favorite groups → Green badges
   - Items matching your collection priorities → Green/Yellow
   - Items from non-favorite groups → Gray badges
   - AI reasoning should reference your preferences

7. **Test Smart Fan Tips**:
   - Tips should be:
     - Personalized (mention your groups by name)
     - Supportive tone (not judgmental)
     - Actionable (specific advice)
   - Examples:
     - "Great choices! Your cart aligns well with your BTS collection goals."
     - "You have items from groups outside your favorites. Consider if these are impulse buys."
     - "Your photocard picks look solid for your collection."

8. **Close analysis modal**:
   - Click × button
   - **Expected result**:
     - Modal closes
     - Floating button reappears

**✅ Success Criteria**:
- Onboarding only appears for first-time users (no preferences saved)
- AI analysis accurately reflects user preferences
- Badges are color-coded correctly (green = favorites, yellow = secondary, gray = skip)
- Smart Fan Tips are personalized and relevant
- Modal UI is clean, readable, accessible
- No console errors or AI hallucinations (verify item details match actual cart)

---

### Test Scenario 3: Returning User (Preferences Already Set)

**Goal**: Test skipping onboarding for returning users

**Steps**:
1. **Ensure preferences are saved** (from Test Scenario 2)
   - Check DevTools → Application → Local Storage
   - Should see `piggybongPreferences` with your groups/priorities

2. **Modify cart**:
   - Add 2-3 new items (different groups)
   - Remove 1-2 items from previous test

3. **Click "Piggy Bong" button**:
   - **Expected result**:
     - Onboarding modal **should NOT appear** (preferences exist)
     - Analysis modal appears directly
     - Shows updated cart with new items
     - Badges reflect saved preferences

4. **Verify preferences persistence**:
   - Badges should use your previously saved favorite groups
   - Collection priorities should match what you selected before
   - Smart Fan Tips should reference your known preferences

**✅ Success Criteria**:
- Onboarding skipped for returning users
- Preferences loaded correctly from localStorage
- Analysis reflects saved preferences without re-asking
- New cart items analyzed accurately

---

### Test Scenario 4: Pattern Recognition (Cart History)

**Goal**: Test repeat item detection

**Steps**:
1. **Analyze cart multiple times** (same items):
   - Add 5 items to cart
   - Click "Piggy Bong" → Analyze
   - Close modal
   - **Do NOT purchase items**
   - Refresh page
   - Click "Piggy Bong" → Analyze again

2. **Repeat 3-5 times** (simulate adding same items repeatedly):
   - Each time, click analyze without purchasing
   - Extension tracks cart history in localStorage

3. **Check for pattern detection**:
   - After 3+ analyses of same items, Smart Fan Tips should include:
     - "You've looked at [Item Name] multiple times. Still interested?"
     - Gentle nudge about items you keep adding but not buying

4. **Verify cart history storage**:
   - DevTools → Application → Local Storage
   - Check `piggybongCartHistory` (should be an array of cart snapshots)

**✅ Success Criteria**:
- Extension tracks cart history over time
- Repeat items are detected
- Smart Fan Tips adapt to show pattern insights
- No performance issues with history storage

---

### Test Scenario 5: Drag-and-Drop Button Positioning

**Goal**: Test floating button repositioning

**Steps**:
1. **Locate floating button** (bottom-right by default)

2. **Hover over button**:
   - Drag handle (6 dots) should appear on left side
   - Cursor should change to "grab" icon

3. **Drag button to new position**:
   - Click and hold on button
   - Cursor changes to "grabbing"
   - Drag to different corner (e.g., bottom-left)
   - Release mouse

4. **Verify position saved**:
   - Refresh page
   - **Expected result**: Button appears in new position (saved to localStorage)

5. **Test boundary constraints**:
   - Try dragging outside viewport
   - Button should stay within visible area (10px padding)

**✅ Success Criteria**:
- Button is draggable
- Cursor changes correctly (grab → grabbing)
- Position persists across page reloads
- Button stays within viewport boundaries

---

### Test Scenario 6: Accessibility (WCAG AAA Compliance)

**Goal**: Verify accessibility standards

**Steps**:
1. **Test badge contrast**:
   - Open analysis modal with color-coded badges
   - Use browser DevTools → Accessibility panel
   - Check contrast ratios:
     - Green badge (#10b981 on white): Should be **7:1+**
     - Yellow badge (#f59e0b on white): Should be **7:1+**
     - Gray badge (#6b7280 on white): Should be **7:1+**

2. **Test keyboard navigation**:
   - Press `Tab` key to navigate UI
   - Focus should be visible on all interactive elements
   - Press `Escape` to close modal (should work)

3. **Test screen reader** (optional, if available):
   - Enable screen reader (NVDA, JAWS, or macOS VoiceOver)
   - Navigate through modal
   - All text should be readable
   - Badges should announce color + text

**✅ Success Criteria**:
- All badges meet WCAG AAA contrast ratio (7:1+)
- Keyboard navigation works without mouse
- Focus indicators are visible
- No accessibility errors in DevTools

---

### Test Scenario 7: Privacy & Data Handling

**Goal**: Verify no external API calls for analysis

**Steps**:
1. **Open DevTools → Network tab**
   - Filter: "All" or "Fetch/XHR"

2. **Analyze cart with Piggy Bong**:
   - Add items to cart
   - Click "Piggy Bong" → Analyze

3. **Monitor network activity**:
   - **Expected result**:
     - No outbound API calls to external AI services (OpenAI, Anthropic, etc.)
     - Only local Chrome Prompt API usage (on-device)
     - No cart data sent to external servers

4. **Verify localStorage usage**:
   - DevTools → Application → Local Storage
   - Check stored data:
     - `piggybongPreferences`: User's favorite groups and priorities
     - `piggybongCartHistory`: Cart snapshots (item names, prices, dates)
     - `piggybongButtonPosition`: Last dragged position (x, y coordinates)
   - **Confirm**: No sensitive payment info, no tracking IDs

**✅ Success Criteria**:
- Zero external API calls during analysis
- All AI processing happens on-device
- localStorage data is minimal and non-sensitive
- No tracking or analytics sent externally

---

### Test Scenario 8: Gemini Nano Availability Check

**Goal**: Test graceful fallback when Prompt API unavailable

**Steps**:
1. **Disable Prompt API** (simulate unavailable):
   - DevTools Console
   - Run:
     ```javascript
     // Temporarily disable AI
     window.ai = undefined;
     ```

2. **Analyze cart**:
   - Click "Piggy Bong" → Analyze
   - **Expected result**:
     - Extension uses **fallback mode** (rule-based analysis)
     - Still provides badges and recommendations
     - Smart Fan Tips use simpler logic
     - Console shows: "Gemini Nano unavailable, using fallback"

3. **Re-enable and test**:
   - Reload page (restores `window.ai`)
   - Analyze cart again
   - **Expected result**: Full AI analysis with richer insights

**✅ Success Criteria**:
- Fallback mode works without errors
- Users still get value even without AI
- Clear console messaging about fallback usage
- No crashes or blank screens

---

### Test Scenario 9: Multi-Site Compatibility

**Goal**: Verify extension works across different K-pop shopping sites

**Supported Sites**:
- ktown4u.com
- choicemusicla.com
- musicplaza.com
- kpopmart.com
- kpoptown.com

**Steps**:
1. **Test on each site**:
   - Navigate to site
   - Verify floating button appears
   - Add items to cart
   - Test analysis modal

2. **Check cart detection**:
   - Different sites have different HTML structures
   - Verify extension correctly:
     - Detects cart items
     - Parses item names
     - Extracts prices
     - Identifies groups (when possible)

**✅ Success Criteria**:
- Button appears on all supported sites
- Cart parsing works despite different HTML structures
- No site-specific bugs or crashes

---

### Test Scenario 10: Edge Cases & Error Handling

**Goal**: Test robustness

**Edge Cases**:

**A. Very large cart (20+ items)**
   - Add 20-30 items to cart
   - Click analyze
   - **Expected**: Modal should scroll, no performance issues

**B. Items without clear group names**
   - Add generic K-pop merch (keychains, posters without group info)
   - **Expected**: Extension should handle gracefully, may show gray badges

**C. Empty preferences**
   - Clear preferences but keep cart
   - Click analyze
   - **Expected**: Onboarding modal appears again

**D. Special characters in group names**
   - Add groups with special characters: "TXT (투모로우바이투게더)"
   - **Expected**: No parsing errors, displays correctly

**E. Network offline**
   - Disconnect internet
   - Use extension
   - **Expected**: Still works (on-device AI), no crashes

**✅ Success Criteria**:
- Extension handles edge cases gracefully
- No crashes or blank screens
- Error messages are user-friendly
- Performance remains smooth with large datasets

---

## 📊 Expected Test Results Summary

| Test Scenario | Expected Outcome | Pass/Fail |
|---------------|------------------|-----------|
| 1. New User (Empty Cart) | Friendly empty cart message, button hide/show works | ☐ |
| 2. First-Time Analysis | Onboarding → AI analysis with color-coded badges | ☐ |
| 3. Returning User | Skips onboarding, loads saved preferences | ☐ |
| 4. Pattern Recognition | Detects repeat items, shows insights | ☐ |
| 5. Drag-and-Drop | Button repositions, persists across reloads | ☐ |
| 6. Accessibility | WCAG AAA contrast, keyboard nav works | ☐ |
| 7. Privacy & Data | No external API calls, localStorage only | ☐ |
| 8. Gemini Nano Fallback | Works without Prompt API (fallback mode) | ☐ |
| 9. Multi-Site Compatibility | Works on all supported K-pop sites | ☐ |
| 10. Edge Cases | Handles large carts, special chars, offline mode | ☐ |

---

## 🐛 Known Limitations

1. **Gemini Nano Availability**: Requires Chrome 127+ with Prompt API enabled. Users on older versions get fallback mode (rule-based analysis).

2. **Cart Parsing**: Some sites have complex HTML structures. Extension does best-effort parsing but may miss items on unsupported sites.

3. **Group Detection**: AI attempts to identify K-pop groups from item names, but generic merch may not have clear group attribution.

4. **Language Support**: Currently English only. Multi-language support planned for future releases.

---

## 💡 Troubleshooting

**Issue**: Button doesn't appear
- **Solution**: Check if site is in supported domain list (manifest.json → `matches`)

**Issue**: "Your cart is empty" even with items
- **Solution**: Cart HTML structure may not be recognized. Check console for errors.

**Issue**: AI analysis seems generic (not personalized)
- **Solution**: Verify preferences are saved (DevTools → localStorage → `piggybongPreferences`)

**Issue**: Badges are all gray
- **Solution**: Ensure favorite groups are spelled correctly, AI may not recognize variations

**Issue**: Console error "window.ai is undefined"
- **Solution**: Enable Prompt API flag in `chrome://flags`, restart Chrome

---

## 📞 Support & Feedback

For bugs, feature requests, or testing feedback:
- **GitHub Issues**: [Link to repository issues]
- **Email**: [Your contact email]
- **Discord**: [Community server link]

---

**Thank you for testing Piggy Bong!** Your feedback helps us build a better shopping companion for the K-pop fan community. 💜

---

_Built with 🐷 for K-pop fans everywhere._
