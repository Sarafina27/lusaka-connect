import { createFileRoute, Link } from "@tanstack/react-router";

const analyticsCards = [
  { label: "Live events", value: "12", detail: "Across Lusaka this week" },
  { label: "Tickets sold", value: "1,248", detail: "Across mobile money and cards" },
  { label: "Revenue ready", value: "ZMW 84k", detail: "Payouts queued for settlement" },
  { label: "Check-in rate", value: "93%", detail: "Verified attendees today" },
];

const toolCards = [
  {
    title: "Create and publish",
    description: "Launch a new event in minutes, add ticket tiers, and share your listing with guest-ready details.",
    to: "/admin",
    cta: "Open event manager",
  },
  {
    title: "Track sales live",
    description: "Monitor bookings, capacity, and ticket demand in real time from one organizer dashboard.",
    to: "/admin",
    cta: "Review inventory",
  },
  {
    title: "Handle payouts",
    description: "Choose your preferred payout method and track when funds arrive after each event.",
    to: "/payouts",
    cta: "See payout options",
  },
  {
    title: "Share event insights",
    description: "Keep guests informed with clear event details, entry instructions, and post-event summaries.",
    to: "/events",
    cta: "View event pages",
  },
];

const checklist = [
  "Confirm venue access and setup timing",
  "Upload event visuals and a short description",
  "Set ticket tiers, capacity, and sold inventory",
  "Share payout details and settlement preferences",
];

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
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-mono uppercase tracking-[0.25em] text-accent">Organizer tools</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Run your event operations without the friction.</h1>
            <p className="mt-4 text-muted-foreground">
              Create events, adjust inventory, and keep payouts clear from one streamlined dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Open event manager
            </Link>
            <Link
              to="/payouts"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Review payouts
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {analyticsCards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-border bg-card/50 p-5">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{card.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {toolCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-border bg-card/50 p-6">
                <h2 className="text-xl font-semibold">{card.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{card.description}</p>
                <Link to={card.to} className="mt-5 inline-flex text-sm font-semibold text-accent hover:underline">
                  {card.cta} →
                </Link>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-card/50 p-6">
            <p className="text-sm font-mono uppercase tracking-[0.25em] text-accent">Next launch checklist</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/40 px-3 py-3">
                  <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3">
              <Link to="/" className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors">
                Back home
              </Link>
              <Link to="/payouts" className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-colors">
                Payout guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
