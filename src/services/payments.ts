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
