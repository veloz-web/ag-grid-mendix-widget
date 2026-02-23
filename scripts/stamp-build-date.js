/**
 * Prebuild script: Stamps the current UTC date/time and git commit hash
 * into widgetBuildDate and widgetBuildCommit in src/AGGrid.xml.
 *
 * Unlike update-ag-version.js (which only writes when the AG Grid
 * version changes), this script writes on EVERY build so the values
 * always reflect when and from what source the widget was last compiled.
 *
 * Runs automatically before every build/release via npm pre-scripts.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const XML_PATH = path.resolve(__dirname, "..", "src", "AGGrid.xml");

// ── 1. Read the XML ──────────────────────────────────────────────────
let xml;
try {
    xml = fs.readFileSync(XML_PATH, "utf8");
} catch (err) {
    console.error(`⚠️  Could not read ${XML_PATH}. Skipping build stamp.`);
    process.exit(0);
}

// ── 2. Build the timestamp ───────────────────────────────────────────
const now = new Date();
const timestamp = now.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");

// ── 3. Get the git commit hash ───────────────────────────────────────
let commitHash = "";
try {
    commitHash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch (err) {
    // Not a git repo or git not available — leave empty
}

// ── 4. Patch the XML ─────────────────────────────────────────────────
const datePattern = /(<property\s+key="widgetBuildDate"\s+[^>]*defaultValue=")([^"]*)(")/;
const commitPattern = /(<property\s+key="widgetBuildCommit"\s+[^>]*defaultValue=")([^"]*)(")/;

let updatedXml = xml;

const dateMatch = updatedXml.match(datePattern);
if (dateMatch) {
    updatedXml = updatedXml.replace(datePattern, `$1${timestamp}$3`);
} else {
    console.error("⚠️  Could not find widgetBuildDate property in AGGrid.xml.");
}

const commitMatch = updatedXml.match(commitPattern);
if (commitMatch) {
    updatedXml = updatedXml.replace(commitPattern, `$1${commitHash}$3`);
} else {
    console.error("⚠️  Could not find widgetBuildCommit property in AGGrid.xml.");
}

if (updatedXml !== xml) {
    fs.writeFileSync(XML_PATH, updatedXml, "utf8");
}

console.log(`✅ Stamped widget build: ${timestamp}${commitHash ? ` · commit ${commitHash}` : ""}`);
