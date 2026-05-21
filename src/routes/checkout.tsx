import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, any>) => ({
    event: search.event || "",
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
  const search = useSearch({ from: "/checkout" }) as any;
  const { event, quantity, price, unit_price } = search;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Checkout</h1>
          <p className="text-muted-foreground max-w-2xl">Select your preferred payment method and complete your purchase.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order summary */}
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
                  </div>
                  <span className="font-mono text-lg">ZMW {price.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 text-lg font-bold">
                <span>Total</span>
                <span className="text-accent">ZMW {price.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment methods */}
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

              <button className="w-full mt-6 py-3 bg-foreground text-background rounded-full font-bold hover:bg-accent hover:text-accent-foreground transition-colors">
                Complete Purchase
              </button>
            </div>
          </motion.div>

          {/* Sidebar */}
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
      </div>
    </main>
  );
}
