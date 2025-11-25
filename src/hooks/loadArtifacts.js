// src/utils/loadArtifacts.js
export async function loadArtifacts() {
  // expects files at /deployed.json and /abis/*.json served from public/
  console.log('Loading artifacts...');
  const deployed = await fetch('/deployed.json').then(r => r.json());
  console.log('Deployed contracts:', deployed);
  
  const AccessABI = await fetch('/abis/AccessControlContract.json').then(r => r.json());
  const RegistryABI = await fetch('/abis/ProductRegistry.json').then(r => r.json());
  const OwnershipABI = await fetch('/abis/OwnershipManager.json').then(r => r.json());
  const WarrantyABI = await fetch('/abis/WarrantyManager.json').then(r => r.json());
  
  console.log('All artifacts loaded successfully');
  return { deployed, AccessABI, RegistryABI, OwnershipABI, WarrantyABI };
}