// ===========================================
// Cart Detection and Helper Functions
// ===========================================

export function isCartPage() {
  const url = window.location.href.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const pageText = document.body.innerText.toLowerCase();

  // Check URL patterns for cart/checkout pages (STRICT - must be in path or query)
  const cartUrlPatterns = [
    '/cart', '/basket', '/bag', '/checkout', '/mycart',
    '/order', '/purchase', '/payment',
    'step=1', 'step=2', 'step=3',
    'orderform', 'shoppingcart'
  ];

  // Strict URL check - must be in pathname or query params
  const hasCartUrl = cartUrlPatterns.some(pattern => pathname.includes(pattern) || url.includes(pattern));

  // If URL clearly indicates cart page, trust it immediately
  if (hasCartUrl) {
    return true;
  }

  // Check page content indicators (MORE STRICT - need strong signals)
  const strongCartIndicators = [
    'proceed to checkout',
    'order summary',
    'remove from cart',
    'update cart',
    'cart is empty',
    'your cart is empty',
    'items in cart',
    'cart total'
  ];

  // Only trust content indicators if we find MULTIPLE strong signals
  const strongSignalCount = strongCartIndicators.filter(text => pageText.includes(text)).length;

  // Need at least 2 strong signals to confirm it's a cart page (prevents false positives from nav menus)
  return strongSignalCount >= 2;
}

export function getCartItemCount() {
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

export function generateCartHTML(cartData) {
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

export function generateProductHTML(productData) {
  return `
    <div class="piggybong-product-card">
      <div class="product-info">
        <h2 class="product-name">${productData.name}</h2>
        <p class="product-price">${productData.price}</p>
      </div>
    </div>
  `;
}

export function showFallback(modalBody) {
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
