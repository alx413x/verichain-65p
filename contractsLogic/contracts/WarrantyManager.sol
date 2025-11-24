// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "./ProductRegistry.sol";

/**
 * @title WarrantyManager
 * @dev Handles warranty claim submission and reviews
 */
contract WarrantyManager {
    AccessControlContract public accessControl;
    ProductRegistry public registry;

    enum ClaimStatus { Pending, Approved, Rejected }

    struct ClaimReview {
        address claimant;
        string reason;
        uint256 submitDate;
        ClaimStatus status;
        address reviewedBy;
        uint256 reviewDate;
        string reviewReason;  // Reason for approval/rejection by service center
    }

    struct ClaimSummary {
        string serialNumber;
        address claimant;
        string reason;
        uint256 submitDate;
        ClaimStatus status;
        address reviewedBy;
        uint256 reviewDate;
        string reviewReason;  // Reason for approval/rejection by service center
    }

    mapping(bytes32 => ClaimReview[]) private reviews;
    string[] private productsWithClaims;
    ClaimSummary[] private allClaims;

    event ClaimSubmitted(string serialNumber, address claimant, string reason);
    event ClaimReviewed(string serialNumber, address reviewer, ClaimStatus status, string reviewReason);

    modifier onlyCustomer() {
        require(accessControl.hasRole(accessControl.CUSTOMER_ROLE(), msg.sender), "Not customer");
        _;
    }

    modifier onlyServiceCenter() {
        require(accessControl.hasRole(accessControl.SERVICE_CENTER_ROLE(), msg.sender), "Not service center");
        _;
    }

    constructor(address accessAddress, address registryAddress) {
        accessControl = AccessControlContract(accessAddress);
        registry = ProductRegistry(registryAddress);
    }

    // ========== Claim Submission ==========
    function submitClaim(string memory serialNumber, string memory reason)
        external
        onlyCustomer
    {
        require(registry.isWarrantyActive(serialNumber), "Warranty inactive");
        
        // Verify the product exists and customer might own it
        address productOwner = registry.getCurrentOwner(serialNumber);
        require(productOwner != address(0), "Product not found");

        bytes32 key = keccak256(abi.encodePacked(serialNumber));

        // Check if there's already a pending claim for this product
        ClaimReview[] storage productClaims = reviews[key];
        for (uint256 i = 0; i < productClaims.length; i++) {
            require(productClaims[i].status != ClaimStatus.Pending, "Already have a pending claim for this product");
        }

        // Increment claim count in ProductRegistry
        registry.incrementClaimCount(serialNumber);

        reviews[key].push(
            ClaimReview({
                claimant: msg.sender,
                reason: reason,
                submitDate: block.timestamp,
                status: ClaimStatus.Pending,
                reviewedBy: address(0),
                reviewDate: 0,
                reviewReason: ""
            })
        );

        allClaims.push(
            ClaimSummary({
                serialNumber: serialNumber,
                claimant: msg.sender,
                reason: reason,
                submitDate: block.timestamp,
                status: ClaimStatus.Pending,
                reviewedBy: address(0),
                reviewDate: 0,
                reviewReason: ""
            })
        );

        if (reviews[key].length == 1) {
            productsWithClaims.push(serialNumber);
        }

        emit ClaimSubmitted(serialNumber, msg.sender, reason);
    }

    // ========== Claim Review ==========
    function reviewClaim(
        string memory serialNumber, 
        uint256 claimIndex, 
        bool approve,
        string memory reviewReason
    )
        external
        onlyServiceCenter
    {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        require(reviews[key].length > 0, "No claims found for this product");
        require(claimIndex < reviews[key].length, "Invalid claim index. Check getClaimCount()");

        ClaimReview storage claim = reviews[key][claimIndex];
        require(claim.status == ClaimStatus.Pending, "Already reviewed");

        // If rejecting, reason must be provided
        if (!approve) {
            require(bytes(reviewReason).length > 0, "Rejection reason required");
        }

        claim.status = approve ? ClaimStatus.Approved : ClaimStatus.Rejected;
        claim.reviewedBy = msg.sender;
        claim.reviewDate = block.timestamp;
        claim.reviewReason = reviewReason;

        for (uint256 i; i < allClaims.length; i++) {
            if (
                keccak256(bytes(allClaims[i].serialNumber)) == keccak256(bytes(serialNumber)) &&
                allClaims[i].claimant == claim.claimant &&
                allClaims[i].submitDate == claim.submitDate
            ) {
                allClaims[i].status = claim.status;
                allClaims[i].reviewedBy = msg.sender;
                allClaims[i].reviewDate = block.timestamp;
                allClaims[i].reviewReason = reviewReason;
                break;
            }
        }

        emit ClaimReviewed(serialNumber, msg.sender, claim.status, reviewReason);
    }

    // ========== Views ==========
    function getClaims(string memory serialNumber) external view returns (ClaimReview[] memory) {
        return reviews[keccak256(abi.encodePacked(serialNumber))];
    }

    function listAllClaimedProducts() external view returns (string[] memory) {
        return productsWithClaims;
    }

    function listAllWarrantyClaims() external view returns (ClaimSummary[] memory) {
        return allClaims;
    }

    // Helper function to check if an address has customer role
    function isCustomer(address account) external view returns (bool) {
        return accessControl.hasRole(accessControl.CUSTOMER_ROLE(), account);
    }

    // Helper function to check if an address has service center role
    function isServiceCenter(address account) external view returns (bool) {
        return accessControl.hasRole(accessControl.SERVICE_CENTER_ROLE(), account);
    }

    // Helper to get the number of claims for a product
    function getClaimCount(string memory serialNumber) external view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        return reviews[key].length;
    }

    // Helper to check if a specific claim index is valid
    function isValidClaimIndex(string memory serialNumber, uint256 claimIndex) external view returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        return claimIndex < reviews[key].length;
    }

    // Helper to check if a product has a pending claim
    function hasPendingClaim(string memory serialNumber) external view returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(serialNumber));
        ClaimReview[] storage productClaims = reviews[key];
        for (uint256 i = 0; i < productClaims.length; i++) {
            if (productClaims[i].status == ClaimStatus.Pending) {
                return true;
            }
        }
        return false;
    }

    // Helper to get the warranty claim count from ProductRegistry
    function getWarrantyClaimCount(string memory serialNumber) external view returns (uint256) {
        return registry.getWarrantyClaimCount(serialNumber);
    }
}