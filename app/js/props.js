import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

import propsArtifacts from '../../build/contracts/Props.json'

let Props = contract(propsArtifacts)
let account

window.Registration = {
  start: function () {
    $('.js-registration-form').on('submit', Registration.onFormSubmit)
  },

  onFormSubmit: function (event) {
    event.preventDefault()
    let username = $('.js-username').val()
    Props.deployed().then(function (instance) {
      return instance.register(username, { from: account })
    }).then(Registration.onSuccess).catch(Registration.onFail)
  },

  onSuccess: function () {
    Alerts.display('success', 'Registration successful')
    $('.js-username').val('')
  },

  onFail: function (err) {
    console.log(err)
    Alerts.display('danger', 'Registration failed, try again (username taken?)')
  }
}

window.App = {
  start: function () {
    $('.js-props-form').on('submit', App.onFormSubmit)
    App.initializeSender()
    App.refreshPropsCount()
    App.initializeProps()
  },

  initializeSender: function () {
    let field = $('.js-from')
    Props.deployed().then(function (instance) {
      return instance.username.call(account)
    }).then(function (username) {
      let value = username === 0 ? 'Unregistered (please register)' : username
      field.val(value)
    })
  },

  initializeProps: function () {
    Props.deployed().then(function (instance) {
      instance.PropsGiven({}, { fromBlock: '0', toBlock: 'latest' }).watch(App.onPropsGivenEvent)
    })
  },

  refreshPropsCount: function () {
    Props.deployed().then(function (instance) {
      return instance.propsCount.call()
    }).then(function (count) {
      App.setPropsCount(count.toString())
    })
  },

  setPropsCount: function (count) {
    $('.js-total-props').html(count)
  },

  onFormSubmit: function (event) {
    event.preventDefault()
    let to = $('.js-to').val()
    let description = $('.js-description').val()
    App.giveProps(to, description)
  },

  giveProps: function (to, description) {
    Props.deployed().then(function (instance) {
      return instance.giveProps(to, description, { from: account, gas: 100000 })
    }).then(App.onPropsGiven).catch(App.onPropsFailed)
  },

  onPropsGiven: function () {
    Alerts.display('success', 'Props given!')
    $('.js-to').val('')
    $('.js-description').val('')
  },

  onPropsFailed: function (err) {
    console.error(err)
    Alerts.display('danger', 'Props failed, try again')
  },

  onPropsGivenEvent: function (_err, result) {
    App.refreshPropsCount()
    App.appendProps({
      from: result.args.from,
      to: result.args.to,
      description: result.args.description
    })
  },

  appendProps: function (props) {
    $('.js-all-props').prepend(
      `<div class="card">
         <div class="card-block">
           <div><span>From: ${props.from}</span></div>
           <div><span>To: ${props.to}</span></div>
           <div><span>Description: ${props.description}</span></div>
         </div>
       </div>`
    )
  }
}

window.Alerts = {
  display: function (alertClass, text) {
    $('.js-alerts').append(
      `<div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <span>${text}</span>
      </div>`
    )
  }
}

$(function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  // if (typeof web3 !== 'undefined') {
  // console.log("Using web3 detected from external source.")
  // window.web3 = new Web3(web3.currentProvider)
  // } else {
  console.warn('No web3 detected. Falling back to http://localhost:8545.')
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  // }
  account = window.web3.eth.accounts[0]
  Props.setProvider(web3.currentProvider)

  if ($('.js-registration-form').length > 0) {
    Registration.start()
  } else {
    App.start()
  }
})
