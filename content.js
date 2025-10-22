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
  // Cart Detection Logic (Strict Mode)
  // ===========================================

  function isCartPage() {
    const url = window.location.href.toLowerCase();
    const pageText = document.body.innerText.toLowerCase();

    // Check URL patterns for cart/checkout pages
    const cartUrlPatterns = [
      '/cart', '/basket', '/bag', '/checkout',
      '/order', '/purchase', '/payment',
      'step=1', 'step=2', 'step=3',
      'orderform', 'shoppingcart'
    ];

    // Check page content indicators
    const cartTextIndicators = [
      'shopping cart', 'shopping bag', 'my cart', 'your cart',
      'checkout', 'items in cart', 'proceed to checkout',
      'order summary', 'cart total', 'subtotal',
      'remove from cart', 'update cart', 'cart is empty'
    ];

    // Match either URL or page content
    const hasCartUrl = cartUrlPatterns.some(pattern => url.includes(pattern));
    const hasCartContent = cartTextIndicators.some(text => pageText.includes(text));

    return hasCartUrl || hasCartContent;
  }

  function getCartItemCount() {
    const pageText = document.body.innerText.toLowerCase();

    // Strategy 1: Look for explicit item count in text
    const itemCountPatterns = [
      /(\d+)\s*items?\s+in\s+cart/i,
      /cart\s*\((\d+)\)/i,
      /(\d+)\s*items?\s+total/i
    ];

    for (const pattern of itemCountPatterns) {
      const match = pageText.match(pattern);
      if (match) {
        const count = parseInt(match[1]);
        if (!isNaN(count)) return count;
      }
    }

    // Strategy 2: Check for "empty cart" indicators
    const emptyCartIndicators = [
      'cart is empty', 'your cart is empty', 'no items in cart',
      'shopping cart is empty', 'bag is empty', '0 items'
    ];

    if (emptyCartIndicators.some(text => pageText.includes(text))) {
      return 0;
    }

    // Strategy 3: Try to count cart item elements (site-specific)
    const hostname = window.location.hostname;

    if (hostname.includes('ktown4u')) {
      const cartItems = document.querySelectorAll('div.flex.w-full.flex-col.text-m2.text-black-21');
      return cartItems.length;
    }

    // Generic: count elements that look like cart items
    const genericCartItems = document.querySelectorAll('[class*="cart-item"], [class*="cartItem"], [class*="CartItem"]');
    if (genericCartItems.length > 0) {
      return genericCartItems.length;
    }

    // Unknown: assume cart has items (allow button to show)
    return -1; // -1 means "unknown, assume has items"
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

  // ===========================================
  // Main Initialization with Cart Detection
  // ===========================================

  let floatingContainer = null;
  let isButtonCreated = false;

  function createFloatingButton() {
    if (isButtonCreated) return;

    console.log('🐷 Creating Piggy Bong floating button...');

    // Create floating button container (for dragging + close button)
    floatingContainer = document.createElement('div');
    floatingContainer.id = 'piggybong-floating-container';
    floatingContainer.className = 'piggybong-float-container';

  // Create the main button
  const floatingBtn = document.createElement('button');
  floatingBtn.id = 'piggybong-floating-btn';
  floatingBtn.className = 'piggybong-float-btn';
  floatingBtn.setAttribute('aria-label', 'Piggy Bong Priority Check');

  // Get extension URLs (cache them early to avoid "Extension context invalidated" errors)
  const logoUrl = chrome.runtime.getURL('piggybong.png');
  const settingsIconUrl = chrome.runtime.getURL('settings.svg');

  // Add logo, text, and drag handle (no close button inside)
  floatingBtn.innerHTML = `
    <div class="piggybong-btn-icon">
      <img src="${logoUrl}" alt="Piggy Bong" />
    </div>
    <span class="piggybong-btn-text">Should I Buy This?</span>
    <div class="piggybong-drag-handle">
      <div class="drag-dots"></div>
    </div>
  `;

  // Create close button (separate from floatingBtn)
  const closeBtn = document.createElement('button');
  closeBtn.className = 'piggybong-close-btn';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Close Piggy Bong');
  closeBtn.title = 'Dismiss';

  // Add both to container
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

  // Mark button as created
  isButtonCreated = true;
  console.log('🐷 Piggy Bong: Floating button created successfully!');
  } // End of createFloatingButton()

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
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'piggybong-onboarding-title');

    const logoUrl = chrome.runtime.getURL('piggybong.png');

    // Get existing values if any
    const existingBias = PersonalizationHelper.getBias() || '';
    const existingGoal = PersonalizationHelper.getCollectionGoal() || '';
    const isEditing = existingBias || existingGoal;

    modal.innerHTML = `
      <div class="piggybong-modal-overlay" aria-hidden="true"></div>
      <div class="piggybong-modal-content" style="max-width: 450px;">
        <div class="piggybong-modal-header">
          <div class="piggybong-brand">
            <img src="${logoUrl}" alt="Piggy Bong" class="piggybong-header-logo">
            <span id="piggybong-onboarding-title" class="piggybong-brand-name">${isEditing ? 'Edit Preferences' : 'Welcome to Piggy Bong!'}</span>
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

    const skipOnboarding = (e) => {
      if (e) e.stopPropagation();
      modal.remove();
      if (callback) callback();
    };

    skipBtn.addEventListener('click', skipOnboarding);
    closeBtn.addEventListener('click', skipOnboarding);
    overlay.addEventListener('click', skipOnboarding);

    // Keyboard accessibility: Escape key to close onboarding
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        skipOnboarding(e);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);

    // Clean up event listener when modal is removed
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
      document.removeEventListener('keydown', handleEscapeKey);
      originalRemove();
    };
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
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'piggybong-modal-title');

    // Get extension resource URLs
    const logoUrl = chrome.runtime.getURL('piggybong.png');
    const settingsIconUrl = chrome.runtime.getURL('settings.svg');

    modal.innerHTML = `
      <div class="piggybong-modal-overlay" aria-hidden="true"></div>
      <div class="piggybong-modal-content">
        <div class="piggybong-modal-header">
          <div class="piggybong-brand">
            <img src="${logoUrl}" alt="Piggy Bong" class="piggybong-header-logo">
            <span id="piggybong-modal-title" class="piggybong-brand-name">Piggy Bong</span>
          </div>
          <div class="piggybong-header-actions">
            <button class="piggybong-settings-btn" aria-label="Edit Preferences" title="Edit your bias and collection goals">
              <img src="${settingsIconUrl}" alt="Settings" class="settings-icon" />
            </button>
            <button class="piggybong-modal-close-btn" aria-label="Close">×</button>
          </div>
        </div>

        <div class="piggybong-modal-body" role="main" aria-live="polite" aria-atomic="true">
          <!-- Loading state for AI analysis -->
          <div class="piggybong-loading">
            <div class="piggybong-spinner" role="status" aria-label="Loading"></div>
            <p>Analyzing your items in the cart...</p>
            <p style="font-size: 12px; color: #757575; margin-top: 8px;">This takes 3-5 seconds</p>
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

    const closeModal = (e) => {
      if (e) e.stopPropagation();
      modal.classList.add('closing');
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Keyboard accessibility: Escape key to close modal
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeModal(e);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);

    // Clean up event listener when modal is removed
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
      document.removeEventListener('keydown', handleEscapeKey);
      originalRemove();
    };

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

    // Check if productInfo is null (cart is empty or extraction failed)
    if (!productInfo || productInfo === null) {
      console.warn('🐷 ⚠️ No product info extracted - cart might be empty');
      showFallback(modalBody);
      return;
    }

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

          <!-- Analysis (merged into card) -->
          <div class="reasoning-content-inline">
            ${aiResult.analysis}
          </div>
        </div>

        <!-- Next Step -->
        <div class="piggybong-fan-tip">
          <h3>💡 Next Step</h3>
          <div class="fan-tip-content">
            ${aiResult.fanTip}
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
    // Remove loading state
    const loadingDiv = modalBody.querySelector('.piggybong-loading');
    if (loadingDiv) {
      loadingDiv.remove();
    }

    modalBody.innerHTML = `
      <div class="piggybong-result">
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
          <h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0;">Hmm, I can't see your cart items</h3>
          <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 16px 0;">
            This might be because your cart is empty, or the page layout is new to me.
          </p>
          <div style="background: #f9f9f9; padding: 16px; border-radius: 12px; border: 1px solid #e8e8e8; text-align: left;">
            <p style="font-size: 13px; color: #4a4a4a; margin: 0 0 8px 0; font-weight: 600;">💭 Quick Reflection:</p>
            <p style="font-size: 13px; color: #666; line-height: 1.5; margin: 0;">
              Before checking out, ask yourself: Are these items on your wishlist? Do they align with your collection goals? Take a breath and decide thoughtfully! ✨
            </p>
          </div>
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
      const systemPrompt = `You are Piggy Bong — an empathetic on-device K-pop fan companion that helps users reflect on their shopping habits before checkout.

Your mission:
Guide K-pop fans to make mindful, emotionally connected shopping decisions without judgment or financial language.

Personality:
Playful, warm, fandom-aware. Speaks like a supportive fan friend, NOT an AI analyst.
Use natural, conversational language — like texting a friend about their cart.
Occasionally uses K-pop-style emojis (💜✨🐷🎶).
Tone depends on the user's Fan Style (see below).

CRITICAL WRITING RULES:
❌ NEVER use clinical/analytical language: "This user demonstrates...", "evidenced by...", "likely dedicated to..."
❌ NEVER sound like a researcher observing behavior: "The purchase of X suggests...", "They're actively building..."
✅ ALWAYS write in second person ("you're", "your") like talking TO the user
✅ ALWAYS sound warm and friendly: "Ooh, you're building...", "Love that you're...", "Your collection is..."
✅ ALWAYS celebrate their passion, never analyze it from outside

--------------------------------------------
USER CONTEXT (Dynamic Personalization)
--------------------------------------------
- Bias: ${PersonalizationHelper.getBias() || 'not specified'} (user's favorite group, optional)
- Collection Type: ${PersonalizationHelper.getCollectionGoal() || 'not specified'} (e.g., albums, photocards, lightsticks)
- Page Info: cart items, product names, group names, item count, and estimated total
- Device: On-device Gemini Nano (privacy-first)

--------------------------------------------
TASK
--------------------------------------------
1. Read and interpret the cart text.
2. Identify emotional shopping patterns (bias loyalty, variety, impulse, etc.).
3. Determine the most fitting **Fan Style** from the list below.
4. Write a short, emotionally aware analysis (1–2 sentences).
5. Add a **contextual next step** — something the user can think or do before checking out (under 15 words).

--------------------------------------------
FAN STYLES (choose one)
--------------------------------------------
💎 **Collector**
Profile: Loves completeness, rare finds, and curating.
Tone: Warm, enthusiastic, celebrates their dedication. Talk like a supportive friend, not an analyst.
Example Analysis: "Ooh, you're building quite the collection! That Season's Greetings is a special touch — you really know how to curate. 💎"
Example Next Step: "Maybe display your ${PersonalizationHelper.getBias() || 'bias'} collection by era — it's looking impressive!"
❌ AVOID: "This user is actively building a collection, evidenced by multiple items" ← Too clinical!

🎀 **Dedicated Fan**
Profile: Emotionally connected to bias, intentional with purchases.
Tone: Warm, sentimental, bias-focused. Speak from the heart, acknowledge their love for their bias.
Example Analysis: "Your ${PersonalizationHelper.getBias() || 'bias'} collection is growing with so much love — that's what true fandom looks like! 💖"
Example Next Step: "Cherish this moment — your ${PersonalizationHelper.getBias() || 'bias'} shelf is becoming something special."
❌ AVOID: "They're likely dedicated to acquiring items" ← Too detached!

🌸 **Casual Listener**
Profile: Lighthearted, aesthetic, enjoys variety.
Tone: Playful, kind, and low-pressure. Be a chill friend who encourages them to take it easy.
Example Analysis: "You're exploring different groups — love the variety! K-pop is all about discovering new favorites. 🎶✨"
Example Next Step: "Sleep on it — your real must-haves will still be calling tomorrow!"
❌ AVOID: "This person demonstrates interest beyond listening" ← Too formal!

🌧️ **Impulse Zone**
Profile: Excitable, tends to buy quickly due to FOMO.
Tone: Gentle, calming, grounding. Be a caring friend helping them pause and breathe.
Example Analysis: "That limited edition caught your eye fast — totally get it, the excitement is real! 💭"
Example Next Step: "Take a breath — bookmark this and see how you feel tomorrow."
❌ AVOID: "User shows impulsive purchasing patterns" ← Too judgmental!

--------------------------------------------
SMART CONTEXTUAL SUGGESTION (New)
--------------------------------------------
After identifying the Fan Style, analyze the cart text to detect product types or behavioral cues.

Look for keywords like:
album, photocard, poster, lightstick, version, gift, pre-order, limited, edition

If multiple items are found:
- Acknowledge variety ("multiple albums," "several versions")
- Recognize bias loyalty if all items match ${PersonalizationHelper.getBias() || 'user bias'}
- Note exploration if groups or products are mixed
- Keep suggestions subtle and fandom-aware

Then write a short **fanTip** (max 15 words) that fits the style:
- Collector → organize, display, curate YOUR SPECIFIC COLLECTION
- Dedicated Fan → cherish, add to YOUR BIAS goals
- Casual Listener → pause, revisit, enjoy WITHOUT pressure
- Impulse Zone → breathe, reflect, bookmark THIS SPECIFIC CART

CRITICAL FOR fanTip:
❌ BANNED PHRASES - NEVER USE THESE:
- "Keep exploring" / "There's a whole world of merch"
- "Browse more" / "Check out more items"
- "Discover new" / "Find more"
- Any generic shopping encouragement

✅ REQUIRED - MUST MENTION:
- User's bias name: "${PersonalizationHelper.getBias()}"
- User's collection type: "${PersonalizationHelper.getCollectionGoal()}"
- Specific items in their cart (albums, photocards, etc.)

✅ GOOD Examples:
"Display your ${PersonalizationHelper.getBias() || 'bias'} photocard collection by era — it's getting impressive!"
"Maybe pick one ${PersonalizationHelper.getCollectionGoal() || 'item'} per member — quality over quantity!"
"Sleep on it — your ${PersonalizationHelper.getBias() || 'bias'} albums aren't going anywhere!"

--------------------------------------------
OUTPUT FORMAT (JSON ONLY)
--------------------------------------------
{
  "fanStyle": "Collector",
  "analysis": "Your cart shows loyalty to ${PersonalizationHelper.getBias() || 'your bias'} with a rare photocard — curated with care. 💎",
  "nextStep": "Maybe keep one version per bias — it'll make your collection shine!",
  "emojiSet": "💎📦🗂️"
}

--------------------------------------------
RULES
--------------------------------------------
- Never use money-related words (budget, cost, save, price, afford).
- Keep all outputs under 60 words total.
- Maintain emotional warmth and fandom fluency.
- ALWAYS mention ${PersonalizationHelper.getBias() || 'user bias'} or ${PersonalizationHelper.getCollectionGoal() || 'collection type'} in your response when available.
- NEVER mention store names, websites, or shopping platforms (no "Ktown4u", "Weverse", "Amazon", etc.).
- NEVER give generic shopping advice like "check for deals" or "browse more items".
- DO focus on emotional connection, collection goals, and personal reflection.
- Use emojis sparingly, only to enhance tone.

--------------------------------------------
EXAMPLES
--------------------------------------------
**GOOD Example 1:**
Input: Cart includes "NewJeans - Get Up Album" and "IVE - Poster."
Bias: NewJeans, CollectType: albums
Output:
{
  "fanStyle": "Collector",
  "analysis": "You're building a balanced mix — loyalty to NewJeans with a touch of curiosity for IVE. 💜",
  "fanTip": "Maybe display your NewJeans albums by era — your collection deserves the spotlight!",
  "emojiSet": "💎📦🗂️"
}

**GOOD Example 2:**
Input: Cart includes "Stray Kids - Limited Tape."
Bias: BTS, CollectType: photocards
Output:
{
  "fanStyle": "Impulse Zone",
  "analysis": "That Stray Kids drop feels exciting — limited items always tempt us. 🌧️",
  "fanTip": "Take a playlist break — your BTS photocard collection is your real priority.",
  "emojiSet": "🌧️🕊️💭"
}

**BAD Examples (DO NOT DO THIS):**
❌ "Don't forget to check Ktown4u for more rare finds!" ← Mentions store name
❌ "Browse more items to find better deals!" ← Generic shopping advice
❌ "Maybe save money for later!" ← Money talk
❌ "Keep exploring! There's a whole world of merch out there to discover." ← Way too generic!
❌ "Check out more items from different groups!" ← Generic browsing encouragement
❌ "Your collection is growing nicely!" ← No personalization, no specific advice

✅ GOOD Examples (DO THIS):
✅ "Display your NewJeans photocard collection by era — it's getting impressive!"
✅ "Maybe keep one album version per bias — your shelf will look curated!"
✅ "Sleep on it — your BTS collection isn't going anywhere!"

Return ONLY clean JSON. No markdown, no extra text.`;

      // Use appropriate API based on what's available
      const session = hasNewAPI
        ? await LanguageModel.create({
            systemPrompt,
            language: 'en',
            expectedOutputs: [
              { type: "text", languages: ["en"] }
            ]
          })
        : await window.ai.languageModel.create({
            systemPrompt,
            language: 'en'
          });
      console.log('🐷 AI session created:', session);

      // Defensive null check (should not happen due to earlier check, but just in case)
      if (!productInfo) {
        console.error('🐷 ❌ productInfo is null in analyzeWithAI');
        throw new Error('No product information available');
      }

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
- analysis (string: 1-2 sentences, emotionally aware, under 40 words)
- fanTip (string: a short friendly suggestion with emoji, NOT a question, under 20 words)
- emojiSet (string: 2-4 emojis that match the fanStyle tone)

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
- analysis (string: 1-2 sentences, emotionally aware, under 40 words)
- fanTip (string: a short friendly suggestion with emoji, NOT a question, under 20 words)
- emojiSet (string: 2-4 emojis that match the fanStyle tone)

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

        // Check if required fields exist (new format: analysis, fanTip, emojiSet)
        if (parsed.fanStyle && parsed.analysis && parsed.fanTip) {
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
            analysis: parsed.analysis,
            fanTip: parsed.fanTip,
            emojiSet: parsed.emojiSet || ''
          };
        } else {
          console.warn('🐷 ⚠️ AI returned JSON but missing required fields:', {
            hasFanStyle: !!parsed.fanStyle,
            hasAnalysis: !!parsed.analysis,
            hasFanTip: !!parsed.fanTip
          });
        }
      }

      // Fallback if JSON parsing fails or missing required fields
      console.warn('🐷 ⚠️ Using fallback response');
      return {
        fanStyle: 'Casual Listener',
        fanStyleEmoji: '🌸',
        analysis: 'AI response was not in the expected format. Take a moment to reflect on your cart! ✨',
        fanTip: 'Maybe bookmark this and check your wishlist first! 🌸',
        emojiSet: '🌸💭✨'
      };

    } catch (error) {
      console.error('AI error:', error);
      throw error;
    }
  }

  // Function to update button state based on cart contents
  function updateButtonState() {
    if (!floatingContainer) return;

    const itemCount = getCartItemCount();
    const floatingBtn = floatingContainer.querySelector('#piggybong-floating-btn');
    const btnText = floatingBtn?.querySelector('.piggybong-btn-text');

    // Always keep button text consistent and fully visible
    if (btnText) btnText.textContent = 'Should I Buy This?';

    // Log cart state for debugging
    if (itemCount === 0) {
      console.log('🐷 Cart is empty - button will show empty cart message');
    } else {
      console.log(`🐷 Cart has ${itemCount === -1 ? 'items (unknown count)' : itemCount + ' items'} - button ready for analysis`);
    }
  }

  // Function to handle empty cart click
  function handleEmptyCartClick(e) {
    const itemCount = getCartItemCount();

    if (itemCount === 0) {
      e.preventDefault();
      e.stopPropagation();

      // Show gentle message
      const modal = document.createElement('div');
      modal.className = 'piggybong-modal show';
      modal.innerHTML = `
        <div class="piggybong-modal-overlay"></div>
        <div class="piggybong-modal-content" style="max-width: 380px;">
          <div class="piggybong-modal-header">
            <div class="piggybong-brand">
              <img src="${chrome.runtime.getURL('piggybong.png')}" alt="Piggy Bong" class="piggybong-header-logo">
              <span class="piggybong-brand-name">Piggy Bong</span>
            </div>
            <button class="piggybong-modal-close-btn" aria-label="Close">×</button>
          </div>
          <div class="piggybong-modal-body">
            <div style="text-align: center; padding: 16px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
              <h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0;">Nothing in your cart yet!</h3>
              <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 0;">
                Add some K-pop items and I'll be here to help you decide before checkout
              </p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const closeBtn = modal.querySelector('.piggybong-modal-close-btn');
      const overlay = modal.querySelector('.piggybong-modal-overlay');

      const closeModal = (e) => {
        if (e) e.stopPropagation();
        modal.classList.add('closing');
        setTimeout(() => modal.remove(), 300);
      };

      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', closeModal);

      return false;
    }
  }

  // ===========================================
  // Cart Detection & Initialization
  // ===========================================

  function initializePiggyBong() {
    console.log('🐷 Piggy Bong: Checking if this is a cart page...');

    // Strict mode: only show on cart pages
    if (!isCartPage()) {
      console.log('🐷 Not a cart page - button will not be shown');
      return;
    }

    console.log('🐷 Cart page detected! Initializing button...');
    createFloatingButton();
    updateButtonState();

    // Add empty cart handler to the button
    const floatingBtn = document.getElementById('piggybong-floating-btn');
    if (floatingBtn) {
      floatingBtn.addEventListener('click', handleEmptyCartClick, true); // Capture phase
    }
  }

  // ===========================================
  // MutationObserver for Dynamic Cart Detection
  // ===========================================

  let reCheckTimeout = null;

  function scheduleReCheck() {
    // Debounce: only re-check after 2 seconds of no mutations
    clearTimeout(reCheckTimeout);
    reCheckTimeout = setTimeout(() => {
      console.log('🐷 Re-checking cart state...');

      // If cart page detected and button doesn't exist yet, create it
      if (isCartPage() && !isButtonCreated) {
        console.log('🐷 Cart appeared dynamically - creating button now!');
        createFloatingButton();
        updateButtonState();

        const floatingBtn = document.getElementById('piggybong-floating-btn');
        if (floatingBtn) {
          floatingBtn.addEventListener('click', handleEmptyCartClick, true);
        }
      }

      // If button exists, update its state
      if (isButtonCreated) {
        updateButtonState();
      }
    }, 2000);
  }

  // Watch for DOM changes (for AJAX cart updates)
  const observer = new MutationObserver((mutations) => {
    // Only care about meaningful changes (text/structure)
    const hasSignificantChange = mutations.some(mutation =>
      mutation.type === 'childList' ||
      (mutation.type === 'characterData' && mutation.target.textContent.length > 10)
    );

    if (hasSignificantChange) {
      scheduleReCheck();
    }
  });

  // Start observing after DOM is ready
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    console.log('🐷 MutationObserver started - watching for dynamic cart updates');
  }

  // Initial check on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePiggyBong);
  } else {
    initializePiggyBong();
  }

  console.log('🐷 Piggy Bong: Content script loaded');

  // Listen for messages from toolbar to trigger floating button click or close modal
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openModal") {
      console.log('🐷 Received openModal message from toolbar');

      // Check if modal is already open
      const existingModal = document.getElementById('piggybong-modal') || document.getElementById('piggybong-onboarding-modal');

      if (existingModal) {
        // Modal is open, close it
        console.log('🐷 Modal already open, closing it');
        existingModal.classList.add('closing');
        setTimeout(() => existingModal.remove(), 300);
        sendResponse({ success: true, action: 'closed' });
      } else {
        // Modal is not open, check if floating button exists
        let floatingBtn = document.getElementById('piggybong-floating-btn');

        // If button doesn't exist yet, create it first (user clicked toolbar before button loaded)
        if (!floatingBtn && !isButtonCreated) {
          console.log('🐷 Button not created yet, creating it now...');
          createFloatingButton();
          updateButtonState();
          floatingBtn = document.getElementById('piggybong-floating-btn');
        }

        if (floatingBtn) {
          // Directly trigger the modal instead of clicking button (to avoid empty cart handler)
          console.log('🐷 Triggering modal directly...');
          const pageText = document.body.innerText || '';
          const pageUrl = window.location.href;
          showPiggyBongModal(pageText, pageUrl);
          sendResponse({ success: true, action: 'opened' });
        } else {
          console.error('🐷 Floating button could not be created!');
          sendResponse({ success: false, error: 'Button could not be created' });
        }
      }
    }
    return true; // Keep message channel open for async response
  });
})();
