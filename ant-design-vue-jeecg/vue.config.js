const path = require('path')
const baseUrl = 'http://localhost:8090/jeecg-boot'

function resolve(dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  /*
    Vue-cli3:
    Crashed when using Webpack `import()` #2463
    https://github.com/vuejs/vue-cli/issues/2463
   */
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,

  // 打包app时放开该配置
  // publicPath: './',
  configureWebpack: config => {
    // 生产环境取消 console.log
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@comp', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@layout', resolve('src/layout'))
      .set('@static', resolve('src/static'))
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */
          'primary-color': '#1890FF',
          'link-color': '#1890FF',
          'border-radius-base': '4px'
        },
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    port: 8091,
    proxy: {
      [process.env.VUE_APP_BASE_URL]: {
        target: baseUrl,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_URL]: ''
        }
      },
      // 如果 VUE_APP_BASE_URL != '/jeecg-boot'
      // 删除该配置不能使用在线开发功能
      '/jeecg-boot': {
        target: baseUrl,
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/jeecg-boot': ''
        }
      }
    },
    open: true
  },

  lintOnSave: process.env.NODE_ENV === 'development'
}
