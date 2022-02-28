const Path = require('path');
const Webpack = require('webpack');
const {merge} = require('webpack-merge');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  target: 'web',
  mode: 'development',
  devtool: 'inline-cheap-source-map',
  output: {
    chunkFilename: 'js/[name].chunk.js',
    publicPath: 'http://localhost:9091/',
  },
  devServer: {
    // inline: true,
    hot: true,
    port: 9091,
    devMiddleware: {
      // index: true,
      // mimeTypes: {phtml: 'text/html'},
      // publicPath: '/publicPathForDevServe',
      // serverSideRender: true,
      writeToDisk: true,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    client: {
      logging: 'error',
      overlay: false,
    },
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new ESLintPlugin({
      extensions: 'js',
      emitWarning: true,
      files: Path.resolve(__dirname, '../src'),
      fix: true,
    }),
    new StylelintPlugin({
      files: Path.join('src', '**/*.s?(a|c)ss'),
      fix: true,
    }),
    new MiniCssExtractPlugin({filename: 'css/[name].css',}),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: Path.resolve(__dirname, '../src'),
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.s?css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader', // Run post css actions
            options: {
              postcssOptions: {
                plugins: function () { // post css plugins, can be exported to postcss.config.js
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              },
            }
          },
          'sass-loader',
        ],
      },
    ],
  },
});
