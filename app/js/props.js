import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import props_artifacts from '../../build/contracts/Props.json'

let Props = contract(props_artifacts);
let account;

window.App = {
  start: function() {
    Props.setProvider(web3.currentProvider);
    $('.js-props-form').on('submit', App.onFormSubmit);
    App.refreshPropsCount();
    App.initializeProps();
  },

  initializeProps: function() {
    Props.deployed().then(function(instance) {
      instance.PropsGiven({}, {fromBlock: '0', toBlock: 'latest'}).watch(App.onPropsGivenEvent);
    });
  },

  refreshPropsCount: function() {
    Props.deployed().then(function(instance) {
      return instance.getPropsCount.call();
    }).then(function(count) {
      App.setPropsCount(count.toString());
    });
  },

  setPropsCount: function(count) {
    $('.js-total-props').html(count);
  },

  onFormSubmit: function(event) {
    event.preventDefault();
    let from = $('.js-from').val();
    let to = $('.js-to').val();
    let description = $('.js-description').val();
    App.giveProps(from, to, description);
  },

  giveProps: function(from, to, description) {
    Props.deployed().then(function(instance) {
      return instance.giveProps(from, to, description, {from: account, gas: 100000});
    }).then(App.onPropsGiven).catch(App.onPropsFailed);
  },

  onPropsGiven: function() {
    App.displayAlert('success', 'Props given!');
  },

  onPropsFailed: function(err) {
    console.error(err);
    App.displayAlert('danger', 'Props failed, try again');
  },

  displayAlert: function(alertClass, text) {
    $('.js-alerts').append(
      `<div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <span>${text}</span>
      </div>`
    );
  },

  onPropsGivenEvent: function(err, result) {
    App.refreshPropsCount();
    App.appendProps({
      from: result.args.from,
      to: result.args.to,
      description: result.args.description
    });
  },

  //initializeProps: function() {
    //Props.deployed().then(function(instance) {
      //return instance.getPropsCount.call().then(function(count) {
        //for (let i = 0; i < count; i++) {
          //instance.getProps.call(i).then(function(fetched) {
            //App.appendProps({
              //from: fetched[0], to: fetched[1], description: fetched[2]
            //});
          //});
        //}
      //});
    //});
  //},

  appendProps: function(props) {
    $('.js-all-props').prepend(
      `<div class="card">
         <div class="card-block">
           <div><span>From: ${props.from}</span></div>
           <div><span>To: ${props.to}</span></div>
           <div><span>Description: ${props.description}</span></div>
         </div>
       </div>`
    );
  }
};

$(function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  //if (typeof web3 !== 'undefined') {
  //console.log("Using web3 detected from external source. If using MetaMask, see the following link. http://truffleframework.com/tutorials/truffle-and-metamask")
  //window.web3 = new Web3(web3.currentProvider);
  //} else {
  console.warn("No web3 detected. Falling back to http://localhost:8545.");
  window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  //}
  account = window.web3.eth.accounts[0];

  App.start();
});

