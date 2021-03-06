process.env.CHROME_BIN = require("puppeteer").executablePath();

var webpack = require("./webpack.config")(null, {
  mode: "development",
});

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["mocha", "chai", "sinon"],
    files: [
      "node_modules/babel-polyfill/dist/polyfill.js",
      "test/unit/**/*.ts",
    ],
    exclude: [],
    preprocessors: {
      "test/**/*.ts": ["webpack"],
    },
    webpack,
    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["ChromeHeadless"],
    singleRun: false,
    concurrency: Infinity,
  });
};
