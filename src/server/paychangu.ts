import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { DEFAULT_EVENTS } from "@/lib/event-store";
import pool from "@/server/db";

const PAYCHANGU_API_URL = "https://api.paychangu.com";
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

type PayChanguVerification = {
  status?: string;
  data?: {
    tx_ref?: string;
    status?: string;
    currency?: string;
    amount?: number | string;
    reference?: string;
  };
};

export class PayChanguError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "PayChanguError";
  }
}

function getAppUrl() {
  const value = process.env.APP_URL;
  if (!value) {
    throw new PayChanguError("PayChangu is not configured: APP_URL is missing.", 503);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new PayChanguError("PayChangu is not configured: APP_URL must be an absolute URL.", 503);
  }

  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new PayChanguError("PayChangu requires APP_URL to use HTTPS.", 503);
  }
  return url.origin;
}

function getSecretKey() {
  if (process.env.PAYCHANGU_ZMW_ENABLED !== "true") {
    throw new PayChanguError(
      "PayChangu payments in ZMW are disabled until ZMW support is confirmed.",
      503,
    );
  }
  if (process.env.PAYCHANGU_CURRENCY !== PAYMENT_CURRENCY) {
    throw new PayChanguError(
      "PayChangu must be explicitly configured for ZMW before payments can be enabled.",
      503,
    );
  }

  const secret = process.env.PAYCHANGU_SECRET_KEY;
  if (!secret) {
    throw new PayChanguError("PayChangu is not configured: PAYCHANGU_SECRET_KEY is missing.", 503);
  }
  return secret;
}

export function getPayChanguAvailability() {
  if (process.env.PAYCHANGU_ZMW_ENABLED !== "true") {
    return {
      available: false,
      message:
        "PayChangu payments are disabled until ZMW support is confirmed for your merchant account.",
    };
  }
  if (process.env.PAYCHANGU_CURRENCY !== PAYMENT_CURRENCY) {
    return { available: false, message: "PayChangu is not configured to charge in ZMW." };
  }
  if (!process.env.PAYCHANGU_SECRET_KEY || !process.env.APP_URL) {
    return {
      available: false,
      message: "PayChangu API credentials and APP_URL must be configured.",
    };
  }

  return { available: true, message: null };
}

async function parseProviderResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    console.error(`PayChangu API request failed with HTTP ${response.status}.`);
    throw new PayChanguError(
      "PayChangu could not process the payment request. Please try again.",
      502,
    );
  }
  return (await response.json()) as T;
}

export async function initiatePayChanguCheckout(input: {
  eventId: string;
  quantity: number;
  email: string;
  firstName: string;
  lastName: string;
}) {
  const secretKey = getSecretKey();
  const appUrl = getAppUrl();
  const event = DEFAULT_EVENTS.find((item) => item.id === input.eventId);
  if (!event) {
    throw new PayChanguError("This event is not available for online checkout.", 404);
  }
  if (!Number.isSafeInteger(input.quantity) || input.quantity < 1 || input.quantity > 10) {
    throw new PayChanguError("Choose between 1 and 10 tickets.", 400);
  }
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new PayChanguError("Enter a valid email address.", 400);
  }
  const firstName = input.firstName.trim().slice(0, 80);
  const lastName = input.lastName.trim().slice(0, 80);
  if (!firstName) {
    throw new PayChanguError("Your first name is required.", 400);
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
    console.error("Could not save PayChangu payment intent.", error);
    throw new PayChanguError("Unable to prepare your payment. Please try again.", 500);
  }

  let providerResponse: {
    status?: string;
    data?: { checkout_url?: string };
  };
  try {
    const response = await fetch(`${PAYCHANGU_API_URL}/payment`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalPrice,
        currency: PAYMENT_CURRENCY,
        email,
        first_name: firstName,
        last_name: lastName,
        callback_url: `${appUrl}/checkout`,
        return_url: `${appUrl}/checkout?payment=cancelled`,
        tx_ref: txRef,
        customization: {
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
    if (error instanceof PayChanguError) throw error;
    console.error("PayChangu checkout request failed.", error);
    throw new PayChanguError("Could not connect to PayChangu. Please try again.", 502);
  }

  const checkoutUrl = providerResponse.data?.checkout_url;
  if (providerResponse.status !== "success" || !checkoutUrl) {
    await pool.execute(
      "UPDATE payment_intents SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [intentId],
    );
    console.error("PayChangu returned an invalid checkout response.");
    throw new PayChanguError("PayChangu did not return a checkout link. Please try again.", 502);
  }

  let parsedCheckoutUrl: URL;
  try {
    parsedCheckoutUrl = new URL(checkoutUrl);
  } catch {
    throw new PayChanguError("PayChangu returned an invalid checkout link.", 502);
  }
  if (
    parsedCheckoutUrl.protocol !== "https:" ||
    parsedCheckoutUrl.hostname !== "checkout.paychangu.com"
  ) {
    throw new PayChanguError("PayChangu returned an untrusted checkout link.", 502);
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

export async function verifyPayChanguPayment(txRef: string) {
  const secretKey = getSecretKey();
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(txRef)) {
    throw new PayChanguError("Invalid PayChangu transaction reference.", 400);
  }

  const intent = await loadIntent(txRef);
  if (!intent) {
    throw new PayChanguError("Payment reference not found.", 404);
  }
  if (intent.status === "failed") {
    return { status: "failed" as const };
  }

  let providerResponse: PayChanguVerification;
  try {
    const response = await fetch(
      `${PAYCHANGU_API_URL}/verify-payment/${encodeURIComponent(txRef)}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
        signal: AbortSignal.timeout(15_000),
      },
    );
    providerResponse = await parseProviderResponse<PayChanguVerification>(response);
  } catch (error) {
    if (error instanceof PayChanguError) throw error;
    console.error("PayChangu verification request failed.", error);
    throw new PayChanguError("Could not verify the payment with PayChangu.", 502);
  }

  const payment = providerResponse.data;
  if (!payment || payment.tx_ref !== txRef) {
    throw new PayChanguError("PayChangu returned a mismatched transaction reference.", 502);
  }

  const receivedAmount = Number(payment.amount);
  if (payment.status === "success") {
    if (payment.currency !== PAYMENT_CURRENCY || receivedAmount !== Number(intent.total_price)) {
      throw new PayChanguError("Payment amount or currency does not match this order.", 409);
    }

    await pool.execute(
      `UPDATE payment_intents
       SET status = 'paid', provider_reference = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'pending'`,
      [payment.reference ?? null, intent.id],
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

  if (payment.status === "failed") {
    await pool.execute(
      `UPDATE payment_intents SET status = 'failed', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'pending'`,
      [intent.id],
    );
    return { status: "failed" as const };
  }

  return { status: "pending" as const };
}

export async function verifyPayChanguWebhook(rawBody: string, signature: string | null) {
  const webhookSecret = process.env.PAYCHANGU_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new PayChanguError("PayChangu webhook is not configured.", 503);
  }
  if (!signature || !/^[a-fA-F0-9]{64}$/.test(signature)) {
    throw new PayChanguError("Invalid PayChangu webhook signature.", 401);
  }

  const expectedSignature = createHmac("sha256", webhookSecret).update(rawBody).digest();
  const actualSignature = Buffer.from(signature, "hex");
  if (!timingSafeEqual(expectedSignature, actualSignature)) {
    throw new PayChanguError("Invalid PayChangu webhook signature.", 401);
  }

  let payload: { tx_ref?: unknown; data?: { tx_ref?: unknown } };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    throw new PayChanguError("Invalid PayChangu webhook payload.", 400);
  }

  const txRef = payload.tx_ref ?? payload.data?.tx_ref;
  if (typeof txRef !== "string") {
    throw new PayChanguError("Webhook is missing the transaction reference.", 400);
  }
  return verifyPayChanguPayment(txRef);
}
