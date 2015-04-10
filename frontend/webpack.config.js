var webpack  = require('webpack'),
  fs         = require('fs'),
  path       = require('path'),
  _          = require('lodash'),
  pathConfig = require('./rails-plugins.conf');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

var pluginEntries = _.reduce(pathConfig.pluginNamesPaths, function(entries, path, name) {
  entries[name.replace(/^openproject\-/, '')] = name;
  return entries;
}, {});

var pluginAliases = _.reduce(pathConfig.pluginNamesPaths, function(entries, pluginPath, name) {
  entries[name] = path.basename(pluginPath);
  return entries;
}, {});

var browsersListConfig = fs.readFileSync(path.join(__dirname, '..', 'browserslist'), 'utf8');
var browsersList = JSON.stringify(_.filter(browsersListConfig.split('\n'), function(entry) {
  return entry && entry.charAt(0) !== '#';
}));

module.exports = {
  context: __dirname + '/app',

  entry: _.merge({
    'global':   './global.js',
    'core-app': './openproject-app.js'
  }, pluginEntries),

  output: {
    filename: 'openproject-[name].js',
    path: path.join(__dirname, '..', 'app', 'assets', 'javascripts', 'bundles'),
    publicPath: '/assets/bundles/'
  },

  module: {
    loaders: [
      { test: /[\/]angular\.js$/,         loader: 'exports?angular' },
      { test: /[\/]jquery\.js$/,          loader: 'expose?jQuery' },
      { test: /[\/]moment\.js$/,          loader: 'expose?moment' },
      { test: /[\/]mousetrap\.js$/,       loader: 'expose?Mousetrap' },
      { test: /[\/]vendor[\/]i18n\.js$/,  loader: 'expose?I18n' },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader!autoprefixer-loader?{browsers:' + browsersList + ',cascade:false}'
        )
      },
      { test: /\.png$/,                   loader: 'url-loader?limit=100000&mimetype=image/png' },
      { test: /\.gif$/,                   loader: 'file-loader' },
      { test: /\.jpg$/,                   loader: 'file-loader' },
      { test: /js-[\w|-]{2,5}\.yml$/,     loader: 'json!yaml' },
      {
        test: /\.html$/,
        loader: 'ngtemplate?module=openproject.templates&relativeTo=' +
                  path.resolve(__dirname, './app') + '!html'
      },
    ]
  },

  resolve: {
    root: __dirname,

    modulesDirectories: [
      'node_modules',
      'bower_components',
      'vendor'
    ].concat(pathConfig.pluginDirectories),

    fallback: [ path.join(__dirname, 'bower_components') ],

    alias: _.merge({
      'locales':        './../../config/locales',

      'angular-ui-date': 'angular-ui-date/src/date',
      'angular-truncate': 'angular-truncate/src/truncate',
      'angular-feature-flags': 'angular-feature-flags/dist/featureFlags.js',
      'angular-context-menu': 'angular-context-menu/dist/angular-context-menu.js',
      'mousetrap': 'mousetrap/mousetrap.js',
      'hyperagent': 'hyperagent/dist/hyperagent',
      'openproject-ui_components': 'openproject-ui_components/app/assets/javascripts/angular/ui-components-app'
    }, pluginAliases)
  },

  resolveLoader: {
    root: __dirname + '/node_modules'
  },

  plugins: [
    new ExtractTextPlugin('openproject-[name].css'),
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
