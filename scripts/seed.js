module.exports = function (done) {
  let Props = artifacts.require('./Props.sol')
  let user1 = 'user1'
  let user2 = 'user2'

  Props.deployed().then(function (instance) {
    return Promise.all([
      instance.register(user1),
      instance.register(user2, { from: web3.eth.accounts[1] })
    ]).then(function () {
      return instance.giveProps(user2, 'test props here', { value: web3.toWei(3, 'ether') })
    }).then(function () {
      console.log('Seeds done')
      done()
    })
  })
}
