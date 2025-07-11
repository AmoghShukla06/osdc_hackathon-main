// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

var webpack = require('webpack'),
  path = require('path'),
  fs = require('fs'),
  config = require('../webpack.config'),
  ZipPlugin = require('zip-webpack-plugin');

delete config.chromeExtensionBoilerplate;

config.mode = 'production';

var packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

config.plugins = (config.plugins || []).concat(
  new ZipPlugin({
    filename: `${packageInfo.name}-${packageInfo.version}.zip`,
    path: path.join(__dirname, '../', 'zip'),
  })
);

console.log('Starting webpack build...');

webpack(config, function (err, stats) {
  if (err) {
    console.error('Webpack build failed:', err);
    throw err;
  }
  if (stats && stats.hasErrors()) {
    console.error('Webpack compilation errors:', stats.toString({ all: false, errors: true, warnings: true }));
  } else {
    console.log('Webpack build completed successfully.');
  }
});
