module.exports = function(done) {
  var Props = artifacts.require("./Props.sol");
  var user1 = 'user1@test.com';
  var user2 = 'user2@test.com';

  Props.deployed().then(function(instance) {
    return Promise.all([
      instance.addUser(user1, web3.eth.accounts[0]),
      instance.addUser(user2, web3.eth.accounts[1])
    ]).then(function() {
      return instance.giveProps(user1, user2, 'test props here');
    }).then(function() {
      done();
    });
  });
};
