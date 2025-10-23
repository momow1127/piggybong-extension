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

export function handleEmptyCartClick(e) {
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
