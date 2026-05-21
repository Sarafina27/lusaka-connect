import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/organizers")({
  head: () => ({
    meta: [
      { title: "Organizers — Kuwala Lusaka" },
      { name: "description", content: "Tools and resources for event organizers, from ticket sales to payout tracking." },
    ],
  }),
  component: OrganizersPage,
});

function OrganizersPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Organizer Hub</h1>
          <p className="text-muted-foreground max-w-2xl">
            Create events, track sales, and manage payouts with Kuwala's organizer tools.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            { title: "Create an event", description: "Launch your next show, party, or private experience within minutes." },
            { title: "Manage ticket sales", description: "See live bookings and revenue from MTN MoMo, Airtel Money, and cards." },
            { title: "Organizer payouts", description: "Receive secure payouts directly to your chosen payout method." },
            { title: "Event analytics", description: "Track attendance, demand, and conversions in one dashboard." },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-border bg-card/50 p-6">
              <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Back to home
          </Link>
          <Link
            to="/payouts"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            How payouts work
          </Link>
        </div>
      </div>
    </main>
  );
}
