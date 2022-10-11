/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

function initCanisterEnv() {
  let localCanisters, prodCanisters, localIiCanisters;

  try {
    localIiCanisters = require(path.resolve(
      'ii-dev/.dfx',
      'local',
      'canister_ids.json',
    ));
  } catch (error) {
    console.log('No local canister_ids.json for II found');
  }

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

  const canisterConfig =
    network === 'local'
      ? {
          ...localCanisters,
          internet_identity: localIiCanisters.internet_identity,
        }
      : prodCanisters;

  return Object.entries(canisterConfig).reduce((prev, current) => {
    const [canisterName, canisterDetails] = current;
    prev[canisterName.toUpperCase() + '_CANISTER_ID'] =
      canisterDetails[network];

    return prev;
  }, {});
}

const canisterEnvVariables = initCanisterEnv();
const isDevelopment = process.env.NODE_ENV !== 'production';

const frontendPath = path.join(__dirname, './dapp/frontend');
const indexPath = path.join(frontendPath, './public/index.html');

module.exports = {
  target: 'web',
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    index: path.join(frontendPath, 'index.tsx'),
  },
  devtool: isDevelopment ? 'source-map' : false,

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
      '~': path.join(__dirname, './dapp/frontend/src'),
    },
  },

  optimization: {
    runtimeChunk: 'single',
    minimize: !isDevelopment,
    minimizer: [new TerserPlugin()],
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
    filename: '[name]_[contenthash].js',
    assetModuleFilename: 'assets/[name]_[contenthash][ext]',
    path: path.join(__dirname, 'dist', 'dun_assets'),
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.less$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]__[hash:base64:8]',
                auto: /\.module\.\w+$/i,
              },
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: {
                  'primary-color': '#2F54EB',
                },
                rewriteUrls: 'local',
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: './dapp/frontend/public',
          filter(filepath) {
            return !filepath.includes('index.html');
          },
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      template: indexPath,
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
    watchFiles: [frontendPath],
    liveReload: true,
    historyApiFallback: true,
  },
};
