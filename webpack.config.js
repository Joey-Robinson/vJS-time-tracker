const path = require("path");

module.exports = {
  mode: "development",
  entry: ["@babel/polyfill", "./src/js/scripts.js"],
  output: {
    path: path.resolve(__dirname, "dist/js"),
    filename: "bundle.js"
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["babel-preset-env"]
        }
      }
    }]
  }
};