// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Wallet {
    struct Transfer {
        uint256 id;
        uint256 amount;
        address payable to;
        uint256 approvals;
        bool sent;
    }

    address[] public approvers;
    uint256 public quorum;
    Transfer[] public transfers;
    mapping(address => mapping(uint256 => bool)) public approvals;

    constructor(address[] memory _approvers, uint256 _quorum) {
        approvers = _approvers;
        quorum = _quorum;
    }

    function getApprovers() public view returns (address[] memory) {
        return approvers;
    }

    function getTransfers() public view returns (Transfer[] memory) {
        return transfers;
    }

    function createTransfer(uint256 _amount, address payable _to)
        external
        onlyApprover()
    {
        transfers.push(Transfer(transfers.length, _amount, _to, 0, false));
    }

    function approveTransfer(uint256 _transferId) external onlyApprover() {
        require(
            transfers[_transferId].sent == false,
            'transfer has already been sent'
        );
        require(
            approvals[msg.sender][_transferId] == false,
            'cannot approve transfer twice'
        );
        approvals[msg.sender][_transferId] = true;
        transfers[_transferId].approvals++;

        if (transfers[_transferId].approvals > quorum) {
            transfers[_transferId].sent = true;
            address payable to = transfers[_transferId].to;
            uint256 amount = transfers[_transferId].amount;
            to.transfer(amount);
        }
    }

    receive() external payable {}

    modifier onlyApprover() {
        bool allowed = false;
        for (uint256 i = 0; i < approvers.length; i++) {
            if (approvers[i] == msg.sender) {
                allowed = true;
            }
        }
        require(allowed, 'only approver can approve');
        _;
    }
}
