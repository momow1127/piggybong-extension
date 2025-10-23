// ===========================================
// Piggy Bong - Bundled Content Script
// Auto-generated from src/content/ modules
// ===========================================

(() => {
  // src/content/utils/helpers.js
  function isCartPage() {
    const url = window.location.href.toLowerCase();
    const pageText = document.body.innerText.toLowerCase();
    const cartUrlPatterns = [
      "/cart",
      "/basket",
      "/bag",
      "/checkout",
      "/order",
      "/purchase",
      "/payment",
      "step=1",
      "step=2",
      "step=3",
      "orderform",
      "shoppingcart"
    ];
    const cartTextIndicators = [
      "shopping cart",
      "shopping bag",
      "my cart",
      "your cart",
      "checkout",
      "items in cart",
      "proceed to checkout",
      "order summary",
      "cart total",
      "subtotal",
      "remove from cart",
      "update cart",
      "cart is empty"
    ];
    const hasCartUrl = cartUrlPatterns.some((pattern) => url.includes(pattern));
    const hasCartContent = cartTextIndicators.some((text) => pageText.includes(text));
    return hasCartUrl || hasCartContent;
  }
  function getCartItemCount() {
    const pageText = document.body.innerText.toLowerCase();
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
    const emptyCartIndicators = [
      "cart is empty",
      "your cart is empty",
      "no items in cart",
      "shopping cart is empty",
      "bag is empty",
      "0 items"
    ];
    if (emptyCartIndicators.some((text) => pageText.includes(text))) {
      return 0;
    }
    const hostname = window.location.hostname;
    if (hostname.includes("ktown4u")) {
      const cartItems = document.querySelectorAll("div.flex.w-full.flex-col.text-m2.text-black-21");
      return cartItems.length;
    }
    const genericCartItems = document.querySelectorAll('[class*="cart-item"], [class*="cartItem"], [class*="CartItem"]');
    if (genericCartItems.length > 0) {
      return genericCartItems.length;
    }
    return -1;
  }
  function showFallback(modalBody) {
    const loadingDiv = modalBody.querySelector(".piggybong-loading");
    if (loadingDiv) {
      loadingDiv.remove();
    }
    const currentUrl = window.location.href;
    const isCartPage2 = currentUrl.includes("/cart");
    modalBody.innerHTML = `
    <div class="piggybong-result">
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">\u{1F6D2}</div>
        <h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0;">
          ${isCartPage2 ? "Your cart looks empty!" : "No cart items found"}
        </h3>
        <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 16px 0;">
          ${isCartPage2 ? "Add some K-pop items to your cart, then click me to see your priority breakdown! \u{1F49C}" : "Go to your shopping cart page and add some items, then I can help you prioritize! \u{1F6CD}\uFE0F"}
        </p>
        <div style="background: linear-gradient(135deg, #F3E5FF 0%, #E8D5FF 100%); padding: 16px; border-radius: 12px; border: 1px solid rgba(93, 44, 238, 0.2); text-align: left;">
          <p style="font-size: 13px; color: #5D2CEE; margin: 0 0 8px 0; font-weight: 700;">\u{1F4A1} How to use Piggy Bong:</p>
          <ol style="font-size: 13px; color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Add K-pop items to your cart</li>
            <li>Click the Piggy Bong button</li>
            <li>Get priority rankings for each item! \u{1F525}</li>
          </ol>
        </div>
      </div>
    </div>
  `;
  }

  // src/content/ui/floatingButton.js
  var floatingContainer = null;
  var isButtonCreated = false;
  function createFloatingButton(showPiggyBongModalCallback) {
    if (isButtonCreated) return;
    console.log("\u{1F437} Creating Piggy Bong floating button...");
    floatingContainer = document.createElement("div");
    floatingContainer.id = "piggybong-floating-container";
    floatingContainer.className = "piggybong-float-container";
    const floatingBtn = document.createElement("button");
    floatingBtn.id = "piggybong-floating-btn";
    floatingBtn.className = "piggybong-float-btn";
    floatingBtn.setAttribute("aria-label", "Piggy Bong Priority Check");
    const logoUrl = chrome.runtime.getURL("piggybong.png");
    floatingBtn.innerHTML = `
    <div class="piggybong-btn-icon">
      <img src="${logoUrl}" alt="Piggy Bong" />
    </div>
    <span class="piggybong-btn-text">Should I Buy This?</span>
    <div class="piggybong-drag-handle">
      <div class="drag-dots"></div>
    </div>
  `;
    const closeBtn = document.createElement("button");
    closeBtn.className = "piggybong-close-btn";
    closeBtn.innerHTML = "\xD7";
    closeBtn.setAttribute("aria-label", "Close Piggy Bong");
    closeBtn.title = "Dismiss";
    floatingContainer.appendChild(floatingBtn);
    floatingContainer.appendChild(closeBtn);
    document.body.appendChild(floatingContainer);
    const hostname = window.location.hostname;
    const savedPosition = localStorage.getItem(`piggybong-position-${hostname}`);
    if (savedPosition) {
      const pos = JSON.parse(savedPosition);
      floatingContainer.style.left = pos.left;
      floatingContainer.style.top = pos.top;
      floatingContainer.style.right = pos.right;
    }
    let isDragging = false;
    let dragStarted = false;
    let startX, startY, initialLeft, initialTop;
    floatingContainer.addEventListener("mousedown", (e) => {
      if (!e.target.closest(".piggybong-drag-handle")) return;
      if (e.target.closest(".piggybong-close-btn")) return;
      isDragging = true;
      dragStarted = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = floatingContainer.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      floatingContainer.style.transition = "none";
      floatingContainer.classList.add("dragging");
      e.preventDefault();
      e.stopPropagation();
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragStarted = true;
      }
      const newLeft = initialLeft + deltaX;
      const newTop = initialTop + deltaY;
      floatingContainer.style.left = newLeft + "px";
      floatingContainer.style.top = newTop + "px";
      floatingContainer.style.right = "auto";
    });
    document.addEventListener("mouseup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      floatingContainer.classList.remove("dragging");
      const rect = floatingContainer.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const centerX = rect.left + rect.width / 2;
      floatingContainer.style.transition = "left 0.3s ease, right 0.3s ease";
      if (centerX < windowWidth / 2) {
        floatingContainer.style.left = "20px";
        floatingContainer.style.right = "auto";
      } else {
        floatingContainer.style.right = "20px";
        floatingContainer.style.left = "auto";
      }
      floatingContainer.style.top = rect.top + "px";
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
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      floatingContainer.style.opacity = "0";
      floatingContainer.style.transform = "scale(0.8)";
      setTimeout(() => {
        floatingContainer.remove();
      }, 200);
    });
    floatingBtn.addEventListener("click", async (e) => {
      if (e.target.closest(".piggybong-drag-handle")) return;
      if (e.target.closest(".piggybong-close-btn")) return;
      if (dragStarted) {
        dragStarted = false;
        return;
      }
      console.log("Piggy Bong button clicked!");
      const pageText = document.body.innerText || "";
      const pageUrl = window.location.href;
      showPiggyBongModalCallback(pageText, pageUrl);
    });
    isButtonCreated = true;
    console.log("\u{1F437} Piggy Bong: Floating button created successfully!");
  }
  function updateButtonState() {
    if (!floatingContainer) return;
    const itemCount = getCartItemCount();
    const floatingBtn = floatingContainer.querySelector("#piggybong-floating-btn");
    const btnText = floatingBtn?.querySelector(".piggybong-btn-text");
    if (btnText) btnText.textContent = "Should I Buy This?";
    if (itemCount === 0) {
      console.log("\u{1F437} Cart is empty - button will show empty cart message");
    } else {
      console.log(`\u{1F437} Cart has ${itemCount === -1 ? "items (unknown count)" : itemCount + " items"} - button ready for analysis`);
    }
  }
  function handleEmptyCartClick(e) {
    const itemCount = getCartItemCount();
    if (itemCount === 0) {
      e.preventDefault();
      e.stopPropagation();
      const modal = document.createElement("div");
      modal.className = "piggybong-modal show";
      modal.innerHTML = `
      <div class="piggybong-modal-overlay"></div>
      <div class="piggybong-modal-content" style="max-width: 380px;">
        <div class="piggybong-modal-header">
          <div class="piggybong-brand">
            <img src="${chrome.runtime.getURL("piggybong.png")}" alt="Piggy Bong" class="piggybong-header-logo">
            <span class="piggybong-brand-name">Piggy Bong</span>
          </div>
          <button class="piggybong-modal-close-btn" aria-label="Close">\xD7</button>
        </div>
        <div class="piggybong-modal-body">
          <div style="text-align: center; padding: 16px;">
            <div style="font-size: 48px; margin-bottom: 16px;">\u{1F6D2}</div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0;">Nothing in your cart yet!</h3>
            <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 0;">
              Add some K-pop items and I'll be here to help you decide before checkout
            </p>
          </div>
        </div>
      </div>
    `;
      document.body.appendChild(modal);
      const closeBtn = modal.querySelector(".piggybong-modal-close-btn");
      const overlay = modal.querySelector(".piggybong-modal-overlay");
      const closeModal = (e2) => {
        if (e2) e2.stopPropagation();
        modal.classList.add("closing");
        setTimeout(() => modal.remove(), 300);
      };
      closeBtn.addEventListener("click", closeModal);
      overlay.addEventListener("click", closeModal);
      return false;
    }
  }

  // src/content/utils/personalization.js
  var PersonalizationHelper = {
    getBias() {
      return localStorage.getItem("piggyBias") || null;
    },
    getCollectionGoal() {
      return localStorage.getItem("piggyGoal") || null;
    },
    setBias(bias) {
      if (bias && bias.trim()) {
        localStorage.setItem("piggyBias", bias.trim());
      }
    },
    setCollectionGoal(goal) {
      if (goal && goal.trim()) {
        localStorage.setItem("piggyGoal", goal.trim());
      }
    },
    hasPersonalization() {
      return this.getBias() !== null || this.getCollectionGoal() !== null;
    },
    clearPersonalization() {
      localStorage.removeItem("piggyBias");
      localStorage.removeItem("piggyGoal");
    },
    getPersonalizationContext() {
      const bias = this.getBias();
      const goal = this.getCollectionGoal();
      if (!bias && !goal) return "";
      let context = "\nPERSONALIZATION CONTEXT:\n";
      if (bias) context += `User's bias: ${bias}
`;
      if (goal) context += `User's collection goal: ${goal}
`;
      return context;
    }
  };

  // src/content/extractors/ktown4u.js
  function extractKtown4uCart() {
    console.log("\u{1F437} Piggy Bong: Trying ktown4u cart extraction...");
    console.log("\u{1F437} Current URL:", window.location.href);
    try {
      const items = [];
      const cartContainers = document.querySelectorAll("div.flex.w-full.flex-col.text-m2.text-black-21");
      console.log(`\u{1F437} Found ${cartContainers.length} cart item containers`);
      cartContainers.forEach((container, index) => {
        if (index >= 3) return;
        const artistSpan = container.querySelector("span.text-m3.font-bold");
        const artist = artistSpan ? artistSpan.textContent.trim() : "";
        const descSpan = container.querySelector("span.block");
        const description = descSpan ? descSpan.textContent.trim() : "";
        const fullName = artist && description ? `${artist} - ${description}` : artist || description;
        const priceText = container.innerText;
        const priceMatch = priceText.match(/USD\s*[\d,]+\.?\d*/i) || priceText.match(/[\d,]+\.?\d+/);
        const price = priceMatch ? priceMatch[0] : "Price N/A";
        const qtyInput = container.querySelector('input[type="number"]');
        const qty = qtyInput ? qtyInput.value : "1";
        const img = container.querySelector("img");
        console.log(`\u{1F437} Item ${index + 1}:`, {
          name: fullName.substring(0, 50),
          price,
          qty,
          hasImg: !!img
        });
        items.push({
          name: fullName.substring(0, 80),
          price,
          quantity: qty,
          image: img?.src || ""
        });
      });
      let total = "";
      let totalBreakdown = {};
      const finalTotalKeywords = ["grand total", "final total", "total amount", "amount due", "payment total", "order total"];
      const allElements = document.querySelectorAll("*");
      for (const keyword of finalTotalKeywords) {
        for (const el of allElements) {
          const text = (el.innerText || el.textContent || "").toLowerCase();
          if (text.includes(keyword)) {
            const priceMatch = text.match(/USD\s*([\d,]+\.?\d*)/i);
            if (priceMatch) {
              const priceNum = parseFloat(priceMatch[1].replace(/,/g, ""));
              if (priceNum > 0) {
                total = `USD ${priceNum.toFixed(2)}`;
                console.log(`\u{1F437} Found FINAL total with keyword "${keyword}": ${total}`);
                totalBreakdown.source = `final total (${keyword})`;
                break;
              }
            }
          }
        }
        if (total) break;
      }
      if (!total) {
        const totalElements = document.querySelectorAll('[class*="total"], [id*="total"], [class*="Total"], [id*="Total"]');
        console.log(`\u{1F437} Found ${totalElements.length} elements with 'total' in class/id`);
        let maxPrice = 0;
        let maxPriceElement = null;
        for (const el of totalElements) {
          const text = el.innerText || el.textContent || "";
          const priceMatch = text.match(/USD\s*([\d,]+\.?\d*)/i);
          if (priceMatch) {
            const priceNum = parseFloat(priceMatch[1].replace(/,/g, ""));
            if (priceNum > maxPrice && priceNum > 5) {
              maxPrice = priceNum;
              maxPriceElement = el;
            }
          }
        }
        if (maxPrice > 0) {
          total = `USD ${maxPrice.toFixed(2)}`;
          console.log(`\u{1F437} Found cart total (largest in 'total' elements): ${total}`);
          totalBreakdown.source = "total element";
        }
      }
      if (!total && items.length > 0) {
        let sum = 0;
        items.forEach((item) => {
          const priceMatch = item.price.match(/([\d,]+\.?\d*)/);
          if (priceMatch) {
            const itemPrice = parseFloat(priceMatch[1].replace(/,/g, ""));
            const qty = parseInt(item.quantity) || 1;
            sum += itemPrice * qty;
          }
        });
        if (sum > 0) {
          total = `~USD ${sum.toFixed(2)}`;
          console.log(`\u{1F437} \u26A0\uFE0F Estimated total by summing items (may not include discounts/shipping): ${total}`);
          totalBreakdown.source = "estimated (items sum)";
          totalBreakdown.warning = "Estimated - may not include discounts or shipping";
        }
      }
      if (items.length > 0) {
        console.log("\u{1F437} SUCCESS! Extracted cart data:", { itemCount: items.length, total });
        return {
          isCart: true,
          items,
          total: total || "Total not found",
          itemCount: items.length
        };
      } else {
        console.log("\u{1F437} No items found, returning null");
      }
    } catch (error) {
      console.error("\u{1F437} Ktown4u extraction failed:", error);
    }
    console.log("\u{1F437} Ktown4u extraction returning null - will use fallback");
    return null;
  }

  // src/content/extractors/weverse.js
  function extractWeverseCart() {
    try {
      const items = [];
      const cartItems = document.querySelectorAll('[class*="CartItem"], [class*="cart-item"]');
      if (cartItems.length > 0) {
        cartItems.forEach((item, index) => {
          if (index > 2) return;
          const img = item.querySelector("img");
          const name = item.querySelector('h3, [class*="name"]')?.textContent?.trim() || "K-pop Item";
          const qty = item.querySelector('[class*="quantity"]')?.textContent?.trim() || "1";
          const price = item.querySelector('[class*="price"]')?.textContent?.trim() || "";
          items.push({
            name: name.substring(0, 60),
            price,
            quantity: qty,
            image: img?.src || ""
          });
        });
        const totalEl = document.querySelector('[class*="total"]');
        const total = totalEl?.textContent?.match(/[₩\$]?[\d,]+\.?\d*/)?.[0] || "";
        return {
          isCart: true,
          items,
          total,
          itemCount: items.length
        };
      }
    } catch (error) {
      console.error("Weverse extraction failed:", error);
    }
    return null;
  }

  // src/content/extractors/generic.js
  function extractGenericCart(pageText) {
    console.log("\u{1F437} Using generic extraction (no site-specific extractor)");
    const allImages = document.querySelectorAll("img");
    const productImages = Array.from(allImages).filter((img) => {
      return img.width > 80 && img.height > 80;
    });
    console.log(`\u{1F437} Found ${productImages.length} product-sized images on page`);
    const items = [];
    productImages.forEach((img, index) => {
      if (index >= 3) return;
      const container = img.closest("div, tr, li, article");
      if (!container) return;
      const containerText = container.innerText || "";
      const priceMatch = containerText.match(/[\$₩€£]?[\d,]+\.?\d+|USD\s*[\d,]+\.?\d+|KRW\s*[\d,]+/i);
      const price = priceMatch ? priceMatch[0] : "";
      const qtyInput = container.querySelector('input[type="number"]');
      const qty = qtyInput ? qtyInput.value : "1";
      const textNodes = Array.from(container.querySelectorAll("a, h1, h2, h3, h4, span, p")).map((el) => el.textContent.trim()).filter((text) => text.length > 5 && text.length < 200);
      const name = textNodes[0] || "K-pop Item";
      if (price) {
        console.log(`\u{1F437} Generic item ${index + 1}:`, { name: name.substring(0, 40), price, qty });
        items.push({
          name: name.substring(0, 80),
          price,
          quantity: qty,
          image: img.src
        });
      }
    });
    const allPrices = pageText.match(/(?:USD|KRW|₩|\$|€|£)?\s*[\d,]+\.?\d*/gi) || [];
    const numericPrices = allPrices.map((p) => parseFloat(p.replace(/[^\d.]/g, ""))).filter((n) => !isNaN(n) && n > 0);
    let total = "";
    if (numericPrices.length > 0) {
      const maxPrice = Math.max(...numericPrices);
      total = `${maxPrice.toFixed(2)}`;
      console.log(`\u{1F437} Generic total (largest price): ${total}`);
    }
    if (items.length > 0) {
      console.log(`\u{1F437} Generic extraction found ${items.length} items`);
      return {
        isCart: true,
        items,
        total: total || "Total calculating...",
        itemCount: items.length
      };
    }
    console.log("\u{1F437} No cart items found - returning null");
    return null;
  }

  // src/content/extractors/index.js
  function extractProductInfo(pageText) {
    console.log("\u{1F437} extractProductInfo() START");
    const hostname = window.location.hostname;
    console.log("\u{1F437} Hostname:", hostname);
    if (hostname.includes("ktown4u")) {
      console.log("\u{1F437} Hostname includes ktown4u, calling extractKtown4uCart...");
      const cartData = extractKtown4uCart();
      if (cartData) {
        console.log("\u{1F437} ktown4u extractor returned data:", cartData);
        return cartData;
      }
      console.log("\u{1F437} ktown4u extractor returned null, falling back to generic");
    } else if (hostname.includes("weverse")) {
      console.log("\u{1F437} Hostname includes weverse, calling extractWeverseCart...");
      const cartData = extractWeverseCart();
      if (cartData) return cartData;
    } else {
      console.log("\u{1F437} Hostname not recognized, using generic extraction");
    }
    console.log("\u{1F437} Calling generic cart extraction...");
    const result = extractGenericCart(pageText);
    console.log("\u{1F437} Generic extraction returned:", result);
    return result;
  }

  // src/content/ai/analyzeWithAI.js
  var PROMPT_VERSION = "v3.1-clean";
  var cachedAISession = null;
  var cachedPromptVersion = null;
  async function analyzeWithAI(pageText, pageUrl, productInfo) {
    console.log("\u{1F437} analyzeWithAI() START");
    console.log("\u{1F437} Checking window.ai:", window.ai);
    console.log("\u{1F437} Checking LanguageModel:", typeof LanguageModel !== "undefined" ? LanguageModel : "undefined");
    const hasNewAPI = typeof LanguageModel !== "undefined";
    const hasOldAPI = window.ai && window.ai.languageModel;
    if (!hasNewAPI && !hasOldAPI) {
      console.error("\u{1F437} \u274C Chrome Built-in AI not available!");
      throw new Error("AI not available - Chrome Built-in AI (Gemini Nano) not enabled");
    }
    console.log("\u{1F437} Using API:", hasNewAPI ? "LanguageModel (new)" : "window.ai (old)");
    try {
      let session = cachedAISession;
      if (!session || cachedPromptVersion !== PROMPT_VERSION) {
        if (cachedPromptVersion !== PROMPT_VERSION) {
          console.log("\u{1F437} Prompt updated - recreating AI session with new rules...");
        } else {
          console.log("\u{1F437} Creating NEW AI session (first time - this takes 2-3 seconds)...");
        }
        const systemPrompt = `You are Piggy Bong \u2014 Your Smart Shopping Prioritizer! \u{1F437}\u2728

Your mission:
Analyze K-pop shopping carts and rank items by ACTUAL VALUE to their collection \u2014 helping fans make decisions based on what truly moves their collection forward, not just vague feelings.

Personality:
You're a warm, supportive bestie helping them shop smart! Think: texting your friend about what's actually worth getting.
Always talk TO the user using "you" and "your" \u2014 NEVER about them using "they" or "the user"
Sound excited and friendly, not cold or analytical
Keep it SHORT and SWEET \u2014 2-4 words for reasoning, 5-8 words for insights
Be positive and supportive, never judgmental or scolding

CRITICAL WRITING RULES:
\u274C NEVER EVER use third-person: "This user...", "They are...", "The user is..."
\u274C NEVER use clinical/analytical language: "demonstrates...", "evidenced by...", "indicating...", "likely dedicated to..."
\u274C NEVER sound like a researcher observing behavior: "The purchase of X suggests...", "actively building...", "shows patterns..."
\u274C NEVER sound scolding or judgmental: "Take a moment to think", "Quick check", "You should reflect"
\u274C NEVER be negative about off-bias items: "doesn't align", "not your priority", "doesn't match"
\u274C BANNED WORDS: "not", "doesn't", "don't", "isn't", "aren't", "won't", "can't", "no"
\u274C MORE BANNED WORDS: "This user", "They're", "The user", "This person", "proactively", "evidenced", "indicating", "take a moment", "reflect on", "doesn't align", "not aligned"
\u2705 ALWAYS write in SECOND PERSON ("you're", "your", "you") like talking DIRECTLY TO the user
\u2705 ALWAYS sound warm, excited, and friendly: "Ooh!", "Love that!", "Your cart is looking fire!"
\u2705 ALWAYS celebrate their passion FIRST, then gently ask questions
\u2705 BE POSITIVE about everything: Multi-stanning is normal! Exploring new groups is fun! Never criticize choices.
\u2705 For off-bias/off-goal items: Just label them (e.g., "Different group"), DON'T say negative things
\u2705 Focus on WHAT MATTERS TO THEM (their bias, their goals), not what doesn't
\u2705 Use language like "Your [bias] items are top priority" NOT "This doesn't fit your goal"
\u2705 Start with enthusiasm: "Ooh", "Love", "Your cart" \u2014 NEVER "Take a moment" or "Quick check"

--------------------------------------------
USER CONTEXT (Dynamic Personalization)
--------------------------------------------
- Bias: ${PersonalizationHelper.getBias() || "not specified"} (user's favorite group - their #1 priority!)
- Page Info: cart items, product names, group names, item count
- Device: On-device Gemini Nano (privacy-first)

--------------------------------------------
YOUR TASK: RANK EACH ITEM BY PRIORITY
--------------------------------------------
For EACH item in the cart, assign a priority badge (HIGH/MEDIUM/LOW) with specific reasoning.

**PRIORITY SCORING SYSTEM:**

Score each item 0-6 points based on:
- Matches bias (${PersonalizationHelper.getBias() || "user bias"}): +2 points
- Completes a collection set: +2 points (look for: "last album needed", "completes era", "final member", etc.)
- Limited/rare edition: +1 point (look for: "limited", "exclusive", "special edition")
- Matches collection goal: +1 point

**PRIORITY BADGES:**
- 3-6 points = HIGH PRIORITY
- 1-2 points = MEDIUM PRIORITY
- 0 points = LOW PRIORITY

**FOR EACH ITEM, PROVIDE:**
1. Item name
2. Priority badge (HIGH/MEDIUM/LOW)
3. ULTRA SHORT reasoning (2-4 words ONLY!)
4. Be warm and friendly - like a supportive bestie!

\u{1F6A8} CRITICAL: Reasoning MUST be 2-4 words MAXIMUM! NO NEGATIVE LANGUAGE! NEVER USE "NOT" OR "DOESN'T"!

\u274C BANNED WORDS: "not", "doesn't", "don't", "isn't", "aren't", "won't", "can't", "no"
\u274C BANNED PHRASES: "not a match", "no match", "doesn't match", "not directly", "not related"

\u2705 GOOD REASONING EXAMPLES (2-4 words):
- "Bias + album goal"
- "Different group"
- "Off-bias merch"
- "Limited edition"
- "Completes your set"
- "Bias match"

REMEMBER: NEVER say what something is NOT. Only say what it IS! Focus on facts, not negatives!

--------------------------------------------
OUTPUT FORMAT (JSON ONLY)
--------------------------------------------
\u26A0\uFE0F FINAL CHECK BEFORE RESPONDING:
- Did you analyze EACH item individually with a priority badge? \u2705
- Does your output include specific reasoning for each item's score? \u2705
- Does your "overallInsight" use "You" or "Your" (second person)? \u2705
- Does it contain "This user" or "They"? \u274C FIX IT!

Return JSON with these EXACT field names:

{
  "items": [
    {
      "name": "Item name from cart",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "reasoning": "2-4 words ONLY! Keep it positive!",
      "score": 0-6
    }
  ],
  "overallInsight": "5-8 words max! Warm, supportive tone!",
  "priorityTip": "A helpful question or prompt (5-8 words)"
}

Example:
{
  "items": [
    {
      "name": "NewJeans Get Up Album",
      "priority": "HIGH",
      "reasoning": "Completes your set",
      "score": 4
    },
    {
      "name": "NewJeans Haerin photocard",
      "priority": "MEDIUM",
      "reasoning": "Bias match",
      "score": 2
    },
    {
      "name": "Stray Kids holder",
      "priority": "LOW",
      "reasoning": "Off-bias",
      "score": 0
    }
  ],
  "overallInsight": "That album completes your collection",
  "priorityTip": "Which items feel essential"
}

--------------------------------------------
RULES - TONE IS EVERYTHING!
--------------------------------------------
\u2705 DO:
- ALWAYS use second person ("you", "your") \u2014 talk TO them, not ABOUT them
- BE ULTRA CONCISE \u2014 2-4 words for reasoning, 5-8 words for insight
- Keep it warm, friendly, supportive \u2014 like a bestie!
- Use positive or neutral language only
- State facts simply, don't explain negatives
- For LOW priority: say "Off-bias" NOT "doesn't match your preference"
- Use emojis sparingly (2-3 max)

\u274C DON'T - BANNED PHRASES:
- Never use third person ("This user", "They", "The user")
- Never write long explanations \u2014 BE BRIEF!
- Never use negative/judgmental language:
  \u274C "doesn't align", "unrelated to", "outside of", "doesn't complete", "doesn't fit"
  \u274C "limited relevance", "no indication", "doesn't match your goal", "not your priority"
  \u274C "isn't interested", "not aligned", "doesn't fit your collection"
  \u274C "won't help", "not relevant", "not useful", "not important"
  \u274C "this item is", "this is a", "not a direct match"
- Never use money words (budget, cost, save, price, afford)
- Never mention store names (Ktown4u, Weverse, Amazon)
- Never give generic advice ("browse more", "keep exploring")
- Never sound clinical, analytical, or scolding
- Never write multiple clauses or complex sentences
- Never criticize their choices \u2014 just help them prioritize what matters MOST

\u{1F6A8} FINAL WARNING BEFORE YOU RESPOND:
- Did you check EVERY reasoning for the words "not", "doesn't", "isn't", "no"? \u274C REMOVE THEM!
- Is EVERY reasoning 2-4 words MAXIMUM? Check the length!
- Did you use ONLY positive or neutral language? NO NEGATIVES!
- Example: Instead of "Not a bias match" \u2192 Use "Different group"
- Example: Instead of "Doesn't complete your goal" \u2192 Use "Off-bias item"

Return ONLY clean JSON. No markdown, no extra text.`;
        session = hasNewAPI ? await LanguageModel.create({
          systemPrompt,
          language: "en",
          expectedOutputs: [
            { type: "text", languages: ["en"] }
          ]
        }) : await window.ai.languageModel.create({
          systemPrompt,
          language: "en"
        });
        cachedAISession = session;
        cachedPromptVersion = PROMPT_VERSION;
        console.log("\u{1F437} AI session created and cached (version:", PROMPT_VERSION, "):", session);
      } else {
        console.log("\u{1F437} Using CACHED AI session (much faster!)");
      }
      if (!productInfo) {
        console.error("\u{1F437} \u274C productInfo is null in analyzeWithAI");
        throw new Error("No product information available");
      }
      let prompt = "";
      const personalizationContext = PersonalizationHelper.getPersonalizationContext();
      if (productInfo.isCart && productInfo.items) {
        const itemsList = productInfo.items.map(
          (item, i) => `Item ${i + 1}: ${item.name} (Qty: ${item.quantity}, Price: ${item.price})`
        ).join("\n");
        prompt = `${personalizationContext}
CART ANALYSIS:
${itemsList}
Total: ${productInfo.total}
Total Items: ${productInfo.itemCount}
Page: ${pageUrl}

Analyze this cart and rank EACH item with HIGH/MEDIUM/LOW priority badges!

Use the priority scoring system:
- Bias match: +2 points
- Completes collection set: +2 points
- Limited/rare edition: +1 point
- Matches collection goal: +1 point
Score 3-6 = HIGH, 1-2 = MEDIUM, 0 = LOW

IMPORTANT: Return ONLY the JSON object with these EXACT fields:
- items (array of objects, one for EACH cart item):
  - name (string: item name)
  - priority (string: "HIGH" or "MEDIUM" or "LOW")
  - reasoning (string: why this priority - be specific!)
  - score (number: 0-6 based on scoring system)
- overallInsight (string: 2-3 sentences overall cart summary. Use second person!)
- priorityTip (string: A helpful question or prompt, under 20 words)

Return ONLY clean JSON. No markdown, no extra text.`;
      } else {
        prompt = `${personalizationContext}
PRODUCT ANALYSIS:
Product: ${productInfo.name}
Price: ${productInfo.price}
Page: ${pageUrl}

Analyze this purchase and rank it with a HIGH/MEDIUM/LOW priority badge!

Use the priority scoring system:
- Bias match: +2 points
- Completes collection set: +2 points
- Limited/rare edition: +1 point
- Matches collection goal: +1 point
Score 3-6 = HIGH, 1-2 = MEDIUM, 0 = LOW

IMPORTANT: Return ONLY the JSON object with these EXACT fields:
- items (array with one object):
  - name (string: product name)
  - priority (string: "HIGH" or "MEDIUM" or "LOW")
  - reasoning (string: why this priority - be specific!)
  - score (number: 0-6 based on scoring system)
- overallInsight (string: 2-3 sentences about this product. Use second person!)
- priorityTip (string: A helpful question or prompt, under 20 words)

Return ONLY clean JSON. No markdown, no extra text.`;
      }
      console.log("\u{1F437} Sending prompt to AI:", prompt);
      const result = await session.prompt(prompt);
      console.log("\u{1F437} AI raw response:", result);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("\u{1F437} Parsed JSON:", parsed);
        if (parsed.items && Array.isArray(parsed.items) && parsed.overallInsight && parsed.priorityTip) {
          console.log("\u{1F437} \u2705 AI priority analysis successful!");
          return {
            items: parsed.items,
            overallInsight: parsed.overallInsight,
            priorityTip: parsed.priorityTip,
            emojiSet: parsed.emojiSet || ""
          };
        } else {
          console.warn("\u{1F437} \u26A0\uFE0F AI returned JSON but missing required fields:", {
            hasItems: !!parsed.items,
            isItemsArray: Array.isArray(parsed.items),
            hasOverallInsight: !!parsed.overallInsight,
            hasPriorityTip: !!parsed.priorityTip
          });
        }
      }
      console.warn("\u{1F437} \u26A0\uFE0F Using fallback response");
      return {
        items: [{
          name: "Your items",
          priority: "MEDIUM",
          badge: "\u2705",
          reasoning: "Looking good! Check which items match your collection goals.",
          score: 2
        }],
        overallInsight: "Ooh, your cart is looking good! \u{1F6CD}\uFE0F Love the K-pop energy in here! \u2728",
        priorityTip: "Which items are you most excited about? Those are your priorities!",
        emojiSet: "\u{1F6CD}\uFE0F\u{1F49C}\u2728"
      };
    } catch (error) {
      console.error("AI error:", error);
      throw error;
    }
  }

  // src/content/ui/modal.js
  function showOnboardingModal(callback) {
    const modal = document.createElement("div");
    modal.id = "piggybong-onboarding-modal";
    modal.className = "piggybong-modal show";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "piggybong-onboarding-title");
    const logoUrl = chrome.runtime.getURL("piggybong.png");
    const existingBias = PersonalizationHelper.getBias() || "";
    const isEditing = existingBias;
    modal.innerHTML = `
    <div class="piggybong-modal-overlay" aria-hidden="true"></div>
    <div class="piggybong-modal-content" style="max-width: 450px;">
      <div class="piggybong-modal-header">
        <div class="piggybong-brand">
          <img src="${logoUrl}" alt="Piggy Bong" class="piggybong-header-logo">
          <span id="piggybong-onboarding-title" class="piggybong-brand-name">${isEditing ? "Edit Preferences" : "Welcome to Piggy Bong!"}</span>
        </div>
        <button class="piggybong-modal-close-btn" aria-label="Skip">\xD7</button>
      </div>

      <div class="piggybong-modal-body">
        <div class="piggybong-onboarding-content">
          <p style="margin-bottom: 20px; color: #666; font-size: 14px; line-height: 1.6;">
            Want me to help prioritize what matches <strong>your bias</strong> in your cart? \u{1F49C}
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
    const saveBtn = modal.querySelector("#piggy-save-preferences");
    saveBtn.addEventListener("click", () => {
      const bias = modal.querySelector("#piggy-bias-input").value.trim();
      if (bias) {
        PersonalizationHelper.setBias(bias);
        console.log("\u{1F437} Bias set to:", bias);
      }
      modal.remove();
      if (callback) callback();
    });
    const skipBtn = modal.querySelector("#piggy-skip-onboarding");
    const closeBtn = modal.querySelector(".piggybong-modal-close-btn");
    const overlay = modal.querySelector(".piggybong-modal-overlay");
    const skipOnboarding = (e) => {
      if (e) e.stopPropagation();
      modal.remove();
      if (!isEditing && callback) {
        callback();
      }
    };
    skipBtn.addEventListener("click", skipOnboarding);
    closeBtn.addEventListener("click", skipOnboarding);
    overlay.addEventListener("click", skipOnboarding);
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        skipOnboarding(e);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
      document.removeEventListener("keydown", handleEscapeKey);
      originalRemove();
    };
  }
  function showPiggyBongModal(pageText, pageUrl) {
    console.log("\u{1F437} showPiggyBongModal called");
    console.log("\u{1F437} Page URL:", pageUrl);
    if (!PersonalizationHelper.hasPersonalization()) {
      showOnboardingModal(() => {
        showAnalysisModal(pageText, pageUrl);
      });
      return;
    }
    showAnalysisModal(pageText, pageUrl);
  }
  function showAnalysisModal(pageText, pageUrl) {
    const existingModal = document.getElementById("piggybong-modal");
    if (existingModal) {
      existingModal.remove();
    }
    console.log("\u{1F437} About to call extractProductInfo...");
    const productInfo = extractProductInfo(pageText);
    console.log("\u{1F437} extractProductInfo returned:", productInfo);
    const modal = document.createElement("div");
    modal.id = "piggybong-modal";
    modal.className = "piggybong-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "piggybong-modal-title");
    const logoUrl = chrome.runtime.getURL("piggybong.png");
    const settingsIconUrl = chrome.runtime.getURL("settings.svg");
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
          <button class="piggybong-modal-close-btn" aria-label="Close">\xD7</button>
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
    const settingsBtn = modal.querySelector(".piggybong-settings-btn");
    settingsBtn.addEventListener("click", () => {
      modal.remove();
      showOnboardingModal(() => {
        const freshPageText = document.body.innerText || "";
        const freshPageUrl = window.location.href;
        showAnalysisModal(freshPageText, freshPageUrl);
      });
    });
    const closeBtn = modal.querySelector(".piggybong-modal-close-btn");
    const overlay = modal.querySelector(".piggybong-modal-overlay");
    const closeModal = (e) => {
      if (e) e.stopPropagation();
      modal.classList.add("closing");
      setTimeout(() => modal.remove(), 300);
    };
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        closeModal(e);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
      document.removeEventListener("keydown", handleEscapeKey);
      originalRemove();
    };
    setTimeout(() => modal.classList.add("show"), 10);
    runAIAnalysis(pageText, pageUrl, productInfo);
  }
  async function runAIAnalysis(pageText, pageUrl, productInfo) {
    const modalBody = document.querySelector(".piggybong-modal-body");
    console.log("\u{1F437} runAIAnalysis() called");
    console.log("\u{1F437} productInfo:", productInfo);
    if (!productInfo || productInfo === null) {
      console.warn("\u{1F437} \u26A0\uFE0F No product info extracted - cart might be empty");
      showFallback(modalBody);
      return;
    }
    try {
      console.log("\u{1F437} Calling analyzeWithAI...");
      const aiResult = await analyzeWithAI(pageText, pageUrl, productInfo);
      console.log("\u{1F437} AI Result:", aiResult);
      const loadingDiv = modalBody.querySelector(".piggybong-loading");
      if (loadingDiv) {
        loadingDiv.remove();
      }
      let contextSummary = "";
      if (productInfo.isCart && productInfo.items && productInfo.items.length > 0) {
        const itemNames = productInfo.items.map((item) => {
          const name = item.name.split("-")[0].trim();
          return name;
        });
        const displayNames = itemNames.slice(0, 2).join(" & ");
        const itemCount = productInfo.items.length;
        contextSummary = `Analyzing ${itemCount} item${itemCount > 1 ? "s" : ""} from ${displayNames}${itemCount > 2 ? " and more" : ""}`;
      } else {
        contextSummary = `Analyzing ${productInfo.name}`;
      }
      const itemsHTML = aiResult.items && aiResult.items.length > 0 ? aiResult.items.map((item) => `
        <div class="piggybong-priority-item">
          <div class="priority-item-header-row">
            <div class="priority-item-name">${item.name}</div>
            <span class="priority-badge priority-${item.priority.toLowerCase()}">${item.priority}</span>
          </div>
          <div class="priority-item-reasoning">${item.reasoning}</div>
        </div>
      `).join("") : "";
      const analysisHTML = `
      <!-- Priority Analysis Section (Items only) -->
      <div class="piggybong-priority-section">
        <h3>Your Fan Priority</h3>
        ${itemsHTML}
      </div>

      <!-- Overall Insight Section -->
      <div class="piggybong-overall-insight-section">
        <h3>\u{1F4A1} Overall Insight</h3>
        <div class="overall-insight-content">
          ${aiResult.overallInsight}
        </div>
      </div>
    `;
      modalBody.insertAdjacentHTML("beforeend", analysisHTML);
    } catch (error) {
      console.error("\u{1F437} \u274C AI analysis failed:", error);
      console.error("\u{1F437} Error details:", error.message);
      console.error("\u{1F437} Error stack:", error.stack);
      showFallback(modalBody);
    }
  }

  // src/content/index.js
  (function() {
    "use strict";
    if (document.getElementById("piggybong-floating-btn")) {
      return;
    }
    function initializePiggyBong() {
      console.log("\u{1F437} Piggy Bong: Checking if this is a cart page...");
      if (!isCartPage()) {
        console.log("\u{1F437} Not a cart page - button will not be shown");
        return;
      }
      console.log("\u{1F437} Cart page detected! Initializing button...");
      createFloatingButton(showPiggyBongModal);
      updateButtonState();
      const floatingBtn = document.getElementById("piggybong-floating-btn");
      if (floatingBtn) {
        floatingBtn.addEventListener("click", handleEmptyCartClick, true);
      }
    }
    let reCheckTimeout = null;
    function scheduleReCheck() {
      clearTimeout(reCheckTimeout);
      reCheckTimeout = setTimeout(() => {
        console.log("\u{1F437} Re-checking cart state...");
        if (isCartPage() && !isButtonCreated) {
          console.log("\u{1F437} Cart appeared dynamically - creating button now!");
          createFloatingButton(showPiggyBongModal);
          updateButtonState();
          const floatingBtn = document.getElementById("piggybong-floating-btn");
          if (floatingBtn) {
            floatingBtn.addEventListener("click", handleEmptyCartClick, true);
          }
        }
        if (isButtonCreated) {
          updateButtonState();
        }
      }, 2e3);
    }
    const observer = new MutationObserver((mutations) => {
      const hasSignificantChange = mutations.some(
        (mutation) => mutation.type === "childList" || mutation.type === "characterData" && mutation.target.textContent.length > 10
      );
      if (hasSignificantChange) {
        scheduleReCheck();
      }
    });
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      console.log("\u{1F437} MutationObserver started - watching for dynamic cart updates");
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializePiggyBong);
    } else {
      initializePiggyBong();
    }
    console.log("\u{1F437} Piggy Bong: Content script loaded");
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "openModal") {
        console.log("\u{1F437} Received openModal message from toolbar");
        const existingModal = document.getElementById("piggybong-modal") || document.getElementById("piggybong-onboarding-modal");
        if (existingModal) {
          console.log("\u{1F437} Modal already open, closing it");
          existingModal.classList.add("closing");
          setTimeout(() => existingModal.remove(), 300);
          sendResponse({ success: true, action: "closed" });
        } else {
          let floatingBtn = document.getElementById("piggybong-floating-btn");
          if (!floatingBtn && !isButtonCreated) {
            console.log("\u{1F437} Button not created yet, creating it now...");
            createFloatingButton(showPiggyBongModal);
            updateButtonState();
            floatingBtn = document.getElementById("piggybong-floating-btn");
          }
          if (floatingBtn) {
            console.log("\u{1F437} Triggering modal directly...");
            const pageText = document.body.innerText || "";
            const pageUrl = window.location.href;
            showPiggyBongModal(pageText, pageUrl);
            sendResponse({ success: true, action: "opened" });
          } else {
            console.error("\u{1F437} Floating button could not be created!");
            sendResponse({ success: false, error: "Button could not be created" });
          }
        }
      }
      return true;
    });
  })();
})();
