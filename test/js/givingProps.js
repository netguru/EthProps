let Props = artifacts.require('./Props.sol')
let FakeRandomSentence = artifacts.require('./FakeRandomSentence.sol')

contract('Props', function (accounts) {
  let instance

  beforeEach(function () {
    return FakeRandomSentence.new()
      .then(function (fake) {
        return Props.new(fake.address)
      })
      .then(function (props) {
        instance = props
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
        let filter = instance.PropsGiven({}, { fromBlock: 0, toBlock: 'latest' })
        filter.watch(function (_error, result) {
          let from = result.args.from.toString()
          let to = result.args.to.toString()
          let description = result.args.description.toString()
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
