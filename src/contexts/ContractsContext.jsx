import React, { createContext, useContext, useState, useEffect } from 'react';
import useEthers from '../hooks/useEthers';
import useContract from '../hooks/useContract';
import { loadArtifacts } from '../hooks/loadArtifacts';
import { getUserRoles } from '../utils/roles';

const ContractsContext = createContext(null);

export const useContracts = () => {
  const context = useContext(ContractsContext);
  if (!context) {
    throw new Error('useContracts must be used within ContractsProvider');
  }
  return context;
};

export const ContractsProvider = ({ children }) => {
  const { provider, signer, account, chainId, connect } = useEthers();
  const [artifacts, setArtifacts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  // Load contract artifacts on mount
  useEffect(() => {
    loadArtifacts()
      .then(loaded => {
        setArtifacts(loaded);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load artifacts:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Create contract instances
  const accessControl = useContract({
    address: artifacts?.deployed?.AccessControlContract,
    abi: artifacts?.AccessABI?.abi,
    provider,
    signer,
    asSigner: true
  });

  const productRegistry = useContract({
    address: artifacts?.deployed?.ProductRegistry,
    abi: artifacts?.RegistryABI?.abi,
    provider,
    signer,
    asSigner: true
  });

  const ownershipManager = useContract({
    address: artifacts?.deployed?.OwnershipManager,
    abi: artifacts?.OwnershipABI?.abi,
    provider,
    signer,
    asSigner: true
  });

  const warrantyManager = useContract({
    address: artifacts?.deployed?.WarrantyManager,
    abi: artifacts?.WarrantyABI?.abi,
    provider,
    signer,
    asSigner: true
  });

  // Load user roles when account changes
  useEffect(() => {
    const loadRoles = async () => {
      // Wait for all required dependencies
      if (!accessControl || !account || !provider) {
        console.log('Skipping role load - missing dependencies:', { 
          hasAccessControl: !!accessControl, 
          hasAccount: !!account,
          hasProvider: !!provider
        });
        setUserRoles([]);
        return;
      }

      // Check network first
      try {
        const network = await provider.getNetwork();
        console.log('Connected to network:', {
          chainId: network.chainId.toString(),
          name: network.name
        });
        
        if (network.chainId.toString() !== '31337') {
          console.error('WRONG NETWORK! You are on chain', network.chainId.toString());
          console.error('Please switch MetaMask to Localhost 8545 (Chain ID: 31337)');
          setUserRoles([]);
          return;
        }
      } catch (err) {
        console.error('Failed to get network:', err);
        setUserRoles([]);
        return;
      }

      // Verify contract has code deployed
      try {
        const contractAddress = accessControl.target || accessControl.address;
        console.log('Checking contract at address:', contractAddress);
        
        const code = await provider.getCode(contractAddress);
        console.log('Contract code length:', code.length, 'characters');
        
        if (code === '0x' || code === '0x0') {
          console.error('WARNING: AccessControl contract has no code at address:', contractAddress);
          console.error('This usually means:');
          console.error('1. Contracts are not deployed to the network your wallet is connected to');
          console.error('2. You need to run: npm run deploy:local && npm run grant-roles');
          console.error('3. Make sure MetaMask is connected to localhost:8545');
          setUserRoles([]);
          return;
        }
        
        console.log('Contract verified at address:', contractAddress);
      } catch (err) {
        console.error('Failed to verify contract code:', err);
        setUserRoles([]);
        return;
      }

      console.log('Loading roles for account:', account);
      const roles = await getUserRoles(accessControl, account);
      console.log('Loaded roles:', roles);
      setUserRoles(roles);
    };
    loadRoles();
  }, [accessControl, account, provider]);

  const value = {
    // Wallet connection
    provider,
    signer,
    account,
    chainId,
    connect,
    isConnected: !!account,
    
    // Contract instances
    accessControl,
    productRegistry,
    ownershipManager,
    warrantyManager,
    
    // Role management
    userRoles,
    hasRole: (role) => userRoles.includes(role),
    isAdmin: userRoles.includes('admin'),
    // Admin has all permissions
    isManufacturer: userRoles.includes('admin') || userRoles.includes('manufacturer'),
    isRetailer: userRoles.includes('admin') || userRoles.includes('retailer'),
    isCustomer: userRoles.includes('admin') || userRoles.includes('customer'),
    isServiceCenter: userRoles.includes('admin') || userRoles.includes('serviceCenter'),
    
    // Metadata
    artifacts,
    loading,
    error
  };

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  );
};
