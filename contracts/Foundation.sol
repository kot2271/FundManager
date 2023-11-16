// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Foundation is Ownable {
    string public description;
    address payable public receiver;

    event FundReceived(address from, uint256 amount);
    event FundsSent(address to, uint256 amount);

    error InsufficientBalance(uint256 available, uint256 required);
    error DonationAmountMustBeGreaterThanZero();

    constructor(address payable _receiver, string memory _description) Ownable(msg.sender) {
        receiver = _receiver;
        description = _description;
    }

    function donate() external payable {
        if(msg.value <= 0) revert DonationAmountMustBeGreaterThanZero();
        emit FundReceived(msg.sender, msg.value);
    }

    function sendFunds(uint256 amount) external onlyOwner {
        if (address(this).balance < amount) revert InsufficientBalance({available: address(this).balance, required: amount});
        receiver.transfer(amount);
        emit FundsSent(receiver, amount);
    }
}