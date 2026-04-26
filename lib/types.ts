export type WalletSession = {
  address: string;
  privateKey: string;
};

export type WalletResponse = {
  address: string;
  privateKey?: string;
  label?: string;
  nonce?: number;
};

export type BalanceResponse = {
  address: string;
  balance_wei: string;
  balance_eth: string;
  network_name: string;
};

export type TransactionResponse = {
  hash: string;
  from: string;
  to: string;
  amount_wei: string;
  status: string;
};

export type TransactionsResponse = {
  address: string;
  transactions: TransactionResponse[];
};

export type ApiEnvelope<T> = {
  status: 'success' | 'error';
  data: T;
  error: string;
};

export type SendTransactionResult = {
  transaction_hash: string;
  from: string;
  to: string;
  amount_wei: string;
  nounce?: number;
  status: string;
};

export type ToastType = 'success' | 'error' | 'info';

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  tone: ToastType;
};

export type TransactionViewModel = TransactionResponse & {
  direction: 'incoming' | 'outgoing';
};