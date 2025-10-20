# Chrome Built-in AI Setup for Piggy Bong

## Current Issue
`window.ai` is undefined even with flags enabled in Chrome Canary 143.

## Required Setup

### 1. Chrome Version
- **Required:** Chrome 127+ (Dev, Beta, or Canary)
- **Your version:** Chrome Canary 143.0.7483.0 ✅

### 2. Enable Flags

Go to `chrome://flags` and enable:

1. **`#prompt-api-for-gemini-nano`** → **Enabled**
2. **`#optimization-guide-on-device-model`** → **Enabled BypassPerfRequirement**

Then **Relaunch Chrome**.

### 3. Verify Flags in Command Line

Check `chrome://version` - you should see in "Command Line":
```
--enable-features=AIPromptAPI
```

✅ **Confirmed** - Your command line shows this flag is enabled.

### 4. Download Gemini Nano Model

**Option A: Via Console**
1. Open DevTools (F12)
2. Run:
```javascript
await window.ai.languageModel.capabilities()
```
3. If it returns `{available: "after-download"}`, run:
```javascript
await window.ai.languageModel.create()
```

**Option B: Via Components**
1. Go to `chrome://components`
2. Find **"Optimization Guide On Device Model"**
3. Click **"Check for update"**
4. Wait for ~1.5GB download

### 5. Verify AI is Ready

In DevTools console:
```javascript
const session = await window.ai.languageModel.create();
const result = await session.prompt("Say hello!");
console.log(result);
```

Should output: AI greeting response.

---

## Current Problem: `window.ai` is undefined

### Troubleshooting Steps

#### Step 1: Completely Restart Chrome
1. **Quit Chrome Canary completely** (Cmd+Q on Mac)
2. **Reopen Chrome Canary**
3. Test: `console.log(window.ai)`

#### Step 2: Check Origin Trial
The Prompt API might require an origin trial token. Try:
1. Go to `chrome://flags/#enable-experimental-web-platform-features`
2. Set to **Enabled**
3. Relaunch

#### Step 3: Try Different Page Context
The API might not be available on all pages. Try:
1. Open a new tab to `chrome://newtab`
2. Open DevTools
3. Test: `console.log(window.ai)`

#### Step 4: Check API Availability Status
In console, run:
```javascript
console.log('window.ai exists:', typeof window.ai !== 'undefined');
console.log('AI APIs available:', Object.keys(window).filter(k => k.includes('ai') || k.includes('AI')));
```

#### Step 5: Alternative API Check
Try the older API path (for Chrome 127-130):
```javascript
console.log(window.LanguageModel);
```

If this exists but `window.ai` doesn't, the extension code needs updating.

---

## For Development Without AI

If you can't get the AI working yet, you can test the extension with mock data by temporarily disabling the AI check:

### Quick Test Mode

In `content.js`, comment out the AI check and return mock data:

```javascript
async function analyzeWithAI(pageText, pageUrl, productInfo) {
  // TEMPORARY: Return mock data for testing
  return {
    priorityLevel: 45,
    badgeText: 'Think It Over',
    badgeClass: 'badge-warning',
    reasoning: 'You have 2 items from different groups in your cart',
    reflection: 'Are both of these groups your top priorities right now?'
  };
}
```

This lets you test the UI/UX while troubleshooting the AI setup.

---

## Resources

- **Chrome AI Documentation:** https://developer.chrome.com/docs/ai/get-started
- **Prompt API Reference:** https://developer.chrome.com/docs/ai/prompt-api
- **Chrome AI Challenge:** https://googlechromeai2025.devpost.com/

## System Requirements

- **RAM:** 22GB+ recommended
- **Disk:** 4GB+ free space
- **GPU:** 4GB+ VRAM recommended
- **OS:** macOS 13+, Windows 10+, Linux, ChromeOS

Your system (macOS 15.2) meets requirements ✅
