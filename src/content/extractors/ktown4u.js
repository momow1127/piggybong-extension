// ===========================================
// Site-specific: ktown4u.com cart extraction
// ===========================================

export function extractKtown4uCart() {
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

    // Get cart total - ACCURATE extraction with discount/shipping handling
    let total = '';
    let totalBreakdown = {};

    // Strategy 1: Look for FINAL total (after discounts, shipping, tax)
    // Priority keywords: "final", "grand", "payment", "pay", "amount due"
    const finalTotalKeywords = ['grand total', 'final total', 'total amount', 'amount due', 'payment total', 'order total'];
    const allElements = document.querySelectorAll('*');

    for (const keyword of finalTotalKeywords) {
      for (const el of allElements) {
        const text = (el.innerText || el.textContent || '').toLowerCase();
        // Check if element contains keyword and has a price
        if (text.includes(keyword)) {
          const priceMatch = text.match(/USD\s*([\d,]+\.?\d*)/i);
          if (priceMatch) {
            const priceNum = parseFloat(priceMatch[1].replace(/,/g, ''));
            if (priceNum > 0) {
              total = `USD ${priceNum.toFixed(2)}`;
              console.log(`🐷 Found FINAL total with keyword "${keyword}": ${total}`);
              totalBreakdown.source = `final total (${keyword})`;
              break;
            }
          }
        }
      }
      if (total) break;
    }

    // Strategy 2: Look for elements with "total" in class/id (common pattern)
    if (!total) {
      const totalElements = document.querySelectorAll('[class*="total"], [id*="total"], [class*="Total"], [id*="Total"]');
      console.log(`🐷 Found ${totalElements.length} elements with 'total' in class/id`);

      // Find the LARGEST price (likely the final total after discounts)
      let maxPrice = 0;
      let maxPriceElement = null;

      for (const el of totalElements) {
        const text = el.innerText || el.textContent || '';
        const priceMatch = text.match(/USD\s*([\d,]+\.?\d*)/i);
        if (priceMatch) {
          const priceNum = parseFloat(priceMatch[1].replace(/,/g, ''));
          // Track the largest price (likely final total)
          if (priceNum > maxPrice && priceNum > 5) {
            maxPrice = priceNum;
            maxPriceElement = el;
          }
        }
      }

      if (maxPrice > 0) {
        total = `USD ${maxPrice.toFixed(2)}`;
        console.log(`🐷 Found cart total (largest in 'total' elements): ${total}`);
        totalBreakdown.source = 'total element';
      }
    }

    // Strategy 3: Manual calculation as LAST RESORT (may not include discounts/shipping)
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
        total = `~USD ${sum.toFixed(2)}`;
        console.log(`🐷 ⚠️ Estimated total by summing items (may not include discounts/shipping): ${total}`);
        totalBreakdown.source = 'estimated (items sum)';
        totalBreakdown.warning = 'Estimated - may not include discounts or shipping';
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
