pragma solidity ^0.4.11;


contract Props {

    struct User {
        address account;
        uint props;
    }

    mapping (string => User) users;

    function Props() {
    }

    function addUser(string email, address account) {
        if (userExists(email))
            throw;
        users[email] = User({account: account, props: 0});
    }

    function userExists(string email) constant returns (bool) {
        if (users[email].account == 0)
            return false;
        return true;
    }

    function getProps(string email) constant returns (uint) {
        return users[email].props;
    }

    function giveProps(string email) {
        address account = users[email].account;
        if (account == msg.sender || account == 0)
            throw;
        users[email].props += 1;
    }
}
