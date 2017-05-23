var Props = artifacts.require('./Props.sol')

contract('Props', function (accounts) {
  let instance

  beforeEach(function () {
    return Props.new().then(function (_instance) {
      instance = _instance
    })
  })

  describe('registering user', function () {
    let user = 'someone@test.com'

    describe('when user does NOT exist', function () {
      it('creates new user', function () {
        return instance.userExists(user).then(function (exists) {
          assert.isFalse(exists)
          return instance.register(user)
        }).then(function () {
          return instance.userExists(user)
        }).then(function (exists) {
          assert.isTrue(exists)
        })
      })

      it('returns correct values form account and username functions', function () {
        return instance.register(user, { from: accounts[2] }).then(function () {
          return instance.account(user)
        }).then(function (account) {
          assert.equal(account, accounts[2])
          return instance.username(accounts[2])
        }).then(function (username) {
          assert.equal(username, user)
        })
      })
    })

    describe('when username already exists', function () {
      beforeEach(function () {
        return instance.register(user)
      })

      it('does NOT change user account', function () {
        return instance.register(user, { from: accounts[1] }).then(function () {
          assert.fail(0, 1, 'Expected an error to be thrown')
        }).catch(function (error) {
          assert.notEqual(error.message.match('invalid opcode', undefined))
          return instance.account(user)
        }).then(function (account) {
          assert.equal(account, accounts[0])
        })
      })
    })

    describe('when account already exists', function () {
      let user2 = 'someone2@test.com'

      beforeEach(function () {
        return instance.register(user)
      })

      it('does NOT change username', function () {
        return instance.register(user2).then(function () {
          assert.fail(0, 1, 'Expected an error to be thrown')
        }).catch(function (error) {
          assert.notEqual(error.message.match('invalid opcode', undefined))
          return instance.username(accounts[0])
        }).then(function (username) {
          assert.equal(username, user)
        })
      })
    })
  })

  describe('PropsGiven event', function () {
    let firstUser = 'first@test.com'
    let secondUser = 'second@test.com'

    beforeEach(function () {
      return Promise.all([
        instance.register(firstUser),
        instance.register(secondUser, { from: accounts[1] })
      ]).then(function () {
        return instance.giveProps(secondUser, 'first props')
      }).then(function () {
        return instance.giveProps(firstUser, 'second props', { from: accounts[1] })
      }).then(function () {
        return instance.giveProps(firstUser, 'third props', { from: accounts[1] })
      })
    })

    it('returns list of given props', function (done) {
      this.timeout(1000)
      let filter = instance.PropsGiven({}, { fromBlock: 0, toBlock: 'latest' })
      let eventsFired = 0
      let events = []
      filter.watch(function (_error, results) {
        events.push({
          from: results.args.from.toString(),
          to: results.args.to.toString(),
          description: results.args.description.toString()
        })
        eventsFired += 1
        if (eventsFired === 3) {
          assert.deepEqual(events[0], { from: firstUser, to: secondUser, description: 'first props' })
          assert.deepEqual(events[1], { from: secondUser, to: firstUser, description: 'second props' })
          assert.deepEqual(events[2], { from: secondUser, to: firstUser, description: 'third props' })
          filter.stopWatching()
          done()
        }
      })
    })
  })

  describe('giving props', function () {
    let firstUser = 'first@test.com'
    let secondUser = 'second@test.com'
    let thirdUser = 'third@test.com'
    let fakeUser = 'someone@else.fake'

    beforeEach(function () {
      return Promise.all([
        instance.register(firstUser),
        instance.register(secondUser, { from: accounts[1] }),
        instance.register(thirdUser, { from: accounts[2] })
      ])
    })

    it('raises PropsGiven event', function (done) {
      this.timeout(1000)
      instance.giveProps(secondUser, 'test').then(function () {
        var filter = instance.PropsGiven({}, { fromBlock: 0, toBlock: 'latest' })
        filter.watch(function (_error, result) {
          var from = result.args.from.toString()
          var to = result.args.to.toString()
          var description = result.args.description.toString()
          assert.equal(from, firstUser)
          assert.equal(to, secondUser)
          assert.equal(description, 'test')
          filter.stopWatching()
          done()
        })
      })
    })

    describe('when sender is giving a props to himself', function () {
      it('does NOT increment user props', function () {
        return instance.propsCount().then(function (given) {
          assert.equal(given, 0)
          return instance.giveProps(firstUser, 'test')
        }).then(function () {
          assert.fail(0, 1, 'Error expected')
        }).catch(function (error) {
          assert.notEqual(error.message.match('invalid opcode', undefined))
          return instance.propsCount()
        }).then(function (given) {
          assert.equal(given, 0)
        })
      })
    })

    describe('when receiver username is NOT registered', function () {
      it('does NOT increment user props', function () {
        return instance.propsCount().then(function (given) {
          assert.equal(given, 0)
          return instance.giveProps(fakeUser, 'test')
        }).then(function () {
          assert.fail(0, 1, 'Error expected')
        }).catch(function (error) {
          assert.notEqual(error.message.match('invalid opcode', undefined))
          return instance.propsCount()
        }).then(function (given) {
          assert.equal(given, 0)
        })
      })
    })

    describe('when sender is NOT registered', function () {
      it('does NOT increment user props', function () {
        return instance.propsCount().then(function (given) {
          assert.equal(given, 0)
          return instance.giveProps(secondUser, 'test', { from: accounts[5] })
        }).then(function () {
          assert.fail(0, 1, 'Error expected')
        }).catch(function (error) {
          assert.notEqual(error.message.match('invalid opcode', undefined))
          return instance.propsCount()
        }).then(function (given) {
          assert.equal(given, 0)
        })
      })
    })
  })
})
