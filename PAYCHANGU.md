# PayChangu checkout setup

The checkout uses PayChangu Standard Checkout. The secret key stays on the server; the browser only receives PayChangu's hosted checkout URL. A ticket is added to the user's profile only after the server verifies the transaction reference, amount, and currency with PayChangu.

## ZMW safety gate

The current checkout is priced in ZMW. PayChangu's published Standard Checkout documentation lists MWK and USD, so this integration deliberately refuses to initiate payments unless ZMW support has been confirmed for the merchant account.

After PayChangu confirms ZMW support:

1. Configure the environment variables shown in `.env.example` on the server/deployment platform. Set `PAYCHANGU_ZMW_ENABLED=true` only after that confirmation, and keep `PAYCHANGU_CURRENCY=ZMW`.
2. Set `APP_URL` to the public HTTPS origin of the deployed application.
3. Run the updated `database/schema.sql` so the `payment_intents` table exists.
4. In the PayChangu dashboard, register `https://<your-domain>/api/paychangu/webhook` as the webhook URL and set `PAYCHANGU_WEBHOOK_SECRET` to the dashboard's webhook secret.
5. Test with PayChangu test credentials before switching to live credentials.

When the ZMW gate is off, the checkout page explains that payments are disabled, and the initiate endpoint returns HTTP 503. The server validates events and prices against the server-side `DEFAULT_EVENTS` catalogue; events created only in browser storage are not eligible for payment.

## API endpoints

- `GET /api/paychangu/config` — reports whether checkout is enabled without exposing credentials.
- `POST /api/paychangu/initiate` — accepts `{ "eventId": "e1", "quantity": 1, "email": "buyer@example.com", "firstName": "First", "lastName": "Last" }`; creates a pending payment intent and returns the hosted checkout URL.
- `POST /api/paychangu/verify` — accepts `{ "tx_ref": "..." }`; verifies the transaction with PayChangu and returns `paid`, `pending`, or `failed`.
- `POST /api/paychangu/webhook` — verifies PayChangu's `Signature` HMAC and re-queries PayChangu before updating an intent.

Payment intents are persisted in MySQL. Ticket display/profile storage continues to follow the existing browser-local booking implementation.
