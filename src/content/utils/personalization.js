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

// ===========================================
// Cart History Pattern Recognition
// ===========================================

export const CartHistoryHelper = {
  // Extract artist/group name from item name
  extractArtist(itemName) {
    const lineup = PersonalizationHelper.getLineup();

    // Check if any lineup group is in the item name
    for (const group of lineup) {
      if (itemName.toLowerCase().includes(group.toLowerCase())) {
        return group;
      }
    }

    // Common K-pop groups (works even if not in user's lineup)
    const commonGroups = [
      'NewJeans', 'BTS', 'BLACKPINK', 'TWICE', 'Stray Kids', 'aespa',
      'SEVENTEEN', 'TXT', 'ENHYPEN', 'IVE', 'LE SSERAFIM', 'ITZY',
      'Red Velvet', 'NCT', 'EXO', 'BIGBANG', 'GOT7', 'ATEEZ'
    ];

    for (const group of commonGroups) {
      if (itemName.toLowerCase().includes(group.toLowerCase())) {
        return group;
      }
    }

    return 'Unknown';
  },

  // Extract item type from item name
  extractType(itemName) {
    const lowerName = itemName.toLowerCase();

    if (lowerName.includes('photocard') || lowerName.includes('pc')) return 'photocard';
    if (lowerName.includes('album')) return 'album';
    if (lowerName.includes('lightstick') || lowerName.includes('light stick')) return 'lightstick';
    if (lowerName.includes('poster')) return 'poster';
    if (lowerName.includes('season') && lowerName.includes('greeting')) return 'season\'s greetings';
    if (lowerName.includes('dvd') || lowerName.includes('blu-ray')) return 'dvd/blu-ray';
    if (lowerName.includes('merchandise') || lowerName.includes('merch')) return 'merchandise';

    return 'other';
  },

  // Get all cart history
  getCartHistory() {
    const stored = localStorage.getItem('piggyCartHistory');
    return stored ? JSON.parse(stored) : [];
  },

  // Save a cart snapshot
  saveCartSnapshot(items, total, timestamp = Date.now()) {
    const history = this.getCartHistory();

    const snapshot = {
      id: timestamp,
      date: new Date(timestamp).toISOString(),
      items: items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        artist: this.extractArtist(item.name),
        type: this.extractType(item.name)
      })),
      total,
      purchased: false, // We assume not purchased initially
      lineup: PersonalizationHelper.getLineup(),
      priorityTypes: PersonalizationHelper.getPriority()?.types || []
    };

    // Avoid duplicate snapshots (same items within 5 minutes)
    const recentSnapshot = history[history.length - 1];
    if (recentSnapshot && (timestamp - recentSnapshot.id) < 300000) {
      const sameItems = JSON.stringify(recentSnapshot.items) === JSON.stringify(snapshot.items);
      if (sameItems) {
        console.log('📊 Skipping duplicate cart snapshot');
        return;
      }
    }

    history.push(snapshot);

    // Keep last 50 carts
    if (history.length > 50) {
      history.shift();
    }

    localStorage.setItem('piggyCartHistory', JSON.stringify(history));
    console.log('📊 Saved cart snapshot:', snapshot);
  },

  // Get artist frequency across all carts
  getArtistFrequency(history) {
    const frequency = {};

    history.forEach(cart => {
      cart.items.forEach(item => {
        const artist = item.artist;
        if (artist !== 'Unknown') {
          frequency[artist] = (frequency[artist] || 0) + 1;
        }
      });
    });

    return frequency;
  },

  // Get item type frequency
  getTypeFrequency(history) {
    const frequency = {};

    history.forEach(cart => {
      cart.items.forEach(item => {
        const type = item.type;
        frequency[type] = (frequency[type] || 0) + 1;
      });
    });

    return frequency;
  },

  // Detect seasonal patterns (which months user shops most)
  getSeasonalPatterns(history) {
    const monthCounts = {};

    history.forEach(cart => {
      const date = new Date(cart.date);
      const monthName = date.toLocaleString('en-US', { month: 'long' });
      monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
    });

    return monthCounts;
  },

  // Get abandoned items (added 2+ times but never purchased)
  getAbandonedItems(history) {
    const itemCounts = {};

    history.forEach(cart => {
      cart.items.forEach(item => {
        const key = item.name;
        if (!itemCounts[key]) {
          itemCounts[key] = { count: 0, purchased: false, artist: item.artist, type: item.type };
        }
        itemCounts[key].count++;
        if (cart.purchased) {
          itemCounts[key].purchased = true;
        }
      });
    });

    return Object.entries(itemCounts)
      .filter(([name, data]) => data.count >= 2 && !data.purchased)
      .map(([name, data]) => ({
        name,
        timesAdded: data.count,
        artist: data.artist,
        type: data.type
      }));
  },

  // Calculate average cart value
  getAverageCartValue(history) {
    if (history.length === 0) return 0;
    const total = history.reduce((sum, cart) => sum + (cart.total || 0), 0);
    return total / history.length;
  },

  // Detect lineup mismatches (stated vs actual collecting behavior)
  getLineupMismatch(history) {
    const currentLineup = PersonalizationHelper.getLineup();
    if (currentLineup.length === 0) return null;

    const artistFreq = this.getArtistFrequency(history);
    const topArtists = Object.entries(artistFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([artist]) => artist);

    const notInLineup = topArtists.filter(artist =>
      !currentLineup.some(lineupGroup =>
        lineupGroup.toLowerCase() === artist.toLowerCase()
      )
    );

    return notInLineup.length > 0 ? notInLineup : null;
  },

  // Analyze all patterns
  analyzePatterns() {
    const history = this.getCartHistory();

    if (history.length < 2) {
      return null; // Need at least 2 carts to detect patterns
    }

    return {
      totalCarts: history.length,
      artistFrequency: this.getArtistFrequency(history),
      typeFrequency: this.getTypeFrequency(history),
      seasonalPatterns: this.getSeasonalPatterns(history),
      abandonedItems: this.getAbandonedItems(history),
      averageCartValue: this.getAverageCartValue(history),
      lineupMismatch: this.getLineupMismatch(history),
      oldestCart: new Date(history[0].date).toLocaleDateString(),
      newestCart: new Date(history[history.length - 1].date).toLocaleDateString()
    };
  }
};
