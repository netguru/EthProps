let Props = artifacts.require('./Props.sol')

contract('Props', function (accounts) {
  let instance
  let firstUser = 'first'
  let secondUser = 'second'

  beforeEach(function () {
    return Props.new().then(function (_instance) {
      instance = _instance
    })
  })

  describe('attaching ether to given props', function () {
    beforeEach(function () {
      return Promise.all([
        instance.register(firstUser),
        instance.register(secondUser, { from: accounts[1] })
      ])
    })

    it('raises user account balance', function () {
      return instance.userBalance().then(function (balance) {
        assert.equal(balance.toString(), '0')
        return instance.giveProps(firstUser, 'first props', { from: accounts[1], value: web3.toWei(3, 'ether') })
      }).then(function () {
        return instance.userBalance()
      }).then(function (balance) {
        let balanceString = balance.toString()
        assert.equal(web3.fromWei(balanceString, 'ether'), '3')
      })
    })

    it('does NOT raise other user account balance', function () {
      return instance.userBalance().then(function (balance) {
        assert.equal(balance.toString(), '0')
        return instance.userBalance({from: accounts[1]})
      }).then(function (balance) {
        assert.equal(balance.toString(), '0')
        return instance.giveProps(firstUser, 'first props', { from: accounts[1], value: web3.toWei(3, 'ether') })
      }).then(function () {
        return instance.userBalance()
      }).then(function (balance) {
        let balanceString = balance.toString()
        assert.equal(web3.fromWei(balanceString, 'ether'), '3')
        return instance.userBalance({from: accounts[1]})
      }).then(function (balance) {
        assert.equal(balance.toString(), '0')
      })
    })

    it('emits a PropsGiven event with attached ether value', function (done) {
      this.timeout(1000)
      instance.giveProps(secondUser, 'test', { value: web3.toWei(5, 'ether') }).then(function () {
        let filter = instance.PropsGiven({}, { fromBlock: 0, toBlock: 'latest' })
        filter.watch(function (_error, result) {
          let from = result.args.from.toString()
          let to = result.args.to.toString()
          let description = result.args.description.toString()
          let sentWei = result.args.sentWei.toString()
          assert.equal(from, firstUser)
          assert.equal(to, secondUser)
          assert.equal(description, 'test')
          assert.equal(web3.fromWei(sentWei, 'ether'), '5')
          filter.stopWatching()
          done()
        })
      })
    })

    it('emits a PropsGiven event with 0 ether value if no ether attached', function (done) {
      this.timeout(1000)
      instance.giveProps(secondUser, 'test').then(function () {
        let filter = instance.PropsGiven({}, { fromBlock: 0, toBlock: 'latest' })
        filter.watch(function (_error, result) {
          let from = result.args.from.toString()
          let to = result.args.to.toString()
          let description = result.args.description.toString()
          let sentWei = result.args.sentWei.toString()
          assert.equal(from, firstUser)
          assert.equal(to, secondUser)
          assert.equal(description, 'test')
          assert.equal(sentWei, '0')
          filter.stopWatching()
          done()
        })
      })
    })
  })
})
