# Piggy Bong Extension - Refactoring Plan

## Current Status

**Completed:**
✅ Directory structure created
✅ `utils/personalization.js` - PersonalizationHelper module
✅ `utils/helpers.js` - Cart detection and helper functions
✅ `extractors/ktown4u.js` - Ktown4u cart extraction
✅ `extractors/weverse.js` - Weverse cart extraction
✅ `extractors/generic.js` - Generic fallback extraction
✅ `ai/analyzeWithAI.js` - AI analysis with Gemini Nano
✅ `ui/floatingButton.js` - Floating button with drag/close

**Remaining:**
⏳ `ui/modal.js` - Modal UI (onboarding + analysis)
⏳ `extractors/index.js` - Main extractor coordinator
⏳ `index.js` - Main entry point

---

## File Structure

```
/src/content/
├─ index.js                    → Main entry (IIFE wrapper, init logic)
├─ ui/
│   ├─ floatingButton.js       → ✅ Button creation, drag, close, state
│   └─ modal.js                → Onboarding + analysis modals
├─ extractors/
│   ├─ index.js                → Coordinator (calls site-specific extractors)
│   ├─ ktown4u.js              → ✅ Ktown4u-specific extraction
│   ├─ weverse.js              → ✅ Weverse extraction
│   └─ generic.js              → ✅ Generic fallback
├─ ai/
│   └─ analyzeWithAI.js        → ✅ AI session + prompt
└─ utils/
    ├─ personalization.js      → ✅ localStorage helper
    └─ helpers.js              → ✅ isCartPage, getCartItemCount, etc.
```

---

## Remaining Files to Create

### 1. `extractors/index.js` (Coordinator)

**Purpose:** Central point that calls site-specific extractors

**Exports:**
- `extractProductInfo(pageText)` - Routes to correct extractor

**Logic:**
```javascript
import { extractKtown4uCart } from './ktown4u.js';
import { extractWeverseCart } from './weverse.js';
import { extractGenericCart } from './generic.js';

export function extractProductInfo(pageText) {
  const hostname = window.location.hostname;

  if (hostname.includes('ktown4u')) {
    return extractKtown4uCart() || extractGenericCart(pageText);
  } else if (hostname.includes('weverse')) {
    return extractWeverseCart() || extractGenericCart(pageText);
  }

  return extractGenericCart(pageText);
}
```

---

### 2. `ui/modal.js` (Modal UI Logic)

**Purpose:** All modal-related UI (onboarding, analysis, fallback)

**Exports:**
- `showOnboardingModal(callback)` - First-time setup
- `showAnalysisModal(pageText, pageUrl)` - Main analysis modal
- `showPiggyBongModal(pageText, pageUrl)` - Entry point (checks if onboarding needed)

**Key Sections:**
- Onboarding modal HTML (lines 376-456 in original)
- Analysis modal HTML (lines 527-557 in original)
- `runAIAnalysis()` function (lines 603-699 in original)
- Settings button handler
- Close/escape key handlers

---

### 3. `index.js` (Main Entry Point)

**Purpose:** IIFE wrapper, initialization, MutationObserver, message listener

**Structure:**
```javascript
import { isCartPage, getCartItemCount } from './utils/helpers.js';
import { createFloatingButton, updateButtonState, handleEmptyCartClick } from './ui/floatingButton.js';
import { showPiggyBongModal } from './ui/modal.js';

(function() {
  'use strict';

  // Prevent duplicate initialization
  if (document.getElementById('piggybong-floating-btn')) {
    return;
  }

  // Init function
  function initializePiggyBong() {
    if (!isCartPage()) {
      console.log('🐷 Not a cart page - button will not be shown');
      return;
    }

    console.log('🐷 Cart page detected! Initializing button...');
    createFloatingButton(showPiggyBongModal);
    updateButtonState();

    const floatingBtn = document.getElementById('piggybong-floating-btn');
    if (floatingBtn) {
      floatingBtn.addEventListener('click', handleEmptyCartClick, true);
    }
  }

  // MutationObserver for dynamic cart detection
  let reCheckTimeout = null;
  function scheduleReCheck() {
    clearTimeout(reCheckTimeout);
    reCheckTimeout = setTimeout(() => {
      console.log('🐷 Re-checking cart state...');
      // Re-check and update
    }, 2000);
  }

  const observer = new MutationObserver((mutations) => {
    const hasSignificantChange = mutations.some(mutation =>
      mutation.type === 'childList' ||
      (mutation.type === 'characterData' && mutation.target.textContent.length > 10)
    );
    if (hasSignificantChange) {
      scheduleReCheck();
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    console.log('🐷 MutationObserver started - watching for dynamic cart updates');
  }

  // Init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePiggyBong);
  } else {
    initializePiggyBong();
  }

  // Chrome runtime message listener (from toolbar)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openModal") {
      // Handle toolbar click
    }
    return true;
  });

  console.log('🐷 Piggy Bong: Content script loaded');
})();
```

---

## Next Steps

**Option A: Complete Refactoring**
1. Create `extractors/index.js`
2. Create `ui/modal.js` (large file ~300 lines)
3. Create `index.js` entry point
4. Update `manifest.json` to point to `src/content/index.js`
5. Test all functionality

**Option B: Hybrid Approach**
- Keep current monolithic `content.js`
- Use modular files as reference for future changes
- Gradually migrate sections over time

**Option C: Stop Here**
- Use completed modules (AI, extractors, helpers) in other projects
- Document the refactoring for future reference

---

## Testing Checklist

After full refactoring, verify:
- [ ] Button appears on cart pages only
- [ ] Button can be dragged and snaps to edges
- [ ] Close button works
- [ ] Modal opens with onboarding (first time)
- [ ] Settings button re-opens onboarding
- [ ] AI analysis runs and displays items
- [ ] Priority badges show (HIGH/MEDIUM/LOW)
- [ ] Site-specific extractors work (ktown4u, weverse)
- [ ] Generic fallback works on unknown sites
- [ ] Toolbar icon toggles modal
- [ ] Empty cart shows appropriate message
- [ ] All console logs remain identical
- [ ] localStorage keys unchanged
- [ ] CSS classes unchanged (UI looks identical)

---

## Notes

- **UI Preservation:** All HTML structure, CSS classes, inline styles, aria attributes, and text content remain 100% identical
- **Behavior Preservation:** All event handlers, drag logic, modal animations, keyboard shortcuts work exactly the same
- **Debugging:** All `console.log('🐷 ...')` statements preserved for consistency
- **No Functional Changes:** This is a pure structural refactor - no AI prompt changes, no logic updates

---

## Risks & Mitigation

**Risk:** ES modules might have import issues in Chrome extensions
**Mitigation:** Use bundler (e.g., esbuild, webpack) or keep as IIFE

**Risk:** Breaking drag/modal interactions during extraction
**Mitigation:** Test each UI component independently after extraction

**Risk:** Lost context in split files
**Mitigation:** Each file has clear comments explaining its purpose

---

## Recommendation

Given the size of `modal.js` (~300 lines) and `index.js` (~200 lines), and the need to ensure zero breakage, I recommend:

1. **Complete the 3 remaining files** if you want full modularization now
2. **OR use the completed modules** as standalone utilities and keep main flow in monolithic file
3. **Test thoroughly** before deploying - drag, modal, AI, extraction all working

Would you like me to:
- A) Complete all 3 remaining files now?
- B) Create just the extractor coordinator (quick win)?
- C) Stop here and document what's been done?
