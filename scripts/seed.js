module.exports = function (done) {
  var Props = artifacts.require('./Props.sol')
  var user1 = 'user1'
  var user2 = 'user2'

  Props.deployed().then(function (instance) {
    return Promise.all([
      instance.register(user1),
      instance.register(user2, { from: web3.eth.accounts[1] })
    ]).then(function () {
      return instance.giveProps(user2, 'test props here')
    }).then(function () {
      console.log('Seeds done')
      done()
    })
  })
}
