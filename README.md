# AIPay247 — User Deposit Flow Tester

A focused, step-by-step API tester for the **USDT TRC20 Payment Gateway** user deposit journey.

## Flow Overview

```
Step 1 → Enter Secret Key (X-SECRET-KEY)
Step 2 → Fetch QR Code & Wallet Address
Step 3 → Create Deposit Reference
Step 4 → Submit Deposit (tx_hash + from_address)
Step 5 → Check Deposit Status
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5174](http://localhost:5174)

## API Endpoints Used

| Step | Method | Endpoint                        |
|------|--------|---------------------------------|
| 2    | GET    | `/api/deposit/qrcode`           |
| 3    | POST   | `/api/deposit/get-reference`    |
| 4    | POST   | `/api/deposit/submit`           |
| 5    | GET    | `/api/deposit/status/:ref`      |

## Authentication

Every request sends `X-SECRET-KEY` as a request header.  
Obtain your key by calling `POST /api/auth/login` on the backend.

## Notes

- All API calls go **directly from your browser to your backend** — no proxy, no middleman.
- The secret key is stored **only in memory** (React state) and is never persisted.
- The reference from Step 3 is **auto-filled** into Steps 4 and 5.
