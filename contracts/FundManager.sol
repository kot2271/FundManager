// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "contracts/Foundation.sol";

contract FundManager {
    mapping(address => address) public foundations;

    event FoundationCreated(address foundation, address owner, string description);

    error UnauthorizedAccess();

    function createFoundation(address payable donationReceiver, string memory description) external payable {
        Foundation foundation = new Foundation(donationReceiver, description);
        foundations[address(foundation)] = msg.sender;

        emit FoundationCreated(address(foundation), msg.sender, description);

        if (msg.value > 0) {
            foundation.donate{value: msg.value}();
        } 
    }

    function transferFundsToReceiver(address payable foundationAddress, uint256 amount) external {
        if (foundations[foundationAddress] != msg.sender) revert UnauthorizedAccess();
        Foundation foundation = Foundation(foundationAddress);
        foundation.sendFunds(amount);
    }

    function getFoundationBalance(address foundationAddress) external view returns (uint256) {
        return address(foundationAddress).balance;
    }
}