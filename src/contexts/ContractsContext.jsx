import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const [eventListeners, setEventListeners] = useState([]);
  const listenersSetup = useRef(false);

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

  // Setup event listeners for real-time updates
  useEffect(() => {
    if (!productRegistry || !ownershipManager || !warrantyManager || listenersSetup.current) {
      return;
    }

    console.log('Setting up blockchain event listeners...');
    listenersSetup.current = true;

    // Listen for ProductRegistered events
    productRegistry.on('ProductRegistered', (serialNumber, model, manufacturer, timestamp, initialOwner) => {
      console.log('Event: ProductRegistered', {
        serialNumber,
        model,
        manufacturer,
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
        initialOwner
      });
      
      // Trigger UI refresh callback if registered
      setEventListeners(prev => [...prev, {
        type: 'ProductRegistered',
        data: { serialNumber, model, manufacturer, timestamp, initialOwner },
        id: Date.now()
      }]);
    });

    // Listen for OwnershipTransferred events
    ownershipManager.on('OwnershipTransferred', (serialNumber, from, to, date) => {
      console.log('Event: OwnershipTransferred', {
        serialNumber,
        from,
        to,
        date: new Date(Number(date) * 1000).toLocaleString()
      });
      
      setEventListeners(prev => [...prev, {
        type: 'OwnershipTransferred',
        data: { serialNumber, from, to, date },
        id: Date.now()
      }]);
    });

    // Listen for ClaimSubmitted events
    warrantyManager.on('ClaimSubmitted', (serialNumber, claimant, reason) => {
      console.log('Event: ClaimSubmitted', {
        serialNumber,
        claimant,
        reason
      });
      
      setEventListeners(prev => [...prev, {
        type: 'ClaimSubmitted',
        data: { serialNumber, claimant, reason },
        id: Date.now()
      }]);
    });

    // Listen for ClaimReviewed events
    warrantyManager.on('ClaimReviewed', (serialNumber, reviewer, status, reviewReason) => {
      console.log('Event: ClaimReviewed', {
        serialNumber,
        reviewer,
        status: status === 1n ? 'Approved' : 'Rejected',
        reviewReason
      });
      
      setEventListeners(prev => [...prev, {
        type: 'ClaimReviewed',
        data: { serialNumber, reviewer, status, reviewReason },
        id: Date.now()
      }]);
    });

    // Listen for WarrantyCreated events
    productRegistry.on('WarrantyCreated', (serialNumber, startDate, expiration) => {
      console.log('Event: WarrantyCreated', {
        serialNumber,
        startDate: new Date(Number(startDate) * 1000).toLocaleString(),
        expiration: new Date(Number(expiration) * 1000).toLocaleString()
      });
      
      setEventListeners(prev => [...prev, {
        type: 'WarrantyCreated',
        data: { serialNumber, startDate, expiration },
        id: Date.now()
      }]);
    });

    console.log('Event listeners active');

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up event listeners...');
      if (productRegistry) {
        productRegistry.removeAllListeners();
      }
      if (ownershipManager) {
        ownershipManager.removeAllListeners();
      }
      if (warrantyManager) {
        warrantyManager.removeAllListeners();
      }
      listenersSetup.current = false;
    };
  }, [productRegistry, ownershipManager, warrantyManager]);

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
    error,
    
    // Event system
    eventListeners,
    latestEvent: eventListeners[eventListeners.length - 1] || null
  };

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  );
};
