pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/RandomSentence.sol";


contract TestRandomSentence {

    RandomSentence sentence;

    function beforeEach() {
        sentence = new RandomSentence();
    }

    function testInitialSentence() {
        bytes32 actual = sentence.get();
        Assert.equal(actual, "sends props to", "Invalid initial sentence");
    }
}
