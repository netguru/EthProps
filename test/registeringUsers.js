let Props = artifacts.require('./Props.sol')

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

  describe('UserRegistered event', function () {
    let firstUser = 'first@test.com'
    let secondUser = 'second@test.com'

    beforeEach(function () {
      return Promise.all([
        instance.register(firstUser),
        instance.register(secondUser, { from: accounts[1] })
      ])
    })

    it('returns list of all registered users', function (done) {
      this.timeout(1000)
      let filter = instance.UserRegistered({}, { fromBlock: 0, toBlock: 'latest' })
      let eventsFired = 0
      let usernames = []
      filter.watch(function (_error, results) {
        usernames.push(results.args.username.toString())
        eventsFired += 1
        if (eventsFired === 2) {
          assert.equal(usernames[0], firstUser)
          assert.equal(usernames[1], secondUser)
          filter.stopWatching()
          done()
        }
      })
    })
  })
})
