const createConfig = require('./webpack.shared.cjs');

module.exports = [createConfig({
  index: './src/index.tsx'
})];
