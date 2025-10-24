// ===========================================
// Personalization Helpers (localStorage)
// ===========================================

export const PersonalizationHelper = {
  // Legacy single bias support (kept for backward compatibility)
  getBias() {
    return localStorage.getItem('piggyBias') || null;
  },

  setBias(bias) {
    if (bias && bias.trim()) {
      localStorage.setItem('piggyBias', bias.trim());
    }
  },

  // New multi-group lineup support
  getLineup() {
    const stored = localStorage.getItem('piggyLineup');
    return stored ? JSON.parse(stored) : [];
  },

  setLineup(lineup) {
    if (Array.isArray(lineup) && lineup.length > 0) {
      localStorage.setItem('piggyLineup', JSON.stringify(lineup));
    }
  },

  // Priority item support
  getPriority() {
    const stored = localStorage.getItem('piggyPriority');
    return stored ? JSON.parse(stored) : null;
  },

  setPriority(priority) {
    if (priority && (priority.type || priority.types)) {
      console.log('🔍 PersonalizationHelper.setPriority() saving:', priority);
      localStorage.setItem('piggyPriority', JSON.stringify(priority));
      console.log('🔍 Saved to localStorage. Reading back:', localStorage.getItem('piggyPriority'));
    } else {
      console.warn('🔍 setPriority() called but priority object invalid:', priority);
    }
  },

  // Legacy goal support
  getCollectionGoal() {
    return localStorage.getItem('piggyGoal') || null;
  },

  setCollectionGoal(goal) {
    if (goal && goal.trim()) {
      localStorage.setItem('piggyGoal', goal.trim());
    }
  },

  hasPersonalization() {
    return this.getLineup().length > 0 || this.getBias() !== null || this.getPriority() !== null;
  },

  clearPersonalization() {
    localStorage.removeItem('piggyBias');
    localStorage.removeItem('piggyGoal');
    localStorage.removeItem('piggyLineup');
    localStorage.removeItem('piggyPriority');
  },

  getPersonalizationContext() {
    const lineup = this.getLineup();
    const priority = this.getPriority();
    const legacyBias = this.getBias();

    if (lineup.length === 0 && !legacyBias && !priority) return '';

    let context = '\nPERSONALIZATION CONTEXT:\n';

    if (lineup.length > 0) {
      context += `User's lineup: ${lineup.join(', ')}\n`;
    } else if (legacyBias) {
      context += `User's bias: ${legacyBias}\n`;
    }

    if (priority) {
      context += `Top priority: ${priority.name} (${priority.type})\n`;
    }

    return context;
  }
};
