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

    // Optimized Ownership struct (packed)
    struct Ownership {
        address owner;          
        uint64 acquiredOn;     
        bool exists;           
    }
    // Total: 1 storage slot (32 bytes) - 67% reduction!

    mapping(bytes32 => Ownership) private ownerships;
    mapping(address => string[]) private ownedProducts;

    event OwnershipRegistered(string serialNumber, address owner);
    event OwnershipTransferred(string serialNumber, address from, address to, uint256 date);

    constructor(address accessAddress, address registryAddress) {
        accessControl = AccessControlContract(accessAddress);
        productRegistry = ProductRegistry(registryAddress);
    }

    function syncOwnership(string memory serialNumber) public {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        address currentOwner = productRegistry.getCurrentOwner(serialNumber);

        // ensure there is a valid owner in registry
        require(currentOwner != address(0), "No current owner");

        if (!ownerships[key].exists) {
            ownerships[key] = Ownership(currentOwner, uint64(block.timestamp), true);
            ownedProducts[currentOwner].push(serialNumber);
            emit OwnershipRegistered(serialNumber, currentOwner);
        } else {
            // Update existing ownership record
            address previousOwner = ownerships[key].owner;
            if (previousOwner != currentOwner) {
                _removeFromList(previousOwner, serialNumber);
                ownerships[key].owner = currentOwner;
                ownerships[key].acquiredOn = uint64(block.timestamp);
                ownedProducts[currentOwner].push(serialNumber);
                emit OwnershipTransferred(serialNumber, previousOwner, currentOwner, block.timestamp);
            }
        }
    }

    function transferOwnership(string memory serialNumber, address newOwner) external {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        
        // Always sync before transfer to ensure data consistency
        syncOwnership(serialNumber);

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
        record.acquiredOn = uint64(block.timestamp);

        ownedProducts[newOwner].push(serialNumber);
        productRegistry.updateOwnership(serialNumber, newOwner);

        emit OwnershipTransferred(serialNumber, previous, newOwner, block.timestamp);
    }

    // ====== Views ======
    function getOwner(string memory serialNumber) external view returns (address) {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        
        // For view function, check both sources
        if (!ownerships[key].exists) {
            address registryOwner = productRegistry.getCurrentOwner(serialNumber);
            require(registryOwner != address(0), "Product not found");
            return registryOwner;
        }
        
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