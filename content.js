// -----------------------------
// 🐷 Piggy Bong Content Script
// Clean Final Version (v5.1)
// -----------------------------

console.log("🐷 Piggy Bong content script loaded");

// =============================
// 🧩 HELPERS
// =============================

// Detect if the page is a cart
function isCartPage() {
  const url = window.location.href.toLowerCase();
  const text = document.body.innerText.toLowerCase();
  const cartHints = ["cart", "checkout", "basket", "order summary"];
  return cartHints.some(h => url.includes(h) || text.includes(h));
}

// Extract generic cart items from page
function extractCartItems() {
  const items = [];
  const containers = document.querySelectorAll("div, li, tr, section");
  containers.forEach(el => {
    const name = el.querySelector("h2, h3, .product-name, .item-name");
    const price = el.querySelector(".price, .amount, .value");
    if (name && price) {
      items.push({
        name: name.innerText.trim(),
        price: price.innerText.trim(),
        qty: 1
      });
    }
  });
  return items;
}

// =============================
// 🧠 NORMALIZER (Fixes Gemini format drift)
// =============================
function normalizeAIResponse(parsed, cartItems, bias) {
  if (!parsed) return fallbackResponse();

  // Handle correct schema first
  if (parsed.items && parsed.overallInsight && parsed.priorityTip) return parsed;

  // Gemini returns random formats - just map cart items ourselves
  const items = cartItems.map(item => {
    const itemName = item.name.toLowerCase();
    const biasLower = bias.toLowerCase();
    const isBiasMatch = itemName.includes(biasLower);

    return {
      name: item.name,
      priority: isBiasMatch ? "HIGH" : "LOW",
      reasoning: isBiasMatch ? `${bias} album 💎` : "Different group",
      score: isBiasMatch ? 5 : 0
    };
  });

  return {
    items,
    overallInsight: `Your ${bias} item is top priority 💎`,
    priorityTip: `Focus on your bias first 💜`
  };
}

// =============================
// 🪄 FALLBACK
// =============================
function fallbackResponse() {
  return {
    items: [],
    overallInsight: "Your cart looks great 💜",
    priorityTip: "Follow your fan instinct ✨"
  };
}

// =============================
// 🎨 UI - Floating Button + Modal
// =============================
function createPiggyButton() {
  if (document.getElementById("piggyBongBtn")) return;
  const btn = document.createElement("button");
  btn.id = "piggyBongBtn";
  btn.textContent = "🐷 Should I Buy This?";
  btn.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    background: linear-gradient(135deg, #5D2CEE, #8B55ED);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 14px 18px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  `;
  btn.onclick = showPiggyModal;
  document.body.appendChild(btn);
  console.log("🐷 Floating button created");
}

function showPiggyModal() {
  const modal = document.createElement("div");
  modal.id = "piggyModal";
  modal.style = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: white;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    width: 320px;
    z-index: 999999;
    font-family: system-ui, sans-serif;
  `;
  modal.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3 style="margin:0;">🐷 Piggy Bong</h3>
      <button id="closePiggy" style="border:none;background:none;font-size:18px;cursor:pointer;">✖</button>
    </div>
    <div id="piggyContent" style="margin-top:12px;">Analyzing your cart... ⏳</div>
  `;
  document.body.appendChild(modal);
  document.getElementById("closePiggy").onclick = () => modal.remove();
  runAIAnalysis(modal);
}

// =============================
// ⚙️ MAIN AI ANALYSIS
// =============================
async function runAIAnalysis(modal) {
  try {
    const cartItems = extractCartItems();
    const contentEl = document.getElementById("piggyContent");

    if (!cartItems.length) {
      contentEl.innerHTML = "🛒 Nothing in your cart yet! Add some merch first 💕";
      return;
    }

    const bias = localStorage.getItem("piggy_bias") || "NewJeans";
    const goal = localStorage.getItem("piggy_goal") || "Albums";

    const userPrompt = `
PERSONALIZATION CONTEXT:
User's bias: ${bias}
User's collection goal: ${goal}

## CART
${cartItems
  .map((i, idx) => `Item ${idx + 1}: ${i.name} (Qty: ${i.qty}, Price: ${i.price})`)
  .join("\n")}

Analyze and return JSON only.
    `;

    console.log("🐷 Sending prompt to Gemini Nano...");

    const model = await LanguageModel.create({
      systemPrompt: `
You are Piggy Bong — a warm, supportive K-pop shopping companion! 🐷

Analyze cart items and assign priority levels.

RULES:
- Use "you/your" tone, 2–4 word reasoning
- Never negative
- Return ONLY JSON

FORMAT:
{
  "items": [
    {"name": "...", "priority": "HIGH|MEDIUM|LOW", "reasoning": "...", "score": 0-6}
  ],
  "overallInsight": "...",
  "priorityTip": "..."
}
      `,
      topK: 3,
      temperature: 1,
    });

    const result = await model.prompt(userPrompt, { output: "json" });

    // ✅ Fix for undefined or object response
    const rawText =
      typeof result === "string"
        ? result
        : result?.text || JSON.stringify(result);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON block found in AI output");

    const parsed = JSON.parse(jsonMatch[0]);
    const normalized = normalizeAIResponse(parsed, cartItems, bias);

    console.log("🐷 ✅ Normalized AI result:", normalized);
    renderPiggyOutput(normalized);
  } catch (err) {
    console.error("🐷 ❌ AI analysis failed:", err);
    const el = document.getElementById("piggyContent");
    if (el)
      el.innerHTML =
        "🐷 Oops! I couldn’t read the cart data this time 💭";
  }
}

// =============================
// 🖼️ RENDER RESULTS
// =============================
function renderPiggyOutput(data) {
  const content = document.getElementById("piggyContent");
  if (!content) return;

  const html = `
    <div style="margin-top:10px;">
      ${data.items
        .map(
          i => `
        <div style="margin-bottom:10px;">
          <b>${i.name}</b><br/>
          <span>${i.reasoning}</span> (${i.priority})
        </div>`
        )
        .join("")}
    </div>
    <div style="margin-top:12px; font-weight:bold;">${data.overallInsight}</div>
    <div style="color:#555; margin-top:4px;">${data.priorityTip}</div>
  `;
  content.innerHTML = html;
}

// =============================
// 🚀 INIT
// =============================
if (isCartPage()) {
  createPiggyButton();
  console.log("🐷 Cart detected - button ready");
} else {
  console.log("🐷 Not a cart page, no button");
}