import type { Currency } from '@/pages/IndexPage/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CreateInvoiceRequest {
  client: string;
  description: string;
  amount: string;
  currency: Currency;
  dueDate: string;
}

interface CreateInvoiceResponse {
  id: string;
  payUrl: string;
}

export type RemoteInvoiceStatus =
  | 'PENDING'
  | 'PAID'
  | 'SETTLED'
  | 'OFFRAMP_PROCESSING'
  | 'PAID_OUT';

export interface GetInvoiceStatusResponse {
  id: string;
  status: RemoteInvoiceStatus;
  paidAt?: string;
  settledAt?: string;
  offRampStartedAt?: string;
  offRampCompletedAt?: string;
}

function ensureApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured');
  }
  return API_BASE_URL.replace(/\/$/, '');
}

export async function createRemoteInvoice(payload: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
  const baseUrl = ensureApiBaseUrl();
  const response = await fetch(`${baseUrl}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Invoice API returned ${response.status}`);
  }

  return response.json() as Promise<CreateInvoiceResponse>;
}

export async function getRemoteInvoiceStatus(invoiceId: string): Promise<GetInvoiceStatusResponse> {
  const baseUrl = ensureApiBaseUrl();
  const response = await fetch(`${baseUrl}/invoices/${encodeURIComponent(invoiceId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Invoice status API returned ${response.status}`);
  }

  return response.json() as Promise<GetInvoiceStatusResponse>;
}
