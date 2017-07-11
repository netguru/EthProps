import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

import propsArtifacts from '../../build/contracts/Props.json'

let Props = contract(propsArtifacts)
let coinbase

window.Withdraw = {
  start: function () {
    Withdraw.refreshBalance()
    $('.js-withdraw-button').on('click', Withdraw.onWithdrawClick)
  },

  refreshBalance: function () {
    Props.deployed().then(function (instance) {
      return instance.userBalance.call({ from: coinbase })
    }).then(function (balance) {
      let ether = web3.fromWei(balance, 'ether')
      $('.js-ether-balance').text(ether)
    })
  },

  onWithdrawClick: function () {
    Withdraw.toggleLoader()
    Props.deployed().then(function (instance) {
      return instance.withdrawPayments({ from: coinbase, gas: 50000 })
    }).then(OutOfGas.check).then(Withdraw.onSuccess).catch(Withdraw.onFail).then(Withdraw.toggleLoader)
  },

  onSuccess: function () {
    Alerts.display('success', 'Withdraw successful')
    Withdraw.refreshBalance()
  },

  onFail: function (err) {
    Alerts.display('danger', 'Withdraw failed')
    console.error(err)
  },

  toggleLoader: function () {
    $('.js-spinner').toggleClass('hidden-xs-up')
    $('.js-withdraw-form').toggleClass('hidden-xs-up')
  }
}

window.Registration = {
  start: function () {
    $('.js-registration-form').on('submit', Registration.onFormSubmit)
  },

  onFormSubmit: function (event) {
    event.preventDefault()
    let username = $('.js-username').val()
    Registration.toggleLoader()
    Registration.validate(username).then(function (valid) {
      if (valid) {
        return Registration.doRegister(username)
      }
    }).then(Registration.toggleLoader)
  },

  doRegister: function (username) {
    return Props.deployed().then(function (instance) {
      return instance.register(username, { from: coinbase, gas: 80000 })
    }).then(OutOfGas.check).then(Registration.onSuccess).catch(Registration.onFail)
  },

  toggleLoader: function () {
    $('.js-spinner').toggleClass('hidden-xs-up')
    $('.js-registration-form').toggleClass('hidden-xs-up')
  },

  onSuccess: function () {
    Alerts.display('success', 'Registration successful')
    $('.js-username').val('')
  },

  validate: function (username) {
    return Props.deployed().then(function (instance) {
      return Promise.all([
        Registration.validateUsername(instance, username),
        Registration.validateAccount(instance)
      ]).then(function (values) {
        return (values[0] && values[1])
      })
    })
  },

  onFail: function (err, username) {
    console.error(err)
    Alerts.display('danger', 'Registration failed, try again')
  },

  validateUsername: function (instance, username) {
    return instance.userExists.call(username, { from: coinbase }).then(function (exists) {
      if (exists) {
        Alerts.display('danger', 'Username already registered')
        return false
      }
      return true
    })
  },

  validateAccount: function (instance) {
    return instance.accountExists.call(coinbase, { from: coinbase }).then(function (exists) {
      if (exists) {
        Alerts.display('danger', 'Account address already registered')
        return false
      }
      return true
    })
  }
}

window.App = {
  start: function () {
    $('.js-props-form').on('submit', App.onFormSubmit)
    App.initializeToSelect()
    App.initializeSender()
    App.refreshPropsCount()
    App.initializeProps()
  },

  initializeToSelect: function () {
    Props.deployed().then(function (instance) {
      instance.UserRegistered({}, { fromBlock: '0', toBlock: 'latest' }).watch(App.onUserRegisteredEvent)
    })
  },

  initializeSender: function () {
    let field = $('.js-from')
    Props.deployed().then(function (instance) {
      instance.accountExists.call(coinbase, { from: coinbase }).then(function (exists) {
        if (!exists) {
          field.val('Unregistered (please register)')
          return
        }
        instance.username.call(coinbase, { from: coinbase }).then(function (username) {
          field.val(username)
        })
      })
    })
  },

  initializeProps: function () {
    Props.deployed().then(function (instance) {
      instance.PropsGiven({}, { fromBlock: '0', toBlock: 'latest' }).watch(App.onPropsGivenEvent)
    })
  },

  refreshPropsCount: function () {
    Props.deployed().then(function (instance) {
      return instance.propsCount.call({ from: coinbase })
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
    let ether = $('.js-attached-ether').val()
    App.giveProps(to, description, ether)
  },

  giveProps: function (to, description, ether) {
    let from = $('.js-from').val()
    App.toggleLoader()
    App.validate(from, to).then(function (valid) {
      if (valid) {
        return App.doGiveProps(to, description, ether)
      }
    }).then(App.toggleLoader)
  },

  doGiveProps: function (to, description, ether) {
    return Props.deployed().then(function (instance) {
      return instance.giveProps(to, description, { from: coinbase, value: web3.toWei(ether, 'ether'), gas: 180000 })
    }).then(OutOfGas.check).then(App.onPropsGiven).catch(App.onPropsFailed)
  },

  toggleLoader: function () {
    $('.js-spinner').toggleClass('hidden-xs-up')
    $('.js-props-form').toggleClass('hidden-xs-up')
  },

  onPropsGiven: function () {
    Alerts.display('success', 'Props given!')
    $('.js-to').val('')
    $('.js-description').val('')
    $('.js-attached-ether').val('')
  },

  onPropsFailed: function (err) {
    Alerts.display('danger', 'Props failed, try again')
    console.error(err)
  },

  validate: function (from, to) {
    return Props.deployed().then(function (instance) {
      return Promise.all([
        App.validateSender(instance, from),
        App.validateReceiver(instance, to),
        App.validateOwnProps(from, to)
      ]).then(function (values) {
        return (values[0] && values[1] && values[2])
      })
    })
  },

  validateSender: function (instance, from) {
    return instance.userExists.call(from, { from: coinbase }).then(function (userExists) {
      if (!userExists) {
        Alerts.display('danger', 'Sender does not exist')
        return false
      }
      return true
    })
  },

  validateReceiver: function (instance, to) {
    return instance.userExists.call(to, { from: coinbase }).then(function (userExists) {
      if (!userExists) {
        Alerts.display('danger', 'Receiver does not exist')
        return false
      }
      return true
    })
  },

  validateOwnProps: function (from, to) {
    return new Promise(function (resolve) {
      if (from === to) {
        Alerts.display('danger', 'You cannot send props to yourself :c')
        resolve(false)
      }
      resolve(true)
    })
  },

  onPropsGivenEvent: function (_err, result) {
    App.ensureLoadingPropsHidden()
    App.refreshPropsCount()
    App.appendProps({
      from: result.args.from,
      to: result.args.to,
      description: result.args.description,
      ether: web3.fromWei(result.args.sentWei, 'ether')
    })
  },

  ensureLoadingPropsHidden: function () {
    $('.js-given-props-spinner.visible').addClass('hidden-xs-up').removeClass('visible')
  },

  onUserRegisteredEvent: function (_err, result) {
    App.ensureLoadingToHidden()
    $('.js-to').prepend(`<option>${result.args.username}</option>`)
  },

  ensureLoadingToHidden: function () {
    $('.js-to option[value=loading]').remove()
  },

  appendProps: function (props) {
    let etherPart = ''
    if (props.ether > 0) {
      etherPart =
        `<div><span>Ether: ${props.ether} <i class="fa fa-circle text-warning" aria-hidden="true"></i></span></div>`
    }
    $('.js-all-props').prepend(
      `<div class="card">
         <div class="card-block">
           <div><span>From: ${props.from}</span></div>
           <div><span>To: ${props.to}</span></div>
           <div><span>Description: ${props.description}</span></div>
           ${etherPart}
         </div>
       </div>`
    )
  }
}

window.OutOfGas = {
  check: function (txId) {
    return new Promise(function (resolve, reject) {
      web3.eth.getTransaction(txId.tx, function (_error, tx) {
        web3.eth.getTransactionReceipt(txId.tx, function (error, txr) {
          if (txr.gasUsed === tx.gas) {
            reject(error)
          }
          resolve()
        })
      })
    })
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

function initializeApp () {
  if ($('.js-registration-form').length > 0) {
    Registration.start()
  } else if ($('.js-withdraw-form').length > 0) {
    Withdraw.start()
  } else {
    App.start()
  }
}

function onCoinbaseRetrieved (error, result) {
  if (error) {
    throw error
  }
  coinbase = result
  initializeApp()
}

window.addEventListener('load', function () {
  window.web3 = new Web3(web3.currentProvider)
  Props.setProvider(web3.currentProvider)
  window.web3.eth.getCoinbase(onCoinbaseRetrieved)
})
