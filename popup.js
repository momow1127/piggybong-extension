// ==================================================
// popup.js - Value Check Controller (The Brains)
// ==================================================

const runCheckBtn = document.getElementById("runCheckBtn");
const contextArea = document.getElementById("context-area");
const reportContainer = document.getElementById("report-container");
const aiStatus = document.getElementById("aiStatus");

// Chrome AI session
let aiSession = null;
const AI_TIMEOUT_MS = 30000; // 30 seconds for AI response (Gemini Nano can be slow)

// --- 1. AI Initialization ---

async function initializeAI() {
  const systemPrompt = `You are Piggy Bong, a K-pop Collection Alignment Specialist. Your job is to analyze a fan's shopping cart on a K-pop merchandise website and guide them to a thoughtful decision aligned with their collection goals.

PERSONALITY: Enthusiastic, supportive, non-judgmental. Focus on goals and collection value. Use emoticons (like 💕✨🐷).

CRITICAL RULES:
1. NEVER use words like: budget, money, finance, spending, afford, expensive, cheap, cost, save, price.
2. INSTEAD use: priority, collection goals, must-haves, commitment, long-term value, investment, top picks.
3. Your response must analyze the page text to identify items and their total value.

OUTPUT FORMAT (CRITICAL):
Value Check Report:
- Items Identified: [List 1-3 main items]
- Estimated Commitment: [State the total value in currency units identified, e.g., '300 USD commitment']
- Reflection: [A short, warm reflection based on the items, asking if they align with their current main bias or wishlist. 2-3 sentences max.]
- Next Step: [Suggest a non-purchase action, e.g., "Ready for the big commitment?" or "Let's check your current wishlist first!"]

Keep the entire response under 70 words. Focus on analysis and reflection based on the text provided.`;

  // Enhanced diagnostics
  console.log('=== AI Availability Diagnostics ===');
  console.log('window.LanguageModel:', typeof window.LanguageModel);

  // Check if LanguageModel exists
  if (!window.LanguageModel) {
    console.warn('⚠️ Chrome AI (LanguageModel) not available. Using fallback logic.');
    console.log('Please check: chrome://on-device-internals and ensure PromptApi is enabled');
    updateAIStatus(false);
    return false;
  }

  try {
    // Create AI session with the new LanguageModel API with timeout
    console.log('Attempting to create AI session...');

    const sessionPromise = window.LanguageModel.create({
      systemPrompt: systemPrompt
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Session creation timed out")), 10000)
    );

    aiSession = await Promise.race([sessionPromise, timeoutPromise]);

    console.log('✅ AI session initialized successfully!');
    console.log('Session details:', aiSession);

    // Store system prompt for later use
    aiSession._systemPrompt = systemPrompt;

    // Update UI status
    updateAIStatus(true);
    return true;

  } catch (error) {
    console.error('❌ AI initialization failed:', error);
    console.error('Error details:', error.message);
    updateAIStatus(false);
    aiSession = null;
    return false;
  }
}

// Update AI status indicator in UI
function updateAIStatus(isAvailable) {
  if (!aiStatus) return;

  const statusText = aiStatus.querySelector('.status-text');

  if (isAvailable) {
    aiStatus.classList.remove('ai-unavailable');
    statusText.textContent = 'AI Ready';
  } else {
    aiStatus.classList.add('ai-unavailable');
    statusText.textContent = 'AI Unavailable';
  }
}

// --- 2. Fallback Helper Functions ---

function extractItemsFromText(text) {
  // Try to find product names or item counts
  const itemPatterns = [
    /Products?\s*\((\d+)\)/i,  // "Products (2)" format
    /(\d+)\s+items?/i,          // "2 items" format
    /Cart.*?(\d+)/i             // Extract number after "Cart"
  ];

  for (const pattern of itemPatterns) {
    const match = text.match(pattern);
    if (match) {
      const count = parseInt(match[1]);
      if (count > 0 && count < 100) return `${count} item(s)`;
    }
  }
  return null;
}

function extractTotalFromText(text) {
  // Try to find total/subtotal amounts
  const pricePatterns = [
    /total[:\s]+USD\s*([\d,]+\.?\d*)/i,
    /subtotal[:\s]+USD\s*([\d,]+\.?\d*)/i,
    /USD\s*([\d,]+\.?\d+)/i
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 10) return `USD ${match[1]} commitment`;
    }
  }
  return null;
}

// --- 3. AI Prompt Logic ---

async function runValueCheck(pageText, pageUrl) {
  // Show loading state
  reportContainer.innerHTML = '<div class="loading">Analyzing your cart...</div>';
  reportContainer.classList.add('has-report');
  runCheckBtn.disabled = true;

  // If no AI session exists yet, try to create it now
  if (!aiSession && window.LanguageModel) {
    console.log('Creating AI session on-demand...');
    try {
      await initializeAI();
    } catch (error) {
      console.log('Failed to initialize AI on-demand:', error);
    }
  }

  const userPrompt = `The current page is ${pageUrl}. Analyze the following text content from the cart/checkout page and generate the Value Check Report as strictly requested in the system prompt. Text to analyze: \n\n${pageText.substring(0, 3000)}`;

  if (aiSession) {
    try {
      console.log('Sending prompt to AI...');
      // Use a timeout to prevent infinite wait
      const promptPromise = aiSession.prompt(userPrompt);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI response timed out.")), AI_TIMEOUT_MS)
      );

      const aiReply = await Promise.race([promptPromise, timeoutPromise]);
      console.log('✅ Received AI response');
      reportContainer.textContent = aiReply.trim();
    } catch (error) {
      console.error("AI execution error or timeout:", error);
      reportContainer.textContent = "⚠️ AI took too long to respond\n\nUsing fallback analysis...\n\n- **Reflection:** Take a moment to check your **collection goals**! Are these items on your **top picks** list, or are you feeling the urgency of **FOMO**? ✨\n- **Next Step:** Close the window, take a deep breath, and check your **wishlist**.";
    }
  } else {
    // Fallback with basic text analysis if AI never initialized
    const items = extractItemsFromText(pageText);
    const total = extractTotalFromText(pageText);

    reportContainer.textContent = `🐷 Priority Check Report\n\n✓ Items Found: ${items || 'Multiple items in cart'}\n✓ Total Commitment: ${total || 'Significant commitment detected'}\n\n💭 Reflection:\nTake a moment to check your collection goals! Are these items on your top picks list, or are you feeling the urgency of FOMO? ✨\n\n→ Next Step: Close this popup, take a deep breath, and review your wishlist.`;
  }
  runCheckBtn.disabled = false;
}

// --- 4. Event Listener and Flow Control ---

// Main listener to trigger the data extraction and AI analysis
runCheckBtn.addEventListener("click", () => {
  // 1. Query the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      reportContainer.textContent = "Error: Could not find active tab.";
      return;
    }
    const activeTab = tabs[0];

    // 2. Inject the content.js script into the active tab
    chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        files: ['content.js'], // This executes the content.js data extractor
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Script injection failed:', chrome.runtime.lastError.message);
          reportContainer.textContent = "Error: Cannot run script. Ensure you have access to the page (e.g., no protected pages like chrome://).";
        }
        // If successful, the injected script will send a message back.
      }
    );
  });
});

// Listener to receive the message from the injected content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "pageContent") {
    const pageText = request.data.text;
    const pageUrl = request.data.url;

    contextArea.innerHTML = `
      **URL:** ${pageUrl.substring(0, 45)}...<br>
      **Context Snippet:** ${pageText.substring(0, 150)}...
    `;

    // 3. Run the AI Value Check with the received data
    runValueCheck(pageText, pageUrl);

    // Stop listening after the first message is received and processed
    // to prevent memory leaks/re-runs, although not strictly necessary for a simple popup.
    // chrome.runtime.onMessage.removeListener(thisListener);
  }
});


// AI will be initialized on-demand when user clicks "Value Check" button
// This prevents slow popup load times
// initializeAI();