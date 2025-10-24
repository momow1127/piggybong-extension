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

  // Check if user has existing preferences (editing mode)
  const isEditing = PersonalizationHelper.hasPersonalization();

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
          <p style="margin-bottom: 16px; color: #666; font-size: 14px; line-height: 1.5;">
            ${isEditing ? 'Update your K-pop collection preferences.' : 'Piggy Bong helps you prioritize K-pop items in your cart.'}
          </p>

          <!-- Your Lineup -->
          <div class="piggybong-form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; font-weight: 600; color: #333;">Your Lineup</label>
            <p style="font-size: 13px; color: #666; margin-bottom: 8px;">Type to search and add groups (optional)</p>

            <div style="position: relative;">
              <input
                type="text"
                id="lineup-search-input"
                placeholder="Search for groups (e.g., NewJeans, Stray Kids)..."
                autocomplete="off"
                style="width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;"
              />
              <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; pointer-events: none;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#999">
                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <div id="lineup-suggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>
            </div>

            <div id="selected-lineup" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;"></div>
          </div>

          <!-- Your Fan Priority -->
          <div class="piggybong-form-group" style="margin-bottom: 16px; margin-top: 8px;">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; font-weight: 600; color: #333;">Your Fan Priority</label>
            <p style="font-size: 13px; color: #666; margin-bottom: 8px;">What item types matter most? (select all that apply)</p>

            <div style="position: relative;">
              <div
                id="priority-dropdown-trigger"
                style="width: 100%; padding: 12px 40px 12px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background-color: white; cursor: pointer; min-height: 20px; background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27 viewBox=%270 0 12 8%27%3e%3cpath fill=%27%23333%27 d=%27M1.41 0L6 4.58 10.59 0 12 1.41l-6 6-6-6z%27/%3e%3c/svg%3e'); background-repeat: no-repeat; background-position: right 12px center; color: #999;"
              >
                Select item types...
              </div>

              <div id="priority-dropdown-menu" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <label style="display: flex; align-items: center; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0;">
                  <input type="checkbox" value="lightstick" class="priority-checkbox" data-label="Official Light Stick" style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer; accent-color: #5D2CEE;">
                  <span style="font-size: 13px;">Official Light Stick</span>
                </label>
                <label style="display: flex; align-items: center; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0;">
                  <input type="checkbox" value="album" class="priority-checkbox" data-label="Latest Album" style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer; accent-color: #5D2CEE;">
                  <span style="font-size: 13px;">Latest Album</span>
                </label>
                <label style="display: flex; align-items: center; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0;">
                  <input type="checkbox" value="seasongreetings" class="priority-checkbox" data-label="Season's Greetings" style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer; accent-color: #5D2CEE;">
                  <span style="font-size: 13px;">Season's Greetings</span>
                </label>
                <label style="display: flex; align-items: center; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0;">
                  <input type="checkbox" value="photocard" class="priority-checkbox" data-label="Photocard Set" style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer; accent-color: #5D2CEE;">
                  <span style="font-size: 13px;">Photocard Set</span>
                </label>
                <label style="display: flex; align-items: center; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0;">
                  <input type="checkbox" value="concert" class="priority-checkbox" data-label="Concert/Show" style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer; accent-color: #5D2CEE;">
                  <span style="font-size: 13px;">Concert/Show</span>
                </label>
                <label style="display: flex; align-items: center; padding: 8px 12px; cursor: pointer;">
                  <input type="checkbox" value="merchandise" class="priority-checkbox" data-label="Official Merchandise" style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer; accent-color: #5D2CEE;">
                  <span style="font-size: 13px;">Official Merchandise</span>
                </label>
              </div>
            </div>

            <div id="selected-priority" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;"></div>
          </div>

          <button
            id="piggy-save-preferences"
            class="piggybong-primary-btn"
            style="width: 100%; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #5D2CEE 0%, #8B55ED 100%); border: none; border-radius: 50px; color: white; font-weight: bold; cursor: pointer; font-size: 14px;"
          >
            ${isEditing ? 'Save Changes' : 'Save & Continue'}
          </button>

          ${!isEditing ? `
          <button
            id="piggy-skip-onboarding"
            style="width: 100%; margin-top: 10px; padding: 10px 24px; background: transparent; border: none; color: #5D2CEE; cursor: pointer; font-size: 14px; font-weight: 600; border-radius: 50px;"
          >
            Skip for Now
          </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // ============================================
  // Lineup Search/Autocomplete Logic
  // ============================================
  const KPOP_GROUPS = [
    'NewJeans', 'Stray Kids', 'LE SSERAFIM', 'IVE', 'MIYEON', 'SHINee',
    'BLACKPINK', 'BTS', 'TWICE', 'aespa', 'Red Velvet', 'ITZY',
    'SEVENTEEN', 'NCT', 'EXO', 'TXT', 'ENHYPEN', 'ATEEZ',
    'THE BOYZ', 'Kep1er', 'NMIXX', 'TREASURE', 'MONSTA X'
  ];

  const lineupSearchInput = modal.querySelector('#lineup-search-input');
  const lineupSuggestions = modal.querySelector('#lineup-suggestions');
  const selectedLineupContainer = modal.querySelector('#selected-lineup');
  const selectedGroups = new Set();

  // Load existing lineup if editing
  const existingLineup = PersonalizationHelper.getLineup();
  existingLineup.forEach(group => {
    selectedGroups.add(group);
    addLineupTag(group);
  });

  function addLineupTag(groupName) {
    const tag = document.createElement('div');
    tag.className = 'lineup-tag';
    tag.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #5D2CEE; color: white; border-radius: 20px; font-size: 13px; font-weight: 500;';
    tag.innerHTML = `
      <span>${groupName}</span>
      <button style="background: none; border: none; color: white; cursor: pointer; font-size: 16px; line-height: 1; padding: 0; margin: 0;" data-group="${groupName}">×</button>
    `;
    selectedLineupContainer.appendChild(tag);

    // Remove button handler
    tag.querySelector('button').addEventListener('click', (e) => {
      const group = e.target.dataset.group;
      selectedGroups.delete(group);
      tag.remove();
    });
  }

  lineupSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (!query) {
      lineupSuggestions.style.display = 'none';
      return;
    }

    const matches = KPOP_GROUPS.filter(group =>
      group.toLowerCase().includes(query) && !selectedGroups.has(group)
    );

    if (matches.length === 0) {
      lineupSuggestions.innerHTML = `<div style="padding: 12px; color: #666; font-size: 13px;">No matches. Press Enter to add "${e.target.value}"</div>`;
      lineupSuggestions.style.display = 'block';
    } else {
      lineupSuggestions.innerHTML = matches.map(group =>
        `<div class="suggestion-item" data-group="${group}" style="padding: 10px 12px; cursor: pointer; font-size: 14px; border-bottom: 1px solid #f0f0f0;">${group}</div>`
      ).join('');
      lineupSuggestions.style.display = 'block';

      // Add click handlers for suggestions
      lineupSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          item.style.background = '#f5f5f5';
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = 'white';
        });
        item.addEventListener('click', () => {
          const group = item.dataset.group;
          selectedGroups.add(group);
          addLineupTag(group);
          lineupSearchInput.value = '';
          lineupSuggestions.style.display = 'none';
        });
      });
    }
  });

  lineupSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const group = e.target.value.trim();
      if (!selectedGroups.has(group)) {
        selectedGroups.add(group);
        addLineupTag(group);
      }
      e.target.value = '';
      lineupSuggestions.style.display = 'none';
    }
  });

  // ============================================
  // Priority Dropdown Multi-Select Logic
  // ============================================
  const priorityTrigger = modal.querySelector('#priority-dropdown-trigger');
  const priorityMenu = modal.querySelector('#priority-dropdown-menu');
  const priorityCheckboxes = modal.querySelectorAll('.priority-checkbox');
  const selectedPriorityContainer = modal.querySelector('#selected-priority');
  const selectedPriorityTypes = new Set();

  // Toggle dropdown
  priorityTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    priorityMenu.style.display = priorityMenu.style.display === 'none' ? 'block' : 'none';
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!priorityTrigger.contains(e.target) && !priorityMenu.contains(e.target)) {
      priorityMenu.style.display = 'none';
    }
  });

  // Add priority tag (same pattern as lineup tags)
  function addPriorityTag(value, label) {
    const tag = document.createElement('div');
    tag.className = 'priority-tag';
    tag.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #5D2CEE; color: white; border-radius: 20px; font-size: 13px; font-weight: 500;';
    tag.innerHTML = `
      <span>${label}</span>
      <button style="background: none; border: none; color: white; cursor: pointer; font-size: 16px; line-height: 1; padding: 0; margin: 0;" data-value="${value}">×</button>
    `;
    selectedPriorityContainer.appendChild(tag);

    // Remove button handler
    tag.querySelector('button').addEventListener('click', (e) => {
      const typeValue = e.target.dataset.value;
      selectedPriorityTypes.delete(typeValue);

      // Uncheck corresponding checkbox
      const checkbox = modal.querySelector(`.priority-checkbox[value="${typeValue}"]`);
      if (checkbox) checkbox.checked = false;

      tag.remove();
    });
  }

  priorityCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      const label = e.target.dataset.label;

      if (e.target.checked) {
        if (!selectedPriorityTypes.has(value)) {
          selectedPriorityTypes.add(value);
          addPriorityTag(value, label);
        }
      } else {
        selectedPriorityTypes.delete(value);
        // Remove the tag
        const existingTag = selectedPriorityContainer.querySelector(`button[data-value="${value}"]`);
        if (existingTag) existingTag.parentElement.remove();
      }
    });
  });

  // Load existing priority if editing
  const existingPriority = PersonalizationHelper.getPriority();
  if (existingPriority) {
    // Handle both old single-type and new multi-type formats
    const types = Array.isArray(existingPriority.types) ? existingPriority.types : [existingPriority.type];
    priorityCheckboxes.forEach(checkbox => {
      if (types.includes(checkbox.value)) {
        checkbox.checked = true;
        selectedPriorityTypes.add(checkbox.value);
        addPriorityTag(checkbox.value, checkbox.dataset.label);
      }
    });
  }

  // ============================================
  // Save preferences and continue
  // ============================================
  const saveBtn = modal.querySelector('#piggy-save-preferences');
  console.log('🔍 Save button found:', saveBtn);

  saveBtn.addEventListener('click', () => {
    console.log('🔍 ========== SAVE BUTTON CLICKED ==========');
    // Get lineup from selected tags
    const lineup = Array.from(selectedGroups);

    // Get priority item types from checkboxes
    console.log('🔍 Total priority checkboxes found:', priorityCheckboxes.length);
    priorityCheckboxes.forEach((cb, i) => {
      console.log(`  Checkbox ${i}: value="${cb.value}" checked=${cb.checked}`);
    });

    const checkedPriorities = Array.from(priorityCheckboxes).filter(cb => cb.checked);
    const priorityTypes = checkedPriorities.map(cb => cb.value);

    console.log('🔍 Checked priorities:', checkedPriorities.length, priorityTypes);

    // Always save lineup (even if empty array) - allows optional personalization
    PersonalizationHelper.setLineup(lineup);
    console.log('🐷 Lineup set to:', lineup.length > 0 ? lineup : '(empty - just browsing)');

    // Save priority types if any selected
    if (priorityTypes.length > 0) {
      PersonalizationHelper.setPriority({
        types: priorityTypes, // Array of selected types
        name: priorityTypes.join(', ') // Human-readable name
      });
      console.log('🐷 Priority set to:', priorityTypes);
    } else {
      // Clear priority if editing and user removed all selections
      localStorage.removeItem('piggyPriority');
      console.log('🐷 Priority cleared (no types selected)');
    }

    modal.remove();
    if (callback) callback();
  });

  // Skip onboarding (only shown on first visit)
  const skipBtn = modal.querySelector('#piggy-skip-onboarding');
  const closeBtn = modal.querySelector('.piggybong-modal-close-btn');
  const overlay = modal.querySelector('.piggybong-modal-overlay');

  const skipOnboarding = (e) => {
    if (e) e.stopPropagation();
    modal.remove();
    // Only run callback if this is first-time onboarding (not editing)
    // If user is editing preferences and clicks X, just close - don't re-show main modal
    if (!isEditing && callback) {
      callback();
    }
  };

  // Skip button only exists on first visit (not when editing)
  if (skipBtn) {
    skipBtn.addEventListener('click', skipOnboarding);
  }
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
  console.log('🔍 Modal appended to body. Modal element:', modal);
  console.log('🔍 Modal classList:', modal.classList);
  console.log('🔍 Modal display style:', window.getComputedStyle(modal).display);

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
  setTimeout(() => {
    modal.classList.add('show');
    console.log('🔍 Added .show class to modal. classList now:', modal.classList);
    console.log('🔍 Modal should now be visible with transform: translateX(0)');
  }, 10);

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
    const startTime = Date.now();
    const aiResult = await analyzeWithAI(pageText, pageUrl, productInfo);
    console.log('🐷 AI Result:', aiResult);

    // Ensure loading screen shows for at least 800ms (smooth UX)
    const elapsedTime = Date.now() - startTime;
    const minDisplayTime = 800;
    const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

    await new Promise(resolve => setTimeout(resolve, remainingTime));

    // Remove loading indicator, keep product card, add AI results
    const loadingDiv = modalBody.querySelector('.piggybong-loading');
    console.log('🔍 Loading div found:', loadingDiv);
    if (loadingDiv) {
      console.log('🔍 Removing loading div...');
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
    console.log('🔍 Inserting analysis HTML into modalBody...');
    console.log('🔍 modalBody:', modalBody);
    console.log('🔍 analysisHTML length:', analysisHTML.length);
    modalBody.insertAdjacentHTML('beforeend', analysisHTML);
    console.log('🔍 Analysis HTML inserted successfully!');
  } catch (error) {
    console.error('🐷 ❌ AI analysis failed:', error);
    console.error('🐷 Error details:', error.message);
    console.error('🐷 Error stack:', error.stack);
    showFallback(modalBody);
  }
}
