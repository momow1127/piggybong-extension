#!/bin/bash

echo "🚀 Launching Chrome Canary with Gemini Nano flags..."
echo ""
echo "This will:"
echo "1. Close any running Chrome Canary instances"
echo "2. Launch with AI flags enabled"
echo "3. Open the diagnostic test page"
echo ""

# Close Chrome Canary if running
pkill -f "Google Chrome Canary"
sleep 2

# Launch Chrome Canary with Gemini Nano flags
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary \
  --enable-features=Optimization GuideOnDeviceModel,PromptAPIForGeminiNano,AIPromptAPI \
  --enable-ai-prompt-api \
  --user-data-dir="$HOME/Library/Application Support/Google/Chrome Canary" \
  "file://$PWD/test-gemini.html" \
  "chrome://flags/#optimization-guide-on-device-model" \
  "chrome://flags/#prompt-api-for-gemini-nano" \
  "chrome://components" \
  > /dev/null 2>&1 &

echo "✅ Chrome Canary launched with AI flags!"
echo ""
echo "📋 Next steps:"
echo "1. In chrome://flags, enable these flags:"
echo "   - Prompt API for Gemini Nano → Enabled"
echo "   - Optimization Guide On Device Model → Enabled BypassPerfRequirement"
echo "2. Click 'Relaunch' button in flags page"
echo "3. Wait 2-3 minutes for model to download"
echo "4. Check chrome://components for 'Optimization Guide On Device Model'"
echo "5. If version is 0.0.0.0, click 'Check for update'"
echo "6. Go to test-gemini.html tab and run tests"
echo ""
