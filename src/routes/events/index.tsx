import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — Kuwala Lusaka" },
      { name: "description", content: "Browse upcoming events in Lusaka, filter by category, and book the best nights out." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">All Events</h1>
        <p className="text-muted-foreground max-w-2xl">
          Discover the latest concerts, parties, and night experiences across Lusaka. Browse by category, date, and venue.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[
          {
            title: "Nightlife",
            description: "Stay updated on the best nightlife and DJ sets across the city.",
            path: "/events/nightlife",
          },
          {
            title: "Concerts",
            description: "Find the hottest concerts and stage shows happening this week.",
            path: "/events/concerts",
          },
          {
            title: "Private Events",
            description: "Book curated private events, launch parties, and exclusive gatherings.",
            path: "/events/private",
          },
          {
            title: "Chill & Daytime",
            description: "Relax with rooftop mixers, lounge sessions, and daytime socials.",
            path: "/events/chill",
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link
              to={card.path}
              className="block rounded-3xl border border-border bg-card/50 p-6 hover:border-accent/40 hover:bg-card/70 transition-colors cursor-pointer h-full"
            >
              <h2 className="text-2xl font-semibold mb-3">{card.title}</h2>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
        >
          Back to home
        </Link>
        <Link
          to="/venues"
          className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Browse venues
        </Link>
      </div>
    </div>
  );
}
