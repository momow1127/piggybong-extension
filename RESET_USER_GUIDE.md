# Reset as New User - Testing Guide

Follow these steps to test the extension as a completely new user.

---

## Method 1: Quick Console Clear (Recommended)

### Step 1: Open Browser Console
1. Go to any K-pop shopping site (e.g., kpoptown.com, ktown4u.com)
2. Press `F12` (or `Cmd+Option+I` on Mac) to open DevTools
3. Click the **Console** tab

### Step 2: Run Clear Script
Copy and paste this into the console:

```javascript
// Clear all Piggy Bong data
const keys = ['piggyLineup', 'piggyPriority', 'piggyBias', 'piggyCartHistory'];
keys.forEach(key => localStorage.removeItem(key));
Object.keys(localStorage).filter(k => k.startsWith('piggybong-position-')).forEach(k => localStorage.removeItem(k));
console.log('✅ All Piggy Bong data cleared! Reload the page.');
```

### Step 3: Reload Page
- Press `Ctrl+R` (or `Cmd+R` on Mac)
- Or click the refresh button

### Step 4: Empty Your Cart
- Go to the shopping cart page
- Remove all items from cart
- Cart should show "0 items" or "Your cart is empty"

---

## Method 2: Manual localStorage Clear

### Step 1: Open Application Panel
1. Press `F12` to open DevTools
2. Click **Application** tab (top menu)
3. In left sidebar, expand **Local Storage**
4. Click on the domain (e.g., `https://kpoptown.com`)

### Step 2: Find and Delete Keys
Look for and delete these keys (right-click → Delete):
- `piggyLineup`
- `piggyPriority`
- `piggyBias`
- `piggyCartHistory`
- `piggybong-position-[domain]`

### Step 3: Reload Page
- Refresh the browser

---

## Method 3: Full Extension Reset

If you want to completely reset the extension:

### Step 1: Remove Extension
1. Go to `chrome://extensions`
2. Find "Piggy Bong"
3. Click **Remove**

### Step 2: Reinstall
1. Click **Load unpacked**
2. Select the piggybong-extension folder
3. Extension loads fresh with no data

---

## Verify Clean State

After clearing, open console and run:

```javascript
console.log({
  lineup: localStorage.getItem('piggyLineup'),
  priority: localStorage.getItem('piggyPriority'),
  bias: localStorage.getItem('piggyBias'),
  history: localStorage.getItem('piggyCartHistory')
});
```

All values should be `null`.

---

## Test Flow as New User

### ✅ Checkpoint 1: Empty Cart State
1. Click Piggy Bong floating button
2. **Expected:** See empty state modal with:
   - Circular purple icon
   - "Smart Shopping Starts Here" heading
   - "Try Demo" button (primary)
   - "Set Preferences" button (secondary)

### ✅ Checkpoint 2: Demo Mode
1. Click **Try Demo**
2. **Expected:**
   - Loading animation (2-3 seconds)
   - Analysis modal appears
   - "Demo Mode" badge (green) at top
   - 3 items shown: NewJeans, aespa, BLACKPINK
   - Each item has priority badge
   - Overall Insight section
   - "Want insights tuned to YOUR lineup?" box
   - "Set My Preferences" button

### ✅ Checkpoint 3: Set Preferences (Post-Demo)
1. Click **Set My Preferences**
2. **Expected:**
   - Onboarding modal opens
   - "Welcome to Piggy Bong!" title
   - Your Lineup field with search
   - Your Fan Priority dropdown
   - "Save & Continue" button
   - "Skip for Now" button

### ✅ Checkpoint 4: Add Preferences
1. Type "NewJeans" in lineup search → click it
2. Type "aespa" → click it
3. Open Priority dropdown
4. Check "Latest Album" and "Photocard Set"
5. Click **Save & Continue**
6. **Expected:** Modal closes

### ✅ Checkpoint 5: Personalized Mode
1. Add real items to cart (or run demo again)
2. Click Piggy Bong button
3. **Expected:**
   - Analysis modal appears
   - "Personalized Recommendations" badge (blue) at top
   - Results tuned to NewJeans + aespa
   - Smart Fan Tip may appear

---

## Troubleshooting

### "Modal doesn't show empty state"
- Make sure cart is truly empty
- Check console for errors
- Try reloading extension at `chrome://extensions`

### "Data still exists after clearing"
- Make sure you ran the clear script
- Verify with: `localStorage.getItem('piggyLineup')`
- Try Method 3 (full extension reset)

### "Demo button doesn't work"
- Check console for errors (F12)
- Make sure extension is loaded
- Try rebuilding: `npm run build`

---

## Quick Reference Commands

```javascript
// Clear data
const keys = ['piggyLineup', 'piggyPriority', 'piggyBias', 'piggyCartHistory'];
keys.forEach(key => localStorage.removeItem(key));

// Check data
console.log(localStorage.getItem('piggyLineup'));

// See all Piggy Bong keys
Object.keys(localStorage).filter(k => k.includes('piggy'));
```

---

Ready to test! 🚀
