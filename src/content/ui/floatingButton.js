// ===========================================
// Floating Button UI with Drag and Close
// ===========================================

import { getCartItemCount } from '../utils/helpers.js';

export let floatingContainer = null;
export let isButtonCreated = false;

export function createFloatingButton(showPiggyBongModalCallback) {
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

  // Add logo, text, and drag handle (no close button inside)
  floatingBtn.innerHTML = `
    <div class="piggybong-btn-icon">
      <img src="${logoUrl}" alt="Piggy Bong" />
    </div>
    <div class="piggybong-btn-text">
      <div class="piggybong-btn-title">Piggy Bong</div>
      <div class="piggybong-btn-subtitle">K-pop Fan Companion</div>
    </div>
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

    // Hide floating button immediately
    floatingContainer.style.display = 'none';
    console.log('🐷 Floating button hidden');

    // Check for empty cart first
    const itemCount = getCartItemCount();
    if (itemCount === 0) {
      e.preventDefault();
      e.stopPropagation();
      handleEmptyCartClick(e, showPiggyBongModalCallback);
      return;
    }

    // Get current page info
    const pageText = document.body.innerText || '';
    const pageUrl = window.location.href;

    // Create and show modal
    showPiggyBongModalCallback(pageText, pageUrl);
  });

  // Mark button as created
  isButtonCreated = true;
  console.log('🐷 Piggy Bong: Floating button created successfully!');
}

export function updateButtonState() {
  if (!floatingContainer) return;

  const itemCount = getCartItemCount();
  const floatingBtn = floatingContainer.querySelector('#piggybong-floating-btn');
  const btnTitle = floatingBtn?.querySelector('.piggybong-btn-title');
  const btnSubtitle = floatingBtn?.querySelector('.piggybong-btn-subtitle');

  // Always keep button text consistent and fully visible
  if (btnTitle) btnTitle.textContent = 'Piggy Bong';
  if (btnSubtitle) btnSubtitle.textContent = 'K-pop Fan Companion';

  // Log cart state for debugging
  if (itemCount === 0) {
    console.log('🐷 Cart is empty - button will show empty cart message');
  } else {
    console.log(`🐷 Cart has ${itemCount === -1 ? 'items (unknown count)' : itemCount + ' items'} - button ready for analysis`);
  }
}

export function handleEmptyCartClick(e, showPiggyBongModalCallback) {
  const itemCount = getCartItemCount();

  if (itemCount === 0) {
    e.preventDefault();
    e.stopPropagation();

    // Show empty state with demo and preferences options
    const modal = document.createElement('div');
    modal.className = 'piggybong-modal show';
    modal.innerHTML = `
      <div class="piggybong-modal-overlay"></div>
      <div class="piggybong-modal-content" style="max-width: 420px;">
        <div class="piggybong-modal-header">
          <div class="piggybong-brand">
            <img src="${chrome.runtime.getURL('piggybong.png')}" alt="Piggy Bong" class="piggybong-header-logo">
            <span class="piggybong-brand-name">Piggy Bong</span>
          </div>
          <button class="piggybong-modal-close-btn" aria-label="Close">×</button>
        </div>
        <div class="piggybong-modal-body">
          <div style="text-align: center; padding: 20px;">
            <div style="width: 120px; height: 120px; margin: 0 auto 20px; background: linear-gradient(135deg, #5D2CEE 0%, #8B55ED 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <img src="${chrome.runtime.getURL('piggybong.png')}" alt="Piggy Bong" style="width: 80px; height: 80px; filter: brightness(0) invert(1);">
            </div>
            <h3 style="font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px 0;">Smart Shopping Starts Here</h3>
            <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px 0;">
              Add K-pop items to your cart or try a quick demo
            </p>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <button
                id="try-demo-btn"
                class="piggybong-primary-btn"
                style="width: 100%; padding: 14px 24px; background: linear-gradient(135deg, #5D2CEE 0%, #8B55ED 100%); border: none; border-radius: 50px; color: white; font-weight: 600; cursor: pointer; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(93, 44, 238, 0.3);"
              >
                Try Demo
              </button>
              <button
                id="set-preferences-btn"
                style="width: 100%; padding: 12px 24px; background: white; border: 2px solid #5D2CEE; border-radius: 50px; color: #5D2CEE; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s;"
              >
                Set Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Hide floating button when empty cart modal opens
    const floatingButton = document.getElementById('piggybong-floating-container');
    if (floatingButton) {
      floatingButton.style.display = 'none';
    }

    const closeBtn = modal.querySelector('.piggybong-modal-close-btn');
    const overlay = modal.querySelector('.piggybong-modal-overlay');
    const tryDemoBtn = modal.querySelector('#try-demo-btn');
    const setPreferencesBtn = modal.querySelector('#set-preferences-btn');

    const closeModal = (e) => {
      if (e) e.stopPropagation();
      modal.classList.add('closing');
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Try Demo button - show demo analysis
    tryDemoBtn.addEventListener('click', () => {
      modal.remove();
      showDemoMode(showPiggyBongModalCallback);
    });

    // Set Preferences button - open onboarding modal (first-time setup)
    setPreferencesBtn.addEventListener('click', () => {
      modal.remove();
      // Import and call showOnboardingModal
      import('./modal.js').then(({ showOnboardingModal }) => {
        // Pass empty callback - user is setting up first time, no analysis to return to
        // But provide callback so back button doesn't error
        showOnboardingModal(() => {
          console.log('🐷 First-time preferences saved from empty cart flow');
          // No action needed - user will manually add items and analyze later
        });
      });
    });

    // Clean up: show floating button when modal is removed
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
      const floatingButton = document.getElementById('piggybong-floating-container');
      if (floatingButton) {
        floatingButton.style.display = '';  // Reset to default
      }
      originalRemove();
    };

    return false;
  }
}

// Demo mode with mock K-pop cart items
function showDemoMode(showPiggyBongModalCallback) {
  // Create mock page data with K-pop items
  const mockPageText = `
    Shopping Cart

    NewJeans - The 2nd EP 'Get Up' Album
    Price: $24.99
    Korean girl group debut album with photo book and photocard

    aespa - Official Photocard Set (Savage Era)
    Price: $18.99
    Collectible photocards from Savage album era

    BLACKPINK - Official Light Stick Ver 2
    Price: $65.00
    Official lightstick for concerts and events

    Cart Total: $108.98
  `;

  const mockPageUrl = 'https://demo.piggybong.app/cart';

  // Call the main modal with demo data
  showPiggyBongModalCallback(mockPageText, mockPageUrl, { isDemo: true });
}
