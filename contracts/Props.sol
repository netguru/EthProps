pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract Props is Ownable {

    struct GivenProps {
        string from;
        string to;
        string description;
    }

    mapping (string => address) users;
    GivenProps[] allProps;

    event PropsGiven(string from, string to, string description);

    function Props() {
    }

    function addUser (string email, address account) onlyOwner {
        if (userExists(email))
            throw;
        users[email] = account;
    }

    function giveProps(string from, string to, string description) {
        address fromAccount = users[from];
        address toAccount = users[to];
        if (fromAccount != msg.sender || toAccount == 0 || toAccount == msg.sender)
            throw;
        allProps.push(
            GivenProps({from: from, to: to, description: description})
        );
        PropsGiven(from, to, description);
    }

    function userExists(string email) constant returns (bool) {
        if (users[email] == 0)
            return false;
        return true;
    }

    function getAccount(string email) constant returns (address) {
        return users[email];
    }

    function getPropsCount() constant returns (uint) {
        return allProps.length;
    }
}
