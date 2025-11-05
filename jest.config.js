const mendixConfig = require("@mendix/pluggable-widgets-tools/test-config/jest.enzyme-free.config.js");

module.exports = {
  ...mendixConfig,
  snapshotSerializers: [], // Remove enzyme-to-json serializer
  collectCoverage: false,
  // Disable problematic pretty-format features
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: false,
  },
  // Disable diff display to avoid pretty-format issues
  expand: false,
};