import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  EventData,
  formatTicketPrice,
  getTicketProgressInterval,
  getTicketProgressPercent,
  getTicketsAvailable,
  useEventStore,
} from "@/lib/event-store";
import eventWarehouse from "@/assets/event-warehouse.jpg";
import eventSunset from "@/assets/event-sunset.jpg";
import eventConcert from "@/assets/event-concert.jpg";

const CLIENT_AUTH_STORAGE_KEY = "kuwala-client-auth";
const CLIENT_USERS_STORAGE_KEY = "kuwala-client-users";

export const Route = createFileRoute("/")({
  component: Index,
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

type Event = EventData;

function Nav() {
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAuthEmail(window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY));
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CLIENT_AUTH_STORAGE_KEY);
    }
    navigate({ to: "/login" });
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-extrabold tracking-tighter text-xl italic uppercase">Kuwala</span>
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/events" className="text-foreground transition-colors">Events</Link>
            <Link to="/venues" className="hover:text-foreground transition-colors">Venues</Link>
            <Link to="/calendar" className="hover:text-foreground transition-colors">Calendar</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {authEmail ? (
            <>
              <Link to="/profile" className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-full border border-border hover:bg-white/5 transition-colors">Profile</Link>
              <button onClick={handleLogout} className="text-sm font-semibold px-5 py-2 rounded-full bg-destructive text-background hover:opacity-90 transition-colors">Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 h-120 w-120 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 60%)", opacity: 0.12 }}
      />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border text-xs font-mono text-accent mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            LUSAKA LIVE TONIGHT
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[0.92]">
            Discover the <br />
            Pulse of <span className="text-accent">Zambia.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
            From midnight raves in Rhodes Park to sunset chill spots in Leopard&apos;s Hill.
            Verified access to the city&apos;s finest experiences — book with mobile money or card.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/5 border border-border rounded-full px-4 py-3 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Category:</span>
              <div className="flex gap-2 flex-wrap">
                {["Nightlife", "Concerts", "Chill Spots", "Private"].map((c, i) => (
                  <button
                    key={c}
                    className={
                      i === 0
                        ? "px-3 py-1 rounded-full bg-foreground text-background text-xs font-bold"
                        : "px-3 py-1 rounded-full border border-border text-xs font-medium hover:border-white/20"
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function EventDetailModal({
  event,
  quantity,
  onQuantityChange,
  onClose,
  onCheckout,
}: {
  event: Event | null;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onClose: () => void;
  onCheckout: () => void;
}) {
  if (!event) return null;

  const available = getTicketsAvailable(event);
  const soldPercent = getTicketProgressPercent(event);
  const totalPrice = event.price * quantity;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-background border border-border rounded-2xl max-w-2xl w-full overflow-hidden"
      >
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-background/80 backdrop-blur rounded-full p-2 hover:bg-background transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-block mb-3">
                <span className="bg-accent/15 text-accent text-xs font-mono px-2 py-1 rounded">
                  {event.badge.toUpperCase()}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold mb-2">{event.title}</h2>
              <p className="text-muted-foreground text-sm mb-4">{event.when}</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {event.description || "Experience an unforgettable night in Lusaka."}
              </p>

              <div className="bg-card/50 border border-border rounded-xl p-4 mb-6">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-1">Location</p>
                <p className="font-semibold text-lg">{event.venue}</p>
              </div>
            </div>

            {/* Ticket selection & checkout */}
            <div>
              <div className="flex items-center justify-between mb-4 p-4 bg-card/50 rounded-xl border border-border">
                <span className="text-sm font-medium">Tickets</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                    className="rounded-full p-2 bg-accent/10 hover:bg-accent/20 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => onQuantityChange(quantity + 1)}
                    className="rounded-full p-2 bg-accent/10 hover:bg-accent/20 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-4 text-sm">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>{getTicketProgressInterval(event)}% sold</span>
                  <span>{available} tickets left</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${soldPercent}%` }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per ticket</span>
                  <span>{formatTicketPrice(event.price)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-accent">{formatTicketPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3 bg-foreground text-background rounded-full font-bold hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TrendingEvents({
  events,
  onEventClick,
}: {
  events: Event[];
  onEventClick: (event: Event) => void;
}) {
  return (
    <section id="events" className="py-12 bg-white/2 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          {...fadeUp}
          className="flex justify-between items-end mb-10"
        >
          <h2 className="text-3xl font-extrabold tracking-tight">Trending Events</h2>
          <Link to="/events" className="text-sm font-mono text-accent hover:underline underline-offset-4">
            View All →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((e, i) => (
            <motion.article
              key={e.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              onClick={() => onEventClick(e)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-4/5 rounded-2xl overflow-hidden mb-4 ring-1 ring-white/10">
                <img
                  src={e.image}
                  alt={e.title}
                  width={800}
                  height={1024}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/0 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-foreground text-[10px] font-mono px-2 py-1 rounded">
                    {e.badge.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start mb-1 gap-3">
                <div>
                  <h3 className="font-bold text-lg group-hover:text-accent transition-colors">
                    {e.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{e.venue} · {e.when}</p>
                </div>
                <span className="font-mono text-accent shrink-0">{e.price}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <Badge variant="secondary">{e.badge}</Badge>
                <span>{getTicketProgressInterval(e)}% sold</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiquorAndVenues() {
  return (
    <section className="py-16 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Liquor stores */}
        <motion.div {...fadeUp} id="liquor">
          <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-6">
            Refuel · Nearby Liquor Stores
          </h4>
          <div className="space-y-3">
            {[
              { name: "Manda Hill Bottle Shop", area: "1.2 km · Rhodes Park", open: true, hours: "Open until 00:00" },
              { name: "Pick n Pay Liquor", area: "2.8 km · Woodlands", open: false, hours: "Closed" },
              { name: "Cheers Woodlands", area: "3.4 km · Woodlands", open: true, hours: "Open until 22:00" },
            ].map((s) => (
              <div
                key={s.name}
                className={
                  "flex items-center justify-between p-4 rounded-xl border border-border hover:border-white/20 transition-colors " +
                  (s.open ? "" : "opacity-60")
                }
              >
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.area}</p>
                </div>
                <span
                  className={
                    "px-2 py-1 rounded text-[10px] font-bold " +
                    (s.open
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400")
                  }
                >
                  {s.hours.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Venue marketplace */}
        <motion.div
          {...fadeUp}
          id="venues"
          className="bg-white/5 rounded-3xl p-8 border border-border flex flex-col justify-between"
        >
          <div>
            <h4 className="text-2xl font-extrabold tracking-tight mb-2">Hosting an event?</h4>
            <p className="text-muted-foreground text-sm mb-6">
              Discover premium spaces — boutique rooftops, garden estates, lounges and apartments
              across Lusaka. Verified hosts. Transparent pricing.
            </p>
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-background bg-zinc-700" />
                <div className="w-8 h-8 rounded-full border-2 border-background bg-zinc-600" />
                <div className="w-8 h-8 rounded-full border-2 border-background bg-zinc-500" />
              </div>
              <p className="text-xs text-muted-foreground">12+ venues recently added</p>
            </div>
          </div>
          <Link to="/venues" className="mt-8 w-full py-4 bg-foreground text-background rounded-xl font-bold text-center hover:bg-accent hover:text-accent-foreground transition-colors">
            Browse Venues from ZMW 1,200 / night
          </Link>
        </motion.div>
      </div>
    </section>
  );
}


function CTA() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          Sell tickets the right way.
        </motion.h2>
        <motion.p {...fadeUp} className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Verified payouts via Mobile Money or Card. Encrypted QR tickets. Live entry scanning.
          Real analytics for every Lusaka event.
        </motion.p>
        <motion.div {...fadeUp} className="flex flex-wrap gap-3 justify-center">
          <Link to="/payouts" className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-bold text-center hover:bg-accent hover:text-accent-foreground transition-colors">
            View event management tools
          </Link>
          <Link to="/payouts" className="px-6 py-3 rounded-full border border-border text-sm font-medium text-center hover:bg-white/5 transition-colors">
            How payouts work
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black/40 border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <span className="font-extrabold tracking-tighter text-2xl italic uppercase mb-4 block">
            Kuwala
          </span>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
            Lusaka&apos;s social discovery platform. Secure ticketing, verified venues, and
            the best night of your life — powered by mobile money.
          </p>
        </div>
        <div>
          <h5 className="text-xs font-mono mb-6 uppercase tracking-widest">Platform</h5>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-accent transition-colors">How it works</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">List a venue</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Become a partner</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Security & fraud</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-mono mb-6 uppercase tracking-widest">Trust</h5>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-accent transition-colors">Refund policy</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Terms of service</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Privacy policy</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Contact support</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
          © 2026 Kuwala Experiences Ltd · Lusaka, Zambia
        </p>
        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
          Visa · Mastercard · MTN MoMo · Airtel Money
        </p>
      </div>
    </footer>
  );
}

const CLIENT_AUTH_STORAGE_KEY = "kuwala-client-auth";

function Index() {
  const { events } = useEventStore();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [authorized, setAuthorized] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return Boolean(window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY));
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY);
    if (!saved) {
      navigate({ to: "/login" });
      return;
    }
    setAuthorized(true);
  }, [navigate]);

  if (authorized === null) {
    return null;
  }

  const handleCheckout = () => {
    if (selectedEvent) {
      const ticketPrice = selectedEvent.price;
      navigate({
        to: "/checkout",
        search: {
          event: selectedEvent.title,
          quantity,
          price: ticketPrice * quantity,
          unit_price: ticketPrice,
        } as any,
      });
      setSelectedEvent(null);
      setQuantity(1);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <TrendingEvents events={events} onEventClick={(e) => { setSelectedEvent(e); setQuantity(1); }} />
      <LiquorAndVenues />
      <CTA />
      <Footer />

      <EventDetailModal
        event={selectedEvent}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onClose={() => setSelectedEvent(null)}
        onCheckout={handleCheckout}
      />
    </main>
  );
}
