// Clear User Data Script
// Run this in the browser console to reset as a new user

console.log('🧹 Clearing Piggy Bong user data...');

// List of all localStorage keys used by Piggy Bong
const keysToRemove = [
  'piggyLineup',           // User's favorite groups
  'piggyPriority',         // User's collection priorities
  'piggyBias',             // Legacy bias field
  'piggyCartHistory',      // Cart history for patterns
  // Position keys (per-domain)
  ...Object.keys(localStorage).filter(key => key.startsWith('piggybong-position-'))
];

let clearedCount = 0;
keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    clearedCount++;
    console.log(`   ✓ Removed: ${key}`);
  }
});

console.log(`\n✅ Cleared ${clearedCount} items from localStorage`);
console.log('🔄 Reload the page to test as a new user!');
console.log('\nTo verify, run: localStorage');
