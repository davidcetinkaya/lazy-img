/* eslint-disable import/no-extraneous-dependencies */
import webpack from 'webpack';
import path from 'path';
import merge from 'webpack-merge';

const SRC_PATH = 'src';

const common = {
  entry: {
    main: path.join(__dirname, SRC_PATH, 'js', 'lazy-img.js')
  },
  output: {
    path: __dirname,
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'lazyImg'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, SRC_PATH, 'js'),
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js']
  }
};

export default common;