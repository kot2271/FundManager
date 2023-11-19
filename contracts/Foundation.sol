// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Foundation is Ownable {
    //the description of the foundation.
    string public description;

    //the address of the receiver of funds.
    address payable public receiver;

    event FundReceived(address from, uint256 amount);
    event FundsSent(address to, uint256 amount);

    //This error is raised when the contract does not have enough balance to send the requested amount.
    error InsufficientBalance(uint256 available, uint256 required);

    //This error is raised when the donation amount is zero or negative.
    error DonationAmountMustBeGreaterThanZero();

    //initializes the receiver and description variables.
    constructor(
        address payable _receiver,
        string memory _description
    ) Ownable(msg.sender) {
        receiver = _receiver;
        description = _description;
    }

    /**
     * This function allows anyone to donate funds to the foundation.
     * It emits a FundReceived event with the address of the donor and the amount donated.
     */
    function donate() external payable {
        if (msg.value <= 0) revert DonationAmountMustBeGreaterThanZero();
        emit FundReceived(msg.sender, msg.value);
    }

    /**
     * This function allows the owner of the contract to send funds to the receiver.
     * It checks if there is enough balance in the contract before sending the funds.
     * It emits a FundsSent event with the address of the receiver and the amount sent.
     * @param amount the amount of funds that will go to the receiver.
     */
    function sendFunds(uint256 amount) external onlyOwner {
        if (address(this).balance < amount)
            revert InsufficientBalance({
                available: address(this).balance,
                required: amount
            });
        (bool sent, ) = receiver.call{value: amount}("");
        if (sent) emit FundsSent(receiver, amount);
    }
}
