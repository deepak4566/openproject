var webpack  = require('webpack'),
  path       = require('path'),
  _          = require('lodash'),
  pathConfig = require('./config/rails-plugins.conf');

var pluginEntries = _.reduce(pathConfig.pluginNamesPaths, function(entries, path, name) {
  entries[name.replace(/^openproject\-/, '')] = name;
  return entries;
}, {});

var pluginAliases = _.reduce(pathConfig.pluginNamesPaths, function(entries, pluginPath, name) {
  entries[name] = path.basename(pluginPath);
  return entries;
}, {});

module.exports = {
  context: __dirname + '/frontend/app',
  devtool: 'inline-source-map',

  entry: _.merge({
    app: './openproject-app.js'
  }, pluginEntries),

  output: {
    filename: 'openproject-[name].js',
    path: path.join(__dirname, 'app', 'assets', 'javascripts', 'bundles')
  },

  module: {
    loaders: [
      { test: /[\/]angular\.js$/,         loader: 'exports?angular' },
      { test: /[\/]vendor[\/]i18n\.js$/,  loader: 'expose?I18n' },
      { test: /js-[\w|-]{2,5}\.yml$/,     loader: 'json!yaml' }
    ]
  },

  resolve: {
    root: __dirname,

    modulesDirectories: [
      'node_modules',
      'vendor/assets/components'
    ].concat(pathConfig.pluginDirectories),

    alias: _.merge({
      'locales':        'config/locales',

      'angular-ui-date': 'angular-ui-date/src/date',
      'angular-truncate': 'angular-truncate/src/truncate',
      'angular-feature-flags': 'angular-feature-flags/dist/featureFlags.js',
      'angular-busy': 'angular-busy/dist/angular-busy.js',
      'angular-context-menu': 'angular-context-menu/dist/angular-context-menu.js',
      'hyperagent': 'hyperagent/dist/hyperagent',
      'openproject-ui_components': 'openproject-ui_components/app/assets/javascripts/angular/ui-components-app'
    }, pluginAliases)
  },

  resolveLoader: {
    root: __dirname + '/node_modules'
  },

  externals: { jquery: 'jQuery' },

  plugins: [
    new webpack.ProvidePlugin({
      '_':            'lodash',
      'URI':          'URIjs',
      'URITemplate':  'URIjs/src/URITemplate'
    }),
    new webpack.ResolverPlugin([
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(
        'bower.json', ['main'])
    ]) // ['normal', 'loader']
  ]
};
