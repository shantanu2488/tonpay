import { Section, Cell } from '@telegram-apps/telegram-ui';

export function JourneyPreview() {
  return (
    <Section header="Journey preview">
      <Cell subtitle="One-tap send to client DM or group">02 — Share in chat</Cell>
      <Cell subtitle='Client taps "Pay now" inside Telegram'>03 — Client pays</Cell>
      <Cell subtitle="Funds arrive in wallet in seconds">04 — Instant settlement</Cell>
      <Cell subtitle="Swap to local fiat via partner rails">05 — Off-ramp</Cell>
    </Section>
  );
}
