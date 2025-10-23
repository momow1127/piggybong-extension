// ===========================================
// Cart Extraction Coordinator
// Routes to site-specific extractors
// ===========================================

import { extractKtown4uCart } from './ktown4u.js';
import { extractWeverseCart } from './weverse.js';
import { extractGenericCart } from './generic.js';

export function extractProductInfo(pageText) {
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
