import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/events/private")({
  head: () => ({
    meta: [
      { title: "Private Events — Kuwala Lusaka" },
      { name: "description", content: "Exclusive private events and gatherings in Lusaka" },
    ],
  }),
  component: PrivateEventsPage,
});

function PrivateEventsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Private Events</h1>
          <p className="text-muted-foreground max-w-2xl">
            Exclusive private parties, corporate events, and curated gatherings for invitation holders.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            { title: "Kuwala x Lush Launch", venue: "Riverside", time: "19:00", price: "Invite Only" },
            { title: "VIP Networking Mixer", venue: "Manda Hill", time: "18:00", price: "Invite Only" },
            { title: "Private Rooftop Soirée", venue: "Cairo Road", time: "20:00", price: "Invite Only" },
            { title: "Exclusive Members Night", venue: "The Plaza", time: "21:00", price: "Invite Only" },
          ].map((event) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-border bg-card/50 p-6 hover:border-accent/40 hover:bg-card/70 transition-colors cursor-pointer"
            >
              <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">{event.venue} · {event.time}</p>
              <p className="text-lg font-bold text-accent">{event.price}</p>
            </motion.div>
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
            View all categories
          </Link>
        </div>
      </div>
    </main>
  );
}
