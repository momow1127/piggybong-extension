// ===========================================
// Piggy Bong - Bundled Content Script
// Auto-generated from src/content/ modules
// ===========================================

(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/content/utils/helpers.js
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
    const isCartPage = currentUrl.includes("/cart");
    modalBody.innerHTML = `
    <div class="piggybong-result">
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">\u{1F6D2}</div>
        <h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0;">
          ${isCartPage ? "Your cart looks empty!" : "No cart items found"}
        </h3>
        <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 16px 0;">
          ${isCartPage ? "Add some K-pop items to your cart, then click me to see your priority breakdown! \u{1F49C}" : "Go to your shopping cart page and add some items, then I can help you prioritize! \u{1F6CD}\uFE0F"}
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
  var init_helpers = __esm({
    "src/content/utils/helpers.js"() {
    }
  });

  // src/content/utils/personalization.js
  var PersonalizationHelper, CartHistoryHelper;
  var init_personalization = __esm({
    "src/content/utils/personalization.js"() {
      PersonalizationHelper = {
        // Legacy single bias support (kept for backward compatibility)
        getBias() {
          return localStorage.getItem("piggyBias") || null;
        },
        setBias(bias) {
          if (bias && bias.trim()) {
            localStorage.setItem("piggyBias", bias.trim());
          }
        },
        // New multi-group lineup support
        getLineup() {
          const stored = localStorage.getItem("piggyLineup");
          return stored ? JSON.parse(stored) : [];
        },
        setLineup(lineup) {
          if (Array.isArray(lineup) && lineup.length > 0) {
            localStorage.setItem("piggyLineup", JSON.stringify(lineup));
          }
        },
        // Priority item support
        getPriority() {
          const stored = localStorage.getItem("piggyPriority");
          return stored ? JSON.parse(stored) : null;
        },
        setPriority(priority) {
          if (priority && (priority.type || priority.types)) {
            console.log("\u{1F50D} PersonalizationHelper.setPriority() saving:", priority);
            localStorage.setItem("piggyPriority", JSON.stringify(priority));
            console.log("\u{1F50D} Saved to localStorage. Reading back:", localStorage.getItem("piggyPriority"));
          } else {
            console.warn("\u{1F50D} setPriority() called but priority object invalid:", priority);
          }
        },
        // Legacy goal support
        getCollectionGoal() {
          return localStorage.getItem("piggyGoal") || null;
        },
        setCollectionGoal(goal) {
          if (goal && goal.trim()) {
            localStorage.setItem("piggyGoal", goal.trim());
          }
        },
        hasPersonalization() {
          return this.getLineup().length > 0 || this.getBias() !== null || this.getPriority() !== null;
        },
        clearPersonalization() {
          localStorage.removeItem("piggyBias");
          localStorage.removeItem("piggyGoal");
          localStorage.removeItem("piggyLineup");
          localStorage.removeItem("piggyPriority");
        },
        getPersonalizationContext() {
          const lineup = this.getLineup();
          const priority = this.getPriority();
          const legacyBias = this.getBias();
          if (lineup.length === 0 && !legacyBias && !priority) return "";
          let context = "\nPERSONALIZATION CONTEXT:\n";
          if (lineup.length > 0) {
            context += `User's lineup: ${lineup.join(", ")}
`;
          } else if (legacyBias) {
            context += `User's bias: ${legacyBias}
`;
          }
          if (priority) {
            context += `Top priority: ${priority.name} (${priority.type})
`;
          }
          return context;
        }
      };
      CartHistoryHelper = {
        // Extract artist/group name from item name
        extractArtist(itemName) {
          const lineup = PersonalizationHelper.getLineup();
          for (const group of lineup) {
            if (itemName.toLowerCase().includes(group.toLowerCase())) {
              return group;
            }
          }
          const commonGroups = [
            "NewJeans",
            "BTS",
            "BLACKPINK",
            "TWICE",
            "Stray Kids",
            "aespa",
            "SEVENTEEN",
            "TXT",
            "ENHYPEN",
            "IVE",
            "LE SSERAFIM",
            "ITZY",
            "Red Velvet",
            "NCT",
            "EXO",
            "BIGBANG",
            "GOT7",
            "ATEEZ"
          ];
          for (const group of commonGroups) {
            if (itemName.toLowerCase().includes(group.toLowerCase())) {
              return group;
            }
          }
          return "Unknown";
        },
        // Extract item type from item name
        extractType(itemName) {
          const lowerName = itemName.toLowerCase();
          if (lowerName.includes("photocard") || lowerName.includes("pc")) return "photocard";
          if (lowerName.includes("album")) return "album";
          if (lowerName.includes("lightstick") || lowerName.includes("light stick")) return "lightstick";
          if (lowerName.includes("poster")) return "poster";
          if (lowerName.includes("season") && lowerName.includes("greeting")) return "season's greetings";
          if (lowerName.includes("dvd") || lowerName.includes("blu-ray")) return "dvd/blu-ray";
          if (lowerName.includes("merchandise") || lowerName.includes("merch")) return "merchandise";
          return "other";
        },
        // Get all cart history
        getCartHistory() {
          const stored = localStorage.getItem("piggyCartHistory");
          return stored ? JSON.parse(stored) : [];
        },
        // Save a cart snapshot
        saveCartSnapshot(items, total, timestamp = Date.now()) {
          const history = this.getCartHistory();
          const snapshot = {
            id: timestamp,
            date: new Date(timestamp).toISOString(),
            items: items.map((item) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity || 1,
              artist: this.extractArtist(item.name),
              type: this.extractType(item.name)
            })),
            total,
            purchased: false,
            // We assume not purchased initially
            lineup: PersonalizationHelper.getLineup(),
            priorityTypes: PersonalizationHelper.getPriority()?.types || []
          };
          const recentSnapshot = history[history.length - 1];
          if (recentSnapshot && timestamp - recentSnapshot.id < 3e5) {
            const sameItems = JSON.stringify(recentSnapshot.items) === JSON.stringify(snapshot.items);
            if (sameItems) {
              console.log("\u{1F4CA} Skipping duplicate cart snapshot");
              return;
            }
          }
          history.push(snapshot);
          if (history.length > 50) {
            history.shift();
          }
          localStorage.setItem("piggyCartHistory", JSON.stringify(history));
          console.log("\u{1F4CA} Saved cart snapshot:", snapshot);
        },
        // Get artist frequency across all carts
        getArtistFrequency(history) {
          const frequency = {};
          history.forEach((cart) => {
            cart.items.forEach((item) => {
              const artist = item.artist;
              if (artist !== "Unknown") {
                frequency[artist] = (frequency[artist] || 0) + 1;
              }
            });
          });
          return frequency;
        },
        // Get item type frequency
        getTypeFrequency(history) {
          const frequency = {};
          history.forEach((cart) => {
            cart.items.forEach((item) => {
              const type = item.type;
              frequency[type] = (frequency[type] || 0) + 1;
            });
          });
          return frequency;
        },
        // Detect seasonal patterns (which months user shops most)
        getSeasonalPatterns(history) {
          const monthCounts = {};
          history.forEach((cart) => {
            const date = new Date(cart.date);
            const monthName = date.toLocaleString("en-US", { month: "long" });
            monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
          });
          return monthCounts;
        },
        // Get abandoned items (added 2+ times but never purchased)
        getAbandonedItems(history) {
          const itemCounts = {};
          history.forEach((cart) => {
            cart.items.forEach((item) => {
              const key = item.name;
              if (!itemCounts[key]) {
                itemCounts[key] = { count: 0, purchased: false, artist: item.artist, type: item.type };
              }
              itemCounts[key].count++;
              if (cart.purchased) {
                itemCounts[key].purchased = true;
              }
            });
          });
          return Object.entries(itemCounts).filter(([name, data]) => data.count >= 2 && !data.purchased).map(([name, data]) => ({
            name,
            timesAdded: data.count,
            artist: data.artist,
            type: data.type
          }));
        },
        // Calculate average cart value
        getAverageCartValue(history) {
          if (history.length === 0) return 0;
          const total = history.reduce((sum, cart) => sum + (cart.total || 0), 0);
          return total / history.length;
        },
        // Detect lineup mismatches (stated vs actual collecting behavior)
        getLineupMismatch(history) {
          const currentLineup = PersonalizationHelper.getLineup();
          if (currentLineup.length === 0) return null;
          const artistFreq = this.getArtistFrequency(history);
          const topArtists = Object.entries(artistFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([artist]) => artist);
          const notInLineup = topArtists.filter(
            (artist) => !currentLineup.some(
              (lineupGroup) => lineupGroup.toLowerCase() === artist.toLowerCase()
            )
          );
          return notInLineup.length > 0 ? notInLineup : null;
        },
        // Analyze all patterns
        analyzePatterns() {
          const history = this.getCartHistory();
          if (history.length < 2) {
            return null;
          }
          return {
            totalCarts: history.length,
            artistFrequency: this.getArtistFrequency(history),
            typeFrequency: this.getTypeFrequency(history),
            seasonalPatterns: this.getSeasonalPatterns(history),
            abandonedItems: this.getAbandonedItems(history),
            averageCartValue: this.getAverageCartValue(history),
            lineupMismatch: this.getLineupMismatch(history),
            oldestCart: new Date(history[0].date).toLocaleDateString(),
            newestCart: new Date(history[history.length - 1].date).toLocaleDateString()
          };
        }
      };
    }
  });

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
  var init_ktown4u = __esm({
    "src/content/extractors/ktown4u.js"() {
    }
  });

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
  var init_weverse = __esm({
    "src/content/extractors/weverse.js"() {
    }
  });

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
  var init_generic = __esm({
    "src/content/extractors/generic.js"() {
    }
  });

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
  var init_extractors = __esm({
    "src/content/extractors/index.js"() {
      init_ktown4u();
      init_weverse();
      init_generic();
    }
  });

  // src/content/ai/analyzeWithAI.js
  function cleanText(t) {
    return (t || "").replace(/[\[\(\{].*?[\]\)\}]/g, "").replace(/\s{2,}/g, " ").replace(/\s+([.!?,])/g, "$1").trim();
  }
  function validateAIResult(ai) {
    const safe = { ...ai };
    safe.items = (ai.items || []).map((it) => ({
      name: it.name || "Unnamed item",
      priority: it.priority || "MEDIUM",
      reasoning: cleanText(it.reasoning || "Collection addition - Building your K-pop treasure"),
      score: it.score ?? 3
    }));
    safe.overallInsight = cleanText(
      ai.overallInsight || "Building your collection thoughtfully! Each item adds unique value to your K-pop journey"
    );
    safe.priorityTip = ai.priorityTip || "Focus on lineup matches first, then explore new groups at your pace";
    safe.patternInsight = ai.patternInsight ? cleanText(ai.patternInsight) : null;
    if (ai.futureOpportunity) {
      if (typeof ai.futureOpportunity === "object") {
        safe.futureOpportunity = {
          text: cleanText(ai.futureOpportunity.text),
          suggestPreferenceUpdate: ai.futureOpportunity.suggestPreferenceUpdate || false,
          artistName: ai.futureOpportunity.artistName || null
        };
      } else {
        safe.futureOpportunity = {
          text: cleanText(ai.futureOpportunity),
          suggestPreferenceUpdate: false,
          artistName: null
        };
      }
    } else {
      safe.futureOpportunity = null;
    }
    return safe;
  }
  function analyzeItemsWithJavaScript(items, lineup, priorityTypes) {
    console.log("\u{1F50D} Using JavaScript fallback analysis");
    return items.map((item) => {
      const itemNameLower = item.name.toLowerCase();
      const lineupMatch = lineup.find(
        (group) => itemNameLower.includes(group.toLowerCase())
      );
      const typeMatch = priorityTypes.find((type) => {
        if (type === "lightstick") return itemNameLower.includes("light stick") || itemNameLower.includes("lightstick");
        if (type === "album") return itemNameLower.includes("album");
        if (type === "seasongreetings") return itemNameLower.includes("season") || itemNameLower.includes("greeting");
        if (type === "photocard") return itemNameLower.includes("photocard") || itemNameLower.includes("photo card");
        if (type === "concert") return itemNameLower.includes("concert") || itemNameLower.includes("show");
        if (type === "merchandise") return itemNameLower.includes("merchandise") || itemNameLower.includes("merch");
        return false;
      });
      let priority, reasoning, score;
      if (lineupMatch && typeMatch) {
        priority = "Top Priority";
        reasoning = "Perfect match - Your lineup + Priority type";
        score = 5;
      } else if (lineupMatch) {
        priority = "Core Lineup";
        reasoning = "Your favorite group - Expanding collection";
        score = 3;
      } else if (typeMatch) {
        priority = "Discovery";
        reasoning = "Discovering new groups through your preferred items";
        score = 2;
      } else {
        priority = "Multi-Stan";
        reasoning = "Broadening horizons beyond your core collection";
        score = 1;
      }
      return {
        name: item.name,
        priority,
        reasoning,
        score
      };
    });
  }
  async function analyzeWithAI(pageText, pageUrl, productInfo) {
    console.log("\u{1F437} analyzeWithAI() START - Using Gemini Nano Prompt API");
    const lineup = PersonalizationHelper.getLineup();
    const priority = PersonalizationHelper.getPriority();
    const legacyBias = PersonalizationHelper.getBias();
    const userGroups = lineup.length > 0 ? lineup : legacyBias ? [legacyBias] : ["NewJeans"];
    const priorityTypes = priority && priority.types ? priority.types : [];
    console.log("\u{1F50D} User preferences:", { lineup: userGroups, priorityTypes });
    if (productInfo.items && productInfo.items.length > 0) {
      CartHistoryHelper.saveCartSnapshot(productInfo.items, productInfo.total);
      console.log("\u{1F4CA} Cart snapshot saved to history");
    }
    const patterns = CartHistoryHelper.analyzePatterns();
    if (patterns) {
      console.log("\u{1F4CA} Cart patterns detected:", {
        totalCarts: patterns.totalCarts,
        topArtists: Object.keys(patterns.artistFrequency).slice(0, 3),
        abandonedItems: patterns.abandonedItems.length
      });
    }
    console.log("\u{1F437} Using hybrid approach: JS for badges, AI for insights");
    const classifiedItems = analyzeItemsWithJavaScript(productInfo.items, userGroups, priorityTypes);
    console.log("\u2705 JavaScript badge classification:", classifiedItems.map((i) => `${i.name.substring(0, 30)}... \u2192 ${i.priority}`));
    classifiedItems.sort((a, b) => b.score - a.score);
    console.log("\u2705 Items sorted by priority:", classifiedItems.map((i) => `${i.priority} (${i.score}): ${i.name.substring(0, 30)}...`));
    try {
      console.log("\u{1F437} Requesting AI insights (overallInsight, futureOpportunity)...");
      const response = await chrome.runtime.sendMessage({
        action: "analyzeWithAI",
        data: {
          items: productInfo.items,
          classifiedItems,
          // 📊 Send pre-classified items so AI knows the correct badges
          userGroups,
          priorityTypes,
          patterns
          // 📊 Include pattern analysis
        }
      });
      if (response.success && response.result) {
        console.log("\u{1F437} \u2705 AI insights received from background");
        const futureOpportunity = generateSmartFanTip(patterns, productInfo.items, userGroups);
        console.log("\u{1F437} Smart Fan Tip generated:", futureOpportunity);
        return validateAIResult({
          items: classifiedItems,
          // ✅ JavaScript-classified badges (100% accurate)
          overallInsight: response.result.overallInsight,
          // ✅ AI-generated insight (creative)
          futureOpportunity,
          // ✅ JavaScript-generated tip (factual, no hallucination)
          priorityTip: response.result.priorityTip || "Focus on lineup matches first, then explore new groups at your pace",
          patternInsight: response.result.patternInsight || null
        });
      } else {
        console.warn("\u{1F437} \u26A0\uFE0F Background AI failed:", response.error);
        console.warn("\u{1F437} Using JavaScript-only fallback");
        return useJavaScriptFallback(productInfo, userGroups, priorityTypes, patterns);
      }
    } catch (error) {
      console.error("\u{1F437} \u274C Failed to communicate with background:", error);
      console.warn("\u{1F437} Using JavaScript-only fallback");
      return useJavaScriptFallback(productInfo, userGroups, priorityTypes, patterns);
    }
  }
  function generateSmartFanTip(patterns, currentItems, userGroups) {
    if (!patterns || patterns.totalCarts < 2) {
      return {
        text: "This is your first cart! Keep shopping and I'll learn your patterns. I'll spot which artists you love and when you shop most.",
        suggestPreferenceUpdate: false,
        artistName: null
      };
    }
    const userGroupsLower = userGroups.map((g) => g.toLowerCase());
    const currentItemNames = currentItems.map((item) => item.name.toLowerCase());
    const abandonedInCart = patterns.abandonedItems.filter(
      (abandoned) => currentItemNames.some((current) => current.includes(abandoned.name.toLowerCase()))
    );
    if (abandonedInCart.length > 0) {
      const item = abandonedInCart[0];
      const artistMatch = item.name.match(/^([A-Za-z\s&]+)/);
      const itemLabel = artistMatch ? artistMatch[1].trim() : "this";
      const artistNotInLineup = itemLabel !== "this" && !userGroupsLower.some(
        (group) => itemLabel.toLowerCase().includes(group) || group.includes(itemLabel.toLowerCase())
      );
      return {
        text: artistNotInLineup && item.timesAdded >= 3 ? `${itemLabel} added ${item.timesAdded} times but not in your lineup. Want to add them?` : `${itemLabel} added ${item.timesAdded} times. Just get it!`,
        suggestPreferenceUpdate: artistNotInLineup && item.timesAdded >= 3,
        artistName: artistNotInLineup ? itemLabel : null
      };
    }
    const peakMonth = Object.entries(patterns.seasonalPatterns).sort((a, b) => b[1] - a[1])[0];
    const currentMonth = (/* @__PURE__ */ new Date()).toLocaleString("en-US", { month: "long" });
    if (peakMonth && peakMonth[0] === currentMonth && patterns.totalCarts >= 3) {
      return {
        text: `${currentMonth} is your peak shopping month. You're on schedule!`,
        suggestPreferenceUpdate: false,
        artistName: null
      };
    }
    const topArtist = Object.entries(patterns.artistFrequency).sort((a, b) => b[1] - a[1])[0];
    if (topArtist && topArtist[1] >= 3) {
      const percentage = Math.round(topArtist[1] / patterns.totalCarts * 100);
      const artistNotInLineup = !userGroupsLower.some(
        (group) => topArtist[0].toLowerCase().includes(group) || group.includes(topArtist[0].toLowerCase())
      );
      return {
        text: artistNotInLineup ? `${topArtist[0]} shows up in ${percentage}% of your carts but not in your lineup. Want to add them?` : `${topArtist[0]} shows up in ${percentage}% of your carts. Dedicated!`,
        suggestPreferenceUpdate: artistNotInLineup,
        artistName: artistNotInLineup ? topArtist[0] : null
      };
    }
    const topType = Object.entries(patterns.typeFrequency).sort((a, b) => b[1] - a[1])[0];
    if (topType && topType[1] >= 3) {
      return {
        text: `You collect ${topType[0]}s!`,
        suggestPreferenceUpdate: false,
        artistName: null
      };
    }
    return null;
  }
  function useJavaScriptFallback(productInfo, userGroups, priorityTypes, patterns) {
    const analyzedItems = analyzeItemsWithJavaScript(
      productInfo.items,
      userGroups,
      priorityTypes
    );
    const lineupText = userGroups.join(", ");
    const typesText = priorityTypes.length > 0 ? ` and ${priorityTypes.join(", ")} items` : "";
    const futureOpportunity = generateSmartFanTip(patterns, productInfo.items, userGroups);
    return validateAIResult({
      items: analyzedItems,
      overallInsight: `Your cart has ${analyzedItems.length} items! Focus on ${lineupText}${typesText} to build your collection.`,
      priorityTip: `Start with ${lineupText} items${priorityTypes.length > 0 ? ` and ${priorityTypes.join(", ")} types` : ""} first.`,
      patternInsight: null,
      futureOpportunity
    });
  }
  var init_analyzeWithAI = __esm({
    "src/content/ai/analyzeWithAI.js"() {
      init_personalization();
    }
  });

  // src/content/ui/modal.js
  var modal_exports = {};
  __export(modal_exports, {
    showAnalysisModal: () => showAnalysisModal,
    showOnboardingModal: () => showOnboardingModal,
    showPiggyBongModal: () => showPiggyBongModal
  });
  function showOnboardingModal(callback) {
    const modal = document.createElement("div");
    modal.id = "piggybong-onboarding-modal";
    modal.className = "piggybong-modal show";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "piggybong-onboarding-title");
    const logoUrl = chrome.runtime.getURL("piggybong.png");
    const isEditing = PersonalizationHelper.hasPersonalization();
    modal.innerHTML = `
    <div class="piggybong-modal-overlay" aria-hidden="true"></div>
    <div class="piggybong-modal-content" style="max-width: 450px;">
      <div class="piggybong-modal-header">
        <div class="piggybong-header-left">
          ${isEditing ? `
          <button class="piggybong-back-btn" aria-label="Back" title="Back to analysis">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          ` : ""}
          <div class="piggybong-brand">
            <img src="${logoUrl}" alt="Piggy Bong" class="piggybong-header-logo">
            <span id="piggybong-onboarding-title" class="piggybong-brand-name">${isEditing ? "Edit Preferences" : "Welcome to Piggy Bong!"}</span>
          </div>
        </div>
        <button class="piggybong-modal-close-btn" aria-label="Skip">\xD7</button>
      </div>

      <div class="piggybong-modal-body">
        <div class="piggybong-onboarding-content">
          <p style="margin-bottom: 16px; color: #666; font-size: 14px; line-height: 1.5;">
            ${isEditing ? "Update your K-pop collection preferences." : "Piggy Bong helps you prioritize K-pop items in your cart."}
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
            ${isEditing ? "Save Changes" : "Save & Continue"}
          </button>

          ${!isEditing ? `
          <button
            id="piggy-skip-onboarding"
            style="width: 100%; margin-top: 10px; padding: 10px 24px; background: transparent; border: none; color: #5D2CEE; cursor: pointer; font-size: 14px; font-weight: 600; border-radius: 50px;"
          >
            Skip for Now
          </button>
          ` : ""}
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
    const KPOP_GROUPS = [
      // 4th Gen Girl Groups
      "NewJeans",
      "IVE",
      "LE SSERAFIM",
      "aespa",
      "NMIXX",
      "Kep1er",
      "STAYC",
      "Billlie",
      "VIVIZ",
      "tripleS",
      "LIGHTSUM",
      "CLASS:y",
      "ILY:1",
      "FIFTY FIFTY",
      "KISS OF LIFE",
      "BABYMONSTER",
      "ARTMS",
      "YOUNG POSSE",
      // 3rd Gen Girl Groups
      "BLACKPINK",
      "TWICE",
      "Red Velvet",
      "ITZY",
      "Oh My Girl",
      "WJSN",
      "EVERGLOW",
      "Weeekly",
      "Rocket Punch",
      "fromis_9",
      "LOONA",
      "CLC",
      "Dreamcatcher",
      "Apink",
      "GFRIEND",
      "MOMOLAND",
      "Weki Meki",
      // Legendary Girl Groups
      "Girls' Generation",
      "SNSD",
      "2NE1",
      "Wonder Girls",
      "f(x)",
      "KARA",
      "SISTAR",
      "T-ara",
      "After School",
      "AOA",
      "Girl's Day",
      "miss A",
      // 4th Gen Boy Groups
      "Stray Kids",
      "TXT",
      "ENHYPEN",
      "ATEEZ",
      "THE BOYZ",
      "TREASURE",
      "CRAVITY",
      "DRIPPIN",
      "OMEGA X",
      "TNX",
      "xikers",
      "ZEROBASEONE",
      "ZB1",
      "BOYNEXTDOOR",
      "RIIZE",
      "PLAVE",
      "&TEAM",
      "TEMPEST",
      "GHOST9",
      // 3rd Gen Boy Groups
      "BTS",
      "SEVENTEEN",
      "NCT",
      "NCT 127",
      "NCT DREAM",
      "WayV",
      "Monsta X",
      "GOT7",
      "Pentagon",
      "SF9",
      "The Boyz",
      "ONEUS",
      "ONEWE",
      "ASTRO",
      "Victon",
      "Golden Child",
      "ONF",
      "VERIVERY",
      "AB6IX",
      "CIX",
      // Legendary Boy Groups
      "EXO",
      "SHINee",
      "Super Junior",
      "TVXQ",
      "Big Bang",
      "INFINITE",
      "BTOB",
      "VIXX",
      "Block B",
      "Winner",
      "iKON",
      "B.A.P",
      "Teen Top",
      "BEAST",
      "MBLAQ",
      "2PM",
      "SS501",
      "Shinhwa",
      "UKISS",
      "ZE:A",
      // Soloists
      "IU",
      "Taeyeon",
      "Sunmi",
      "Chungha",
      "HyunA",
      "Taemin",
      "Kai",
      "Baekhyun",
      "Chen",
      "D.O.",
      "Kang Daniel",
      "Jay Park",
      "Crush",
      "Dean",
      "Zico",
      "G-Dragon",
      "Taeyang",
      "Daesung",
      "CL",
      "PSY",
      "Rain",
      "BoA",
      "Heize",
      // Solo - (G)I-DLE members
      "MIYEON",
      "Soyeon",
      "Yuqi",
      // Groups with unique names
      "(G)I-DLE",
      "GOT the beat",
      "SuperM",
      "AKMU",
      "Bolbbalgan4",
      "Mamamoo",
      "PURPLE KISS",
      "Brave Girls",
      "Cherry Bullet",
      "Lapillus",
      "LE SSERAFIM",
      "cignature",
      "H1-KEY",
      "PRIMROSE",
      "ICHILLIN'",
      "CSR",
      "ATBO"
    ];
    const lineupSearchInput = modal.querySelector("#lineup-search-input");
    const lineupSuggestions = modal.querySelector("#lineup-suggestions");
    const selectedLineupContainer = modal.querySelector("#selected-lineup");
    const selectedGroups = /* @__PURE__ */ new Set();
    const existingLineup = PersonalizationHelper.getLineup();
    existingLineup.forEach((group) => {
      selectedGroups.add(group);
      addLineupTag(group);
    });
    function addLineupTag(groupName) {
      const tag = document.createElement("div");
      tag.className = "lineup-tag";
      tag.style.cssText = "display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #5D2CEE; color: white; border-radius: 20px; font-size: 13px; font-weight: 500;";
      tag.innerHTML = `
      <span>${groupName}</span>
      <button style="background: none; border: none; color: white; cursor: pointer; font-size: 16px; line-height: 1; padding: 0; margin: 0;" data-group="${groupName}">\xD7</button>
    `;
      selectedLineupContainer.appendChild(tag);
      tag.querySelector("button").addEventListener("click", (e) => {
        const group = e.target.dataset.group;
        selectedGroups.delete(group);
        tag.remove();
      });
    }
    lineupSearchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        lineupSuggestions.style.display = "none";
        return;
      }
      const matches = KPOP_GROUPS.filter(
        (group) => group.toLowerCase().includes(query) && !selectedGroups.has(group)
      );
      if (matches.length === 0) {
        lineupSuggestions.innerHTML = `<div style="padding: 12px; color: #666; font-size: 13px;">No matches. Press Enter to add "${e.target.value}"</div>`;
        lineupSuggestions.style.display = "block";
      } else {
        lineupSuggestions.innerHTML = matches.map(
          (group) => `<div class="suggestion-item" data-group="${group}" style="padding: 10px 12px; cursor: pointer; font-size: 14px; border-bottom: 1px solid #f0f0f0;">${group}</div>`
        ).join("");
        lineupSuggestions.style.display = "block";
        lineupSuggestions.querySelectorAll(".suggestion-item").forEach((item) => {
          item.addEventListener("mouseenter", () => {
            item.style.background = "#f5f5f5";
          });
          item.addEventListener("mouseleave", () => {
            item.style.background = "white";
          });
          item.addEventListener("click", () => {
            const group = item.dataset.group;
            selectedGroups.add(group);
            addLineupTag(group);
            lineupSearchInput.value = "";
            lineupSuggestions.style.display = "none";
          });
        });
      }
    });
    lineupSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.value.trim()) {
        const group = e.target.value.trim();
        if (!selectedGroups.has(group)) {
          selectedGroups.add(group);
          addLineupTag(group);
        }
        e.target.value = "";
        lineupSuggestions.style.display = "none";
      }
    });
    const priorityTrigger = modal.querySelector("#priority-dropdown-trigger");
    const priorityMenu = modal.querySelector("#priority-dropdown-menu");
    const priorityCheckboxes = modal.querySelectorAll(".priority-checkbox");
    const selectedPriorityContainer = modal.querySelector("#selected-priority");
    const selectedPriorityTypes = /* @__PURE__ */ new Set();
    priorityTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      priorityMenu.style.display = priorityMenu.style.display === "none" ? "block" : "none";
    });
    document.addEventListener("click", (e) => {
      if (!priorityTrigger.contains(e.target) && !priorityMenu.contains(e.target)) {
        priorityMenu.style.display = "none";
      }
    });
    function addPriorityTag(value, label) {
      const tag = document.createElement("div");
      tag.className = "priority-tag";
      tag.style.cssText = "display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #5D2CEE; color: white; border-radius: 20px; font-size: 13px; font-weight: 500;";
      tag.innerHTML = `
      <span>${label}</span>
      <button style="background: none; border: none; color: white; cursor: pointer; font-size: 16px; line-height: 1; padding: 0; margin: 0;" data-value="${value}">\xD7</button>
    `;
      selectedPriorityContainer.appendChild(tag);
      tag.querySelector("button").addEventListener("click", (e) => {
        const typeValue = e.target.dataset.value;
        selectedPriorityTypes.delete(typeValue);
        const checkbox = modal.querySelector(`.priority-checkbox[value="${typeValue}"]`);
        if (checkbox) checkbox.checked = false;
        tag.remove();
      });
    }
    priorityCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const value = e.target.value;
        const label = e.target.dataset.label;
        if (e.target.checked) {
          if (!selectedPriorityTypes.has(value)) {
            selectedPriorityTypes.add(value);
            addPriorityTag(value, label);
          }
        } else {
          selectedPriorityTypes.delete(value);
          const existingTag = selectedPriorityContainer.querySelector(`button[data-value="${value}"]`);
          if (existingTag) existingTag.parentElement.remove();
        }
      });
    });
    const existingPriority = PersonalizationHelper.getPriority();
    if (existingPriority) {
      const types = Array.isArray(existingPriority.types) ? existingPriority.types : [existingPriority.type];
      priorityCheckboxes.forEach((checkbox) => {
        if (types.includes(checkbox.value)) {
          checkbox.checked = true;
          selectedPriorityTypes.add(checkbox.value);
          addPriorityTag(checkbox.value, checkbox.dataset.label);
        }
      });
    }
    const saveBtn = modal.querySelector("#piggy-save-preferences");
    console.log("\u{1F50D} Save button found:", saveBtn);
    saveBtn.addEventListener("click", () => {
      console.log("\u{1F50D} ========== SAVE BUTTON CLICKED ==========");
      const lineup = Array.from(selectedGroups);
      console.log("\u{1F50D} Total priority checkboxes found:", priorityCheckboxes.length);
      priorityCheckboxes.forEach((cb, i) => {
        console.log(`  Checkbox ${i}: value="${cb.value}" checked=${cb.checked}`);
      });
      const checkedPriorities = Array.from(priorityCheckboxes).filter((cb) => cb.checked);
      const priorityTypes = checkedPriorities.map((cb) => cb.value);
      console.log("\u{1F50D} Checked priorities:", checkedPriorities.length, priorityTypes);
      PersonalizationHelper.setLineup(lineup);
      console.log("\u{1F437} Lineup set to:", lineup.length > 0 ? lineup : "(empty - just browsing)");
      if (priorityTypes.length > 0) {
        PersonalizationHelper.setPriority({
          types: priorityTypes,
          // Array of selected types
          name: priorityTypes.join(", ")
          // Human-readable name
        });
        console.log("\u{1F437} Priority set to:", priorityTypes);
      } else {
        localStorage.removeItem("piggyPriority");
        console.log("\u{1F437} Priority cleared (no types selected)");
      }
      modal.remove();
      if (isEditing) {
        console.log("\u{1F437} Preferences updated - need to re-analyze with new preferences!");
        const oldAnalysisModal = document.getElementById("piggybong-modal");
        if (oldAnalysisModal) {
          console.log("\u{1F437} Removing old analysis modal (preferences changed)");
          oldAnalysisModal.remove();
        }
        const pageText = document.body.innerText || "";
        const pageUrl = window.location.href;
        console.log("\u{1F437} Re-analyzing cart with updated preferences...");
        showAnalysisModal(pageText, pageUrl);
      } else {
        if (callback) callback();
      }
    });
    const backBtn = modal.querySelector(".piggybong-back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log("\u{1F437} ========== BACK BUTTON CLICKED ==========");
        console.log("\u{1F437} Callback exists?", !!callback);
        modal.remove();
        console.log("\u{1F437} Preferences modal removed");
        if (callback) {
          console.log("\u{1F437} Calling callback to reveal analysis modal...");
          callback();
          console.log("\u{1F437} Callback executed");
        } else {
          console.error("\u{1F437} ERROR: No callback provided to back button!");
        }
      });
    }
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
    if (skipBtn) {
      skipBtn.addEventListener("click", skipOnboarding);
    }
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
      const floatingButton = document.getElementById("piggybong-floating-container");
      if (floatingButton) {
        floatingButton.style.display = "";
      }
      originalRemove();
    };
  }
  function showPiggyBongModal(pageText, pageUrl, options = {}) {
    console.log("\u{1F437} showPiggyBongModal called");
    console.log("\u{1F437} Page URL:", pageUrl);
    console.log("\u{1F437} Options:", options);
    const isDemo = options.isDemo || false;
    if (!isDemo && !PersonalizationHelper.hasPersonalization()) {
      showOnboardingModal(() => {
        showAnalysisModal(pageText, pageUrl, { isDemo });
      });
      return;
    }
    showAnalysisModal(pageText, pageUrl, { isDemo });
  }
  function showAnalysisModal(pageText, pageUrl, options = {}) {
    const isDemo = options.isDemo || false;
    const existingModal = document.getElementById("piggybong-modal");
    if (existingModal) {
      existingModal.remove();
    }
    console.log("\u{1F437} About to call extractProductInfo...");
    const productInfo = extractProductInfo(pageText);
    console.log("\u{1F437} extractProductInfo returned:", productInfo);
    console.log("\u{1F437} isDemo:", isDemo);
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
          <div class="piggybong-spinner" role="status" aria-label="Loading">
            <img src="${chrome.runtime.getURL("piggybong.png")}" alt="Piggybong lightstick">
          </div>
          <p>Analyzing your cart...</p>
          <p style="font-size: 12px; color: #757575; margin-top: 8px;">This takes a few seconds</p>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
    console.log("\u{1F50D} Modal appended to body. Modal element:", modal);
    console.log("\u{1F50D} Modal classList:", modal.classList);
    console.log("\u{1F50D} Modal display style:", window.getComputedStyle(modal).display);
    const floatingButton = document.getElementById("piggybong-floating-container");
    console.log("\u{1F437} Analysis modal - Looking for floating button:", floatingButton ? "FOUND" : "NOT FOUND");
    if (floatingButton) {
      floatingButton.style.display = "none";
      console.log("\u{1F437} Analysis modal - Floating button HIDDEN");
    } else {
      console.warn("\u{1F437} Analysis modal - Cannot hide floating button (not found in DOM)");
    }
    const settingsBtn = modal.querySelector(".piggybong-settings-btn");
    settingsBtn.addEventListener("click", () => {
      console.log("\u{1F437} Settings clicked - hiding analysis modal:", modal.id);
      modal.style.display = "none";
      showOnboardingModal(() => {
        console.log("\u{1F437} ========== CALLBACK EXECUTED (REVEALING MODAL) ==========");
        console.log("\u{1F437} Looking for analysis modal with id:", modal.id);
        console.log("\u{1F437} Modal still in DOM?", document.body.contains(modal));
        console.log("\u{1F437} Modal current display:", modal.style.display);
        console.log("\u{1F437} All modals in page:", document.querySelectorAll(".piggybong-modal").length);
        if (document.body.contains(modal)) {
          modal.style.display = "";
          console.log("\u{1F437} \u2705 Modal revealed successfully!");
          console.log("\u{1F437} Modal final display:", modal.style.display);
        } else {
          console.error("\u{1F437} \u274C ERROR: Modal was removed from DOM!");
          console.log("\u{1F437} Searching for modal by ID:", document.getElementById(modal.id));
        }
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
      const floatingButton2 = document.getElementById("piggybong-floating-container");
      if (floatingButton2) {
        floatingButton2.style.display = "";
      }
      originalRemove();
    };
    setTimeout(() => {
      modal.classList.add("show");
      console.log("\u{1F50D} Added .show class to modal. classList now:", modal.classList);
      console.log("\u{1F50D} Modal should now be visible with transform: translateX(0)");
    }, 10);
    runAIAnalysis(pageText, pageUrl, productInfo, isDemo);
  }
  async function runAIAnalysis(pageText, pageUrl, productInfo, isDemo = false) {
    const modalBody = document.querySelector(".piggybong-modal-body");
    const hasPersonalization = PersonalizationHelper.hasPersonalization();
    console.log("\u{1F437} runAIAnalysis() called");
    console.log("\u{1F437} productInfo:", productInfo);
    console.log("\u{1F437} isDemo:", isDemo);
    console.log("\u{1F437} hasPersonalization:", hasPersonalization);
    if (!productInfo || productInfo === null) {
      console.warn("\u{1F437} \u26A0\uFE0F No product info extracted - cart might be empty");
      showFallback(modalBody);
      return;
    }
    try {
      console.log("\u{1F437} Calling analyzeWithAI...");
      const startTime = Date.now();
      const aiResult = await analyzeWithAI(pageText, pageUrl, productInfo);
      console.log("\u{1F437} AI Result:", aiResult);
      const elapsedTime = Date.now() - startTime;
      const minDisplayTime = 800;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
      const loadingDiv = modalBody.querySelector(".piggybong-loading");
      console.log("\u{1F50D} Loading div found:", loadingDiv);
      if (loadingDiv) {
        console.log("\u{1F50D} Removing loading div...");
        loadingDiv.remove();
      }
      const analysisModeBadge = isDemo ? '<span style="display: inline-block; padding: 4px 12px; background: #E8F5E9; color: #2E7D32; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">Demo Mode</span>' : "";
      const postDemoCTA = isDemo ? `
      <div style="margin-top: 24px; padding: 16px; background: linear-gradient(135deg, rgba(93, 44, 238, 0.05) 0%, rgba(139, 85, 237, 0.05) 100%); border-radius: 12px; border: 1px solid rgba(93, 44, 238, 0.2);">
        <p style="font-size: 14px; color: #666; margin: 0 0 12px 0; line-height: 1.5;">
          Want insights tuned to YOUR lineup?
        </p>
        <button
          id="set-preferences-after-demo"
          class="piggybong-primary-btn"
          style="width: 100%; padding: 12px 24px; background: linear-gradient(135deg, #5D2CEE 0%, #8B55ED 100%); border: none; border-radius: 50px; color: white; font-weight: 600; cursor: pointer; font-size: 14px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(93, 44, 238, 0.3);"
        >
          Set My Preferences
        </button>
      </div>
    ` : "";
      console.log("\u{1F50D} DEBUG futureOpportunity:", aiResult.futureOpportunity);
      console.log("\u{1F50D} DEBUG full aiResult:", aiResult);
      const analysisHTML = `
      ${analysisModeBadge}

      <!-- White Card Container with title inside -->
      <div class="piggybong-insight-card">
        <h3 class="piggybong-insight-card-title">Overall Insight</h3>

        ${aiResult.items && aiResult.items.length > 0 ? `
        <div class="piggybong-items-compact">
          ${aiResult.items.map((item) => `
            <div class="piggybong-item-badge-row">
              <span class="priority-badge priority-${item.priority.toLowerCase().replace(/\s+/g, "")}">${item.priority}</span>
              <span class="item-name-compact">${item.name}</span>
            </div>
          `).join("")}
        </div>
        ` : ""}

        <div class="overall-insight-content">
          ${aiResult.overallInsight}
          ${aiResult.patternInsight ? `<br><br>${aiResult.patternInsight}` : ""}
        </div>

        <!-- HIDDEN FOR CHROME AI CHALLENGE - Future Enhancement
        <div class="feedback-section" style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 13px; color: #666; margin-bottom: 8px;">Was this helpful?</p>
          <div class="feedback-buttons" style="display: flex; gap: 12px; align-items: center;">
            <button class="feedback-btn feedback-thumbs-up" data-feedback="helpful" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
              \u{1F44D} Helpful
            </button>
            <button class="feedback-btn feedback-thumbs-down" data-feedback="not-helpful" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
              \u{1F44E} Not Helpful
            </button>
          </div>
          <div class="feedback-comment-box" style="display: none; margin-top: 12px;">
            <textarea
              class="feedback-comment-input"
              placeholder="What could be better? (optional)"
              style="width: 100%; min-height: 60px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; font-family: inherit; resize: vertical;"
            ></textarea>
            <button class="feedback-submit-btn" style="margin-top: 8px; padding: 8px 16px; background: linear-gradient(135deg, #5D2CEE 0%, #8B55ED 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
              Submit Feedback
            </button>
          </div>
        </div>
        /HIDDEN -->
      </div>

      ${aiResult.futureOpportunity ? `
      <!-- Smart Fan Tip with Green Frame -->
      <div class="piggybong-future-opportunity-section">
        <h3>Smart Fan Tip</h3>
        <div class="future-opportunity-content">
          <p style="margin-bottom: ${aiResult.futureOpportunity.suggestPreferenceUpdate ? "12px" : "0"};">
            ${typeof aiResult.futureOpportunity === "object" ? aiResult.futureOpportunity.text : aiResult.futureOpportunity}
          </p>
          ${aiResult.futureOpportunity.suggestPreferenceUpdate ? `
            <button class="update-lineup-btn">Update Lineup</button>
          ` : ""}
        </div>
      </div>
      ` : "<!-- Smart Fan Tip: futureOpportunity is null or undefined -->"}

      ${postDemoCTA}
    `;
      console.log("\u{1F50D} Inserting analysis HTML into modalBody...");
      console.log("\u{1F50D} modalBody:", modalBody);
      console.log("\u{1F50D} analysisHTML length:", analysisHTML.length);
      modalBody.insertAdjacentHTML("beforeend", analysisHTML);
      console.log("\u{1F50D} Analysis HTML inserted successfully!");
      const updateLineupBtn = modalBody.querySelector(".update-lineup-btn");
      if (updateLineupBtn) {
        updateLineupBtn.addEventListener("click", (e) => {
          e.preventDefault();
          console.log('\u{1F437} User clicked "Update Lineup" button');
          const analysisModal = document.getElementById("piggybong-modal");
          if (analysisModal) {
            analysisModal.style.display = "none";
          }
          showOnboardingModal(() => {
            if (analysisModal) analysisModal.remove();
            const pageText2 = document.body.innerText || "";
            const pageUrl2 = window.location.href;
            showAnalysisModal(pageText2, pageUrl2);
          });
        });
      }
      const setPreferencesAfterDemo = modalBody.querySelector("#set-preferences-after-demo");
      if (setPreferencesAfterDemo) {
        setPreferencesAfterDemo.addEventListener("click", (e) => {
          e.preventDefault();
          console.log('\u{1F437} User clicked "Set My Preferences" after demo');
          const modal = document.getElementById("piggybong-modal");
          if (modal) modal.remove();
          showOnboardingModal(() => {
            console.log("\u{1F437} Preferences saved after demo");
          });
        });
      }
    } catch (error) {
      console.error("\u{1F437} \u274C AI analysis failed:", error);
      console.error("\u{1F437} Error details:", error.message);
      console.error("\u{1F437} Error stack:", error.stack);
      showFallback(modalBody);
    }
  }
  var init_modal = __esm({
    "src/content/ui/modal.js"() {
      init_personalization();
      init_helpers();
      init_extractors();
      init_analyzeWithAI();
    }
  });

  // src/content/ui/floatingButton.js
  init_helpers();
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
    <div class="piggybong-btn-text">
      <div class="piggybong-btn-title">Piggy Bong</div>
      <div class="piggybong-btn-subtitle">K-pop Fan Companion</div>
    </div>
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
      floatingContainer.style.display = "none";
      console.log("\u{1F437} Floating button hidden");
      const itemCount = getCartItemCount();
      if (itemCount === 0) {
        e.preventDefault();
        e.stopPropagation();
        handleEmptyCartClick(e, showPiggyBongModalCallback);
        return;
      }
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
    const btnTitle = floatingBtn?.querySelector(".piggybong-btn-title");
    const btnSubtitle = floatingBtn?.querySelector(".piggybong-btn-subtitle");
    if (btnTitle) btnTitle.textContent = "Piggy Bong";
    if (btnSubtitle) btnSubtitle.textContent = "K-pop Fan Companion";
    if (itemCount === 0) {
      console.log("\u{1F437} Cart is empty - button will show empty cart message");
    } else {
      console.log(`\u{1F437} Cart has ${itemCount === -1 ? "items (unknown count)" : itemCount + " items"} - button ready for analysis`);
    }
  }
  function handleEmptyCartClick(e, showPiggyBongModalCallback) {
    const itemCount = getCartItemCount();
    if (itemCount === 0) {
      e.preventDefault();
      e.stopPropagation();
      const modal = document.createElement("div");
      modal.className = "piggybong-modal show";
      modal.innerHTML = `
      <div class="piggybong-modal-overlay"></div>
      <div class="piggybong-modal-content" style="max-width: 420px;">
        <div class="piggybong-modal-header">
          <div class="piggybong-brand">
            <img src="${chrome.runtime.getURL("piggybong.png")}" alt="Piggy Bong" class="piggybong-header-logo">
            <span class="piggybong-brand-name">Piggy Bong</span>
          </div>
          <button class="piggybong-modal-close-btn" aria-label="Close">\xD7</button>
        </div>
        <div class="piggybong-modal-body">
          <div style="text-align: center; padding: 20px;">
            <div style="width: 120px; height: 120px; margin: 0 auto 20px; background: linear-gradient(135deg, #5D2CEE 0%, #8B55ED 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <img src="${chrome.runtime.getURL("piggybong.png")}" alt="Piggy Bong" style="width: 80px; height: 80px; filter: brightness(0) invert(1);">
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
      const floatingButton = document.getElementById("piggybong-floating-container");
      if (floatingButton) {
        floatingButton.style.display = "none";
      }
      const closeBtn = modal.querySelector(".piggybong-modal-close-btn");
      const overlay = modal.querySelector(".piggybong-modal-overlay");
      const tryDemoBtn = modal.querySelector("#try-demo-btn");
      const setPreferencesBtn = modal.querySelector("#set-preferences-btn");
      const closeModal = (e2) => {
        if (e2) e2.stopPropagation();
        modal.classList.add("closing");
        setTimeout(() => modal.remove(), 300);
      };
      closeBtn.addEventListener("click", closeModal);
      overlay.addEventListener("click", closeModal);
      tryDemoBtn.addEventListener("click", () => {
        modal.remove();
        showDemoMode(showPiggyBongModalCallback);
      });
      setPreferencesBtn.addEventListener("click", () => {
        modal.remove();
        Promise.resolve().then(() => (init_modal(), modal_exports)).then(({ showOnboardingModal: showOnboardingModal2 }) => {
          showOnboardingModal2(() => {
            console.log("\u{1F437} First-time preferences saved from empty cart flow");
          });
        });
      });
      const originalRemove = modal.remove.bind(modal);
      modal.remove = function() {
        const floatingButton2 = document.getElementById("piggybong-floating-container");
        if (floatingButton2) {
          floatingButton2.style.display = "";
        }
        originalRemove();
      };
      return false;
    }
  }
  function showDemoMode(showPiggyBongModalCallback) {
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
    const mockPageUrl = "https://demo.piggybong.app/cart";
    showPiggyBongModalCallback(mockPageText, mockPageUrl, { isDemo: true });
  }

  // src/content/index.js
  init_modal();
  (function() {
    "use strict";
    if (document.getElementById("piggybong-floating-btn")) {
      return;
    }
    function initializePiggyBong() {
      console.log("\u{1F437} Piggy Bong: Initializing floating button...");
      createFloatingButton(showPiggyBongModal);
      updateButtonState();
      console.log("\u{1F437} Piggy Bong: Button ready!");
    }
    let reCheckTimeout = null;
    function scheduleReCheck() {
      clearTimeout(reCheckTimeout);
      reCheckTimeout = setTimeout(() => {
        console.log("\u{1F437} Re-checking state...");
        if (!isButtonCreated) {
          console.log("\u{1F437} Page loaded dynamically - creating button now!");
          createFloatingButton(showPiggyBongModal);
          updateButtonState();
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
