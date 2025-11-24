import React, { createContext, useContext, useState, useEffect } from 'react';
import useEthers from '../hooks/useEthers';
import useContract from '../hooks/useContract';
import { loadArtifacts } from '../hooks/loadArtifacts';

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
