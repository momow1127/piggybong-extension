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

  // Create floating button
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

  // Add button to page
  document.body.appendChild(floatingBtn);

  // Button click handler
  floatingBtn.addEventListener('click', async () => {
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

  // Site-specific: ktown4u.com cart extraction
  function extractKtown4uCart() {
    console.log('🐷 Piggy Bong: Trying ktown4u cart extraction...');
    console.log('🐷 Current URL:', window.location.href);

    try {
      const items = [];

      // Try multiple selector patterns for ktown4u
      const selectorPatterns = [
        '.cart_product_item',
        '.cart-item',
        '[class*="cart_list"] tr',
        'table.cart tr',
        '.product-cart tbody tr',
        '[id*="cart"] tbody tr'
      ];

      let cartItems = [];
      for (const selector of selectorPatterns) {
        const found = document.querySelectorAll(selector);
        console.log(`🐷 Trying selector "${selector}": found ${found.length} items`);
        if (found.length > 0) {
          cartItems = found;
          break;
        }
      }

      if (cartItems.length > 0) {
        console.log(`🐷 Found ${cartItems.length} cart items!`);
        cartItems.forEach((item, index) => {
          if (index > 2) return; // Max 3 items

          const img = item.querySelector('img');

          // Try multiple name selectors
          const nameSelectors = ['.product_name', '.goods_name', 'td a', 'a', 'h3', '.name'];
          let name = 'K-pop Item';
          for (const sel of nameSelectors) {
            const nameEl = item.querySelector(sel);
            if (nameEl && nameEl.textContent.trim()) {
              name = nameEl.textContent.trim();
              break;
            }
          }

          // Try multiple quantity selectors
          const qtyEl = item.querySelector('input[type="number"], .qty, .quantity, [class*="qty"]');
          const qty = qtyEl?.value || qtyEl?.textContent?.trim() || '1';

          // Try multiple price selectors
          const priceSelectors = ['.price', '[class*="price"]', 'td.price', '.amount'];
          let price = '';
          for (const sel of priceSelectors) {
            const priceEl = item.querySelector(sel);
            if (priceEl && priceEl.textContent.trim()) {
              price = priceEl.textContent.trim();
              break;
            }
          }

          console.log(`🐷 Item ${index + 1}:`, { name: name.substring(0, 30), price, qty, hasImg: !!img });

          items.push({
            name: name.substring(0, 60),
            price: price,
            quantity: qty,
            image: img?.src || ''
          });
        });
      }

      // Get cart total - try multiple selectors
      const totalSelectors = [
        '.total_price',
        '.cart_total',
        '[class*="total"]',
        '#total',
        '.grand-total',
        '.order-total'
      ];

      let total = '';
      for (const selector of totalSelectors) {
        const totalEl = document.querySelector(selector);
        if (totalEl) {
          const match = totalEl.textContent?.match(/\$?[\d,]+\.?\d*/);
          if (match) {
            total = match[0];
            console.log(`🐷 Found total with selector "${selector}":`, total);
            break;
          }
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

  // Generic cart/product extraction (fallback)
  function extractGenericCart(pageText) {
    // Try to detect cart items with common patterns
    const cartSelectors = [
      '.cart-item', '.basket-item', '.checkout-item',
      '[class*="cart-product"]', '[class*="cart_item"]',
      '[class*="CartItem"]', 'tr[class*="cart"]'
    ];

    let items = [];
    for (const selector of cartSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach((el, index) => {
          if (index > 2) return; // Max 3 items

          const img = el.querySelector('img');
          const nameEl = el.querySelector('h2, h3, h4, .name, [class*="name"], a');
          const qtyEl = el.querySelector('input[type="number"], .qty, .quantity, [class*="quantity"]');
          const priceEl = el.querySelector('.price, [class*="price"]');

          if (nameEl) {
            items.push({
              name: nameEl.textContent?.trim().substring(0, 60) || 'K-pop Item',
              price: priceEl?.textContent?.trim() || '',
              quantity: qtyEl?.value || qtyEl?.textContent?.trim() || '1',
              image: img?.src || ''
            });
          }
        });

        if (items.length > 0) break;
      }
    }

    // If cart items found, get total
    if (items.length > 0) {
      const totalSelectors = ['.total', '.cart-total', '[class*="total"]', '[class*="Total"]'];
      let total = '';

      for (const selector of totalSelectors) {
        const totalEl = document.querySelector(selector);
        if (totalEl) {
          const match = totalEl.textContent?.match(/[\$₩€£]?[\d,]+\.?\d*/);
          if (match) {
            total = match[0];
            break;
          }
        }
      }

      return {
        isCart: true,
        items: items,
        total: total || 'Total not found',
        itemCount: items.length
      };
    }

    // Fallback: single product page
    const pricePatterns = [
      /\$[\d,]+\.?\d*/,              // $29.99
      /[\d,]+\s*USD/i,               // 29.99 USD
      /₩[\d,]+/,                     // ₩29,900
      /[\d,]+\s*KRW/i,               // 29900 KRW
      /€[\d,]+\.?\d*/,               // €29.99
      /£[\d,]+\.?\d*/,               // £29.99
      /[\d,]+\.?\d*\s*원/,            // 29900원
    ];

    let price = 'Price not found';
    for (const pattern of pricePatterns) {
      const match = pageText.match(pattern);
      if (match) {
        price = match[0];
        break;
      }
    }

    const titleMatch = document.title.match(/^[^-|]+/);
    const name = titleMatch ? titleMatch[0].trim().substring(0, 60) : 'K-pop Item';

    return {
      isCart: false,
      name: name,
      price: price
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
