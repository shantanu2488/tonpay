import { Section, Cell, Button, Input } from '@telegram-apps/telegram-ui';
import type { Currency } from '../types';

interface InvoiceFormProps {
  client: string;
  description: string;
  amount: string;
  currency: Currency;
  dueDate: string;
  canCreate: boolean;
  onClientChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onCurrencyToggle: () => void;
  onDueDateChange: (value: string) => void;
  onCreateInvoice: () => void;
}

export function InvoiceForm(props: InvoiceFormProps) {
  const {
    client,
    description,
    amount,
    currency,
    dueDate,
    canCreate,
    onClientChange,
    onDescriptionChange,
    onAmountChange,
    onCurrencyToggle,
    onDueDateChange,
    onCreateInvoice,
  } = props;

  return (
    <Section
      header="01 — Create invoice"
      footer="MVP form to generate an invoice payload inside the Mini App."
    >
      <Input
        header="Client"
        placeholder="@client_username or company"
        value={client}
        onChange={(event) => onClientChange(event.target.value)}
      />
      <Input
        header="Line item"
        placeholder="Website redesign sprint"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
      />
      <Input
        header="Amount"
        type="number"
        placeholder="500"
        value={amount}
        onChange={(event) => onAmountChange(event.target.value)}
      />
      <Cell subtitle="Tap to switch invoice currency" onClick={onCurrencyToggle}>
        Currency: {currency}
      </Cell>
      <Input
        header="Due date"
        type="date"
        value={dueDate}
        onChange={(event) => onDueDateChange(event.target.value)}
      />
      <Button stretched size="m" onClick={onCreateInvoice} disabled={!canCreate}>
        Create invoice
      </Button>
    </Section>
  );
}
