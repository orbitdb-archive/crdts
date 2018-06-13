'use strict'

const path = require('path')
const webpack = require('webpack')
const Uglify = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    libraryTarget: 'var',
    library: 'CRDTs',
    filename: './dist/crdts.min.js'
  },
  target: 'web',
  devtool: 'none',
  externals: {
    fs: '{}',
  },
  node: {
    console: false,
    Buffer: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new Uglify(),
  ],
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, '../node_modules')
    ],
    alias: {
      leveldown: 'level-js',
    },
  },
  resolveLoader: {
    modules: [
      'node_modules',
      path.resolve(__dirname, '../node_modules')
    ],
    moduleExtensions: ['-loader']
  },
}
