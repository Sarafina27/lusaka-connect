# Flutterwave checkout setup

The checkout uses Flutterwave's Standard hosted checkout. The secret key stays on the server; the browser only receives Flutterwave's hosted checkout URL. Tickets are issued only after the server verifies the transaction ID, reference, amount, and currency with Flutterwave.

## ZMW safety gate

Event prices are in ZMW. Checkout is deliberately disabled unless Flutterwave ZMW checkout has been enabled for your merchant account and `FLUTTERWAVE_ZMW_ENABLED=true` is set on the server.

1. Configure the environment variables shown in `.env.example` on the server/deployment platform. Set `FLUTTERWAVE_ZMW_ENABLED=true` only after confirming ZMW support for your account. Keep `FLUTTERWAVE_CURRENCY=ZMW`.
2. Set `APP_URL` to the public HTTPS origin of the deployed application.
3. Run the updated `database/schema.sql` so the `payment_intents` table exists.
4. In the Flutterwave dashboard, set your webhook secret hash to the same value as `FLW_SECRET_HASH` and register `https://<your-domain>/api/flutterwave/webhook` as the webhook URL.
5. Test with Flutterwave test credentials before switching to live credentials.

When the ZMW gate is off, the checkout page explains that payments are disabled, and the initiate endpoint returns HTTP 503. The server validates event IDs and prices against the server-side `DEFAULT_EVENTS` catalogue; events created only in browser storage are not eligible for payment.

## API endpoints

- `GET /api/flutterwave/config` — reports whether checkout is enabled without exposing credentials.
- `POST /api/flutterwave/initiate` — accepts `{ "eventId": "e1", "quantity": 1, "email": "buyer@example.com", "firstName": "First", "lastName": "Last", "phoneNumber": "+260..." }`; creates a pending payment intent and returns the hosted checkout URL.
- `POST /api/flutterwave/verify` — accepts `{ "tx_ref": "...", "transaction_id": "..." }`; verifies the transaction with Flutterwave and returns `paid`, `pending`, or `failed`.
- `POST /api/flutterwave/webhook` — verifies Flutterwave's webhook signature and re-queries Flutterwave before updating an intent.

Payment intents are persisted in MySQL. Ticket display/profile storage continues to follow the existing browser-local booking implementation.
