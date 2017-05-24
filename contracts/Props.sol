pragma solidity ^0.4.11;


contract Props {

    struct GivenProps {
        string from;
        string to;
        string description;
    }

    mapping (address => string) usernames;
    mapping (string => address) accounts;
    uint public propsCount;

    event PropsGiven(string from, string to, string description);
    event UserRegistered(string username);

    function Props() {
    }

    function register(string username) {
        if (userExists(username) || accountExists(msg.sender))
            throw;
        usernames[msg.sender] = username;
        accounts[username] = msg.sender;
        UserRegistered(username);
    }

    function giveProps(string to, string description) {
        string from = usernames[msg.sender];
        if (!userExists(from) || !userExists(to) || sha3(from) == sha3(to))
            throw;
        PropsGiven(from, to, description);
        propsCount++;
    }

    function userExists(string username) constant returns (bool) {
        if (accounts[username] == 0)
            return false;
        return true;
    }

    function accountExists(address account) constant returns (bool) {
        if (sha3(usernames[account]) == sha3("")) // as to compare strings we need another contract
            return false;
        return true;
    }

    function account(string username) constant returns (address) {
        return accounts[username];
    }

    function username(address account) constant returns (string) {
        return usernames[account];
    }
}
