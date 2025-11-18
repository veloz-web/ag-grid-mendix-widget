#!/usr/bin/env node
/**
 * Post-build script to strip console.log statements
 * USES TERSER FOR SAFE REMOVAL
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const terser = require('terser');
const glob = require('glob'); // You might need to install this: npm install glob --save-dev
// If you don't want to install glob, I have provided a native solution below.

// --- CONFIGURATION ---
// The directory where Mendix builds the raw files before zipping
const WIDGET_DIR = path.join(__dirname, '../dist/tmp/widgets');
// The final destination for the .mpk
const OUTPUT_DIR = path.join(__dirname, '../dist/1.0.0');
const OUTPUT_FILE = 'mendix.AGGrid.mpk';

// Helper to recursively find all JS files
function getAllJsFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllJsFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.js') || file.endsWith('.mjs')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });
    return arrayOfFiles;
}

(async () => {
    console.log('🚀 Starting Post-Build Log Stripper...');

    if (!fs.existsSync(WIDGET_DIR)) {
        console.error(`❌ Error: Widget tmp directory not found at: ${WIDGET_DIR}`);
        console.error('   Make sure to run this script AFTER "npm run build" but BEFORE the Mendix packager moves files.');
        process.exit(1);
    }

    // 1. FIND FILES
    // Scan recursively because Mendix 9+ structure puts files in subfolders or creates chunks
    const buildFiles = getAllJsFiles(WIDGET_DIR);
    
    if (buildFiles.length === 0) {
        console.warn('⚠ No .js/.mjs files found to process.');
    }

    // 2. PROCESS FILES
    for (const buildFile of buildFiles) {
        const fileName = path.relative(WIDGET_DIR, buildFile);
        
        // Skip minified vendor chunks if you want to save time, 
        // though processing them doesn't hurt.
        
        const originalCode = fs.readFileSync(buildFile, 'utf8');
        
        // Quick check to see if we even need to run Terser
        if (!originalCode.match(/console\.(log|info|debug)/)) {
            continue; 
        }

        console.log(`\nProcessing ${fileName}...`);
        
        const beforeCount = (originalCode.match(/console\.(log|info|debug)/g) || []).length;

        try {
            const result = await terser.minify(originalCode, {
                compress: {
                    // THESE are the specific functions to strip
                    pure_funcs: ['console.log', 'console.info', 'console.debug'],
                    
                    // CRITICAL FIX: 'unused' must be true for pure_funcs to be removed!
                    unused: true, 
                    dead_code: true,
                    
                    // Keep defaults mostly on to allow optimization, but we turn off 
                    // dangerous ones below if needed.
                    defaults: true, 
                },
                mangle: false, // Mendix widget widgets usually dislike mangling after Webpack has already run
                output: {
                    comments: 'some', // Keep licenses
                    beautify: false   
                }
            });

            if (result.error) throw result.error;

            const afterCount = (result.code.match(/console\.(log|info|debug)/g) || []).length;
            const removed = beforeCount - afterCount;

            fs.writeFileSync(buildFile, result.code, 'utf8');
            console.log(`  ✓ Removed ${removed} logs (Remaining: ${afterCount})`);

        } catch (e) {
            console.error(`❌ Error processing ${fileName}:`, e);
            process.exit(1);
        }
    }

    console.log(`\n✓ console.error and console.warn preserved`);

    // 3. REPACKAGE
    console.log('\n📦 Repackaging .mpk file...');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const fullOutputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);

    // Delete existing .mpk
    if (fs.existsSync(fullOutputPath)) {
        fs.unlinkSync(fullOutputPath);
    }

    const output = fs.createWriteStream(fullOutputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', function() {
        console.log(`✓ Created ${fullOutputPath} (${(archive.pointer() / 1024).toFixed(2)} KB)`);
        console.log(`✓ Process Complete.`);
    });

    archive.on('error', function(err) {
        console.error('❌ Archiver Error:', err);
        process.exit(1);
    });

    archive.pipe(output);

    // IMPORTANT: Mendix widgets expect `package.xml` at the root of the zip.
    // Ensure WIDGET_DIR is the folder containing package.xml
    archive.directory(WIDGET_DIR, false);
    
    await archive.finalize();
})();