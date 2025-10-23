// ===========================================
// Build Script - Bundle ES Modules for Chrome Extension
// Usage: node build.js
// ===========================================

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
  try {
    console.log('🔨 Building Piggy Bong extension...');

    // Bundle the content script
    await esbuild.build({
      entryPoints: ['src/content/index.js'],
      bundle: true,
      outfile: 'content-bundled.js',
      format: 'iife',
      target: 'chrome120',
      platform: 'browser',
      minify: false, // Keep readable for debugging
      sourcemap: true,
      logLevel: 'info'
    });

    console.log('✅ Build complete!');
    console.log('📦 Output: content-bundled.js');
    console.log('\n⚠️  Next steps:');
    console.log('1. Update manifest.json to use "content-bundled.js" instead of "content.js"');
    console.log('2. Reload the extension in Chrome');
    console.log('3. Test all functionality');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
