let RandomSentence = artifacts.require('./RandomSentence.sol')
let Props = artifacts.require('./Props.sol')

let ethereumBridgeAddress = '0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475'
// Replace above with your bridge address (todo: move to some config file)

module.exports = function (deployer, network) {
  return deployer.deploy(RandomSentence)
    .then(function () {
      return RandomSentence.deployed()
        .then(function (instance) {
          return initializeRandomSentence(instance, network)
        })
    })
    .then(function () {
      return deployer.deploy(Props, RandomSentence.address)
    })
}

function initializeRandomSentence (instance, network) {
  return initializeOraclize(instance, network)
    .then(function () {
      return instance.update()
    })
}

function initializeOraclize (instance, network) {
  if (network === 'development') {
    console.log('Mocking oraclize')
    return instance.mockOraclize(ethereumBridgeAddress)
  } else {
    return Promise.resolve()
  }
}
