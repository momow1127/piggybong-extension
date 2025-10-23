// ===========================================
// Site-specific: weverse.io cart extraction
// ===========================================

export function extractWeverseCart() {
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
