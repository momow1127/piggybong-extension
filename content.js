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

    // Get existing bias if any
    const existingBias = PersonalizationHelper.getBias() || '';
    const isEditing = existingBias;

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
            <p style="margin-bottom: 20px; color: #666; font-size: 14px; line-height: 1.6;">
              Want me to help prioritize what matches <strong>your bias</strong> in your cart? 💜
            </p>

            <div class="piggybong-form-group">
              <label for="piggy-bias-input" style="display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #4a4a4a;">Who's your #1 priority? (optional)</label>
              <input
                type="text"
                id="piggy-bias-input"
                placeholder="e.g., BLACKPINK, NewJeans, Stray Kids..."
                value="${existingBias}"
                style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;"
              />
              <p style="font-size: 12px; color: #999; margin-top: 6px;">I'll mention them by name in your priority tips!</p>
            </div>

            <button
              id="piggy-save-preferences"
              class="piggybong-primary-btn"
              style="width: 100%; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #5D2CEE 0%, #8B55ED 100%); border: none; border-radius: 50px; color: white; font-weight: bold; cursor: pointer; font-size: 14px;"
            >
              Save My Fan Priority
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

      if (bias) {
        PersonalizationHelper.setBias(bias);
        console.log('🐷 Bias set to:', bias);
      }

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
      // Only run callback if this is first-time onboarding (not editing)
      // If user is editing preferences and clicks X/Skip, just close - don't re-show main modal
      if (!isEditing && callback) {
        callback();
      }
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
            <p>Analyzing your cart...</p>
            <p style="font-size: 12px; color: #757575; margin-top: 8px;">First time: 3-5 seconds • After: 1-2 seconds</p>
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
        // After editing, show analysis modal again with FRESH page content
        const freshPageText = document.body.innerText || '';
        const freshPageUrl = window.location.href;
        showAnalysisModal(freshPageText, freshPageUrl);
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

      // Build individual item priority cards (merged in one frame)
      const itemsHTML = aiResult.items && aiResult.items.length > 0
        ? aiResult.items.map(item => `
          <div class="piggybong-priority-item">
            <div class="priority-item-header-row">
              <div class="priority-item-name">${item.name}</div>
              <span class="priority-badge priority-${item.priority.toLowerCase()}">${item.priority}</span>
            </div>
            <div class="priority-item-reasoning">${item.reasoning}</div>
          </div>
        `).join('')
        : '';

      // Add AI analysis results below product card
      const analysisHTML = `
        <!-- Priority Analysis Section (Items only) -->
        <div class="piggybong-priority-section">
          <h3>Your Fan Priority</h3>
          ${itemsHTML}
        </div>

        <!-- Overall Insight Section -->
        <div class="piggybong-overall-insight-section">
          <h3>💡 Overall Insight</h3>
          <div class="overall-insight-content">
            ${aiResult.overallInsight}
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

    const currentUrl = window.location.href;
    const isCartPage = currentUrl.includes('/cart');

    modalBody.innerHTML = `
      <div class="piggybong-result">
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
          <h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0;">
            ${isCartPage ? 'Your cart looks empty!' : 'No cart items found'}
          </h3>
          <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 16px 0;">
            ${isCartPage
              ? 'Add some K-pop items to your cart, then click me to see your priority breakdown! 💜'
              : 'Go to your shopping cart page and add some items, then I can help you prioritize! 🛍️'
            }
          </p>
          <div style="background: linear-gradient(135deg, #F3E5FF 0%, #E8D5FF 100%); padding: 16px; border-radius: 12px; border: 1px solid rgba(93, 44, 238, 0.2); text-align: left;">
            <p style="font-size: 13px; color: #5D2CEE; margin: 0 0 8px 0; font-weight: 700;">💡 How to use Piggy Bong:</p>
            <ol style="font-size: 13px; color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Add K-pop items to your cart</li>
              <li>Click the Piggy Bong button</li>
              <li>Get priority rankings for each item! 🔥</li>
            </ol>
          </div>
        </div>
      </div>
    `;
  }

  // Cache AI session to avoid recreating it every time (speeds up analysis)
  let cachedAISession = null;

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
      // Reuse cached session if available (much faster!)
      let session = cachedAISession;

      if (!session) {
        console.log('🐷 Creating NEW AI session (first time - this takes 2-3 seconds)...');
        const systemPrompt = `You are Piggy Bong — Your Smart Shopping Prioritizer! 🐷✨

Your mission:
Analyze K-pop shopping carts and rank items by ACTUAL VALUE to their collection — helping fans make decisions based on what truly moves their collection forward, not just vague feelings.

Personality:
You're a warm, supportive bestie helping them shop smart! Think: texting your friend about what's actually worth getting.
Always talk TO the user using "you" and "your" — NEVER about them using "they" or "the user"
Sound excited and friendly, not cold or analytical
Keep it SHORT and SWEET — 2-4 words for reasoning, 5-8 words for insights
Be positive and supportive, never judgmental or scolding

CRITICAL WRITING RULES:
❌ NEVER EVER use third-person: "This user...", "They are...", "The user is..."
❌ NEVER use clinical/analytical language: "demonstrates...", "evidenced by...", "indicating...", "likely dedicated to..."
❌ NEVER sound like a researcher observing behavior: "The purchase of X suggests...", "actively building...", "shows patterns..."
❌ NEVER sound scolding or judgmental: "Take a moment to think", "Quick check", "You should reflect"
❌ NEVER be negative about off-bias items: "doesn't align", "not your priority", "doesn't match"
❌ BANNED WORDS: "This user", "They're", "The user", "This person", "proactively", "evidenced", "indicating", "take a moment", "reflect on", "doesn't align", "not aligned"
✅ ALWAYS write in SECOND PERSON ("you're", "your", "you") like talking DIRECTLY TO the user
✅ ALWAYS sound warm, excited, and friendly: "Ooh!", "Love that!", "Your cart is looking fire!"
✅ ALWAYS celebrate their passion FIRST, then gently ask questions
✅ BE POSITIVE about everything: Multi-stanning is normal! Exploring new groups is fun! Never criticize choices.
✅ For off-bias/off-goal items: Just label them (e.g., "Different group"), DON'T say negative things
✅ Focus on WHAT MATTERS TO THEM (their bias, their goals), not what doesn't
✅ Use language like "Your [bias] items are top priority" NOT "This doesn't fit your goal"
✅ Start with enthusiasm: "Ooh", "Love", "Your cart" — NEVER "Take a moment" or "Quick check"

--------------------------------------------
USER CONTEXT (Dynamic Personalization)
--------------------------------------------
- Bias: ${PersonalizationHelper.getBias() || 'not specified'} (user's favorite group - their #1 priority!)
- Page Info: cart items, product names, group names, item count
- Device: On-device Gemini Nano (privacy-first)

--------------------------------------------
YOUR TASK: RANK EACH ITEM BY PRIORITY
--------------------------------------------
For EACH item in the cart, assign a priority badge (HIGH/MEDIUM/LOW) with specific reasoning.

**PRIORITY SCORING SYSTEM:**

Score each item 0-6 points based on:
- Matches bias (${PersonalizationHelper.getBias() || 'user bias'}): +2 points
- Completes a collection set: +2 points (look for: "last album needed", "completes era", "final member", etc.)
- Limited/rare edition: +1 point (look for: "limited", "exclusive", "special edition")
- Matches collection goal: +1 point

**PRIORITY BADGES:**
- 3-6 points = HIGH PRIORITY
- 1-2 points = MEDIUM PRIORITY
- 0 points = LOW PRIORITY

**FOR EACH ITEM, PROVIDE:**
1. Item name
2. Priority badge (HIGH/MEDIUM/LOW)
3. ULTRA SHORT reasoning (2-4 words ONLY!)
4. Be warm and friendly - like a supportive bestie!

🚨 CRITICAL: Reasoning MUST be 2-4 words MAXIMUM! NO NEGATIVE LANGUAGE!
❌ BAD: "Directly aligns with the user's bias for NewJeans and their collection goal of albums."
✅ GOOD: "Bias + album goal"

❌ BAD: "This is a merchandise item (holder) not an album. It doesn't align with the primary collection goal."
✅ GOOD: "Different item type"

❌ BAD: "Doesn't match your goal"
✅ GOOD: "Different group"

REMEMBER: Focus on what MATTERS to them (their bias, their goals), NOT on criticizing what doesn't!

**EXAMPLE OUTPUT STRUCTURE:**

If cart has 3 items:

Item 1: NewJeans "Get Up" Album
Priority: HIGH
Why: Completes your set

Item 2: NewJeans Haerin photocard
Priority: MEDIUM
Why: Bias match

Item 3: Stray Kids holder
Priority: LOW
Why: Off-bias

**Then add overall insight (5-8 words max, friendly tone!):**
"That album completes your collection"

--------------------------------------------
OUTPUT FORMAT (JSON ONLY)
--------------------------------------------
⚠️ FINAL CHECK BEFORE RESPONDING:
- Did you analyze EACH item individually with a priority badge? ✅
- Does your output include specific reasoning for each item's score? ✅
- Does your "overallInsight" use "You" or "Your" (second person)? ✅
- Does it contain "This user" or "They"? ❌ FIX IT!

Return JSON with these EXACT field names:

{
  "items": [
    {
      "name": "Item name from cart",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "reasoning": "2-4 words ONLY! Keep it positive!",
      "score": 0-6
    }
  ],
  "overallInsight": "5-8 words max! Warm, supportive tone!",
  "priorityTip": "A helpful question or prompt (5-8 words)"
}

Example:
{
  "items": [
    {
      "name": "NewJeans Get Up Album",
      "priority": "HIGH",
      "reasoning": "Completes your set",
      "score": 4
    },
    {
      "name": "NewJeans Haerin photocard",
      "priority": "MEDIUM",
      "reasoning": "Bias match",
      "score": 2
    },
    {
      "name": "Stray Kids holder",
      "priority": "LOW",
      "reasoning": "Off-bias",
      "score": 0
    }
  ],
  "overallInsight": "That album completes your collection",
  "priorityTip": "Which items feel essential"
}

--------------------------------------------
RULES - TONE IS EVERYTHING!
--------------------------------------------
✅ DO:
- ALWAYS use second person ("you", "your") — talk TO them, not ABOUT them
- BE ULTRA CONCISE — 2-4 words for reasoning, 5-8 words for insight
- Keep it warm, friendly, supportive — like a bestie!
- Use positive or neutral language only
- State facts simply, don't explain negatives
- For LOW priority: say "Off-bias" NOT "doesn't match your preference"
- Use emojis sparingly (2-3 max)

❌ DON'T - BANNED PHRASES:
- Never use third person ("This user", "They", "The user")
- Never write long explanations — BE BRIEF!
- Never use negative/judgmental language:
  ❌ "doesn't align", "unrelated to", "outside of", "doesn't complete", "doesn't fit"
  ❌ "limited relevance", "no indication", "doesn't match your goal", "not your priority"
  ❌ "isn't interested", "not aligned", "doesn't fit your collection"
  ❌ "won't help", "not relevant", "not useful", "not important"
  ❌ "this item is", "this is a", "not a direct match"
- Never use money words (budget, cost, save, price, afford)
- Never mention store names (Ktown4u, Weverse, Amazon)
- Never give generic advice ("browse more", "keep exploring")
- Never sound clinical, analytical, or scolding
- Never write multiple clauses or complex sentences
- Never criticize their choices — just help them prioritize what matters MOST

**TONE EXAMPLES - GOOD vs BAD:**

For reasoning (2-4 words):
❌ BAD (cold, analytical): "No bias match, doesn't complete NewJeans album collection goal"
✅ GOOD (warm, simple): "Off-bias"

❌ BAD (talking ABOUT user): "This is a Stray Kids item which doesn't align with your NewJeans preference"
✅ GOOD (warm, simple): "Off-bias"

❌ BAD (third person): "TVXQ is unrelated to user's preference"
✅ GOOD (simple fact): "Off-bias"

❌ BAD (long explanation): "Doesn't match your bias or complete your collection"
✅ GOOD (2-3 words): "Off-bias item"

❌ BAD (negative about off-bias): "Doesn't match your priority"
✅ GOOD (neutral): "Different group"

For overallInsight (5-8 words):
❌ BAD (cold, clinical): "You're browsing albums from groups outside of your preferred NewJeans"
✅ GOOD (warm, positive): "Exploring other groups too"

❌ BAD (judgmental): "The cart doesn't align with your goal of collecting NewJeans albums"
✅ GOOD (encouraging): "Focus on NewJeans first"

❌ BAD (analytical): "It seems you might be exploring other K-Pop merchandise"
✅ GOOD (friendly): "Branching out from NewJeans"

❌ BAD (negative): "These items won't help your NewJeans collection"
✅ GOOD (positive): "Your NewJeans album is top priority"

❌ BAD (discouraging multi-stanning): "Stick to your bias only"
✅ GOOD (supportive): "Multi-stanning or just exploring"

❌ BAD (negative about off-goal): "This doesn't fit your collection goal"
✅ GOOD (focus on what matters): "Your albums are the priority"

❌ BAD (critical): "Most of these don't match your goal"
✅ GOOD (positive): "Focus on your top priorities"

Remember: NEVER criticize their choices! Just help them see what matters MOST to them. Multi-stanning is totally normal!

--------------------------------------------
EXAMPLES
--------------------------------------------
**Example 1: Multi-Stan Cart (Positive about exploring!)**
Input: Cart has 3 NewJeans items + 1 Stray Kids item (user's bias is NewJeans)
Output:
{
  "items": [
    {
      "name": "NewJeans Get Up Album - Limited Edition",
      "priority": "HIGH",
      "reasoning": "Limited + completes set",
      "score": 5
    },
    {
      "name": "NewJeans Haerin photocard",
      "priority": "MEDIUM",
      "reasoning": "Bias match",
      "score": 2
    },
    {
      "name": "NewJeans keyring",
      "priority": "MEDIUM",
      "reasoning": "Bias merch",
      "score": 2
    },
    {
      "name": "Stray Kids holder",
      "priority": "LOW",
      "reasoning": "Different group",
      "score": 0
    }
  ],
  "overallInsight": "That NewJeans album is top priority",
  "priorityTip": "Multi-stanning or exploring Stray Kids",
}

**Example 2: All High Priority (Bias Collector)**
Input: Cart has 2 BLACKPINK items completing sets (user's bias is BLACKPINK)
Output:
{
  "items": [
    {
      "name": "BLACKPINK Born Pink - Final photobook version",
      "priority": "HIGH",
      "reasoning": "Completes photobook set",
      "score": 4
    },
    {
      "name": "BLACKPINK The Album - Limited pressing",
      "priority": "HIGH",
      "reasoning": "Limited edition",
      "score": 4
    }
  ],
  "overallInsight": "Both are high priority",
  "priorityTip": "Must-haves for your collection",
}

**Example 3: Single Item - High Priority**
Input: Cart has 1 item that matches bias and completes set (user's bias is aespa)
Output:
{
  "items": [
    {
      "name": "aespa MY WORLD - Final member photocard",
      "priority": "HIGH",
      "reasoning": "Completes your set",
      "score": 4
    }
  ],
  "overallInsight": "This completes your collection",
  "priorityTip": "Must-have for the set",
}

**Example 4: Single Item - Off-Bias (Multi-stanning is OK!)**
Input: Cart has 1 Stray Kids item (user's bias is NewJeans)
Output:
{
  "items": [
    {
      "name": "Stray Kids 5-STAR Album",
      "priority": "LOW",
      "reasoning": "Different group",
      "score": 0
    }
  ],
  "overallInsight": "Exploring Stray Kids too",
  "priorityTip": "Multi-stanning or just browsing",
}

**Example 5: All Items Same Priority (All Medium)**
Input: Cart has 3 items, all match bias but none complete sets (user's bias is IVE)
Output:
{
  "items": [
    {
      "name": "IVE Liz photocard",
      "priority": "MEDIUM",
      "reasoning": "Bias match",
      "score": 2
    },
    {
      "name": "IVE keyring",
      "priority": "MEDIUM",
      "reasoning": "Bias merch",
      "score": 2
    },
    {
      "name": "IVE poster",
      "priority": "MEDIUM",
      "reasoning": "Bias item",
      "score": 2
    }
  ],
  "overallInsight": "All IVE items match your bias",
  "priorityTip": "Which feels most essential",
}

**Example 6: Duplicate Versions**
Input: Cart has 3 versions of same album (user's bias is BLACKPINK)
Output:
{
  "items": [
    {
      "name": "Born Pink - Version A",
      "priority": "HIGH",
      "reasoning": "Bias + completes set",
      "score": 3
    },
    {
      "name": "Born Pink - Version B",
      "priority": "MEDIUM",
      "reasoning": "Duplicate version",
      "score": 2
    },
    {
      "name": "Born Pink - Digipack",
      "priority": "MEDIUM",
      "reasoning": "Another version",
      "score": 2
    }
  ],
  "overallInsight": "Three Born Pink versions",
  "priorityTip": "Collecting all versions",
}

**Example 7: No Bias Set**
Input: Cart has various items, user didn't set bias
Output:
{
  "items": [
    {
      "name": "NewJeans Get Up Album - Limited Edition",
      "priority": "MEDIUM",
      "reasoning": "Limited edition",
      "score": 1
    },
    {
      "name": "IVE poster",
      "priority": "LOW",
      "reasoning": "Common item",
      "score": 0
    }
  ],
  "overallInsight": "That limited album stands out",
  "priorityTip": "Which group excites you most",
}

❌ **BAD Examples (NEVER DO THIS):**

BAD reasoning (TOO LONG, COLD, ANALYTICAL, NEGATIVE):
❌ "Directly aligns with the user's bias for NewJeans and their collection goal of albums."
❌ "While not a direct bias match, TVXQ is a significant K-Pop group. It fulfills a collection goal (potentially) and could be valuable."
❌ "This is a merchandise item (holder) not an album. It doesn't align with the primary collection goal or bias."
❌ "Matches your bias, adds to collection but doesn't complete a set"
❌ "Common item, no special collection value"
❌ "Doesn't match your goal" ← NEGATIVE!
❌ "Not aligned with your bias" ← NEGATIVE!
❌ "Won't help your collection" ← NEGATIVE!

GOOD reasoning (2-4 WORDS, WARM, POSITIVE/NEUTRAL):
✅ "Bias + album goal"
✅ "Different group"
✅ "Bias match"
✅ "Limited edition"
✅ "Exploring new groups"
✅ "Different item type"

Other BAD phrases:
❌ "This user is building a collection" ← THIRD PERSON!
❌ "They're clearly dedicated" ← THIRD PERSON!
❌ "Save money for later" ← MONEY TALK!
❌ "Check out Ktown4u for deals" ← STORE NAME!
❌ "aligns with", "fulfills", "potentially", "primary", "significant" ← COLD WORDS!

Return ONLY clean JSON. No markdown, no extra text.`;

        // Use appropriate API based on what's available
        session = hasNewAPI
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

        // Cache the session for next time
        cachedAISession = session;
        console.log('🐷 AI session created and cached:', session);
      } else {
        console.log('🐷 Using CACHED AI session (much faster!)');
      }

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

Analyze this cart and rank EACH item with HIGH/MEDIUM/LOW priority badges!

Use the priority scoring system:
- Bias match: +2 points
- Completes collection set: +2 points
- Limited/rare edition: +1 point
- Matches collection goal: +1 point
Score 3-6 = HIGH 🔥, 1-2 = MEDIUM ✅, 0 = LOW 💭

IMPORTANT: Return ONLY the JSON object with these EXACT fields:
- items (array of objects, one for EACH cart item):
  - name (string: item name)
  - priority (string: "HIGH" or "MEDIUM" or "LOW")
  - badge (string: "🔥" or "✅" or "💭")
  - reasoning (string: why this priority - be specific!)
  - score (number: 0-6 based on scoring system)
- overallInsight (string: 2-3 sentences overall cart summary. Use second person!)
- priorityTip (string: A helpful question or prompt, under 20 words)
- emojiSet (string: 2-3 emojis matching the vibe)

Return ONLY clean JSON. No markdown, no extra text.`;
      } else {
        prompt = `${personalizationContext}
PRODUCT ANALYSIS:
Product: ${productInfo.name}
Price: ${productInfo.price}
Page: ${pageUrl}

Analyze this purchase and rank it with a HIGH/MEDIUM/LOW priority badge!

Use the priority scoring system:
- Bias match: +2 points
- Completes collection set: +2 points
- Limited/rare edition: +1 point
- Matches collection goal: +1 point
Score 3-6 = HIGH 🔥, 1-2 = MEDIUM ✅, 0 = LOW 💭

IMPORTANT: Return ONLY the JSON object with these EXACT fields:
- items (array with one object):
  - name (string: product name)
  - priority (string: "HIGH" or "MEDIUM" or "LOW")
  - badge (string: "🔥" or "✅" or "💭")
  - reasoning (string: why this priority - be specific!)
  - score (number: 0-6 based on scoring system)
- overallInsight (string: 2-3 sentences about this product. Use second person!)
- priorityTip (string: A helpful question or prompt, under 20 words)
- emojiSet (string: 2-3 emojis matching the vibe)

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

        // Check if required fields exist (new format: items, overallInsight, priorityTip)
        if (parsed.items && Array.isArray(parsed.items) && parsed.overallInsight && parsed.priorityTip) {
          console.log('🐷 ✅ AI priority analysis successful!');
          return {
            items: parsed.items,
            overallInsight: parsed.overallInsight,
            priorityTip: parsed.priorityTip,
            emojiSet: parsed.emojiSet || '🔥✅💭'
          };
        } else {
          console.warn('🐷 ⚠️ AI returned JSON but missing required fields:', {
            hasItems: !!parsed.items,
            isItemsArray: Array.isArray(parsed.items),
            hasOverallInsight: !!parsed.overallInsight,
            hasPriorityTip: !!parsed.priorityTip
          });
        }
      }

      // Fallback if JSON parsing fails or missing required fields
      console.warn('🐷 ⚠️ Using fallback response');
      return {
        items: [{
          name: 'Your items',
          priority: 'MEDIUM',
          badge: '✅',
          reasoning: 'Looking good! Check which items match your collection goals.',
          score: 2
        }],
        overallInsight: 'Ooh, your cart is looking good! 🛍️ Love the K-pop energy in here! ✨',
        priorityTip: 'Which items are you most excited about? Those are your priorities!',
        emojiSet: '🛍️💜✨'
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
