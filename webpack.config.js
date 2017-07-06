const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './app/js/props.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'props.js'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' },
      { from: './app/registration.html', to: 'registration.html' },
      { from: './app/withdraw.html', to: 'withdraw.html' }
    ])
  ],
  module: {
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  }
}
