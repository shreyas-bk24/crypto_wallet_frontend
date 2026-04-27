import axios, { isAxiosError } from 'axios';
import { normalizeAddress } from './format';
import type {
  ApiEnvelope,
  BalanceResponse,
  TransactionResponse,
  TransactionsResponse
} from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://crypto-wallet-gse7.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function request<T>(path: string, init?: { method?: 'GET' | 'POST'; data?: unknown }): Promise<T> {
  try {
    const response = await api.request<ApiEnvelope<T>>({
      url: path,
      method: init?.method ?? 'GET',
      data: init?.data
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.error || 'Request failed');
    }

    return response.data.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const message = error.response?.data?.error || error.message || 'Request failed';
      console.error('[api_request_failed]', {
        path,
        method: init?.method ?? 'GET',
        status: error.response?.status,
        message
      });
      throw new Error(message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Request failed');
  }
}

export async function getBalance(address: string): Promise<BalanceResponse> {
  const normalizedAddress = normalizeAddress(address);
  const data = await request<{ balance: BalanceResponse }>(`/wallet/balance/${normalizedAddress}`);

  return data.balance;
}

export async function getTransactions(address: string): Promise<TransactionsResponse> {
  const normalizedAddress = normalizeAddress(address);
  const data = await request<{ transactions?: Partial<TransactionsResponse> | null }>(`/wallet/transactions/${normalizedAddress}`);

  const response = data.transactions;
  const normalizedTransactions = Array.isArray(response?.transactions)
    ? response.transactions.filter((transaction): transaction is TransactionResponse => (
      typeof transaction?.hash === 'string'
      && typeof transaction?.from === 'string'
      && typeof transaction?.to === 'string'
      && typeof transaction?.amount_wei === 'string'
      && typeof transaction?.status === 'string'
    ))
    : [];

  return {
    address: typeof response?.address === 'string' && response.address ? response.address : normalizedAddress,
    transactions: normalizedTransactions
  };
}

export { api };