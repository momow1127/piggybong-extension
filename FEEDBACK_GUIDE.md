# Piggy Bong Feedback System Guide

## 🎯 What's Included

A complete user feedback system to track if AI insights are helpful.

### Features:
- ✅ Thumbs up/down buttons after Overall Insight
- ✅ ChatGPT-style toast notification ("Thank you for your feedback!")
- ✅ Optional comment box when user clicks thumbs down
- ✅ All data stored locally in localStorage
- ✅ Easy viewing and export via console commands

---

## 📊 How to View Feedback Data

### Method 1: Console Commands (Quick)

1. Go to any K-pop shopping site where extension is active
2. Open DevTools Console (F12)
3. Copy and paste contents of `view-feedback.js` file
4. Use these commands:

```javascript
// View all feedback
viewFeedback()

// Get statistics
getFeedbackStats()

// View only comments
viewComments()

// Export as JSON file
exportFeedback()
```

### Method 2: Direct localStorage Access

```javascript
// Raw data
const feedback = JSON.parse(localStorage.getItem('piggyFeedback') || '[]')
console.table(feedback)
```

---

## 📁 Feedback Data Structure

Each feedback entry contains:

```javascript
{
  timestamp: "2025-10-26T13:45:22.123Z",
  feedbackType: "helpful" | "not-helpful",
  comment: "Optional user comment",
  userLineup: ["NewJeans", "SHINee"],
  userPriority: {types: ["album", "photocard"]},
  itemCount: 3,
  badgeDistribution: {
    "Top Priority": 2,
    "Discovery": 1
  },
  overallInsight: "Three Top Priority NewJeans items...",
  hasSmartFanTip: true
}
```

---

## 📈 Useful Queries

### Get Thumbs Down Percentage
```javascript
const feedback = JSON.parse(localStorage.getItem('piggyFeedback') || '[]')
const notHelpful = feedback.filter(f => f.feedbackType === 'not-helpful').length
const percentage = (notHelpful / feedback.length * 100).toFixed(1)
console.log(`👎 Not Helpful: ${percentage}%`)
```

### Find Common Issues
```javascript
viewComments() // Shows all user comments
```

### Export for Analysis
```javascript
exportFeedback() // Downloads JSON file
```

---

## 🔧 Customization

### Change Toast Message

Edit in `src/content/ui/modal.js`:

```javascript
// Line 860 (thumbs up)
showToast('Thank you for your feedback! 🎉');

// Line 874 (thumbs down)
showToast('Thank you for your feedback! 🙏');
```

### Change Toast Duration

Line 933:
```javascript
setTimeout(() => {
  toast.style.animation = 'slideUp 0.3s ease';
  setTimeout(() => toast.remove(), 300);
}, 3000); // ← Change this (milliseconds)
```

### Add Server Sync (Future)

In `saveFeedback()` function, add:

```javascript
// After localStorage.setItem()
fetch('your-api.com/feedback', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(feedback)
});
```

---

## 🗑️ Clear Feedback Data

```javascript
// Console command
clearFeedback() // Will prompt for confirmation

// Direct
localStorage.removeItem('piggyFeedback')
```

---

## 🎨 UI Appearance

**Location:** Below "Overall Insight" section in analysis modal

**Buttons:**
- 👍 Helpful (gray background, hover effect)
- 👎 Not Helpful (gray background, hover effect)

**When thumbs down clicked:**
- Textarea appears: "What could be better? (optional)"
- Submit button: Purple gradient (matches extension theme)

**After submission:**
- Toast notification slides down from top
- Buttons become disabled (gray, can't click again)
- Toast auto-dismisses after 3 seconds

---

## 📊 Example Statistics Output

```
📈 Feedback Statistics:
┌─────────────────────┬──────────┐
│ total               │ 25       │
│ helpful             │ 18       │
│ notHelpful          │ 7        │
│ withComments        │ 4        │
│ helpfulPercentage   │ 72.0%    │
│ avgItemCount        │ 3.2      │
│ mostCommonBadges    │ {...}    │
└─────────────────────┴──────────┘
```

---

## 🚀 Next Steps

1. **Test it:** Reload extension and give feedback on your own carts
2. **Monitor:** Run `getFeedbackStats()` weekly to track trends
3. **Analyze:** Export JSON and analyze in Excel/Python
4. **Improve:** Use comments to identify pain points
5. **Iterate:** Update AI prompts based on feedback

Happy tracking! 🐷📊
