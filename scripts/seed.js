module.exports = function () {
  let Props = artifacts.require('./Props.sol')
  let RandomSentence = artifacts.require('./RandomSentence.sol')

  let accounts = web3.eth.accounts
  let user1 = 'Joe'
  let user2 = 'Tony'

  let testAccount = '0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475'
  // Feel free to replace above with your test account (todo: move to app config)

  web3.eth.sendTransaction({ from: accounts[0], to: testAccount, value: web3.toWei(1, 'ether') })

  return RandomSentence.deployed()
    .then(function (sentence) {
      return sentence.sendTransaction({ from: accounts[0], value: web3.toWei(2, 'ether') })
    })
    .then(function () {
      return Props.deployed()
    })
    .then(function (props) {
      return Promise.all([
        props.register(user1),
        props.register(user2, { from: accounts[1] })
      ])
        .then(function () {
          return props.giveProps(user2, 'This man is an expert in blockchain!', { value: web3.toWei(0.3, 'ether') })
        })
    })
    .then(function () {
      console.log('Seeds done')
    })
}
