export type Currency = 'USDT' | 'TON';
export type OffRampProvider = 'Fonbnk' | 'Normies';

export interface InvoiceDraft {
  client: string;
  description: string;
  amount: string;
  currency: Currency;
  dueDate: string;
}

export interface InvoiceFlowState extends InvoiceDraft {
  remoteInvoiceId: string | null;
  remotePayUrl: string | null;
  integrationStatus: 'simulated' | 'live';
  integrationError: string | null;
  createdAt: string | null;
  paidAt: string | null;
  settledAt: string | null;
  offRampProvider: OffRampProvider;
  offRampStartedAt: string | null;
  offRampCompletedAt: string | null;
}
