'use strict';

function getProperties(values, defaultProperties) {
  return defaultProperties;
}
function getPreview(values) {
  return {
    type: "Container",
    borders: true,
    children: [{
      type: "Container",
      children: [{
        type: "Text",
        content: "AG Grid",
        fontColor: "#555",
        fontSize: 14
      }, {
        type: "Text",
        content: "".concat(values.columns.length, " column(s) configured"),
        fontColor: "#888",
        fontSize: 12
      }]
    }, {
      type: "Container",
      children: values.columns.map(function (col, index) {
        return {
          type: "Text",
          content: "Column ".concat(index + 1, ": ").concat(col.header || "Unnamed"),
          fontColor: "#666",
          fontSize: 11
        };
      })
    }]
  };
}
exports.getPreview = getPreview;
exports.getProperties = getProperties;
