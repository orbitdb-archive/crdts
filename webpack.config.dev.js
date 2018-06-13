'use strict'

const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    libraryTarget: 'var',
    library: 'CRDTs',
    filename: './dist/crdts.js'
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
