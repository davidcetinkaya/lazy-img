/* eslint-disable import/no-extraneous-dependencies */
import webpack from 'webpack';
import path from 'path';
import merge from 'webpack-merge';

const OUT_PATH = 'dist';
const SRC_PATH = 'src';

const common = {
  entry: {
    main: path.join(__dirname, SRC_PATH, 'js', 'lazy-img.js')
  },
  output: {
    path: path.join(__dirname, OUT_PATH),
    filename: 'lazy-img.js',
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

const development = {
  devtool: 'source-map'
};

const production = {
  plugins: [
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
  ]
};

const config = (environment) => {
  switch (environment) {
    case 'build':
      return merge(common, production);
    case 'start':
      return merge(common, development);
    default:
      return common;
  }
};

export default config(process.env.npm_lifecycle_event);
