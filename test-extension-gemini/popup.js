function testGemini() {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '<div class="info">Testing... Check service worker console for details</div>';

  chrome.runtime.sendMessage({ action: "testGemini" }, (response) => {
    if (response && response.success) {
      resultDiv.innerHTML = '<div class="info success">✅ Check service worker console for results!</div>';
    } else {
      resultDiv.innerHTML = `<div class="info error">❌ Error: ${response?.error || 'Check service worker console'}</div>`;
    }
  });
}

function openServiceWorkerConsole() {
  // This will open chrome://serviceworker-internals
  alert('Go to: chrome://extensions\nFind "Gemini Nano Test Extension"\nClick "service worker" link\nConsole will open showing logs');
}

function openBackgroundPage() {
  chrome.runtime.openOptionsPage();
}

// Auto-test on popup open
window.addEventListener('load', () => {
  console.log('Popup loaded');
});
