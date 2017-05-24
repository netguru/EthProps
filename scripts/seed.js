module.exports = function (done) {
  let Props = artifacts.require('./Props.sol')
  let accounts = web3.eth.accounts
  let user1 = 'Joe'
  let user2 = 'Tony'

  Props.deployed().then(function (instance) {
    return Promise.all([
      instance.register(user1),
      instance.register(user2, { from: accounts[1] })
    ]).then(function () {
      return Promise.all([
        instance.giveProps(user2, 'Great job!', { value: web3.toWei(3, 'ether') }),
        instance.giveProps(user1, 'Thanks :)', { from: accounts[1], value: web3.toWei(5, 'ether') })
      ])
    }).then(function () {
      console.log('Seeds done')
      done()
    })
  })
}
