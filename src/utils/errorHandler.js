/**
 * Parse blockchain error messages and return user-friendly messages
 */
export const parseError = (error) => {
  console.error('Error details:', error);

  // User rejected transaction
  if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
    return {
      title: 'Transaction Rejected',
      message: 'You rejected the transaction in MetaMask',
      type: 'warning'
    };
  }

  // Insufficient funds
  if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
    return {
      title: 'Insufficient Funds',
      message: 'You don\'t have enough ETH to pay for gas fees',
      type: 'error'
    };
  }

  // Network error
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
    return {
      title: 'Network Error',
      message: 'Please check your internet connection and try again',
      type: 'error'
    };
  }

  // Contract revert errors
  if (error.message?.includes('revert')) {
    // Extract revert reason if available
    const revertMatch = error.message.match(/revert (.+?)(?:\"|$)/);
    const reason = revertMatch ? revertMatch[1] : 'Transaction failed';
    
    return {
      title: 'Transaction Failed',
      message: reason,
      type: 'error'
    };
  }

  // Not authorized / permission errors
  if (error.message?.includes('Not manufacturer') || 
      error.message?.includes('Not retailer') ||
      error.message?.includes('Not customer') ||
      error.message?.includes('Not service center')) {
    return {
      title: 'Permission Denied',
      message: 'You don\'t have the required role to perform this action',
      type: 'error'
    };
  }

  // Nonce too high (usually means need to reset account)
  if (error.message?.includes('nonce')) {
    return {
      title: 'Nonce Error',
      message: 'Please reset your account in MetaMask (Settings → Advanced → Reset Account)',
      type: 'error'
    };
  }

  // Gas estimation failed
  if (error.message?.includes('gas') && error.message?.includes('estimate')) {
    return {
      title: 'Transaction Would Fail',
      message: 'This transaction would fail. Please check the input values',
      type: 'error'
    };
  }

  // Default error
  return {
    title: 'Error',
    message: error.reason || error.message || 'An unexpected error occurred',
    type: 'error'
  };
};

/**
 * Format ETH value for display
 */
export const formatEth = (wei) => {
  if (!wei) return '0';
  const eth = Number(wei) / 1e18;
  if (eth < 0.0001) return eth.toExponential(2);
  return eth.toFixed(4);
};

/**
 * Format gas estimate for display
 */
export const formatGasEstimate = (gasLimit, gasPrice) => {
  const gasCost = BigInt(gasLimit) * BigInt(gasPrice);
  return formatEth(gasCost);
};
