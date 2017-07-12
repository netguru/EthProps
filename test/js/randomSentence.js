let RandomSentence = artifacts.require('./RandomSentence.sol')

contract('RandomSentence', function (accounts) {
  let instance

  beforeEach(function () {
    return RandomSentence.new().then(function (_instance) {
      instance = _instance
    })
  })

  it('gets first sentence', function () {
    return instance.get().then(function (sentence) {
      let parsed = web3.toAscii(sentence).replace(/\u0000/g, '')
      assert.equal(parsed, 'sends props to')
    })
  })

  it('updates sentence', function (done) {
    this.timeout(30000)
    let filter = instance.Updated({}, { fromBlock: 0, toBlock: 'latest' })
    filter.watch(function (_error, result) {
      let updated = web3.toAscii(result.args.sentence).replace(/\u0000/g, '')
      instance.get().then(function (sentence) {
        let fetched = web3.toAscii(sentence).replace(/\u0000/g, '')
        assert.equal(updated, fetched)
        assert.isAbove(updated.length, 0)
        filter.stopWatching()
        done()
      })
    })
    instance.update()
  })
})
