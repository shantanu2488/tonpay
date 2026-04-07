# TonPay Backend API Contract

This document defines the minimum backend contract required by the frontend payment integration.

## Base URL

The frontend reads:

- `VITE_API_BASE_URL` from environment variables.

Example:

```bash
VITE_API_BASE_URL=https://api.tonpay.app
```

## Create Invoice

`POST /invoices`

Creates an invoice and returns an ID plus a payment URL.

### Request JSON

```json
{
  "client": "@acme",
  "description": "Website redesign sprint",
  "amount": "500",
  "currency": "USDT",
  "dueDate": "2026-04-30"
}
```

### Validation notes

- `client`: non-empty string
- `description`: non-empty string
- `amount`: stringified decimal; backend should validate as positive numeric value
- `currency`: one of `USDT` or `TON`
- `dueDate`: `YYYY-MM-DD`

### Success response (`200` or `201`)

```json
{
  "id": "inv_01JABCDEFG",
  "payUrl": "https://t.me/your_bot?start=pay_inv_01JABCDEFG"
}
```

### Error response (`4xx`/`5xx`)

```json
{
  "error": "Human-readable message"
}
```

## Frontend behavior

- If `/invoices` succeeds, the app uses:
  - response `id` as backend invoice reference
  - response `payUrl` in the "Pay now" share payload
  - integration status shown as `live`
- If request fails or `VITE_API_BASE_URL` is missing:
  - app falls back to local simulation mode
  - integration status shown as `simulated`
