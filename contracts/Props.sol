pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/payment/PullPayment.sol";
import "./RandomSentence.sol";


contract Props is PullPayment {

    RandomSentence randomSentence;

    mapping (address => string) usernames;
    mapping (string => address) accounts;
    uint public propsCount;

    event PropsGiven(string from, string to, string description, uint sentWei, bytes32 sentence);
    event UserRegistered(string username);

    function Props(RandomSentence _randomSentence) {
        randomSentence = _randomSentence;
    }

    function register(string username) {
        if (userExists(username) || accountExists(msg.sender))
            throw;
        usernames[msg.sender] = username;
        accounts[username] = msg.sender;
        UserRegistered(username);
    }

    function giveProps(string to, string description) payable {
        string from = usernames[msg.sender];
        uint sentWei = msg.value;
        if (!propsValid(from, to))
            throw;
        bytes32 sentence = takeSentence();
        asyncSend(accounts[to], sentWei);
        propsCount++;
        PropsGiven(from, to, description, sentWei, sentence);
    }

    function takeSentence() private returns (bytes32) {
        bytes32 sentence = randomSentence.get();
        randomSentence.update();
        return sentence;
    }

    // Constant functions (functions that do NOT write to blockchain)

    function propsValid(string from, string to) private constant returns (bool) {
        return userExists(from) && userExists(to) && sha3(from) != sha3(to);
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

    function userBalance() constant returns (uint) {
        return payments[msg.sender];
    }
}
