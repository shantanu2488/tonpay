import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { openLink } from '@tma.js/sdk-react';
import { Page } from '@/components/Page.tsx';
import { createRemoteInvoice, getRemoteInvoiceStatus } from '@/services/payments';
import { InvoiceForm } from './components/InvoiceForm';
import { JourneyPreview } from './components/JourneyPreview';
import { InvoiceLifecycleCard } from './components/InvoiceLifecycleCard';
import type { Currency, InvoiceFlowState } from './types';

const STORAGE_KEY = 'tonpay.invoice.flow.v1';

const initialState: InvoiceFlowState = {
  client: '',
  description: '',
  amount: '',
  currency: 'USDT',
  dueDate: '',
  remoteInvoiceId: null,
  remotePayUrl: null,
  integrationStatus: 'simulated',
  createdAt: null,
  paidAt: null,
  settledAt: null,
  offRampProvider: 'Fonbnk',
  offRampStartedAt: null,
  offRampCompletedAt: null,
};

export const IndexPage: FC = () => {
  const [state, setState] = useState<InvoiceFlowState>(initialState);
  const {
    client,
    description,
    amount,
    currency,
    dueDate,
    remoteInvoiceId,
    remotePayUrl,
    integrationStatus,
    createdAt,
    paidAt,
    settledAt,
    offRampProvider,
    offRampStartedAt,
    offRampCompletedAt,
  } = state;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<InvoiceFlowState>;
      setState((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Ignore malformed persisted state and keep defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const invoiceId = useMemo(() => {
    if (!createdAt) return null;
    const createdAtMs = new Date(createdAt).getTime();
    return `INV-${String(createdAtMs).slice(-6)}`;
  }, [createdAt]);

  const canCreate = client.trim() && description.trim() && amount.trim() && dueDate.trim();

  const onCreateInvoice = async () => {
    if (!canCreate) return;
    let nextRemoteInvoiceId: string | null = null;
    let nextRemotePayUrl: string | null = null;
    let nextIntegrationStatus: 'simulated' | 'live' = 'simulated';

    try {
      const invoice = await createRemoteInvoice({
        client,
        description,
        amount,
        currency,
        dueDate,
      });
      nextRemoteInvoiceId = invoice.id;
      nextRemotePayUrl = invoice.payUrl;
      nextIntegrationStatus = 'live';
    } catch {
      nextIntegrationStatus = 'simulated';
    }

    setState((prev) => ({
      ...prev,
      createdAt: new Date().toLocaleString(),
      remoteInvoiceId: nextRemoteInvoiceId,
      remotePayUrl: nextRemotePayUrl,
      integrationStatus: nextIntegrationStatus,
      paidAt: null,
      settledAt: null,
      offRampStartedAt: null,
      offRampCompletedAt: null,
    }));
  };

  const payUrl = useMemo(() => {
    if (!invoiceId) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tonpay.app';
    const params = new URLSearchParams({
      invoice: invoiceId,
      amount,
      currency,
      action: 'pay',
    });
    return `${baseUrl}?${params.toString()}`;
  }, [amount, currency, invoiceId]);

  const effectivePayUrl = remotePayUrl || payUrl;

  const invoiceShareText = useMemo(() => {
    if (!invoiceId) return '';
    const lines = [
      `TonPay Invoice ${invoiceId}`,
      `Client: ${client}`,
      `Item: ${description}`,
      `Amount: ${amount} ${currency}`,
      `Due: ${dueDate}`,
      '',
      `Pay now: ${effectivePayUrl}`,
    ];
    return lines.join('\n');
  }, [amount, client, currency, description, dueDate, effectivePayUrl, invoiceId]);

  const onShareInvoice = () => {
    if (!invoiceShareText) return;
    const encodedText = encodeURIComponent(invoiceShareText);
    openLink(`https://t.me/share/url?url=${encodeURIComponent('https://t.me')}&text=${encodedText}`);
  };

  const onSimulatePaid = () => {
    setState((prev) => ({ ...prev, paidAt: new Date().toLocaleString() }));
  };

  const onStartOffRamp = () => {
    if (!settledAt || offRampStartedAt) return;
    setState((prev) => ({ ...prev, offRampStartedAt: new Date().toLocaleString() }));
  };

  const onResetFlow = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  };

  const settlementRef = useMemo(() => {
    if (!settledAt || !invoiceId) return null;
    const suffix = invoiceId.replace('INV-', '').padStart(8, '0');
    return `0:tonpay${suffix}settle`;
  }, [invoiceId, settledAt]);

  const payoutRef = useMemo(() => {
    if (!offRampCompletedAt || !invoiceId) return null;
    return `PAYOUT-${invoiceId.replace('INV-', '')}-${offRampProvider.toUpperCase()}`;
  }, [invoiceId, offRampCompletedAt, offRampProvider]);

  const fiatQuote = useMemo(() => {
    const numericAmount = Number.parseFloat(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return {
        localAmount: '0.00',
        fee: '0.00',
        net: '0.00',
      };
    }
    const rate = currency === 'USDT' ? 130 : 420;
    const gross = numericAmount * rate;
    const fee = gross * 0.0125;
    const net = gross - fee;
    return {
      localAmount: gross.toFixed(2),
      fee: fee.toFixed(2),
      net: net.toFixed(2),
    };
  }, [amount, currency]);

  useEffect(() => {
    if (!paidAt || settledAt) return;
    const timer = window.setTimeout(() => {
      setState((prev) => ({ ...prev, settledAt: new Date().toLocaleString() }));
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [paidAt, settledAt]);

  useEffect(() => {
    if (!offRampStartedAt || offRampCompletedAt) return;
    const timer = window.setTimeout(() => {
      setState((prev) => ({ ...prev, offRampCompletedAt: new Date().toLocaleString() }));
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [offRampCompletedAt, offRampStartedAt]);

  useEffect(() => {
    if (integrationStatus !== 'live' || !remoteInvoiceId) return;

    let cancelled = false;
    const toLocalTime = (value?: string) => (value ? new Date(value).toLocaleString() : new Date().toLocaleString());
    const syncStatus = async () => {
      try {
        const remote = await getRemoteInvoiceStatus(remoteInvoiceId);
        if (cancelled) return;

        setState((prev) => {
          const next = { ...prev };
          switch (remote.status) {
            case 'PAID':
              next.paidAt = prev.paidAt || toLocalTime(remote.paidAt);
              break;
            case 'SETTLED':
              next.paidAt = prev.paidAt || toLocalTime(remote.paidAt);
              next.settledAt = prev.settledAt || toLocalTime(remote.settledAt);
              break;
            case 'OFFRAMP_PROCESSING':
              next.paidAt = prev.paidAt || toLocalTime(remote.paidAt);
              next.settledAt = prev.settledAt || toLocalTime(remote.settledAt);
              next.offRampStartedAt = prev.offRampStartedAt || toLocalTime(remote.offRampStartedAt);
              break;
            case 'PAID_OUT':
              next.paidAt = prev.paidAt || toLocalTime(remote.paidAt);
              next.settledAt = prev.settledAt || toLocalTime(remote.settledAt);
              next.offRampStartedAt = prev.offRampStartedAt || toLocalTime(remote.offRampStartedAt);
              next.offRampCompletedAt = prev.offRampCompletedAt || toLocalTime(remote.offRampCompletedAt);
              break;
            default:
              break;
          }
          return next;
        });
      } catch {
        // Keep last known state and retry on next poll.
      }
    };

    void syncStatus();
    const pollTimer = window.setInterval(() => {
      void syncStatus();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(pollTimer);
    };
  }, [integrationStatus, remoteInvoiceId]);

  return (
    <Page back={false}>
      <List>
        <Section
          header="TonPay"
          footer="Telegram-native payroll and invoicing for remote teams."
        >
          <Cell subtitle="Pay contractors, freelancers, and global teams instantly in TON or USDT.">
            Payroll + Invoicing
          </Cell>
          <Cell subtitle={integrationStatus === 'live' ? 'Using configured API backend' : 'Using local simulation mode'}>
            Integration: {integrationStatus}
          </Cell>
          {remoteInvoiceId && <Cell subtitle="Latest backend invoice ID">{remoteInvoiceId}</Cell>}
          <Cell subtitle="Clear draft invoice and payout progress" onClick={onResetFlow}>
            Reset flow
          </Cell>
        </Section>

        <InvoiceForm
          client={client}
          description={description}
          amount={amount}
          currency={currency}
          dueDate={dueDate}
          canCreate={Boolean(canCreate)}
          onClientChange={(value) => setState((prev) => ({ ...prev, client: value }))}
          onDescriptionChange={(value) => setState((prev) => ({ ...prev, description: value }))}
          onAmountChange={(value) => setState((prev) => ({ ...prev, amount: value }))}
          onCurrencyToggle={() =>
            setState((prev) => ({
              ...prev,
              currency: (prev.currency === 'USDT' ? 'TON' : 'USDT') as Currency,
            }))
          }
          onDueDateChange={(value) => setState((prev) => ({ ...prev, dueDate: value }))}
          onCreateInvoice={onCreateInvoice}
        />

        <JourneyPreview />

        {createdAt && invoiceId && (
          <InvoiceLifecycleCard
            createdAt={createdAt}
            invoiceId={invoiceId}
            description={description}
            amount={amount}
            currency={currency}
            dueDate={dueDate}
            payUrl={effectivePayUrl}
            paidAt={paidAt}
            settledAt={settledAt}
            settlementRef={settlementRef}
            offRampProvider={offRampProvider}
            offRampStartedAt={offRampStartedAt}
            offRampCompletedAt={offRampCompletedAt}
            payoutRef={payoutRef}
            fiatQuote={fiatQuote}
            allowSimulationActions={integrationStatus !== 'live'}
            onShareInvoice={onShareInvoice}
            onSimulatePaid={onSimulatePaid}
            onToggleOffRampProvider={() =>
              setState((prev) => ({
                ...prev,
                offRampProvider: prev.offRampProvider === 'Fonbnk' ? 'Normies' : 'Fonbnk',
              }))
            }
            onStartOffRamp={onStartOffRamp}
          />
        )}
      </List>
    </Page>
  );
};
