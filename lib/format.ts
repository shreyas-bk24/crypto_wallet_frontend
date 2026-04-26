import { formatEther, getAddress, isAddress, parseEther } from 'ethers';

export function normalizePrivateKey(privateKey: string): string {
  const value = privateKey.trim();
  return value.startsWith('0x') ? value.slice(2) : value;
}

export function normalizeAddress(address: string): string {
  if (!isAddress(address)) {
    throw new Error('Invalid wallet address');
  }

  return getAddress(address);
}

export function shortenAddress(address: string, size = 4): string {
  if (!address) {
    return '';
  }

  return `${address.slice(0, 2 + size)}…${address.slice(-size)}`;
}

export function shortenHash(hash: string, size = 6): string {
  if (!hash) {
    return '';
  }

  return `${hash.slice(0, 2 + size)}…${hash.slice(-size)}`;
}

export function weiToEth(wei: string): string {
  try {
    return Number.parseFloat(formatEther(BigInt(wei))).toFixed(6).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  } catch {
    return '0';
  }
}

export function ethToWei(amountEth: string): string {
  return parseEther(amountEth).toString();
}

export function formatNetworkName(networkName: string): string {
  if (!networkName) {
    return 'Ethereum Sepolia';
  }

  if (networkName.toLowerCase().includes('sepolia')) {
    return 'Ethereum Sepolia';
  }

  return networkName;
}

export function etherscanAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`;
}

export function etherscanTransactionUrl(hash: string): string {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}