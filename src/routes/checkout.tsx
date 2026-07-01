import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { addBooking } from "@/lib/bookings";

const CLIENT_AUTH_STORAGE_KEY = "kuwala-client-auth";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, any>) => ({
    event: search.event || "",
    eventId: search.eventId || "",
    eventDate: search.eventDate || "",
    eventTime: search.eventTime || "",
    quantity: Number(search.quantity) || 1,
    price: Number(search.price) || 0,
    unit_price: Number(search.unit_price) || 0,
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Kuwala Lusaka" },
      { name: "description", content: "Complete your ticket purchase on Kuwala" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  // useSearch's generic isn't the Router type here; coerce search values safely.
  const search = useSearch({ from: "/checkout" });
  const s = search as Record<string, any>;
  const { event, eventId, eventDate, eventTime } = s;
  const quantity = Number(s.quantity ?? 1);
  const totalPrice = Number(s.price ?? 0);
  const unit_price = Number(s.unit_price ?? 0);
  const [isComplete, setIsComplete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCompletePurchase = () => {
    if (typeof window === "undefined") return;

    const auth = window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY);
    if (!auth) {
      setMessage("Please sign in to complete your purchase.");
      navigate({ to: "/login" });
      return;
    }

    if (!eventId || !eventDate) {
      setMessage("Unable to confirm your booking. Please try again.");
      return;
    }

    addBooking({
      id: typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userEmail: auth,
      eventId,
      eventTitle: event,
      eventDate,
      eventTime,
      quantity,
      unitPrice: unit_price,
      totalPrice: totalPrice,
      purchasedAt: new Date().toISOString(),
      rsvp: false,
    });

    setIsComplete(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Checkout</h1>
          <p className="text-muted-foreground max-w-2xl">Select your preferred payment method and complete your purchase.</p>
        </div>

        {message ? (
          <div className="rounded-3xl border border-red-500 bg-red-500/10 p-4 text-sm text-red-600 mb-8">
            {message}
          </div>
        ) : null}

        {isComplete ? (
          <div className="rounded-3xl border border-accent bg-accent/10 p-10 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Purchase complete</h2>
            <p className="text-muted-foreground mb-6">Your tickets are booked and saved to your profile. Head to your profile calendar to view them.</p>
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
                      <p className="text-sm text-muted-foreground">Quantity: {quantity} ticket{quantity !== 1 ? 's' : ''}</p>
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
                <h2 className="text-2xl font-extrabold mb-6">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { name: "MTN MoMo", desc: "Mobile money transfer", icon: "📱", active: true },
                    { name: "Airtel Money", desc: "Airtel mobile money", icon: "📞", active: true },
                    { name: "Credit/Debit Card", desc: "Visa, Mastercard", icon: "💳", active: true },
                    { name: "Bank Transfer", desc: "Direct bank deposit", icon: "🏦", active: false },
                  ].map((method) => (
                    <div
                      key={method.name}
                      className={`rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                        method.active
                          ? "border-accent bg-accent/5 hover:border-accent hover:bg-accent/10"
                          : "border-border bg-background/50 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <p className="font-semibold text-lg">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.desc}</p>
                          </div>
                        </div>
                        {method.active && (
                          <input
                            type="radio"
                            name="payment"
                            defaultChecked={method.name === "MTN MoMo"}
                            className="mt-1"
                          />
                        )}
                        {!method.active && <span className="text-xs text-muted-foreground">Coming soon</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCompletePurchase}
                  className="w-full mt-6 py-3 bg-foreground text-background rounded-full font-bold hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Complete Purchase
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-border bg-card/50 p-6">
                <h3 className="font-extrabold mb-3">Why Kuwala?</h3>
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
