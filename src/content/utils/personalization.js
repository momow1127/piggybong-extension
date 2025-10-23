// ===========================================
// Personalization Helpers (localStorage)
// ===========================================

export const PersonalizationHelper = {
  getBias() {
    return localStorage.getItem('piggyBias') || null;
  },

  getCollectionGoal() {
    return localStorage.getItem('piggyGoal') || null;
  },

  setBias(bias) {
    if (bias && bias.trim()) {
      localStorage.setItem('piggyBias', bias.trim());
    }
  },

  setCollectionGoal(goal) {
    if (goal && goal.trim()) {
      localStorage.setItem('piggyGoal', goal.trim());
    }
  },

  hasPersonalization() {
    return this.getBias() !== null || this.getCollectionGoal() !== null;
  },

  clearPersonalization() {
    localStorage.removeItem('piggyBias');
    localStorage.removeItem('piggyGoal');
  },

  getPersonalizationContext() {
    const bias = this.getBias();
    const goal = this.getCollectionGoal();

    if (!bias && !goal) return '';

    let context = '\nPERSONALIZATION CONTEXT:\n';
    if (bias) context += `User's bias: ${bias}\n`;
    if (goal) context += `User's collection goal: ${goal}\n`;

    return context;
  }
};
