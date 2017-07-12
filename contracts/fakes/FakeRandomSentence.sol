pragma solidity ^0.4.11;

import "../RandomSentence.sol";


contract FakeRandomSentence is RandomSentence {

    function update() payable {
    }

    function get() constant returns (bytes32) {
        return "fake random sentence";
    }
}
