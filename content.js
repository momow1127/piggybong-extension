// ===========================================
// content.js - Piggy Bong Floating Button
// Automatically injected into all pages
// ===========================================

(function() {
  'use strict';

  // Check if button already exists (prevent duplicates)
  if (document.getElementById('piggybong-floating-btn')) {
    return;
  }

  // ===========================================
  // Personalization Helpers (localStorage)
  // ===========================================

  const PersonalizationHelper = {
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

  // Create floating button container (for dragging + close button)
  const floatingContainer = document.createElement('div');
  floatingContainer.id = 'piggybong-floating-container';
  floatingContainer.className = 'piggybong-float-container';

  // Create the main button
  const floatingBtn = document.createElement('button');
  floatingBtn.id = 'piggybong-floating-btn';
  floatingBtn.className = 'piggybong-float-btn';
  floatingBtn.setAttribute('aria-label', 'Piggy Bong Priority Check');

  // Get extension URL for logo
  const logoUrl = chrome.runtime.getURL('piggybong.png');

  // Add drag handle, logo, and text
  floatingBtn.innerHTML = `
    <div class="piggybong-drag-handle">
      <div class="drag-dots"></div>
    </div>
    <div class="piggybong-btn-icon">
      <img src="${logoUrl}" alt="Piggy Bong" />
    </div>
    <span class="piggybong-btn-text">Should I Buy This?</span>
  `;

  // Create close button (shows on hover)
  const closeBtn = document.createElement('button');
  closeBtn.className = 'piggybong-close-btn';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Close Piggy Bong');
  closeBtn.title = 'Dismiss';

  // Add both buttons to container
  floatingContainer.appendChild(floatingBtn);
  floatingContainer.appendChild(closeBtn);

  // Add container to page
  document.body.appendChild(floatingContainer);

  // Load saved position or use default
  const hostname = window.location.hostname;
  const savedPosition = localStorage.getItem(`piggybong-position-${hostname}`);
  if (savedPosition) {
    const pos = JSON.parse(savedPosition);
    floatingContainer.style.left = pos.left;
    floatingContainer.style.top = pos.top;
    floatingContainer.style.right = pos.right;
  }

  // Dragging logic - ONLY works on drag handle
  let isDragging = false;
  let dragStarted = false;
  let startX, startY, initialLeft, initialTop;

  // Only drag handle can initiate dragging
  floatingContainer.addEventListener('mousedown', (e) => {
    // Only start drag if clicking on the drag handle
    if (!e.target.closest('.piggybong-drag-handle')) return;

    // Don't drag if clicking close button
    if (e.target.closest('.piggybong-close-btn')) return;

    isDragging = true;
    dragStarted = false; // Track if actual drag movement happened
    startX = e.clientX;
    startY = e.clientY;

    const rect = floatingContainer.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    floatingContainer.style.transition = 'none';
    floatingContainer.classList.add('dragging');
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // If movement detected, mark as dragging (prevents click event)
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dragStarted = true;
    }

    const newLeft = initialLeft + deltaX;
    const newTop = initialTop + deltaY;

    floatingContainer.style.left = newLeft + 'px';
    floatingContainer.style.top = newTop + 'px';
    floatingContainer.style.right = 'auto';
  });

  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    floatingContainer.classList.remove('dragging');

    // Snap to nearest side (left or right)
    const rect = floatingContainer.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const centerX = rect.left + rect.width / 2;

    floatingContainer.style.transition = 'left 0.3s ease, right 0.3s ease';

    if (centerX < windowWidth / 2) {
      // Snap to left
      floatingContainer.style.left = '20px';
      floatingContainer.style.right = 'auto';
    } else {
      // Snap to right
      floatingContainer.style.right = '20px';
      floatingContainer.style.left = 'auto';
    }

    // Keep vertical position
    floatingContainer.style.top = rect.top + 'px';

    // Save position
    setTimeout(() => {
      const finalRect = floatingContainer.getBoundingClientRect();
      const position = {
        left: floatingContainer.style.left,
        right: floatingContainer.style.right,
        top: floatingContainer.style.top
      };
      localStorage.setItem(`piggybong-position-${hostname}`, JSON.stringify(position));
    }, 300);
  });

  // Close button handler
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    floatingContainer.style.opacity = '0';
    floatingContainer.style.transform = 'scale(0.8)';
    setTimeout(() => {
      floatingContainer.remove();
    }, 200);
  });

  // Button click handler (open modal) - doesn't work on drag handle
  floatingBtn.addEventListener('click', async (e) => {
    // Don't open modal if clicking drag handle or close button
    if (e.target.closest('.piggybong-drag-handle')) return;
    if (e.target.closest('.piggybong-close-btn')) return;

    // Don't open modal if user was dragging
    if (dragStarted) {
      dragStarted = false;
      return;
    }

    console.log('Piggy Bong button clicked!');

    // Get current page info
    const pageText = document.body.innerText || '';
    const pageUrl = window.location.href;

    // Create and show modal
    showPiggyBongModal(pageText, pageUrl);
  });

  // Generate cart HTML with items (COMPACT VERSION)
  function generateCartHTML(cartData) {
    // Only show first 2 items to save space, show count if more
    const displayItems = cartData.items.slice(0, 2);
    const hasMore = cartData.items.length > 2;

    const itemsHTML = displayItems.map(item => `
      <div class="cart-item-row-compact">
        <div class="cart-item-name-compact">${item.name}</div>
        <div class="cart-item-price-compact">${item.quantity}× ${item.price || 'N/A'}</div>
      </div>
    `).join('');

    // Check if total is estimated (starts with ~)
    const isEstimated = cartData.total && cartData.total.startsWith('~');
    const totalClass = isEstimated ? 'cart-total-compact cart-total-estimated' : 'cart-total-compact';
    const totalText = isEstimated
      ? `${cartData.itemCount} items • ${cartData.total} (estimated)`
      : `${cartData.itemCount} items • ${cartData.total}`;

    return `
      <div class="piggybong-product-card-compact">
        <div class="cart-items-compact">
          ${itemsHTML}
          ${hasMore ? `<div class="cart-more">+${cartData.items.length - 2} more item${cartData.items.length - 2 > 1 ? 's' : ''}</div>` : ''}
        </div>
        ${cartData.total ? `<div class="${totalClass}">${totalText}</div>` : ''}
      </div>
    `;
  }

  // Generate single product HTML
  function generateProductHTML(productData) {
    return `
      <div class="piggybong-product-card">
        <div class="product-info">
          <h2 class="product-name">${productData.name}</h2>
          <p class="product-price">${productData.price}</p>
        </div>
      </div>
    `;
  }

  // Function to show onboarding modal (first-time personalization setup)
  function showOnboardingModal(callback) {
    const modal = document.createElement('div');
    modal.id = 'piggybong-onboarding-modal';
    modal.className = 'piggybong-modal show';

    const logoUrl = chrome.runtime.getURL('piggybong.png');

    // Get existing values if any
    const existingBias = PersonalizationHelper.getBias() || '';
    const existingGoal = PersonalizationHelper.getCollectionGoal() || '';
    const isEditing = existingBias || existingGoal;

    modal.innerHTML = `
      <div class="piggybong-modal-overlay"></div>
      <div class="piggybong-modal-content" style="max-width: 450px;">
        <div class="piggybong-modal-header">
          <div class="piggybong-brand">
            <img src="${logoUrl}" alt="Piggy Bong" class="piggybong-header-logo">
            <span class="piggybong-brand-name">${isEditing ? 'Edit Preferences' : 'Welcome to Piggy Bong!'}</span>
          </div>
          <button class="piggybong-modal-close-btn" aria-label="Skip">×</button>
        </div>

        <div class="piggybong-modal-body">
          <div class="piggybong-onboarding-content">
            <p style="margin-bottom: 20px; color: #666;">Help Piggy Bong understand your K-pop collection style:</p>

            <div class="piggybong-form-group">
              <label for="piggy-bias-input" style="display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #4a4a4a;">Who's your bias? (optional)</label>
              <input
                type="text"
                id="piggy-bias-input"
                placeholder="e.g., Stray Kids, SUPER JUNIOR, NewJeans..."
                value="${existingBias}"
                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;"
              />
            </div>

            <div class="piggybong-form-group" style="margin-top: 16px;">
              <label for="piggy-goal-select" style="display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #4a4a4a;">What do you usually collect?</label>
              <select
                id="piggy-goal-select"
                style="width: 100%; padding: 10px 32px 10px 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;"
              >
                <option value="">Select...</option>
                <option value="Albums" ${existingGoal === 'Albums' ? 'selected' : ''}>Albums</option>
                <option value="Photocards" ${existingGoal === 'Photocards' ? 'selected' : ''}>Photocards</option>
                <option value="Lightsticks" ${existingGoal === 'Lightsticks' ? 'selected' : ''}>Lightsticks</option>
                <option value="Posters" ${existingGoal === 'Posters' ? 'selected' : ''}>Posters</option>
                <option value="Everything" ${existingGoal === 'Everything' ? 'selected' : ''}>Everything (OT collector)</option>
                <option value="Limited Editions" ${existingGoal === 'Limited Editions' ? 'selected' : ''}>Limited Editions only</option>
                <option value="Casual" ${existingGoal === 'Casual' ? 'selected' : ''}>Casual collecting</option>
              </select>
            </div>

            <button
              id="piggy-save-preferences"
              class="piggybong-primary-btn"
              style="width: 100%; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #5D2CEE 0%, #8B55ED 100%); border: none; border-radius: 50px; color: white; font-weight: bold; cursor: pointer; font-size: 14px;"
            >
              Save & Continue
            </button>

            <button
              id="piggy-skip-onboarding"
              style="width: 100%; margin-top: 10px; padding: 10px 24px; background: transparent; border: none; color: #5D2CEE; cursor: pointer; font-size: 14px; font-weight: 600; border-radius: 50px;"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Save preferences and continue
    const saveBtn = modal.querySelector('#piggy-save-preferences');
    saveBtn.addEventListener('click', () => {
      const bias = modal.querySelector('#piggy-bias-input').value.trim();
      const goal = modal.querySelector('#piggy-goal-select').value;

      if (bias) PersonalizationHelper.setBias(bias);
      if (goal) PersonalizationHelper.setCollectionGoal(goal);

      modal.remove();
      if (callback) callback();
    });

    // Skip onboarding
    const skipBtn = modal.querySelector('#piggy-skip-onboarding');
    const closeBtn = modal.querySelector('.piggybong-modal-close-btn');
    const overlay = modal.querySelector('.piggybong-modal-overlay');

    const skipOnboarding = () => {
      modal.remove();
      if (callback) callback();
    };

    skipBtn.addEventListener('click', skipOnboarding);
    closeBtn.addEventListener('click', skipOnboarding);
    overlay.addEventListener('click', skipOnboarding);
  }

  // Function to show modal
  function showPiggyBongModal(pageText, pageUrl) {
    console.log('🐷 showPiggyBongModal called');
    console.log('🐷 Page URL:', pageUrl);

    // Check if this is first time (no personalization) and show onboarding
    if (!PersonalizationHelper.hasPersonalization()) {
      showOnboardingModal(() => {
        // After onboarding (or skip), show main analysis modal
        showAnalysisModal(pageText, pageUrl);
      });
      return;
    }

    // Already has personalization, go straight to analysis
    showAnalysisModal(pageText, pageUrl);
  }

  // Main analysis modal (renamed from showPiggyBongModal)
  function showAnalysisModal(pageText, pageUrl) {
    // Remove existing modal if any
    const existingModal = document.getElementById('piggybong-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Extract product info immediately
    console.log('🐷 About to call extractProductInfo...');
    const productInfo = extractProductInfo(pageText);
    console.log('🐷 extractProductInfo returned:', productInfo);

    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'piggybong-modal';
    modal.className = 'piggybong-modal';

    // Get logo URL
    const logoUrl = chrome.runtime.getURL('piggybong.png');

    modal.innerHTML = `
      <div class="piggybong-modal-overlay"></div>
      <div class="piggybong-modal-content">
        <div class="piggybong-modal-header">
          <div class="piggybong-brand">
            <img src="${logoUrl}" alt="Piggy Bong" class="piggybong-header-logo">
            <span class="piggybong-brand-name">Piggy Bong</span>
          </div>
          <div class="piggybong-header-actions">
            <button class="piggybong-settings-btn" aria-label="Edit Preferences" title="Edit your bias and collection goals">
              <img src="${chrome.runtime.getURL('settings.svg')}" alt="Settings" class="settings-icon" />
            </button>
            <button class="piggybong-modal-close-btn" aria-label="Close">×</button>
          </div>
        </div>

        <div class="piggybong-modal-body">
          <!-- Show cart or product card immediately -->
          ${productInfo.isCart ? generateCartHTML(productInfo) : generateProductHTML(productInfo)}

          <!-- Loading state for AI analysis -->
          <div class="piggybong-loading">
            <div class="piggybong-spinner"></div>
            <p>🤖 AI is analyzing your collection alignment...</p>
            <p style="font-size: 12px; color: #999; margin-top: 8px;">This takes 3-5 seconds using on-device AI</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Settings button handler
    const settingsBtn = modal.querySelector('.piggybong-settings-btn');
    settingsBtn.addEventListener('click', () => {
      // Close current modal
      modal.remove();

      // Show onboarding modal for editing preferences
      showOnboardingModal(() => {
        // After editing, show analysis modal again
        showAnalysisModal(pageText, pageUrl);
      });
    });

    // Close button handler
    const closeBtn = modal.querySelector('.piggybong-modal-close-btn');
    const overlay = modal.querySelector('.piggybong-modal-overlay');

    const closeModal = () => {
      modal.classList.add('closing');
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Trigger animation
    setTimeout(() => modal.classList.add('show'), 10);

    // Run AI analysis (product card already shown)
    runAIAnalysis(pageText, pageUrl, productInfo);
  }

  // Function to run AI analysis
  async function runAIAnalysis(pageText, pageUrl, productInfo) {
    const modalBody = document.querySelector('.piggybong-modal-body');

    console.log('🐷 runAIAnalysis() called');
    console.log('🐷 productInfo:', productInfo);

    try {
      // Get AI analysis (product info already extracted)
      console.log('🐷 Calling analyzeWithAI...');
      const aiResult = await analyzeWithAI(pageText, pageUrl, productInfo);
      console.log('🐷 AI Result:', aiResult);

      // Remove loading indicator, keep product card, add AI results
      const loadingDiv = modalBody.querySelector('.piggybong-loading');
      if (loadingDiv) {
        loadingDiv.remove();
      }

      // Generate context summary
      let contextSummary = '';
      if (productInfo.isCart && productInfo.items && productInfo.items.length > 0) {
        const itemNames = productInfo.items.map(item => {
          const name = item.name.split('-')[0].trim();
          return name;
        });
        const displayNames = itemNames.slice(0, 2).join(' & ');
        const itemCount = productInfo.items.length;
        contextSummary = `Analyzing ${itemCount} item${itemCount > 1 ? 's' : ''} from ${displayNames}${itemCount > 2 ? ' and more' : ''}`;
      } else {
        contextSummary = `Analyzing ${productInfo.name}`;
      }

      // Add AI analysis results below product card
      const analysisHTML = `

        <!-- Context Summary -->
        <div class="piggybong-context-summary">
          ${contextSummary}
        </div>

        <!-- Fan Style Assessment -->
        <div class="piggybong-assessment-card">
          <div class="assessment-header">
            <span class="assessment-title">Your Fan Style</span>
          </div>

          <!-- Fan Style Badge -->
          <div class="fanstyle-badge">
            <div class="fanstyle-emoji">${aiResult.fanStyleEmoji}</div>
            <div class="fanstyle-name">${aiResult.fanStyle}</div>
          </div>

          <!-- Why This Style (merged into card) -->
          <div class="reasoning-content-inline">
            ${aiResult.reasoning}
          </div>
        </div>

        <!-- Fan Tip -->
        <div class="piggybong-fan-tip">
          <h3>💡 Fan Tip</h3>
          <div class="fan-tip-content">
            ${aiResult.nextStep.replace(/[💕💎🌸✨🐷🌧️🎀]/g, '').trim()}
          </div>
        </div>
      `;

      // Insert AI results after product card
      modalBody.insertAdjacentHTML('beforeend', analysisHTML);
    } catch (error) {
      console.error('🐷 ❌ AI analysis failed:', error);
      console.error('🐷 Error details:', error.message);
      console.error('🐷 Error stack:', error.stack);
      showFallback(modalBody);
    }
  }

  // Extract cart/product info from page (Hybrid approach)
  function extractProductInfo(pageText) {
    console.log('🐷 extractProductInfo() START');
    const hostname = window.location.hostname;
    console.log('🐷 Hostname:', hostname);

    // Try site-specific extractors first
    if (hostname.includes('ktown4u')) {
      console.log('🐷 Hostname includes ktown4u, calling extractKtown4uCart...');
      const cartData = extractKtown4uCart();
      if (cartData) {
        console.log('🐷 ktown4u extractor returned data:', cartData);
        return cartData;
      }
      console.log('🐷 ktown4u extractor returned null, falling back to generic');
    } else if (hostname.includes('weverse')) {
      console.log('🐷 Hostname includes weverse, calling extractWeverseCart...');
      const cartData = extractWeverseCart();
      if (cartData) return cartData;
    } else {
      console.log('🐷 Hostname not recognized, using generic extraction');
    }

    // Fallback to generic extraction
    console.log('🐷 Calling generic cart extraction...');
    const result = extractGenericCart(pageText);
    console.log('🐷 Generic extraction returned:', result);
    return result;
  }

  // Site-specific: ktown4u.com cart extraction (modern Tailwind CSS site)
  function extractKtown4uCart() {
    console.log('🐷 Piggy Bong: Trying ktown4u cart extraction...');
    console.log('🐷 Current URL:', window.location.href);

    try {
      const items = [];

      // ktown4u structure: div.flex.w-full.flex-col.text-m2.text-black-21 contains each cart item
      const cartContainers = document.querySelectorAll('div.flex.w-full.flex-col.text-m2.text-black-21');
      console.log(`🐷 Found ${cartContainers.length} cart item containers`);

      cartContainers.forEach((container, index) => {
        if (index >= 3) return; // Max 3 items

        // Get artist name from span.text-m3.font-bold
        const artistSpan = container.querySelector('span.text-m3.font-bold');
        const artist = artistSpan ? artistSpan.textContent.trim() : '';

        // Get product description from span.block
        const descSpan = container.querySelector('span.block');
        const description = descSpan ? descSpan.textContent.trim() : '';

        const fullName = artist && description ? `${artist} - ${description}` : artist || description;

        // Get price - format is: <span>USD</span>37.12
        // Look for text like "USD 37.12" or just numbers after "USD"
        const priceText = container.innerText;
        const priceMatch = priceText.match(/USD\s*[\d,]+\.?\d*/i) || priceText.match(/[\d,]+\.?\d+/);
        const price = priceMatch ? priceMatch[0] : 'Price N/A';

        // Get quantity from input[type="number"]
        const qtyInput = container.querySelector('input[type="number"]');
        const qty = qtyInput ? qtyInput.value : '1';

        // Get image
        const img = container.querySelector('img');

        console.log(`🐷 Item ${index + 1}:`, {
          name: fullName.substring(0, 50),
          price,
          qty,
          hasImg: !!img
        });

        items.push({
          name: fullName.substring(0, 80),
          price: price,
          quantity: qty,
          image: img?.src || ''
        });
      });

      // Get cart total - ACCURATE extraction with discount/shipping handling
      let total = '';
      let totalBreakdown = {};

      // Strategy 1: Look for FINAL total (after discounts, shipping, tax)
      // Priority keywords: "final", "grand", "payment", "pay", "amount due"
      const finalTotalKeywords = ['grand total', 'final total', 'total amount', 'amount due', 'payment total', 'order total'];
      const allElements = document.querySelectorAll('*');

      for (const keyword of finalTotalKeywords) {
        for (const el of allElements) {
          const text = (el.innerText || el.textContent || '').toLowerCase();
          // Check if element contains keyword and has a price
          if (text.includes(keyword)) {
            const priceMatch = text.match(/USD\s*([\d,]+\.?\d*)/i);
            if (priceMatch) {
              const priceNum = parseFloat(priceMatch[1].replace(/,/g, ''));
              if (priceNum > 0) {
                total = `USD ${priceNum.toFixed(2)}`;
                console.log(`🐷 Found FINAL total with keyword "${keyword}": ${total}`);
                totalBreakdown.source = `final total (${keyword})`;
                break;
              }
            }
          }
        }
        if (total) break;
      }

      // Strategy 2: Look for elements with "total" in class/id (common pattern)
      if (!total) {
        const totalElements = document.querySelectorAll('[class*="total"], [id*="total"], [class*="Total"], [id*="Total"]');
        console.log(`🐷 Found ${totalElements.length} elements with 'total' in class/id`);

        // Find the LARGEST price (likely the final total after discounts)
        let maxPrice = 0;
        let maxPriceElement = null;

        for (const el of totalElements) {
          const text = el.innerText || el.textContent || '';
          const priceMatch = text.match(/USD\s*([\d,]+\.?\d*)/i);
          if (priceMatch) {
            const priceNum = parseFloat(priceMatch[1].replace(/,/g, ''));
            // Track the largest price (likely final total)
            if (priceNum > maxPrice && priceNum > 5) {
              maxPrice = priceNum;
              maxPriceElement = el;
            }
          }
        }

        if (maxPrice > 0) {
          total = `USD ${maxPrice.toFixed(2)}`;
          console.log(`🐷 Found cart total (largest in 'total' elements): ${total}`);
          totalBreakdown.source = 'total element';
        }
      }

      // Strategy 3: Manual calculation as LAST RESORT (may not include discounts/shipping)
      if (!total && items.length > 0) {
        let sum = 0;
        items.forEach(item => {
          const priceMatch = item.price.match(/([\d,]+\.?\d*)/);
          if (priceMatch) {
            const itemPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
            const qty = parseInt(item.quantity) || 1;
            sum += itemPrice * qty;
          }
        });
        if (sum > 0) {
          total = `~USD ${sum.toFixed(2)}`;
          console.log(`🐷 ⚠️ Estimated total by summing items (may not include discounts/shipping): ${total}`);
          totalBreakdown.source = 'estimated (items sum)';
          totalBreakdown.warning = 'Estimated - may not include discounts or shipping';
        }
      }

      if (items.length > 0) {
        console.log('🐷 SUCCESS! Extracted cart data:', { itemCount: items.length, total });
        return {
          isCart: true,
          items: items,
          total: total || 'Total not found',
          itemCount: items.length
        };
      } else {
        console.log('🐷 No items found, returning null');
      }
    } catch (error) {
      console.error('🐷 Ktown4u extraction failed:', error);
    }
    console.log('🐷 Ktown4u extraction returning null - will use fallback');
    return null;
  }

  // Site-specific: weverse.io cart extraction
  function extractWeverseCart() {
    try {
      const items = [];
      const cartItems = document.querySelectorAll('[class*="CartItem"], [class*="cart-item"]');

      if (cartItems.length > 0) {
        cartItems.forEach((item, index) => {
          if (index > 2) return;

          const img = item.querySelector('img');
          const name = item.querySelector('h3, [class*="name"]')?.textContent?.trim() || 'K-pop Item';
          const qty = item.querySelector('[class*="quantity"]')?.textContent?.trim() || '1';
          const price = item.querySelector('[class*="price"]')?.textContent?.trim() || '';

          items.push({
            name: name.substring(0, 60),
            price: price,
            quantity: qty,
            image: img?.src || ''
          });
        });

        const totalEl = document.querySelector('[class*="total"]');
        const total = totalEl?.textContent?.match(/[₩\$]?[\d,]+\.?\d*/)?.[0] || '';

        return {
          isCart: true,
          items: items,
          total: total,
          itemCount: items.length
        };
      }
    } catch (error) {
      console.error('Weverse extraction failed:', error);
    }
    return null;
  }

  // Generic cart/product extraction (fallback) - Works on all sites
  function extractGenericCart(pageText) {
    console.log('🐷 Using generic extraction (no site-specific extractor)');

    // Strategy: Look for universal patterns - images + prices + quantities
    const allImages = document.querySelectorAll('img');
    const productImages = Array.from(allImages).filter(img => {
      // Filter out small images (icons, logos) - products are usually >80px
      return img.width > 80 && img.height > 80;
    });

    console.log(`🐷 Found ${productImages.length} product-sized images on page`);

    const items = [];

    // For each large image, check if it's a cart item
    productImages.forEach((img, index) => {
      if (index >= 3) return; // Max 3 items

      // Get parent container (likely the cart item wrapper)
      const container = img.closest('div, tr, li, article');
      if (!container) return;

      const containerText = container.innerText || '';

      // Look for price near this image
      const priceMatch = containerText.match(/[\$₩€£]?[\d,]+\.?\d+|USD\s*[\d,]+\.?\d+|KRW\s*[\d,]+/i);
      const price = priceMatch ? priceMatch[0] : '';

      // Look for quantity input near this image
      const qtyInput = container.querySelector('input[type="number"]');
      const qty = qtyInput ? qtyInput.value : '1';

      // Get product name - usually first meaningful text in container
      const textNodes = Array.from(container.querySelectorAll('a, h1, h2, h3, h4, span, p'))
        .map(el => el.textContent.trim())
        .filter(text => text.length > 5 && text.length < 200);

      const name = textNodes[0] || 'K-pop Item';

      if (price) {
        console.log(`🐷 Generic item ${index + 1}:`, { name: name.substring(0, 40), price, qty });
        items.push({
          name: name.substring(0, 80),
          price: price,
          quantity: qty,
          image: img.src
        });
      }
    });

    // Try to find cart total - look for all prices on page
    const allPrices = pageText.match(/(?:USD|KRW|₩|\$|€|£)?\s*[\d,]+\.?\d*/gi) || [];
    const numericPrices = allPrices
      .map(p => parseFloat(p.replace(/[^\d.]/g, '')))
      .filter(n => !isNaN(n) && n > 0);

    let total = '';
    if (numericPrices.length > 0) {
      const maxPrice = Math.max(...numericPrices);
      total = `${maxPrice.toFixed(2)}`;
      console.log(`🐷 Generic total (largest price): ${total}`);
    }

    // If we found items with prices, return as cart
    if (items.length > 0) {
      console.log(`🐷 Generic extraction found ${items.length} items`);
      return {
        isCart: true,
        items: items,
        total: total || 'Total calculating...',
        itemCount: items.length
      };
    }

    // If no items found, return null instead of mock data
    console.log('🐷 No cart items found - returning null');
    return null;
  }

  // Show fallback UI
  function showFallback(modalBody) {
    modalBody.innerHTML = `
      <div class="piggybong-result">
        <h3>🐷 Priority Check</h3>
        <div class="piggybong-analysis">
          <p><strong>Quick Reflection:</strong></p>
          <p>Take a moment to check your collection goals! Are these items on your top picks list, or are you feeling the urgency of FOMO? ✨</p>
          <p><strong>Next Step:</strong> Close this window, take a deep breath, and review your wishlist.</p>
        </div>
      </div>
    `;
  }

  // AI Analysis function - returns structured data for Phia-style UI
  async function analyzeWithAI(pageText, pageUrl, productInfo) {
    console.log('🐷 analyzeWithAI() START');

    // Check if LanguageModel API is available (Chrome 140+ uses LanguageModel directly)
    console.log('🐷 Checking window.ai:', window.ai);
    console.log('🐷 Checking LanguageModel:', typeof LanguageModel !== 'undefined' ? LanguageModel : 'undefined');

    // Try new API first (Chrome 140+), then fall back to old API
    const hasNewAPI = typeof LanguageModel !== 'undefined';
    const hasOldAPI = window.ai && window.ai.languageModel;

    if (!hasNewAPI && !hasOldAPI) {
      console.error('🐷 ❌ Chrome Built-in AI not available!');
      throw new Error('AI not available - Chrome Built-in AI (Gemini Nano) not enabled');
    }

    console.log('🐷 Using API:', hasNewAPI ? 'LanguageModel (new)' : 'window.ai (old)');

    try {
      console.log('🐷 Creating AI session...');
      const systemPrompt = `You are Piggy Bong 🐷, a cheerful K-pop companion who helps fans reflect on their collection choices in a warm, non-judgmental way.

Context: You analyze what a fan is about to buy and describe their fan style. Your role is to encourage thoughtful fandom — not budgeting or finance. Never mention money, prices, cost, saving, or affordability. Instead, talk about priorities, collection goals, and emotional alignment.

POSSIBLE FAN STYLES:
💎 Collector – Deeply invested in collecting rare or special editions; values completeness and variety
🎀 Dedicated Fan – Thoughtful about their bias; selective and emotionally connected to certain eras or groups
🌸 Casual Listener – Enjoys fun or aesthetic merch casually; purchases are lighthearted or mood-based
🌧️ Impulse Zone – Excited and spontaneous; may buy quickly due to limited or trending items

RESPONSE FORMAT (JSON ONLY):
{
  "fanStyle": "Collector" | "Dedicated Fan" | "Casual Listener" | "Impulse Zone",
  "badgeText": "Treasure Item" | "Think It Over" | "FOMO Alert",
  "reasoning": "1–2 short sentences explaining what this cart says about their fan behavior",
  "nextStep": "A short, friendly suggestion or encouragement (NOT a question), helping the fan take the next step"
}

TONE & STYLE:
- Friendly, playful, and K-pop aware (bias, comeback, drop, photocard, etc.)
- Use emoticons naturally 💕💎🌸✨🐷
- Keep reasoning under 40 words, nextStep under 20 words
- Focus on emotional insight + gentle encouragement, not guilt or judgment
- NEVER mention: budget, money, finance, spending, afford, expensive, cheap, cost, save

NEXTSP RULES (IMPORTANT):
- Provide actionable suggestions, NOT questions
- Be a supportive friend offering next steps
- Examples of GOOD nextStep:
  * "💎 Maybe organize by bias or era before checking out — you're building something special!"
  * "🌧️ Take a breath, bookmark it, and come back after a playlist break — true treasures wait!"
  * "💕 Feels like a perfect bias pick! Add it to your collection goals ✨"
  * "🌸 Cute find! Maybe give it a day — your favorites always call you back"
- Examples of BAD nextStep (questions):
  * "Is this your bias, or comeback hype?" ❌
  * "Does this fit your collection focus?" ❌

EXAMPLES:
{
  "fanStyle": "Collector",
  "badgeText": "Think It Over",
  "reasoning": "Your cart mixes different groups and editions — classic collector behavior!",
  "nextStep": "💎 Maybe organize by bias or era before checking out — you're building something special!"
}

{
  "fanStyle": "Impulse Zone",
  "badgeText": "FOMO Alert",
  "reasoning": "Limited drops and mixed artists show that rush of excitement we all know too well.",
  "nextStep": "🌧️ Take a breath, bookmark it, and come back after a playlist break — true treasures wait!"
}

Return ONLY clean JSON. No markdown, no extra text.`;

      // Use appropriate API based on what's available
      const session = hasNewAPI
        ? await LanguageModel.create({
            systemPrompt,
            expectedOutputs: [
              { type: "text", languages: ["en"] }
            ]
          })
        : await window.ai.languageModel.create({
            systemPrompt,
            language: 'en'
          });
      console.log('🐷 AI session created:', session);

      // Build detailed prompt based on cart or single product
      let prompt = '';

      // Add personalization context if available
      const personalizationContext = PersonalizationHelper.getPersonalizationContext();

      if (productInfo.isCart && productInfo.items) {
        const itemsList = productInfo.items.map((item, i) =>
          `Item ${i+1}: ${item.name} (Qty: ${item.quantity}, Price: ${item.price})`
        ).join('\n');

        prompt = `${personalizationContext}
CART ANALYSIS:
${itemsList}
Total: ${productInfo.total}
Total Items: ${productInfo.itemCount}
Page: ${pageUrl}

Analyze this cart and return the fanStyle assessment as JSON.

IMPORTANT: Return ONLY the JSON object with these EXACT fields:
- fanStyle (string: "Collector" or "Dedicated Fan" or "Casual Listener" or "Impulse Zone")
- badgeText (string: "Treasure Item" or "Think It Over" or "FOMO Alert")
- reasoning (string: under 40 words, friendly tone)
- nextStep (string: a short friendly suggestion with emoji, NOT a question, under 20 words)

Return ONLY clean JSON. No markdown, no extra text.`;
      } else {
        prompt = `${personalizationContext}
PRODUCT ANALYSIS:
Product: ${productInfo.name}
Price: ${productInfo.price}
Page: ${pageUrl}

Analyze this purchase decision and return the fanStyle assessment as JSON.

IMPORTANT: Return ONLY the JSON object with these EXACT fields:
- fanStyle (string: "Collector" or "Dedicated Fan" or "Casual Listener" or "Impulse Zone")
- badgeText (string: "Treasure Item" or "Think It Over" or "FOMO Alert")
- reasoning (string: under 40 words, friendly tone)
- nextStep (string: a short friendly suggestion with emoji, NOT a question, under 20 words)

Return ONLY clean JSON. No markdown, no extra text.`;
      }

      console.log('🐷 Sending prompt to AI:', prompt);
      const result = await session.prompt(prompt);
      console.log('🐷 AI raw response:', result);

      // Parse AI response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('🐷 Parsed JSON:', parsed);

        // Check if required fields exist (new Fan Style format)
        if (parsed.fanStyle && parsed.badgeText && parsed.reasoning && parsed.nextStep) {
          // Determine badge class based on badgeText
          let badgeClass = 'badge-good';
          if (parsed.badgeText === 'Think It Over') badgeClass = 'badge-warning';
          if (parsed.badgeText === 'FOMO Alert') badgeClass = 'badge-alert';

          // Map fanStyle to emoji
          const fanStyleEmoji = {
            'Collector': '💎',
            'Dedicated Fan': '🎀',
            'Casual Listener': '🌸',
            'Impulse Zone': '🌧️'
          };

          console.log('🐷 ✅ AI analysis successful!');
          return {
            fanStyle: parsed.fanStyle,
            fanStyleEmoji: fanStyleEmoji[parsed.fanStyle] || '💭',
            badgeText: parsed.badgeText,
            badgeClass: badgeClass,
            reasoning: parsed.reasoning,
            nextStep: parsed.nextStep
          };
        } else {
          console.warn('🐷 ⚠️ AI returned JSON but missing required fields:', {
            hasFanStyle: !!parsed.fanStyle,
            hasBadgeText: !!parsed.badgeText,
            hasReasoning: !!parsed.reasoning,
            hasNextStep: !!parsed.nextStep
          });
        }
      }

      // Fallback if JSON parsing fails or missing required fields
      console.warn('🐷 ⚠️ Using fallback response');
      return {
        fanStyle: 'Casual Listener',
        fanStyleEmoji: '🌸',
        badgeText: 'Think It Over',
        badgeClass: 'badge-warning',
        reasoning: 'AI response was not in the expected format. Take a moment to reflect!',
        nextStep: '🌸 Maybe bookmark this and check your wishlist first — your heart knows best!'
      };

    } catch (error) {
      console.error('AI error:', error);
      throw error;
    }
  }

  console.log('🐷 Piggy Bong: Floating button injected!');
})();
