import { ethers } from 'ethers';

// Role constants matching the smart contract
export const ROLES = {
  ADMIN: ethers.id('ADMIN_ROLE'),
  MANUFACTURER: ethers.id('MANUFACTURER_ROLE'),
  RETAILER: ethers.id('RETAILER_ROLE'),
  CUSTOMER: ethers.id('CUSTOMER_ROLE'),
  SERVICE_CENTER: ethers.id('SERVICE_CENTER_ROLE'),
};

// Helper function to check if user has a specific role
export const checkRole = async (accessControl, role, address) => {
  if (!accessControl || !address) return false;
  try {
    return await accessControl.hasRole(role, address);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

// Get all roles for a user
export const getUserRoles = async (accessControl, address) => {
  if (!accessControl || !address) {
    console.log('getUserRoles: Missing required parameters');
    return [];
  }
  
  const roles = [];
  try {
    console.log('Checking roles for address:', address);
    console.log('AccessControl contract:', accessControl.target || accessControl.address);
    
    const isAdmin = await accessControl.hasRole(ROLES.ADMIN, address);
    console.log('Is Admin:', isAdmin);
    if (isAdmin) roles.push('admin');
    
    const isManufacturer = await accessControl.hasRole(ROLES.MANUFACTURER, address);
    console.log('Is Manufacturer:', isManufacturer);
    if (isManufacturer) roles.push('manufacturer');
    
    const isRetailer = await accessControl.hasRole(ROLES.RETAILER, address);
    console.log('Is Retailer:', isRetailer);
    if (isRetailer) roles.push('retailer');
    
    const isCustomer = await accessControl.hasRole(ROLES.CUSTOMER, address);
    console.log('Is Customer:', isCustomer);
    if (isCustomer) roles.push('customer');
    
    const isServiceCenter = await accessControl.hasRole(ROLES.SERVICE_CENTER, address);
    console.log('Is Service Center:', isServiceCenter);
    if (isServiceCenter) roles.push('serviceCenter');
    
    console.log('Final roles array:', roles);
  } catch (error) {
    console.error('Error getting user roles:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      data: error.data
    });
  }
  
  return roles;
};
