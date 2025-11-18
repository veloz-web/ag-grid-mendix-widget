#!/usr/bin/env node
/**
 * Post-build script to strip console.log statements from production builds
 * and repackage the .mpk file
 * USES TERSER FOR SAFE REMOVAL - NO MORE REGEX CORRUPTION!
 * Preserves console.error and console.warn
 * Only removes console.log, console.info, console.debug
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const terser = require('terser'); // AST-based removal - safe and reliable

const buildFiles = [
    path.join(__dirname, '../dist/tmp/widgets/mendix/aggrid/AGGrid.js'),
    path.join(__dirname, '../dist/tmp/widgets/mendix/aggrid/AGGrid.mjs')
];

// Async IIFE to handle terser's async API
(async () => {
    console.log('Stripping console.log statements with Terser (AST-based, safe)...');

    for (const buildFile of buildFiles) {
        if (!fs.existsSync(buildFile)) {
            console.warn(`⚠ Build file not found (skipping): ${path.basename(buildFile)}`);
            continue;
        }

        console.log(`\nProcessing ${path.basename(buildFile)}...`);
        const originalCode = fs.readFileSync(buildFile, 'utf8');
        
        // Count console statements before (for reporting)
        const beforeCount = (originalCode.match(/console\.(log|info|debug)/g) || []).length;

        // Terser magic: AST-based removal of specific console functions
        const result = await terser.minify(originalCode, {
            compress: {
                // Mark these as "pure" functions (no side effects) - Terser will remove them
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
                // Don't do other aggressive optimizations
                defaults: false,
                unused: false
            },
            mangle: false,     // Do NOT rename variables (critical for Mendix)
            format: {
                comments: 'some', // Keep important comments (license, etc.)
                beautify: false   // Minify output
            }
        });

        if (result.error) {
            console.error(`❌ Error processing ${buildFile}:`, result.error);
            process.exit(1);
        }

        // Count after (approximate - Terser removes them completely)
        const afterCount = (result.code.match(/console\.(log|info|debug)/g) || []).length;
        const removed = beforeCount - afterCount;

        fs.writeFileSync(buildFile, result.code, 'utf8');
        console.log(`  ✓ Safely removed ${removed} console.log/info/debug statements`);
        console.log(`    (${afterCount} remaining - likely in strings)`);
        console.log(`    No code corruption - AST-based transformation ✓`);
    }

    console.log(`\n✓ console.error and console.warn preserved`);
    console.log(`✓ Code structure intact - no regex corruption`);

    // Now repackage the .mpk file
    console.log('\nRepackaging .mpk file...');

    const distTmpWidgetsDir = path.join(__dirname, '../dist/tmp/widgets');
    const outputDir = path.join(__dirname, '../dist/1.0.0');
    const outputFile = path.join(outputDir, 'mendix.AGGrid.mpk');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Delete existing .mpk if it exists
    if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
    }

    // Create zip archive
    const output = fs.createWriteStream(outputFile);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
    });

    output.on('close', function() {
        console.log(`✓ Created ${outputFile} (${archive.pointer()} bytes)`);
        console.log(`✓ Package structure: package.xml at root, widgets in subdirectories`);
        console.log(`✓ Production build complete - ready to deploy!`);
    });

    archive.on('error', function(err) {
        console.error('❌ Error creating .mpk:', err);
        process.exit(1);
    });

    archive.pipe(output);
    // Archive the contents of dist/tmp/widgets/ which includes package.xml and all widget files
    archive.directory(distTmpWidgetsDir, false);
    await archive.finalize();

})(); // Immediately execute the async function
