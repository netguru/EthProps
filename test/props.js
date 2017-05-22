var Props = artifacts.require("./Props.sol");

contract('Props', function(accounts) {
  let instance;

  beforeEach(function() {
    return Props.new().then(function(_instance) {
      instance = _instance;
    });
  })

  describe('registering user', function() {
    let user = 'someone@test.com';

    describe('when user does NOT exist', function() {
      it('creates new user', function() {
        return instance.userExists(user).then(function(exists) {
          assert.isFalse(exists);
          return instance.register(user, accounts[0]);
        }).then(function() {
          return instance.userExists(user);
        }).then(function(exists) {
          assert.isTrue(exists);
        });
      });
    });

    describe('when user already exists', function() {
      beforeEach(function() {
        return instance.register(user, accounts[0]);
      });

      it('does NOT change user address', function() {
        return instance.register(user, accounts[1]).then(function() {
          assert.fail(0, 1, 'Expected an error to be thrown');
        }).catch(function(error) {
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getAccount(user);
        }).then(function(account) {
          assert.equal(account, accounts[0]);
        });
      });
    });
  });

  describe('PropsGiven event', function() {
    let firstUser = 'first@test.com';
    let secondUser = 'second@test.com';

    beforeEach(function() {
      return Promise.all([
        instance.register(firstUser, accounts[0]),
        instance.register(secondUser, accounts[1])
      ]).then(function() {
        return instance.giveProps(firstUser, secondUser, 'first props');
      }).then(function() {
        return instance.giveProps(secondUser, firstUser, 'second props', {from: accounts[1]});
      }).then(function() {
        return instance.giveProps(secondUser, firstUser, 'third props', {from: accounts[1]});
      });
    });

    it('returns list of given props', function(done) {
      this.timeout(1000);
      let filter = instance.PropsGiven({}, {fromBlock: 0, toBlock: 'latest'});
      let eventsFired = 0;
      let events = [];
      filter.watch(function(error, results) {
        events.push({
          from: results.args.from.toString(),
          to: results.args.to.toString(),
          description: results.args.description.toString()
        });
        eventsFired += 1;
        if (eventsFired == 3) {
          assert.deepEqual(events[0], {from: firstUser, to: secondUser, description: 'first props'});
          assert.deepEqual(events[1], {from: secondUser, to: firstUser, description: 'second props'});
          assert.deepEqual(events[2], {from: secondUser, to: firstUser, description: 'third props'});
          filter.stopWatching();
          done();
        }
      })
    });
  });

  describe('giving props', function() {
    let firstUser = 'first@test.com';
    let secondUser = 'second@test.com';
    let thirdUser = 'third@test.com';
    let fakeUser = 'someone@else.fake';

    beforeEach(function() {
      return Promise.all([
        instance.register(firstUser, accounts[0]),
        instance.register(secondUser, accounts[1]),
        instance.register(thirdUser, accounts[2])
      ]);
    });

    it('raises PropsGiven event', function(done) {
      this.timeout(1000);
      instance.giveProps(firstUser, secondUser, 'test').then(function() {
        var filter = instance.PropsGiven({}, {fromBlock: 0, toBlock: 'latest'});
        filter.watch(function(error, result) {
          var from = result.args.from.toString();
          var to = result.args.to.toString();
          var description = result.args.description.toString();
          assert.equal(from, firstUser);
          assert.equal(to, secondUser);
          assert.equal(description, 'test');
          filter.stopWatching();
          done();
        });
      });
    });

    describe('when sender is giving a props to himself', function() {
      it('does NOT increment user props', function() {
        return instance.getPropsCount().then(function(given) {
          assert.equal(given, 0);
          return instance.giveProps(firstUser, firstUser, 'test');
        }).then(function() {
          assert.fail(0, 1, 'Error expected');
        }).catch(function(error) {
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getPropsCount();
        }).then(function(given) {
          assert.equal(given, 0);
        });
      });
    });

    describe('when receiver email is NOT registered', function() {
      it('does NOT increment user props', function() {
        return instance.getPropsCount().then(function(given) {
          assert.equal(given, 0);
          return instance.giveProps(firstUser, fakeUser, 'test');
        }).then(function() {
          assert.fail(0, 1, 'Error expected');
        }).catch(function(error) {
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getPropsCount();
        }).then(function(given) {
          assert.equal(given, 0);
        });
      })
    });

    describe('when sender email is NOT registered to current eth address', function() {
      it('does NOT increment user props', function() {
        return instance.getPropsCount().then(function(given) {
          assert.equal(given, 0);
          return instance.giveProps(secondUser, thirdUser, 'test');
        }).then(function() {
          assert.fail(0, 1, 'Error expected');
        }).catch(function(error) {
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getPropsCount();
        }).then(function(given) {
          assert.equal(given, 0);
        });
      })
    });

    describe('when sender email is NOT registered', function() {
      it('does NOT increment user props', function() {
        return instance.getPropsCount().then(function(given) {
          assert.equal(given, 0);
          return instance.giveProps(fakeUser, secondUser, 'test');
        }).then(function() {
          assert.fail(0, 1, 'Error expected');
        }).catch(function(error) {
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getPropsCount();
        }).then(function(given) {
          assert.equal(given, 0);
        });
      })
    });
  });
});
