const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.plugin('copy').tap(args => {
      if (args[0]?.patterns?.[0]?.globOptions?.ignore) {
        args[0].patterns[0].globOptions.ignore.push('**/index.html');
      }
      return args;
    });
  }
})
