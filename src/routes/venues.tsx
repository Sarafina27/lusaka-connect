import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/venues")({
  head: () => ({
    meta: [
      { title: "Venues — Kuwala Lusaka" },
      { name: "description", content: "Browse verified venues and event spaces throughout Lusaka." },
    ],
  }),
  component: VenuesPage,
});

function VenuesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Venues</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore premium event spaces, lounges, and rooftop venues across Lusaka with verified pricing and availability.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            { name: "Manda Hill Rooftop", location: "Manda Hill", price: "ZMW 1,500 / night" },
            { name: "Leopard's Hill Lounge", location: "Leopard's Hill", price: "ZMW 1,200 / night" },
            { name: "Rhodes Park Garden", location: "Rhodes Park", price: "ZMW 1,350 / night" },
            { name: "Showgrounds Hall", location: "Showgrounds", price: "ZMW 1,800 / night" },
          ].map((venue) => (
            <div key={venue.name} className="rounded-3xl border border-border bg-card/50 p-6">
              <h2 className="text-2xl font-semibold mb-2">{venue.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{venue.location}</p>
              <p className="text-sm font-semibold">{venue.price}</p>
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
            to="/events"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            View events
          </Link>
        </div>
      </div>
    </main>
  );
}
