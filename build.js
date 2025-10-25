// ===========================================
// Build Script - Bundle ES Modules for Chrome Extension
// Usage: npm run build or node build.js
// ===========================================

import esbuild from 'esbuild';

async function build() {
  try {
    console.log('🔨 Building Piggy Bong extension...');
    console.log('📂 Entry: src/content/index.js');
    console.log('📦 Output: content.js (replaces old file)');

    // Bundle the content script
    await esbuild.build({
      entryPoints: ['src/content/index.js'],
      bundle: true,
      outfile: 'content.js',  // Direct output to content.js
      format: 'iife',         // Immediately Invoked Function Expression (no modules)
      target: 'chrome120',    // Target Chrome 120+
      platform: 'browser',    // Browser environment
      minify: false,          // Keep readable for debugging
      sourcemap: false,       // No sourcemap (cleaner output)
      logLevel: 'info',
      banner: {
        js: '// ===========================================\n// Piggy Bong - Bundled Content Script\n// Auto-generated from src/content/ modules\n// ===========================================\n'
      }
    });

    console.log('✅ Build complete!');
    console.log('📦 Output: content.js');
    console.log('📊 Old file replaced with bundled version');
    console.log('\n⚡ Next steps:');
    console.log('1. Reload the extension in Chrome (chrome://extensions)');
    console.log('2. Test all functionality');
    console.log('3. Old 1555-line file is now replaced with modular bundle');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
