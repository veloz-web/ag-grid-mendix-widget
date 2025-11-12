#!/usr/bin/env node
/**
 * Post-build script to strip console.log statements from production builds
 * and repackage the .mpk file
 * Preserves console.error and console.warn
 * Only removes console.log, console.info, console.debug
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const buildFile = path.join(__dirname, '../dist/tmp/widgets/mendix/aggrid/AGGrid.js');

if (!fs.existsSync(buildFile)) {
    console.error('Build file not found:', buildFile);
    process.exit(1);
}

console.log('Stripping console.log statements from production build...');

let content = fs.readFileSync(buildFile, 'utf8');

// Count console.logs before
const beforeCount = (content.match(/console\.(log|info|debug)/g) || []).length;

// Remove console.log, console.info, console.debug statements
// This regex matches various patterns:
// - console.log(...) 
// - console.info(...)
// - console.debug(...)
// It preserves console.error and console.warn

content = content.replace(
    /console\.(log|info|debug)\s*\([^)]*\)\s*;?/g,
    ''
);

// Also handle multi-line console statements
content = content.replace(
    /console\.(log|info|debug)\s*\([^)]*(?:\([^)]*\)[^)]*)*\)\s*;?/g,
    ''
);

// Count remaining console statements
const afterCount = (content.match(/console\.(log|info|debug)/g) || []).length;

fs.writeFileSync(buildFile, content, 'utf8');

console.log(`✓ Removed ${beforeCount - afterCount} console.log/info/debug statements`);
console.log(`  (${afterCount} remaining - likely from AG Grid library)`);
console.log(`✓ console.error and console.warn preserved`);

// Now repackage the .mpk file
console.log('\nRepackaging .mpk file...');

const distTmpDir = path.join(__dirname, '../dist/tmp');
const outputDir = path.join(__dirname, '../dist/1.0.0');
const outputFile = path.join(outputDir, 'mendix.aggrid.AGGrid.mpk');

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
});

archive.on('error', function(err) {
    console.error('Error creating .mpk:', err);
    process.exit(1);
});

archive.pipe(output);
archive.directory(distTmpDir, false);
archive.finalize();
