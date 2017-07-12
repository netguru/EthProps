pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/RandomSentence.sol";
import "../../contracts/Props.sol";


contract TestProps {

    Props props;

    function beforeEach() {
        props = new Props(new RandomSentence());
    }

    function testUserBalance() {
        props.register("test");
        Assert.equal(props.userBalance(), 0, "User should have 0 ether to withdraw initially");
    }

    function testRegistrationMakesUserExists() {
        string memory username = "test name";
        Assert.isFalse(props.userExists(username), "User should NOT exist before registration");
        props.register(username);
        Assert.isTrue(props.userExists(username), "User should exists after registration");
    }

    function testAccountExists() {
        string memory username = "first";
        props.register(username);
        Assert.isTrue(props.userExists(username), "User should exists after registration");
        address account = props.account(username);
        Assert.isTrue(props.accountExists(account), "User account should exist after registration");
    }
}
