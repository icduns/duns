/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { createHash } = require('crypto');

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

function createVersionHash(env) {
  const hash = createHash('md5');
  hash.update(JSON.stringify(env));

  return hash.digest('hex');
}

const canisterEnvVariables = initCanisterEnv();
const frontendPath = path.join(__dirname, './dapp/frontend');
const indexPath = path.join(frontendPath, './public/index.html');

module.exports = function (env) {
  const isDevelopment = !!env.development;
  const mode = isDevelopment ? 'development' : 'production';

  return {
    target: 'web',
    stats: 'errors-warnings',
    mode,
    bail: !isDevelopment,
    entry: {
      index: path.join(frontendPath, 'index.tsx'),
    },
    devtool: isDevelopment && 'source-map',

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
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
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
      filename: isDevelopment
        ? 'static/js/[name].js'
        : 'static/js/[name].[contenthash:8].js',
      chunkFilename: isDevelopment
        ? 'static/js/[name].chunk.js'
        : 'static/js/[name].[contenthash:8].chunk.js',
      assetModuleFilename: 'assets/[name].[hash][ext]',
      path: path.join(__dirname, 'dist', 'dun_assets'),
    },

    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
        {
          test: /\.less$/i,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[local]__[hash:base64:8]',
                  auto: /\.module\.\w+$/i,
                },
                importLoaders: 1,
                sourceMap: isDevelopment,
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
                },
                sourceMap: true,
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
      !isDevelopment &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      new HtmlWebpackPlugin({
        template: indexPath,
        cache: false,
      }),
      new webpack.EnvironmentPlugin({
        NODE_ENV: mode,
        ...canisterEnvVariables,
        DFX_NETWORK: process.env.DFX_NETWORK || 'local',
      }),
      new webpack.ProvidePlugin({
        Buffer: [require.resolve('buffer/'), 'Buffer'],
        process: require.resolve('process/browser'),
      }),
    ].filter(Boolean),

    cache: {
      type: 'filesystem',
      version: createVersionHash(env),
      buildDependencies: {
        config: [__filename],
      },
    },

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
};
