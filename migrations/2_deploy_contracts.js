let RandomSentence = artifacts.require('./RandomSentence.sol')
let Props = artifacts.require('./Props.sol')

module.exports = function (deployer) {
  return deployer.deploy(RandomSentence).then(function () {
    return deployer.deploy(Props, RandomSentence.address)
  })
}
