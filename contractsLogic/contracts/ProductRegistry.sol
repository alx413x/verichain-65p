// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

/**
 * @title ProductRegistry
 * @dev Stores product data, warranty info, and default ownership (registrant becomes initial owner)
 */
contract ProductRegistry {
    AccessControlContract public accessControl;

    struct Warranty {
        uint256 startDate;
        uint256 expiration;
        uint256 claimCount;
        uint256 maxCount;
    }

    struct Product {
        string serialNumber;
        string model;
        address manufacturer;
        uint256 timestamp;
        Warranty warranty;
        bool exists;
        address owner;
    }

    mapping(bytes32 => Product) private products;
    address public ownershipManagerAddress;
    address public warrantyManagerAddress;

    event ProductRegistered(string serialNumber, string model, address manufacturer, uint256 timestamp, address initialOwner);
    event WarrantyCreated(string serialNumber, uint256 startDate, uint256 expiration);
    event OwnershipUpdated(string serialNumber, address previousOwner, address newOwner);

    modifier onlyManufacturer() {
        require(accessControl.hasRole(accessControl.MANUFACTURER_ROLE(), msg.sender), "Not manufacturer");
        _;
    }

    constructor(address accessAddress) {
        accessControl = AccessControlContract(accessAddress);
    }

    // ========== Product Registration ==========
    function registerProduct(
        string memory serialNumber,
        string memory model
    ) external {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(!products[key].exists, "Already registered");

        // Only a manufacturer role may register products
        require(accessControl.hasRole(accessControl.MANUFACTURER_ROLE(), msg.sender), "Not manufacturer");

        // Use caller as manufacturer to prevent spoofing
        products[key] = Product({
            serialNumber: serialNumber,
            model: model,
            manufacturer: msg.sender,
            timestamp: block.timestamp,
            warranty: Warranty(0, 0, 0, 0),
            exists: true,
            owner: msg.sender
        });

        emit ProductRegistered(serialNumber, model, msg.sender, block.timestamp, msg.sender);
    }

    // ========== Warranty ==========
    function setOwnershipManager(address _addr) external {
        require(accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender), "Not admin");
        ownershipManagerAddress = _addr;
    }

    function setWarrantyManager(address _addr) external {
        require(accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender), "Not admin");
        warrantyManagerAddress = _addr;
    }

    function createWarranty(
        string memory serialNumber,
        uint256 durationDays,
        uint256 maxClaim
    ) external onlyManufacturer {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(products[key].exists, "Product not found");
        require(products[key].manufacturer == msg.sender, "Not manufacturer");

        uint256 start = block.timestamp;
        uint256 expiry = start + (durationDays * 1 days);
        products[key].warranty = Warranty(start, expiry, 0, maxClaim);

        emit WarrantyCreated(serialNumber, start, expiry);
    }

    function incrementClaimCount(string memory serialNumber) external {
        require(msg.sender == warrantyManagerAddress, "Only warranty manager can increment claim count");
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(products[key].exists, "Product not found");
        products[key].warranty.claimCount += 1;
    }

    function getWarrantyClaimCount(string memory serialNumber) external view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(products[key].exists, "Product not found");
        return products[key].warranty.claimCount;
    }

    // ========== Ownership Updates ==========
    function updateOwnership(string memory serialNumber, address newOwner) external {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(products[key].exists, "Product not found");
        address oldOwner = products[key].owner;
        require(
            msg.sender == oldOwner ||
            accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender) ||
            msg.sender == ownershipManagerAddress,
            "Unauthorized owner, admin, or ownership manager"
        );

        products[key].owner = newOwner;
        emit OwnershipUpdated(serialNumber, oldOwner, newOwner);
    }

    // ========== Views ==========
    function getProductDetails(string memory serialNumber)
        external
        view
        returns (Product memory)
    {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(products[key].exists, "Product not found");
        return products[key];
    }

    function getCurrentOwner(string memory serialNumber) external view returns (address) {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(products[key].exists, "Product not found");
        return products[key].owner;
    }

    function isWarrantyActive(string memory serialNumber) external view returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(products[key].exists, "Product not found");
        Warranty memory w = products[key].warranty;
        return w.startDate != 0 && block.timestamp <= w.expiration;
    }
}