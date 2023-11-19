// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "contracts/Foundation.sol";

contract FundManager {
    // Mapping storing the address of the fund creator, where the key is the address of the fund
    mapping(address => address) public foundations;

    event FoundationCreated(
        address foundation,
        address owner,
        string description
    );

    error UnauthorizedAccess();

    /**
     * Function for creating a new charity fund.
     * You can immediately send some amount of money to the created fund by passing the ether when the function is called.
     * Should deploat a new fund contract,
     * with the given description and address of the final recipient of donations + record the address of the fund creator(msg.sender's) in the 'foundations' mapping.
     * Should also emit an event that contains information about the new fund.
     * @param donationReceiver address of the final recipient of donations.
     * @param description description of foundation.
     */
    function createFoundation(
        address payable donationReceiver,
        string memory description
    ) external payable {
        Foundation foundation = new Foundation(donationReceiver, description);
        foundations[address(foundation)] = msg.sender;

        emit FoundationCreated(address(foundation), msg.sender, description);

        if (msg.value > 0) {
            foundation.donate{value: msg.value}();
        }
    }

    /**
     * Function to transfer funds from the contract to the final recipient address.
     * Must call the function sendFundsToReceiver(sendFunds) on the contract of a particular fund.
     * Can only be called by the address of the fund creator(the address of the creator can be taken from the foundations mapping).
     * @param foundationAddress address of the fund from which the funds will be debited.
     * @param amount the amount of funds that will go to the recipient.
     */
    function transferFundsToReceiver(
        address payable foundationAddress,
        uint256 amount
    ) external {
        if (foundations[foundationAddress] != msg.sender)
            revert UnauthorizedAccess();
        Foundation foundation = Foundation(foundationAddress);
        foundation.sendFunds(amount);
    }

    /**
     * The function requests a fund balance
     * @param foundationAddress address of requested fund.
     */
    function getFoundationBalance(
        address foundationAddress
    ) external view returns (uint256) {
        return address(foundationAddress).balance;
    }
}
