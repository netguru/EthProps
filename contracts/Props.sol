pragma solidity ^0.4.11;


contract Props {

    struct GivenProps {
        string from;
        string to;
        string description;
    }

    mapping (string => address) users;
    GivenProps[] allProps;

    function Props() {
    }

    function addUser(string email, address account) {
        if (userExists(email))
            throw;
        users[email] = account;
    }

    function giveProps(string from, string to, string description) {
        address fromAccount = users[from];
        address toAccount = users[to];
        if (fromAccount != msg.sender || toAccount == 0 || toAccount == msg.sender)
            throw;
        allProps.push(GivenProps(
            {from: from, to: to, description: description}
        ));
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

    function getProps(uint index) constant returns (string, string, string) {
        return (allProps[index].from, allProps[index].to, allProps[index].description);
    }
}
