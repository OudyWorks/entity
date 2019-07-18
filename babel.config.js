module.exports = {
  ignore: [
    './node_modules',
    './MongoDB'
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
}