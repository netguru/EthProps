var Props = artifacts.require("./Props.sol");

contract('Props', function(accounts) {
  let instance;

  beforeEach(function() {
    return Props.new().then(function(_instance) {
      instance = _instance;
    });
  })

  describe('adding user', function() {
    let user = 'someone@test.com';

    describe('when user does NOT exist', function() {
      it('creates new user', function() {
        return instance.userExists(user).then(function(exists) {
          assert.isFalse(exists);
          return instance.addUser(user, accounts[0]);
        }).then(function() {
          return instance.userExists(user);
        }).then(function(exists) {
          assert.isTrue(exists);
        });
      });

      describe('when user already exists', function() {
        beforeEach(function(done) {
          instance.addUser(user, accounts[0]).then(function() {
            return instance.giveProps(user, {from: accounts[1]});
          }).then(function() {
            done();
          });
        });

        it('does NOT reset user props', function() {
          return instance.getProps(user, function(given) {
            assert.equal(given, 1);
            return instance.addUser(user, accounts[0]);
          }).catch(function(error) {
            assert.notEqual(error.message.match('invalid opcode', undefined));
            return instance.getProps(user);
          }).then(function(given) {
            assert.equal(given, 1);
          });
        });
      });
    });
  })

  describe('giving props', function() {
    let firstUser = 'first@test.com';
    let secondUser = 'second@test.com';

    beforeEach(function() {
      return Props.new().then(function(_instance) {
        instance = _instance;
        return Promise.all([
          instance.addUser(firstUser, accounts[0]),
          instance.addUser(secondUser, accounts[1])
        ]);
      });
    });

    it('increment user props by 1', function() {
      return instance.getProps(secondUser).then(function(given) {
        assert.equal(given, 0);
        return instance.giveProps(secondUser, {from: accounts[0]});
      }).then(function() {
        return instance.getProps(secondUser);
      }).then(function(given) {
        assert.equal(given, 1);
      });
    });

    describe('when sender is giving a props to himself', function() {
      it('does NOT increment user props', function() {
        return instance.getProps(secondUser).then(function(given) {
          assert.equal(given, 0);
          return instance.giveProps(secondUser, {from: accounts[1]});
        }).catch(function(error) {
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getProps(secondUser);
        }).then(function(given) {
          assert.equal(given, 0);
        });
      });
    });

    describe('when sender is giving a props to not existing user', function() {
      let fakeUser = 'someone@else.fake';

      it('does NOT increment user props', function() {
        return instance.getProps(fakeUser).then(function(given) {
          assert.equal(given, 0);
          return instance.giveProps(fakeUser, {from: accounts[1]});
        }).catch(function(error) {
          assert.notEqual(error.message.match('invalid opcode', undefined));
          return instance.getProps(fakeUser);
        }).then(function(given) {
          assert.equal(given, 0);
        });
      })
    });
  });
});
