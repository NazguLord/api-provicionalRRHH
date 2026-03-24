const logInfo = (mensaje, extra = null) => {
  console.log("[INFO]", mensaje, extra || "");
};

const logError = (mensaje, extra = null) => {
  console.error("[ERROR]", mensaje, extra || "");
};

module.exports = {
  logInfo,
  logError
};
