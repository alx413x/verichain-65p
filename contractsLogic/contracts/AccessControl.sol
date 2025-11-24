// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AccessControlContract
 * @dev Extends OpenZeppelin's AccessControl with manufacturer, retailer, customer, and service center roles.
 */
contract AccessControlContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant CUSTOMER_ROLE = keccak256("CUSTOMER_ROLE");
    bytes32 public constant SERVICE_CENTER_ROLE = keccak256("SERVICE_CENTER_ROLE");

    constructor() {
        // Deployer is the default admin
    // give deployer the ADMIN_ROLE
    _grantRole(ADMIN_ROLE, msg.sender);
    // also give deployer the DEFAULT_ADMIN_ROLE so they can manage ADMIN_ROLE and other roles
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

    // Make ADMIN_ROLE the admin for all other roles
        _setRoleAdmin(MANUFACTURER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(RETAILER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(CUSTOMER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(SERVICE_CENTER_ROLE, ADMIN_ROLE);
    }

    // ---------- Role Registration ----------

    function registerManufacturer(address account)
        external
        onlyRole(ADMIN_ROLE)
    {
        grantRole(MANUFACTURER_ROLE, account);
    }

    function registerRetailer(address account)
        external
        onlyRole(ADMIN_ROLE)
    {
        grantRole(RETAILER_ROLE, account);
    }

    function registerCustomer(address account)
        external
        onlyRole(ADMIN_ROLE)
    {
        grantRole(CUSTOMER_ROLE, account);
    }

    function registerServiceCenter(address account)
        external
        onlyRole(ADMIN_ROLE)
    {
        grantRole(SERVICE_CENTER_ROLE, account);
    }

    // ---------- Helpers ----------

    function isAdmin(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }

    function isManufacturer(address account) external view returns (bool) {
        return hasRole(MANUFACTURER_ROLE, account);
    }

    function isRetailer(address account) external view returns (bool) {
        return hasRole(RETAILER_ROLE, account);
    }

    function isCustomer(address account) external view returns (bool) {
        return hasRole(CUSTOMER_ROLE, account);
    }

    function isServiceCenter(address account) external view returns (bool) {
        return hasRole(SERVICE_CENTER_ROLE, account);
    }
}