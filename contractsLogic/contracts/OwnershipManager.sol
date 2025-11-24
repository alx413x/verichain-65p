// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "./ProductRegistry.sol";

/**
 * @title OwnershipManager
 * @dev Manages ownership transfers. Only current owner can transfer.
 */
contract OwnershipManager {
    AccessControlContract public accessControl;
    ProductRegistry public productRegistry;

    struct Ownership {
        address owner;
        uint256 acquiredOn;
        bool exists;
    }

    mapping(bytes32 => Ownership) private ownerships;
    mapping(address => string[]) private ownedProducts;

    event OwnershipRegistered(string serialNumber, address owner);
    event OwnershipTransferred(string serialNumber, address from, address to, uint256 date);

    constructor(address accessAddress, address registryAddress) {
        accessControl = AccessControlContract(accessAddress);
        productRegistry = ProductRegistry(registryAddress);
    }

    function syncOwnership(string memory serialNumber) external {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(!ownerships[key].exists, "Already synced");
        address currentOwner = productRegistry.getCurrentOwner(serialNumber);

        // ensure there is a valid owner in registry
        require(currentOwner != address(0), "No current owner");

        ownerships[key] = Ownership(currentOwner, block.timestamp, true);
        ownedProducts[currentOwner].push(serialNumber);
        emit OwnershipRegistered(serialNumber, currentOwner);
    }

    function transferOwnership(string memory serialNumber, address newOwner) external {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(ownerships[key].exists, "No ownership record");

        Ownership storage record = ownerships[key];
        require(record.owner == msg.sender, "Not current owner");

        // prevent transferring to zero address
        require(newOwner != address(0), "Invalid new owner");

        bool validRecipient =
            accessControl.hasRole(accessControl.RETAILER_ROLE(), newOwner) ||
            accessControl.hasRole(accessControl.CUSTOMER_ROLE(), newOwner);
        require(validRecipient, "Invalid recipient role");

        _removeFromList(msg.sender, serialNumber);

        address previous = record.owner;
        record.owner = newOwner;
        record.acquiredOn = block.timestamp;

        ownedProducts[newOwner].push(serialNumber);
        productRegistry.updateOwnership(serialNumber, newOwner);

        emit OwnershipTransferred(serialNumber, previous, newOwner, block.timestamp);
    }

    // ====== Views ======
    function getOwner(string memory serialNumber) external view returns (address) {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(ownerships[key].exists, "Ownership not found");
        return ownerships[key].owner;
    }

    function getProductsByOwner(address account) external view returns (string[] memory) {
        return ownedProducts[account];
    }

    // ====== Internal ======
    function _removeFromList(address owner, string memory serialNumber) internal {
        string[] storage list = ownedProducts[owner];
        for (uint256 i; i < list.length; i++) {
            if (keccak256(bytes(list[i])) == keccak256(bytes(serialNumber))) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
    }
}