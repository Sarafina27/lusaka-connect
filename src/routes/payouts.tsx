import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/payouts")({
  head: () => ({
    meta: [
      { title: "Payouts — Kuwala Lusaka" },
      { name: "description", content: "Learn how Kuwala organizers receive secure payouts for ticket sales." },
    ],
  }),
  component: PayoutsPage,
});

function PayoutsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Organizer Payouts</h1>
          <p className="text-muted-foreground max-w-2xl">
            Kuwala pays organizers securely through MTN MoMo, Airtel Money, or bank transfers, with verified settlement tracking.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/50 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Fast, verified payouts</h2>
            <p className="text-sm text-muted-foreground">
              Track your sales and receive funds quickly after each event, with full payout transparency.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Choose your payout method</h2>
            <p className="text-sm text-muted-foreground">
              Select the option that works for you: MTN MoMo, Airtel Money, or bank transfer.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Secure settlement</h2>
            <p className="text-sm text-muted-foreground">
              Payment details are encrypted and settlements are tracked on your dashboard so you know exactly when money arrives.
            </p>
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Back to home
          </Link>
          <Link
            to="/organizers"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Organizer tools
          </Link>
        </div>
      </div>
    </main>
  );
}
