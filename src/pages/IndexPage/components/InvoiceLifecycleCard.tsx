import { Section, Cell, Button } from '@telegram-apps/telegram-ui';
import type { OffRampProvider } from '../types';

interface FiatQuote {
  localAmount: string;
  fee: string;
  net: string;
}

interface InvoiceLifecycleCardProps {
  createdAt: string;
  invoiceId: string;
  description: string;
  amount: string;
  currency: string;
  dueDate: string;
  payUrl: string;
  paidAt: string | null;
  settledAt: string | null;
  settlementRef: string | null;
  offRampProvider: OffRampProvider;
  offRampStartedAt: string | null;
  offRampCompletedAt: string | null;
  payoutRef: string | null;
  fiatQuote: FiatQuote;
  allowSimulationActions: boolean;
  onShareInvoice: () => void;
  onSimulatePaid: () => void;
  onToggleOffRampProvider: () => void;
  onStartOffRamp: () => void;
}

export function InvoiceLifecycleCard(props: InvoiceLifecycleCardProps) {
  const {
    createdAt,
    invoiceId,
    description,
    amount,
    currency,
    dueDate,
    payUrl,
    paidAt,
    settledAt,
    settlementRef,
    offRampProvider,
    offRampStartedAt,
    offRampCompletedAt,
    payoutRef,
    fiatQuote,
    allowSimulationActions,
    onShareInvoice,
    onSimulatePaid,
    onToggleOffRampProvider,
    onStartOffRamp,
  } = props;

  return (
    <Section header="Invoice created" footer="Next: connect to Telegram send + TON payment API.">
      <Cell subtitle={`Created ${createdAt}`}>{invoiceId}</Cell>
      <Cell subtitle={description}>
        {amount} {currency} due {dueDate}
      </Cell>
      <Cell subtitle={payUrl}>Pay link</Cell>
      <Cell subtitle={paidAt ? `Paid at ${paidAt}` : 'Ready for client payment'}>
        Status: {paidAt ? 'Paid' : 'Pending payment'}
      </Cell>
      <Cell
        subtitle={
          settledAt
            ? `Settled at ${settledAt}`
            : paidAt
              ? 'Settlement in progress...'
              : 'Waiting for payment confirmation'
        }
      >
        Wallet credit: {settledAt ? `${amount} ${currency}` : 'Not credited yet'}
      </Cell>
      {settlementRef && <Cell subtitle={settlementRef}>Settlement reference</Cell>}
      <Button stretched size="m" onClick={onShareInvoice}>
        02 — Share in chat
      </Button>
      {allowSimulationActions && !paidAt && (
        <Button stretched size="m" mode="bezeled" onClick={onSimulatePaid}>
          03 — Simulate client "Pay now"
        </Button>
      )}
      {settledAt && (
        <>
          <Cell subtitle="Tap to switch provider" onClick={onToggleOffRampProvider}>
            05 — Off-ramp provider: {offRampProvider}
          </Cell>
          <Cell subtitle="Estimated local payout (NGN)">
            Quote: {fiatQuote.localAmount} | Fee: {fiatQuote.fee} | Net: {fiatQuote.net}
          </Cell>
          <Cell
            subtitle={
              offRampCompletedAt
                ? `Completed at ${offRampCompletedAt}`
                : offRampStartedAt
                  ? 'Converting and sending to local rail...'
                  : 'Ready to convert crypto to fiat'
            }
          >
            Off-ramp status: {offRampCompletedAt ? 'Paid out' : offRampStartedAt ? 'Processing' : 'Not started'}
          </Cell>
          {payoutRef && <Cell subtitle={payoutRef}>Fiat payout reference</Cell>}
          {allowSimulationActions && !offRampStartedAt && (
            <Button stretched size="m" mode="bezeled" onClick={onStartOffRamp}>
              05 — Convert to local fiat
            </Button>
          )}
        </>
      )}
    </Section>
  );
}
