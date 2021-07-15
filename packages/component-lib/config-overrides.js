const webpack = require('webpack')
const {
  override,
  addWebpackPlugin,
  fixBabelImports,
  addLessLoader,
  setWebpackOptimizationSplitChunks,
  addWebpackAlias,
} = require('customize-cra')

const rewireLess = require('react-app-rewire-less')

const {alias} = require('react-app-rewire-alias')

const path = require('path')

const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin()

// Deployment on Heroku
// During Heroku builds, the SOURCE_VERSION and STACK environment variables are set:
var onHeroku = process.env.SOURCE_VERSION && process.env.STACK
// If we're on Heroku, we don't have access to the .git directory so we can't
// rely on git commands to get the version. What we *do* have during Heroku
// builds is a SOURCE_VERSION env with the git SHA of the commit being built,
// so we can use that instead to generate the version file.
function getCommitHash() {
  try {
    return onHeroku
      ? process.env.SOURCE_VERSION
      : gitRevisionPlugin.commithash()
  } catch (error) {
    return ''
  }
}

const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')

const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent') // 直接这么引入就可以，他在create-app-react包里 这个就是getLocalIdent属性要设置的值

const getStyleLoaders = (cssOptions, preProcessor, lessOptions) => {
  const loaders = [
    require.resolve('style-loader'),
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebook/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
        ],
      },
    },
  ]
  if (preProcessor) {
    loaders.push({
      loader: require.resolve(preProcessor),
      options: lessOptions,
    })
  }
  return loaders
}

module.exports = override(
  addWebpackAlias({}),

  /*
  addWebpackPlugin(
    new DuplicatePackageCheckerPlugin({
      verbose: false,
      emitError: false,
      strict: true,
    }),
  ),
  */

  // addWebpackPlugin(gitRevisionPlugin),
  addWebpackPlugin(
    new CopyWebpackPlugin({
        patterns: [{from: path.resolve(__dirname, "..", "assets"), to: './static', toType: "dir"}],
      }
    )),
  addWebpackPlugin(
    new webpack.DefinePlugin({
      'process.env.COMMITHASH': JSON.stringify(getCommitHash()),
      'process.env.TIME':
        '"' +
        new Date().toLocaleString('en-US', {timeZone: 'Asia/Shanghai'}) +
        '/SH"',
    }),
  ),
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  setWebpackOptimizationSplitChunks({
    // https://webpack.js.org/plugins/split-chunks-plugin/
    chunks: 'async',
    maxSize: 4000000,
    maxAsyncRequests: 8,
    maxInitialRequests: 6,
  }),
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: {'@primary-color': '#1DA57A'},
      sourceMap: false,
    },
  }),
  (config) => {
    // 增加处理less module配置 customize-cra 不提供 less.module 只提供css.module
    const oneOf_loc = config.module.rules.findIndex((n) => n.oneOf) // 这里的config是全局的
    config.module.rules[oneOf_loc].oneOf = [
      {
        test: /\.module\.less$/,
        use: getStyleLoaders(
          {
            importLoaders: 2,
            modules: {
              getLocalIdent: getCSSModuleLocalIdent,
            },
          },

          'less-loader',
        ),
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=10240',
        options: {name: '[path][name].[ext]'},
      },
      ...config.module.rules[oneOf_loc].oneOf,
    ]

    alias({
      "static-resource": path.resolve(__dirname, 'src/static-resource'),
      "static": path.resolve(__dirname, 'src/static-resource'),
      //"@loopring-web/static-resource": 'static-resource',
    })(config)

    return config
  },
  /*
  function override(config, env) {
    config = rewireLess.withLoaderOptions({
      javascriptEnabled: true,
    })(config, env)

    return config
  },
  */
)
