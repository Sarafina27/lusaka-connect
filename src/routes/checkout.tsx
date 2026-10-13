import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { addBooking, buildTicketDelivery, getBookingsForUser } from "@/lib/bookings";
import { useEventStore } from "@/lib/event-store";

const CLIENT_AUTH_STORAGE_KEY = "tiyenza-client-auth";
const CLIENT_USERS_STORAGE_KEY = "tiyenza-client-users";

type ClientUser = { email: string; name: string; phone: string; password?: string };

function loadClientUsers(): ClientUser[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(CLIENT_USERS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ClientUser[]) : [];
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    event: typeof search.event === "string" ? search.event : "",
    eventId: typeof search.eventId === "string" ? search.eventId : "",
    eventDate: typeof search.eventDate === "string" ? search.eventDate : "",
    eventTime: typeof search.eventTime === "string" ? search.eventTime : "",
    quantity: Number(search.quantity) || 1,
    price: Number(search.price) || 0,
    unit_price: Number(search.unit_price) || 0,
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Tiyenza Lusaka" },
      { name: "description", content: "Complete your ticket purchase on Tiyenza" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const search = useSearch({ from: "/checkout" });
  const { event, eventId, eventTime, quantity, price, unit_price } = search;
  const totalPrice = price;
  const [isComplete, setIsComplete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [paymentAvailabilityMessage, setPaymentAvailabilityMessage] = useState(
    "Checking PayChangu availability...",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingTxRef, setPendingTxRef] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<ReturnType<typeof buildTicketDelivery> | null>(
    null,
  );
  const navigate = useNavigate();

  const { buyTickets } = useEventStore();

  const verifyPayment = useCallback(
    async (txRef: string) => {
      if (typeof window === "undefined") return;
      setIsProcessing(true);
      setMessage(null);
      try {
        const response = await fetch("/api/paychangu/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tx_ref: txRef }),
        });
        const result = (await response.json()) as {
          status?: "pending" | "paid" | "failed";
          error?: string;
          email?: string;
          eventId?: string;
          eventTitle?: string;
          eventDate?: string;
          eventTime?: string;
          quantity?: number;
          unitPrice?: number;
          totalPrice?: number;
        };
        if (!response.ok) throw new Error(result.error || "Unable to verify your payment.");

        if (result.status === "pending") {
          setMessage("Your payment is still processing. Check again in a moment.");
          return;
        }
        if (result.status !== "paid" || !result.email || !result.eventId || !result.eventDate) {
          setMessage("Payment was not completed. No tickets have been issued.");
          setPendingTxRef(null);
          return;
        }

        const auth = window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY)?.trim().toLowerCase();
        if (!auth || auth !== result.email) {
          setMessage("Sign in with the email used for payment to view your tickets.");
          return;
        }

        const existing = getBookingsForUser(auth).find(
          (booking) => booking.transactionReference === txRef,
        );
        if (existing) {
          setTicketDetails({
            ticketNumber: existing.ticketNumber ?? "",
            qrCode: existing.qrCode ?? "",
            deliveryChannel: existing.deliveryChannel ?? "email",
            deliveryTarget: existing.deliveryTarget ?? auth,
          });
          setIsComplete(true);
          setPendingTxRef(null);
          return;
        }

        const user = loadClientUsers().find((item) => item.email === auth);
        const phone = user?.phone?.trim();
        const delivery = buildTicketDelivery(phone || auth, phone ? "sms" : "email");
        addBooking({
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          userEmail: auth,
          eventId: result.eventId,
          eventTitle: result.eventTitle || event,
          eventDate: result.eventDate,
          eventTime: result.eventTime || eventTime,
          quantity: result.quantity || quantity,
          unitPrice: result.unitPrice ?? unit_price,
          totalPrice: result.totalPrice ?? totalPrice,
          purchasedAt: new Date().toISOString(),
          rsvp: false,
          ticketNumber: delivery.ticketNumber,
          qrCode: delivery.qrCode,
          deliveryChannel: delivery.deliveryChannel,
          deliveryTarget: delivery.deliveryTarget,
          paymentMethod: "PayChangu",
          transactionReference: txRef,
        });
        buyTickets(result.eventId, result.quantity || quantity);
        setTicketDetails(delivery);
        setIsComplete(true);
        setPendingTxRef(null);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to verify your payment.");
      } finally {
        setIsProcessing(false);
      }
    },
    [buyTickets, event, eventTime, quantity, totalPrice, unit_price],
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/paychangu/config")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to check PayChangu availability.");
        return (await response.json()) as { available: boolean; message: string | null };
      })
      .then((availability) => {
        if (cancelled) return;
        setPaymentEnabled(availability.available);
        setPaymentAvailabilityMessage(
          availability.message ?? "Secure payment is provided by PayChangu.",
        );
      })
      .catch(() => {
        if (cancelled) return;
        setPaymentEnabled(false);
        setPaymentAvailabilityMessage(
          "PayChangu is currently unavailable. Please try again later.",
        );
      });

    const params = new URLSearchParams(window.location.search);
    const txRef = params.get("tx_ref");
    if (params.get("payment") === "cancelled") {
      setMessage("Payment was cancelled. No tickets have been issued.");
    }
    if (txRef) {
      setPendingTxRef(txRef);
      void verifyPayment(txRef);
    }

    return () => {
      cancelled = true;
    };
  }, [verifyPayment]);

  const handleCompletePurchase = async () => {
    if (typeof window === "undefined") return;

    const auth = window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY);
    if (!auth) {
      setMessage("Please sign in to complete your purchase.");
      navigate({ to: "/login" });
      return;
    }
    if (!eventId) {
      setMessage("Unable to confirm the event. Please return to the event page and try again.");
      return;
    }

    const buyer = loadClientUsers().find((user) => user.email === auth);
    if (!buyer) {
      setMessage("Your account details could not be loaded. Please sign in again.");
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    try {
      const response = await fetch("/api/paychangu/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          quantity,
          email: auth,
          firstName: buyer.name.trim().split(/\s+/)[0] || "",
          lastName: buyer.name.trim().split(/\s+/).slice(1).join(" ") || "",
        }),
      });
      const result = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to start your payment.");
      if (!result.checkoutUrl) throw new Error("PayChangu did not return a checkout link.");
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start your payment.");
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Checkout</h1>
          <p className="text-muted-foreground max-w-2xl">
            Select your preferred payment method and complete your purchase.
          </p>
        </div>

        {message ? (
          <div className="rounded-3xl border border-red-500 bg-red-500/10 p-4 text-sm text-red-600 mb-8">
            {message}
          </div>
        ) : null}

        {isComplete ? (
          <div className="rounded-3xl border border-accent bg-accent/10 p-10 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Purchase complete</h2>
            <p className="text-muted-foreground mb-6">
              Your tickets are booked and saved to your profile. Head to your profile calendar to
              view them.
            </p>
            {ticketDetails ? (
              <div className="mx-auto mb-6 max-w-md rounded-3xl border border-border bg-background/80 p-6 text-left shadow-sm">
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={ticketDetails.qrCode}
                    alt="Ticket QR code"
                    className="h-36 w-36 rounded-2xl border border-border bg-white p-2"
                  />
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Ticket number
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold">
                      {ticketDetails.ticketNumber}
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground">
                  <p>
                    Ticket details were prepared for{" "}
                    {ticketDetails.deliveryChannel === "sms" ? "your phone" : "your email"}:{" "}
                    {ticketDetails.deliveryTarget}
                  </p>
                  <p className="mt-2">Show the QR code or ticket number at the venue entrance.</p>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/profile"
                className="inline-flex justify-center rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background hover:bg-accent transition-colors"
              >
                View profile
              </Link>
              <Link
                to="/"
                className="inline-flex justify-center rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Continue browsing
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-2"
            >
              <div className="rounded-2xl border border-border bg-card/50 p-6 mb-6">
                <h2 className="text-2xl font-extrabold mb-4">Order Summary</h2>
                <div className="space-y-3 pb-4 border-b border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{event}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {quantity} ticket{quantity !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">{eventTime}</p>
                    </div>
                    <span className="font-mono text-lg">ZMW {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">ZMW {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/50 p-6">
                <h2 className="text-2xl font-extrabold mb-3">Pay securely with PayChangu</h2>
                <p className="text-sm text-muted-foreground">
                  PayChangu will show the payment methods enabled for your account, including mobile
                  money and cards.
                </p>
                <div className="mt-4 rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                  {paymentAvailabilityMessage}
                </div>

                <button
                  onClick={handleCompletePurchase}
                  disabled={!paymentEnabled || isProcessing}
                  className="w-full mt-6 py-3 bg-foreground text-background rounded-full font-bold hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {isProcessing ? "Please wait..." : "Continue to PayChangu"}
                </button>
                {pendingTxRef ? (
                  <button
                    type="button"
                    onClick={() => void verifyPayment(pendingTxRef)}
                    disabled={isProcessing}
                    className="w-full mt-3 py-3 rounded-full border border-border font-semibold disabled:opacity-50"
                  >
                    Check payment status
                  </button>
                ) : null}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-border bg-card/50 p-6">
                <h3 className="font-extrabold mb-3">Why Tiyenza?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Secure encrypted payments</li>
                  <li>✓ Instant ticket delivery</li>
                  <li>✓ 24/7 customer support</li>
                  <li>✓ Mobile money verified</li>
                  <li>✓ No hidden charges</li>
                </ul>
              </div>

              <Link
                to="/"
                className="block rounded-full border border-border px-5 py-3 text-sm font-medium text-center hover:bg-white/5 transition-colors"
              >
                Continue shopping
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
