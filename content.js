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

  // Add logo and text
  floatingBtn.innerHTML = `
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

  // Dragging logic
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  floatingBtn.addEventListener('mousedown', (e) => {
    // Only start drag if not clicking close button
    if (e.target.closest('.piggybong-close-btn')) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = floatingContainer.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    floatingContainer.style.transition = 'none';
    floatingContainer.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

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

  // Button click handler (open modal)
  floatingBtn.addEventListener('click', async (e) => {
    if (isDragging || e.target.closest('.piggybong-close-btn')) return;

    console.log('Piggy Bong button clicked!');

    // Get current page info
    const pageText = document.body.innerText || '';
    const pageUrl = window.location.href;

    // Create and show modal
    showPiggyBongModal(pageText, pageUrl);
  });

  // Generate cart HTML with items
  function generateCartHTML(cartData) {
    const itemsHTML = cartData.items.map(item => `
      <div class="cart-item-row">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-item-img">` : '<div class="cart-item-img-placeholder">📦</div>'}
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-details">Qty: ${item.quantity} × ${item.price || 'Price N/A'}</div>
        </div>
      </div>
    `).join('');

    return `
      <div class="piggybong-product-card">
        <div class="cart-header">
          <span class="cart-icon">🛒</span>
          <span class="cart-title">Your Cart (${cartData.itemCount} ${cartData.itemCount === 1 ? 'item' : 'items'})</span>
        </div>
        <div class="cart-items-list">
          ${itemsHTML}
        </div>
        ${cartData.total ? `<div class="cart-total">Total: ${cartData.total}</div>` : ''}
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

  // Function to show modal
  function showPiggyBongModal(pageText, pageUrl) {
    console.log('🐷 showPiggyBongModal called');
    console.log('🐷 Page URL:', pageUrl);

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

    modal.innerHTML = `
      <div class="piggybong-modal-overlay"></div>
      <div class="piggybong-modal-content">
        <div class="piggybong-modal-header">
          <div class="piggybong-brand">
            <span class="piggybong-brand-name">Piggy Bong</span>
          </div>
          <button class="piggybong-close-btn" aria-label="Close">×</button>
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

    // Close button handler
    const closeBtn = modal.querySelector('.piggybong-close-btn');
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

    try {
      // Get AI analysis (product info already extracted)
      const aiResult = await analyzeWithAI(pageText, pageUrl, productInfo);

      // Remove loading indicator, keep product card, add AI results
      const loadingDiv = modalBody.querySelector('.piggybong-loading');
      if (loadingDiv) {
        loadingDiv.remove();
      }

      // Add AI analysis results below product card
      const analysisHTML = `

        <!-- Priority Assessment (like Phia's price comparison) -->
        <div class="piggybong-assessment-card">
          <div class="assessment-header">
            <span class="assessment-icon">💭</span>
            <span class="assessment-title">Priority Assessment</span>
          </div>

          <!-- Visual meter with emoji labels -->
          <div class="priority-meter">
            <div class="meter-bar">
              <div class="meter-fill" style="width: ${aiResult.priorityLevel}%"></div>
              <div class="meter-indicator" style="left: ${aiResult.priorityLevel}%"></div>
            </div>
            <div class="meter-labels">
              <span>💜 Treasure</span>
              <span>🧡 Consider</span>
              <span>❤️ FOMO</span>
            </div>
          </div>

          <div class="priority-badge ${aiResult.badgeClass}">
            ${aiResult.badgeText}
          </div>
        </div>

        <!-- Why This Score? -->
        <div class="piggybong-reasoning">
          <h3>📊 Why This Score?</h3>
          <div class="reasoning-content">
            ${aiResult.reasoning}
          </div>
        </div>

        <!-- AI Reflection -->
        <div class="piggybong-reflection">
          <h3>💭 Reflection</h3>
          <div class="reflection-content">
            ${aiResult.reflection}
          </div>
        </div>
      `;

      // Insert AI results after product card
      modalBody.insertAdjacentHTML('beforeend', analysisHTML);
    } catch (error) {
      console.error('AI analysis failed:', error);
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

      // Get cart total - look for specific total element on ktown4u
      let total = '';

      // Strategy 1: Look for elements with "total" in class/id (most reliable)
      const totalElements = document.querySelectorAll('[class*="total"], [id*="total"], [class*="Total"], [id*="Total"]');
      console.log(`🐷 Found ${totalElements.length} elements with 'total' in class/id`);

      for (const el of totalElements) {
        const text = el.innerText || el.textContent || '';
        // Look for USD price in total element
        const priceMatch = text.match(/USD\s*([\d,]+\.?\d*)/i);
        if (priceMatch) {
          const priceNum = parseFloat(priceMatch[1].replace(/,/g, ''));
          // Cart total should be greater than individual items
          if (priceNum > 10) {
            total = `USD ${priceNum.toFixed(2)}`;
            console.log(`🐷 Found cart total in element with class="${el.className}": ${total}`);
            break;
          }
        }
      }

      // Strategy 2: If no total element found, sum up the individual item prices
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
          total = `USD ${sum.toFixed(2)}`;
          console.log(`🐷 Calculated cart total by summing items: ${total}`);
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

    // Fallback: Simple cart summary without detailed items
    console.log('🐷 Falling back to cart summary mode');

    // Count how many quantity inputs exist (indicates cart items)
    const qtyInputs = document.querySelectorAll('input[type="number"]');
    const itemCount = qtyInputs.length || 1;

    // Get first meaningful price as reference
    const pricePatterns = [
      /\$[\d,]+\.?\d*/,
      /[\d,]+\s*USD/i,
      /₩[\d,]+/,
      /[\d,]+\s*KRW/i,
      /€[\d,]+\.?\d*/,
      /£[\d,]+\.?\d*/
    ];

    let referencePrice = 'Price not shown';
    for (const pattern of pricePatterns) {
      const match = pageText.match(pattern);
      if (match) {
        referencePrice = match[0];
        break;
      }
    }

    // Return simplified cart summary
    return {
      isCart: true,
      itemCount: itemCount,
      items: [{
        name: `${itemCount} item${itemCount > 1 ? 's' : ''} in cart`,
        price: referencePrice,
        quantity: itemCount.toString(),
        image: ''
      }],
      total: total || numericPrices.length > 0 ? Math.max(...numericPrices).toFixed(2) : 'Calculating...'
    };
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
    // Check if LanguageModel API is available
    if (!window.LanguageModel) {
      throw new Error('AI not available');
    }

    try {
      const systemPrompt = `You are Piggy Bong 🐷, a warm, insightful K-pop companion that helps fans make thoughtful collection decisions.

Analyze shopping cart or product page and produce contextual emotional value check.

RESPONSE FORMAT (JSON):
{
  "priorityLevel": <number 0-100, where 0=treasure/collection goal, 30=moderate, 70=consider carefully, 100=pure FOMO>,
  "badgeText": "<use these: 'Treasure Item' (0-30), 'Think It Over' (31-70), 'FOMO Alert' (71-100)>",
  "reasoning": "<1-2 sentences explaining SPECIFIC FACTORS: duplicate items, comeback timing, limited edition, bias relevance, multiple groups in cart, completionist behavior, impulse patterns>",
  "reflection": "<1 warm QUESTION that encourages self-reflection, NOT advice. Use fan language: bias, comeback, photocard, lightstick, collection goals. Examples: 'Is this your bias, or comeback hype?' or 'Does this fit your collection focus, or are you chasing completeness?'>"
}

RULES:
1. NEVER use: budget, money, finance, spending, afford, expensive, cheap, cost, save
2. USE fan-language: bias, comeback, photocard, lightstick, limited edition, collection goals, must-haves, FOMO
3. In "reasoning": BE SPECIFIC about what you see (duplicates? multiple groups? limited edition? comeback timing?)
4. In "reflection": ASK A QUESTION, don't lecture. Be a supportive friend.
5. Tone = warm, fun, non-judgmental

EXAMPLES OF GOOD REASONING:
- "Multiple items from different groups (BTS + NewJeans) suggests browsing rather than focused collecting"
- "This appears to be a limited lightstick from your bias group, which aligns with collection goals"
- "Buying 3 versions of the same album may indicate completionist FOMO"
- "Random photocard bundles often lead to duplicates and storage overwhelm"

EXAMPLES OF GOOD REFLECTION (QUESTIONS, NOT ADVICE):
- "Are both groups your biases, or is one an impulse add?"
- "Is this comeback special to you, or are you caught in the hype?"
- "Do you need all versions, or is completeness calling louder than your collection heart?"
- "Will future-you treasure this, or is present-you just feeling FOMO?"`;

      const session = await window.LanguageModel.create({ systemPrompt });

      // Build detailed prompt based on cart or single product
      let prompt = '';
      if (productInfo.isCart && productInfo.items) {
        const itemsList = productInfo.items.map((item, i) =>
          `Item ${i+1}: ${item.name} (Qty: ${item.quantity}, Price: ${item.price})`
        ).join('\n');

        prompt = `CART ANALYSIS
${itemsList}
Total: ${productInfo.total}
Total Items: ${productInfo.itemCount}
Page: ${pageUrl}

Analyze this cart for FOMO patterns. Return JSON only.`;
      } else {
        prompt = `PRODUCT ANALYSIS
Product: ${productInfo.name}
Price: ${productInfo.price}
Page: ${pageUrl}

Analyze this purchase decision. Return JSON only.`;
      }

      const result = await session.prompt(prompt);

      // Parse AI response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Determine badge class based on new priority scale
        // 0-30: Treasure (green), 31-70: Think It Over (yellow), 71-100: FOMO (red)
        let badgeClass = 'badge-good';
        if (parsed.priorityLevel > 30) badgeClass = 'badge-warning';
        if (parsed.priorityLevel > 70) badgeClass = 'badge-alert';

        return {
          priorityLevel: parsed.priorityLevel || 50,
          badgeText: parsed.badgeText || 'Think It Over',
          badgeClass: badgeClass,
          reasoning: parsed.reasoning || 'Analyzing your collection patterns...',
          reflection: parsed.reflection || 'Does this align with your collection goals?'
        };
      }

      // Fallback if JSON parsing fails
      return {
        priorityLevel: 50,
        badgeText: 'Reflection Needed',
        badgeClass: 'badge-warning',
        reflection: result.trim()
      };

    } catch (error) {
      console.error('AI error:', error);
      throw error;
    }
  }

  console.log('🐷 Piggy Bong: Floating button injected!');
})();
