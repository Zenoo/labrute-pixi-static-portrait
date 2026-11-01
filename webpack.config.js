const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const swfMiddleware = require('./test/swfMiddleware.cjs');

// This development server keeps the Ruffle runtime and SWF comparison local.
module.exports = () => ({
  mode: 'development',
  devtool: 'source-map',
  entry: './test/index.mjs',
  experiments: { topLevelAwait: true },
  output: {
    path: path.resolve(__dirname, '.playground'),
    filename: 'playground.js',
    clean: true,
  },
  plugins: [new HtmlWebpackPlugin({ template: 'test/index.html' })],
  devServer: {
    host: '127.0.0.1',
    port: 3001,
    static: [
      {
        directory: path.resolve(__dirname, 'node_modules/@ruffle-rs/ruffle'),
        publicPath: '/ruffle/',
      },
    ],
    setupMiddlewares(middlewares, server) {
      swfMiddleware(server.app);
      return middlewares;
    },
  },
});
