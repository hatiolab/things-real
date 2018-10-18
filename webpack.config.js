/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

const NodePackage = require('./package.json');
const path = require('path');
const webpack = require('webpack');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env, argv) => {

  var plugins = [
    new WebpackCleanupPlugin(),

    new webpack.DefinePlugin({
      REAL_MODE: JSON.stringify(argv.mode || 'development'),
      REAL_VERSION: JSON.stringify(NodePackage.version)
    })
  ];

  var devtool = 'inline-source-map';

  if (argv.mode == 'production') {
    plugins.push(new UglifyJSPlugin({
      sourceMap: true
    }))

    devtool = 'source-map';
  }

  return {
    mode: argv.mode || 'development',
    entry: './src/index.ts',
    output: {
      filename: "things-real.js",
      path: path.resolve(__dirname, './dist'),
      library: 'REAL',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    devtool,
    plugins,
    devServer: {
      // contentBase: path.join(__dirname, 'tutorials'),
      contentBase: path.join(__dirname, './'),
      compress: false,
      port: 9000
    }
  }
};
