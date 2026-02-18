/**
 * Prebuild script: Reads the installed ag-grid-community version from
 * node_modules and patches the defaultValue of agGridVersion and
 * agGridVersionDate in src/AGGrid.xml.
 *
 * Only writes to the XML when the version actually changes, so the
 * timestamp reflects when the AG Grid dependency was last upgraded.
 *
 * Runs automatically before every build/release via npm pre-scripts.
 */
const fs = require("fs");
const path = require("path");

const XML_PATH = path.resolve(__dirname, "..", "src", "AGGrid.xml");
const AG_GRID_PKG = path.resolve(__dirname, "..", "node_modules", "ag-grid-community", "package.json");

// ── 1. Read the installed AG Grid version ────────────────────────────
let agVersion;
try {
    const pkg = JSON.parse(fs.readFileSync(AG_GRID_PKG, "utf8"));
    agVersion = pkg.version;
} catch (err) {
    console.error("⚠️  Could not read ag-grid-community version from node_modules. Skipping version update.");
    process.exit(0); // Non-fatal — don't break the build
}

// ── 2. Read the XML ──────────────────────────────────────────────────
let xml;
try {
    xml = fs.readFileSync(XML_PATH, "utf8");
} catch (err) {
    console.error(`⚠️  Could not read ${XML_PATH}. Skipping version update.`);
    process.exit(0);
}

// ── 3. Check current version in XML ─────────────────────────────────
const versionPattern = /(<property\s+key="agGridVersion"\s+[^>]*defaultValue=")([^"]*)(")/;
const versionMatch = xml.match(versionPattern);

if (!versionMatch) {
    console.error("⚠️  Could not find agGridVersion property in AGGrid.xml. Skipping version update.");
    process.exit(0);
}

if (versionMatch[2] === agVersion) {
    console.log(`✅ AG Grid version already up-to-date: v${agVersion}`);
    process.exit(0);
}

// ── 4. Version changed — update both version and timestamp ──────────
const now = new Date();
const timestamp = now.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");

let updatedXml = xml.replace(versionPattern, `$1${agVersion}$3`);

const datePattern = /(<property\s+key="agGridVersionDate"\s+[^>]*defaultValue=")([^"]*)(")/;
updatedXml = updatedXml.replace(datePattern, `$1${timestamp}$3`);

fs.writeFileSync(XML_PATH, updatedXml, "utf8");
console.log(`✅ Updated AG Grid version in AGGrid.xml: v${versionMatch[2]} → v${agVersion}  (${timestamp})`);
