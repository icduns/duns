/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function initCanisterEnv() {
  let localCanisters, prodCanisters;

  try {
    localCanisters = require(path.resolve(
      '.dfx',
      'local',
      'canister_ids.json',
    ));
  } catch (error) {
    console.log('No local canister_ids.json found. Continuing production');
  }

  try {
    prodCanisters = require(path.resolve('canister_ids.json'));
  } catch (error) {
    console.log('No production canister_ids.json found. Continuing with local');
  }

  const network =
    process.env.DFX_NETWORK ||
    (process.env.NODE_ENV === 'production' ? 'ic' : 'local');

  const canisterConfig = network === 'local' ? localCanisters : prodCanisters;

  return Object.entries(canisterConfig).reduce((prev, current) => {
    const [canisterName, canisterDetails] = current;
    prev[canisterName.toUpperCase() + '_CANISTER_ID'] =
      canisterDetails[network];

    return prev;
  }, {});
}

const canisterEnvVariables = initCanisterEnv();
const isDevelopment = process.env.NODE_ENV !== 'production';

const frontendDirectory = 'frontend';
const asset_entry = path.join('dun', frontendDirectory, 'index.html');

module.exports = {
  target: 'web',
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    index: path.join(__dirname, asset_entry).replace(/\.html$/, '.tsx'),
  },
  devtool: isDevelopment ? 'source-map' : false,
  optimization: {
    minimize: !isDevelopment,
    minimizer: [new TerserPlugin()],
  },

  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    fallback: {
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
      events: require.resolve('events/'),
      stream: require.resolve('stream-browserify/'),
      util: require.resolve('util/'),
    },
    alias: {
      '~': path.resolve(__dirname, 'dun/frontend/src'),
      '@dun/decl': path.resolve(__dirname, 'declarations/dun/index.js'),
      '@dun/assets': path.resolve(__dirname, 'dun/frontend/assets'),
    },
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            if (module.context.includes('node_modules/antd')) {
              return 'antd';
            }

            return 'vendor';
          },
        },
      },
    },
  },

  output: {
    filename: '[name].[contenthash].js',
    path: path.join(__dirname, 'dist', 'dun_assets'),
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]__[hash:base64:8]',
              },
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, asset_entry),
      cache: false,
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      ...canisterEnvVariables,
    }),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve('buffer/'), 'Buffer'],
      process: require.resolve('process/browser'),
    }),
  ],

  devServer: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api',
        },
      },
    },
    hot: true,
    watchFiles: [path.resolve(__dirname, 'dun', frontendDirectory)],
    liveReload: true,
  },
};