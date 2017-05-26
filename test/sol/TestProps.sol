pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/Props.sol";


contract TestProps {

    function testUserBalance() {
        Props props = new Props();
        props.register('test');
        Assert.equal(props.userBalance(), 0, "User should have 0 ether to withdraw initially");
    }

    function testRegistrationMakesUserExists() {
        Props props = new Props();
        var username = 'test name';
        Assert.isFalse(props.userExists(username), "User should NOT exist before registration");
        props.register(username);
        Assert.isTrue(props.userExists(username), "User should exists after registration");
    }

    function testAccountExists() {
        Props props = new Props();
        var username = 'first';
        props.register(username);
        Assert.isTrue(props.userExists(username), "User should exists after registration");
        var account = props.account(username);
        Assert.isTrue(props.accountExists(account), "User account should exist after registration");
    }
}
