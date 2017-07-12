let Props = artifacts.require('./Props.sol')
let FakeRandomSentence = artifacts.require('./FakeRandomSentence.sol')

contract('Props', function (accounts) {
  let instance
  let firstUser = 'first@test.com'
  let secondUser = 'second@test.com'

  beforeEach(function () {
    return FakeRandomSentence.new()
      .then(function (fake) {
        return Props.new(fake.address)
      })
      .then(function (props) {
        instance = props
        return Promise.all([
          instance.register(firstUser),
          instance.register(secondUser, { from: accounts[1] })
        ])
      })
      .then(function () {
        return instance.giveProps(firstUser, 'first props', { from: accounts[1], value: web3.toWei(3, 'ether') })
      })
  })

  describe('withdraw', function () {
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

  describe('userBalance', function () {
    it('returns user balance for given account', function () {
      return instance.userBalance({ from: accounts[0] }).then(function (balance) {
        let etherBalance = web3.fromWei(balance.toString(), 'ether')
        assert.equal(etherBalance, '3')
      })
    })

    it('returns 0 if account does NOT exist', function () {
      return instance.userBalance({ from: '0x9045447c50795d34785b846b019dbf3a75dcd071' }).then(function (balance) {
        assert.equal(balance, '0')
      })
    })

    it('returns 0 if account is account is empty', function () {
      return instance.userBalance({ from: web3.eth.accounts[2] }).then(function (balance) {
        assert.equal(balance.toString(), '0')
      })
    })
  })
})
