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

  // Function to show modal
  function showPiggyBongModal(pageText, pageUrl) {
    // Remove existing modal if any
    const existingModal = document.getElementById('piggybong-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Extract product info immediately
    const productInfo = extractProductInfo(pageText);

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
          <!-- Show product card immediately -->
          <div class="piggybong-product-card">
            <div class="product-info">
              <h2 class="product-name">${productInfo.name}</h2>
              <p class="product-price">${productInfo.price}</p>
            </div>
          </div>

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

          <!-- Visual meter -->
          <div class="priority-meter">
            <div class="meter-bar">
              <div class="meter-fill" style="width: ${aiResult.priorityLevel}%"></div>
              <div class="meter-indicator" style="left: ${aiResult.priorityLevel}%"></div>
            </div>
            <div class="meter-labels">
              <span>Collection Goal</span>
              <span>FOMO Buy</span>
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

  // Extract product info from page
  function extractProductInfo(pageText) {
    // Try multiple price formats (USD, KRW, EUR, etc.)
    let price = 'Price not found';

    // Try finding price with various currency symbols and formats
    const pricePatterns = [
      /\$[\d,]+\.?\d*/,              // $29.99
      /[\d,]+\s*USD/i,               // 29.99 USD
      /₩[\d,]+/,                     // ₩29,900
      /[\d,]+\s*KRW/i,               // 29900 KRW
      /€[\d,]+\.?\d*/,               // €29.99
      /£[\d,]+\.?\d*/,               // £29.99
      /[\d,]+\.?\d*\s*원/,            // 29900원
    ];

    for (const pattern of pricePatterns) {
      const match = pageText.match(pattern);
      if (match) {
        price = match[0];
        break;
      }
    }

    // Try to extract product name from meta tags or page title
    let name = 'K-pop Item';
    const titleMatch = document.title.match(/^[^-|]+/);
    if (titleMatch) {
      name = titleMatch[0].trim().substring(0, 60);
    }

    return { name, price };
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
      const systemPrompt = `You are Piggy Bong, a K-pop Collection Alignment Specialist. You help fans make mindful collection decisions.

RULES:
1. NEVER use: budget, money, finance, spending, afford, expensive, cheap, cost, save
2. USE: priority, collection goals, must-haves, commitment, long-term value, top picks
3. Be warm, supportive, non-judgmental
4. Analyze if this is a collection goal or FOMO impulse

RESPONSE FORMAT (JSON):
{
  "priorityLevel": <number 0-100, where 0=perfect collection goal, 100=pure FOMO>,
  "badgeText": "<short phrase like 'Collection Priority' or 'FOMO Alert'>",
  "reasoning": "<1 sentence explaining WHY you gave this score - be specific about what made it collection goal vs FOMO>",
  "reflection": "<2-3 sentences of supportive guidance based on your reasoning>"
}

IMPORTANT: In "reasoning", clearly explain WHAT FACTORS led to your priority score. For example:
- "This appears to be a limited edition photocard from your bias, which aligns with focused collecting"
- "This seems like a random impulse triggered by seeing others buy it"
- "Multiple versions of the same album may indicate completionist FOMO rather than genuine collection need"`;

      const session = await window.LanguageModel.create({ systemPrompt });
      const prompt = `Product: ${productInfo.name}
Price: ${productInfo.price}
Page: ${pageUrl}

Analyze this K-pop purchase. Return JSON only.`;

      const result = await session.prompt(prompt);

      // Parse AI response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Determine badge class based on priority level
        let badgeClass = 'badge-good';
        if (parsed.priorityLevel > 70) badgeClass = 'badge-warning';
        if (parsed.priorityLevel > 85) badgeClass = 'badge-alert';

        return {
          priorityLevel: parsed.priorityLevel || 50,
          badgeText: parsed.badgeText || 'Consider Carefully',
          badgeClass: badgeClass,
          reasoning: parsed.reasoning || 'Analyzing your collection alignment...',
          reflection: parsed.reflection || 'Take a moment to reflect on your collection goals.'
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
