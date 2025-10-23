// ===========================================
// Modal UI Logic (Onboarding + Analysis)
// ===========================================

import { PersonalizationHelper } from '../utils/personalization.js';
import { showFallback } from '../utils/helpers.js';
import { extractProductInfo } from '../extractors/index.js';
import { analyzeWithAI } from '../ai/analyzeWithAI.js';

// Function to show onboarding modal (first-time personalization setup)
export function showOnboardingModal(callback) {
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
export function showPiggyBongModal(pageText, pageUrl) {
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
export function showAnalysisModal(pageText, pageUrl) {
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
          <p style="font-size: 12px; color: #757575; margin-top: 8px;">This takes a few seconds</p>
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
