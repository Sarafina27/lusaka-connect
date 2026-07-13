import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEventStore, EventCategory, formatTicketPrice, getTicketsAvailable, getTicketProgressPercent } from "@/lib/event-store";

interface EventCategoryPageProps {
  category: EventCategory;
  title: string;
  description: string;
}

export default function EventCategoryPage({ category, title, description }: EventCategoryPageProps) {
  const { events } = useEventStore();
  const navigate = useNavigate();

  const categoryEvents = events.filter((event) => event.category === category);

  const handleBuyTicket = (event: (typeof events)[0]) => {
    navigate({
      to: "/checkout",
      search: {
        event: event.title,
        eventId: event.id,
        eventDate: event.date,
        eventTime: event.time,
        quantity: 1,
        price: event.price,
        unit_price: event.price,
      },
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{title}</h1>
          <p className="text-muted-foreground max-w-2xl">{description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {categoryEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-border bg-card/50 p-6 hover:border-accent/40 hover:bg-card/70 transition-colors"
            >
              <div className="mb-5">
                <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
                <p className="text-sm text-muted-foreground mb-3">{event.venue} · {event.when}</p>
                <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border px-3 py-1">{getTicketsAvailable(event)} tickets left</span>
                  <span className="rounded-full border border-border px-3 py-1">{getTicketProgressPercent(event)}% sold</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">Price</span>
                  <span className="text-accent font-bold">{formatTicketPrice(event.price)}</span>
                </div>
                <button
                  onClick={() => handleBuyTicket(event)}
                  className="w-full rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Buy ticket
                </button>
              </div>
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
