// ============================================
// Piggy Bong Feedback Viewer
// Console Helper to View and Export User Feedback
// ============================================

/**
 * View all feedback data
 * Usage: Copy this file content and paste in browser console on any K-pop shopping site
 */

// Get all feedback
function viewFeedback() {
  const feedback = JSON.parse(localStorage.getItem('piggyFeedback') || '[]');
  console.log(`📊 Total Feedback Entries: ${feedback.length}`);
  console.table(feedback);
  return feedback;
}

// Get feedback statistics
function getFeedbackStats() {
  const feedback = JSON.parse(localStorage.getItem('piggyFeedback') || '[]');

  const stats = {
    total: feedback.length,
    helpful: feedback.filter(f => f.feedbackType === 'helpful').length,
    notHelpful: feedback.filter(f => f.feedbackType === 'not-helpful').length,
    withComments: feedback.filter(f => f.comment && f.comment.length > 0).length,
    helpfulPercentage: 0,
    avgItemCount: 0,
    mostCommonBadges: {}
  };

  if (stats.total > 0) {
    stats.helpfulPercentage = ((stats.helpful / stats.total) * 100).toFixed(1) + '%';
    stats.avgItemCount = (feedback.reduce((sum, f) => sum + f.itemCount, 0) / stats.total).toFixed(1);

    // Badge distribution across all feedback
    const allBadges = {};
    feedback.forEach(f => {
      Object.entries(f.badgeDistribution || {}).forEach(([badge, count]) => {
        allBadges[badge] = (allBadges[badge] || 0) + count;
      });
    });
    stats.mostCommonBadges = allBadges;
  }

  console.log('📈 Feedback Statistics:');
  console.table(stats);
  return stats;
}

// Export feedback as JSON
function exportFeedback() {
  const feedback = JSON.parse(localStorage.getItem('piggyFeedback') || '[]');
  const dataStr = JSON.stringify(feedback, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `piggy-feedback-${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  console.log('✅ Feedback exported as JSON file');
}

// View comments only
function viewComments() {
  const feedback = JSON.parse(localStorage.getItem('piggyFeedback') || '[]');
  const withComments = feedback.filter(f => f.comment && f.comment.length > 0);

  console.log(`💬 Feedback with Comments (${withComments.length}):`);
  withComments.forEach((f, i) => {
    console.log(`\n${i + 1}. [${f.feedbackType}] ${f.timestamp}`);
    console.log(`   Comment: "${f.comment}"`);
    console.log(`   Lineup: ${f.userLineup.join(', ')}`);
    console.log(`   Items: ${f.itemCount}, Badges: ${JSON.stringify(f.badgeDistribution)}`);
  });

  return withComments;
}

// Clear all feedback (use with caution!)
function clearFeedback() {
  const confirm = prompt('⚠️ This will delete ALL feedback data. Type "DELETE" to confirm:');
  if (confirm === 'DELETE') {
    localStorage.removeItem('piggyFeedback');
    console.log('🗑️ All feedback data cleared');
  } else {
    console.log('❌ Deletion cancelled');
  }
}

// Quick console commands
console.log(`
🐷 Piggy Bong Feedback Viewer
=============================

Available commands:
- viewFeedback()      → View all feedback data
- getFeedbackStats()  → Get summary statistics
- exportFeedback()    → Download feedback as JSON
- viewComments()      → View only entries with comments
- clearFeedback()     → Delete all feedback data

Example:
> viewFeedback()
> getFeedbackStats()
`);

// Auto-run stats on load
if (localStorage.getItem('piggyFeedback')) {
  console.log('📊 Quick Stats:');
  getFeedbackStats();
}
