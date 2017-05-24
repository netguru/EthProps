let Props = artifacts.require('./Props.sol')

contract('Props', function (accounts) {
  let instance

  beforeEach(function () {
    return Props.new().then(function (_instance) {
      instance = _instance
    })
  })

  describe('withdraw', function () {
    let firstUser = 'first@test.com'
    let secondUser = 'second@test.com'

    beforeEach(function () {
      return Promise.all([
        instance.register(firstUser),
        instance.register(secondUser, { from: accounts[1] })
      ]).then(function () {
        return instance.giveProps(firstUser, 'first props', { from: accounts[1], value: web3.toWei(3, 'ether') })
      })
    })

    it('raises user account balance on ethereum network', function () {
      let balanceBefore = web3.eth.getBalance(accounts[0])
      return instance.withdrawPayments().then(function () {
        let balanceAfter = web3.eth.getBalance(accounts[0])
        let balanceDifference = balanceAfter.minus(balanceBefore)
        let gasDifference = 3 - web3.fromWei(balanceDifference, 'ether')
        assert.isBelow(gasDifference, 0.0025)
      })
    })

    it('zeroes user account balance on props app', function () {
      return instance.userBalance().then(function (balance) {
        let etherBalance = web3.fromWei(balance, 'ether')
        assert.equal(etherBalance, '3')
      }).then(function () {
        return instance.withdrawPayments()
      }).then(function () {
        return instance.userBalance()
      }).then(function (balance) {
        assert.equal(balance, 0)
      })
    })
  })
})
