// ===========================================
// Generic cart/product extraction (fallback)
// Works on all sites
// ===========================================

export function extractGenericCart(pageText) {
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
