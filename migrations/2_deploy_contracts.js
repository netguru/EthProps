let RandomSentence = artifacts.require('./RandomSentence.sol')
let Props = artifacts.require('./Props.sol')

module.exports = function (deployer) {
  deployer.deploy(RandomSentence).then(function () {
    deployer.deploy(Props, RandomSentence.address)
  })
}
