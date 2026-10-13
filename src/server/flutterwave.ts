import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { DEFAULT_EVENTS } from "@/lib/event-store";
import pool from "@/server/db";

const FLUTTERWAVE_API_URL = "https://api.flutterwave.com/v3";
const PAYMENT_CURRENCY = "ZMW";

type PaymentIntentRow = {
  id: string;
  tx_ref: string;
  user_email: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_time: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  status: "pending" | "paid" | "failed";
};

type FlutterwaveVerification = {
  status?: string;
  data?: {
    id?: number | string;
    tx_ref?: string;
    status?: string;
    currency?: string;
    amount?: number | string;
    flw_ref?: string;
  };
};

export class FlutterwaveError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "FlutterwaveError";
  }
}

function getAppUrl() {
  const value = process.env.APP_URL;
  if (!value) {
    throw new FlutterwaveError("Flutterwave is not configured: APP_URL is missing.", 503);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new FlutterwaveError(
      "Flutterwave is not configured: APP_URL must be an absolute URL.",
      503,
    );
  }

  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new FlutterwaveError("Flutterwave requires APP_URL to use HTTPS.", 503);
  }
  return url.origin;
}

function getSecretKey() {
  if (process.env.FLUTTERWAVE_ZMW_ENABLED !== "true") {
    throw new FlutterwaveError(
      "Flutterwave payments in ZMW are disabled until they are enabled for your merchant account.",
      503,
    );
  }
  if (process.env.FLUTTERWAVE_CURRENCY !== PAYMENT_CURRENCY) {
    throw new FlutterwaveError(
      "Flutterwave must be explicitly configured for ZMW before payments can be enabled.",
      503,
    );
  }

  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) {
    throw new FlutterwaveError("Flutterwave is not configured: FLW_SECRET_KEY is missing.", 503);
  }
  if (!process.env.FLW_SECRET_HASH) {
    throw new FlutterwaveError("Flutterwave is not configured: FLW_SECRET_HASH is missing.", 503);
  }
  return secret;
}

export function getFlutterwaveAvailability() {
  if (process.env.FLUTTERWAVE_ZMW_ENABLED !== "true") {
    return {
      available: false,
      message: "Flutterwave payments in ZMW are disabled until enabled for your merchant account.",
    };
  }
  if (process.env.FLUTTERWAVE_CURRENCY !== PAYMENT_CURRENCY) {
    return { available: false, message: "Flutterwave is not configured to charge in ZMW." };
  }
  if (!process.env.FLW_SECRET_KEY || !process.env.FLW_SECRET_HASH || !process.env.APP_URL) {
    return {
      available: false,
      message: "Flutterwave API credentials, webhook secret hash, and APP_URL must be configured.",
    };
  }

  return { available: true, message: null };
}

async function parseProviderResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    console.error(`Flutterwave API request failed with HTTP ${response.status}.`);
    throw new FlutterwaveError(
      "Flutterwave could not process the payment request. Please try again.",
      502,
    );
  }
  return (await response.json()) as T;
}

export async function initiateFlutterwaveCheckout(input: {
  eventId: string;
  quantity: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}) {
  const secretKey = getSecretKey();
  const appUrl = getAppUrl();
  const event = DEFAULT_EVENTS.find((item) => item.id === input.eventId);
  if (!event) {
    throw new FlutterwaveError("This event is not available for online checkout.", 404);
  }
  if (!Number.isSafeInteger(input.quantity) || input.quantity < 1 || input.quantity > 10) {
    throw new FlutterwaveError("Choose between 1 and 10 tickets.", 400);
  }
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new FlutterwaveError("Enter a valid email address.", 400);
  }
  const firstName = input.firstName.trim().slice(0, 80);
  const lastName = input.lastName.trim().slice(0, 80);
  if (!firstName) {
    throw new FlutterwaveError("Your first name is required.", 400);
  }

  const intentId = randomUUID();
  const txRef = `kw-${randomUUID()}`;
  const totalPrice = event.price * input.quantity;

  try {
    await pool.execute(
      `INSERT INTO payment_intents
        (id, tx_ref, user_email, event_id, event_title, event_date, event_time, quantity, unit_price, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        intentId,
        txRef,
        email,
        event.id,
        event.title,
        new Date(event.date).toISOString().slice(0, 19).replace("T", " "),
        event.time,
        input.quantity,
        event.price,
        totalPrice,
      ],
    );
  } catch (error) {
    console.error("Could not save Flutterwave payment intent.", error);
    throw new FlutterwaveError("Unable to prepare your payment. Please try again.", 500);
  }

  let providerResponse: {
    status?: string;
    data?: { link?: string };
  };
  try {
    const response = await fetch(`${FLUTTERWAVE_API_URL}/payments`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: totalPrice,
        currency: PAYMENT_CURRENCY,
        redirect_url: `${appUrl}/checkout`,
        customer: {
          email,
          name: [firstName, lastName].filter(Boolean).join(" "),
          ...(input.phoneNumber?.trim()
            ? { phonenumber: input.phoneNumber.trim().slice(0, 32) }
            : {}),
        },
        customizations: {
          title: event.title,
          description: `${input.quantity} ticket${input.quantity === 1 ? "" : "s"} for ${event.title}`,
        },
        meta: { payment_intent_id: intentId },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    providerResponse = await parseProviderResponse(response);
  } catch (error) {
    await pool.execute(
      "UPDATE payment_intents SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [intentId],
    );
    if (error instanceof FlutterwaveError) throw error;
    console.error("Flutterwave checkout request failed.", error);
    throw new FlutterwaveError("Could not connect to Flutterwave. Please try again.", 502);
  }

  const checkoutUrl = providerResponse.data?.link;
  if (providerResponse.status !== "success" || !checkoutUrl) {
    await pool.execute(
      "UPDATE payment_intents SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [intentId],
    );
    console.error("Flutterwave returned an invalid checkout response.");
    throw new FlutterwaveError(
      "Flutterwave did not return a checkout link. Please try again.",
      502,
    );
  }

  let parsedCheckoutUrl: URL;
  try {
    parsedCheckoutUrl = new URL(checkoutUrl);
  } catch {
    throw new FlutterwaveError("Flutterwave returned an invalid checkout link.", 502);
  }
  if (
    parsedCheckoutUrl.protocol !== "https:" ||
    parsedCheckoutUrl.hostname !== "checkout.flutterwave.com"
  ) {
    throw new FlutterwaveError("Flutterwave returned an untrusted checkout link.", 502);
  }

  return {
    checkoutUrl: parsedCheckoutUrl.toString(),
    txRef,
    amount: totalPrice,
    currency: PAYMENT_CURRENCY,
  };
}

async function loadIntent(txRef: string) {
  const [rows] = await pool.execute(
    `SELECT id, tx_ref, user_email, event_id, event_title, event_date, event_time, quantity,
            unit_price, total_price, status
     FROM payment_intents WHERE tx_ref = ? LIMIT 1`,
    [txRef],
  );
  return (rows as PaymentIntentRow[])[0] ?? null;
}

export async function verifyFlutterwavePayment(txRef: string, transactionId: string) {
  const secretKey = getSecretKey();
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(txRef)) {
    throw new FlutterwaveError("Invalid Flutterwave transaction reference.", 400);
  }
  if (!/^[0-9]{1,32}$/.test(transactionId)) {
    throw new FlutterwaveError("Invalid Flutterwave transaction ID.", 400);
  }

  const intent = await loadIntent(txRef);
  if (!intent) {
    throw new FlutterwaveError("Payment reference not found.", 404);
  }
  if (intent.status === "failed") {
    return { status: "failed" as const };
  }

  let providerResponse: FlutterwaveVerification;
  try {
    const response = await fetch(
      `${FLUTTERWAVE_API_URL}/transactions/${encodeURIComponent(transactionId)}/verify`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
        signal: AbortSignal.timeout(15_000),
      },
    );
    providerResponse = await parseProviderResponse<FlutterwaveVerification>(response);
  } catch (error) {
    if (error instanceof FlutterwaveError) throw error;
    console.error("Flutterwave verification request failed.", error);
    throw new FlutterwaveError("Could not verify the payment with Flutterwave.", 502);
  }

  const payment = providerResponse.data;
  if (!payment || String(payment.id) !== transactionId || payment.tx_ref !== txRef) {
    throw new FlutterwaveError("Flutterwave returned a mismatched transaction reference.", 502);
  }

  const receivedAmount = Number(payment.amount);
  if (payment.status === "successful") {
    if (payment.currency !== PAYMENT_CURRENCY || receivedAmount !== Number(intent.total_price)) {
      throw new FlutterwaveError("Payment amount or currency does not match this order.", 409);
    }

    await pool.execute(
      `UPDATE payment_intents
       SET status = 'paid', provider_reference = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'pending'`,
      [payment.flw_ref ?? transactionId, intent.id],
    );

    return {
      status: "paid" as const,
      email: intent.user_email,
      eventId: intent.event_id,
      eventTitle: intent.event_title,
      eventDate: new Date(intent.event_date).toISOString(),
      eventTime: intent.event_time,
      quantity: Number(intent.quantity),
      unitPrice: Number(intent.unit_price),
      totalPrice: Number(intent.total_price),
      txRef,
      currency: PAYMENT_CURRENCY,
    };
  }

  if (payment.status === "failed" || payment.status === "cancelled") {
    await pool.execute(
      `UPDATE payment_intents SET status = 'failed', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'pending'`,
      [intent.id],
    );
    return { status: "failed" as const };
  }

  return { status: "pending" as const };
}

function signaturesMatch(expected: Buffer, provided: string, encoding: "base64" | "hex") {
  let actual: Buffer;
  try {
    actual = Buffer.from(provided, encoding);
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(expected, actual);
}

export async function verifyFlutterwaveWebhook(rawBody: string, request: Request) {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash) {
    throw new FlutterwaveError("Flutterwave webhook is not configured.", 503);
  }

  const signature = request.headers.get("flutterwave-signature");
  const legacyHash = request.headers.get("verif-hash");
  const expectedSignature = createHmac("sha256", secretHash).update(rawBody).digest();
  const validSignature =
    (signature !== null && signaturesMatch(expectedSignature, signature, "base64")) ||
    (legacyHash !== null &&
      Buffer.byteLength(legacyHash) === Buffer.byteLength(secretHash) &&
      timingSafeEqual(Buffer.from(legacyHash), Buffer.from(secretHash)));

  if (!validSignature) {
    throw new FlutterwaveError("Invalid Flutterwave webhook signature.", 401);
  }

  let payload: {
    data?: { id?: unknown; tx_ref?: unknown };
  };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    throw new FlutterwaveError("Invalid Flutterwave webhook payload.", 400);
  }

  const transactionId = payload.data?.id;
  const txRef = payload.data?.tx_ref;
  if (
    (typeof transactionId !== "string" && typeof transactionId !== "number") ||
    typeof txRef !== "string"
  ) {
    throw new FlutterwaveError("Webhook is missing the transaction ID or reference.", 400);
  }

  return verifyFlutterwavePayment(txRef, String(transactionId));
}
