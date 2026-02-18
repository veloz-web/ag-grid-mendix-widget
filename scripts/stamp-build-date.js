/**
 * Prebuild script: Stamps the current UTC date/time into the
 * widgetBuildDate property defaultValue in src/AGGrid.xml.
 *
 * Unlike update-ag-version.js (which only writes when the AG Grid
 * version changes), this script writes on EVERY build so the
 * timestamp always reflects when the widget was last compiled.
 *
 * Runs automatically before every build/release via npm pre-scripts.
 */
const fs = require("fs");
const path = require("path");

const XML_PATH = path.resolve(__dirname, "..", "src", "AGGrid.xml");

// ── 1. Read the XML ──────────────────────────────────────────────────
let xml;
try {
    xml = fs.readFileSync(XML_PATH, "utf8");
} catch (err) {
    console.error(`⚠️  Could not read ${XML_PATH}. Skipping build-date stamp.`);
    process.exit(0);
}

// ── 2. Build the timestamp ───────────────────────────────────────────
const now = new Date();
const timestamp = now.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");

// ── 3. Patch the XML ─────────────────────────────────────────────────
const pattern = /(<property\s+key="widgetBuildDate"\s+[^>]*defaultValue=")([^"]*)(")/;
const match = xml.match(pattern);

if (!match) {
    console.error("⚠️  Could not find widgetBuildDate property in AGGrid.xml. Skipping build-date stamp.");
    process.exit(0);
}

const updatedXml = xml.replace(pattern, `$1${timestamp}$3`);
fs.writeFileSync(XML_PATH, updatedXml, "utf8");
console.log(`✅ Stamped widget build date: ${timestamp}`);
