import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import eventWarehouse from "@/assets/event-warehouse.jpg";
import eventSunset from "@/assets/event-sunset.jpg";
import eventConcert from "@/assets/event-concert.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

type Event = {
  title: string;
  venue: string;
  when: string;
  price: string;
  badge: string;
  image: string;
};

const trendingEvents: Event[] = [
  {
    title: "Warehouse Sessions",
    venue: "Rhodes Park",
    when: "Tonight · 22:00",
    price: "ZMW 150",
    badge: "MoMo Accepted",
    image: eventWarehouse,
  },
  {
    title: "Sunset Soirée at Latitude",
    venue: "Leopard's Hill",
    when: "Sat · 16:00",
    price: "ZMW 450",
    badge: "Limited Tickets",
    image: eventSunset,
  },
  {
    title: "Echoes of the Copperbelt",
    venue: "Showgrounds",
    when: "Sun · 19:00",
    price: "ZMW 200",
    badge: "Verified Organizer",
    image: eventConcert,
  },
];

function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-extrabold tracking-tighter text-xl italic uppercase">
            Kuwala
          </span>
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#events" className="text-foreground transition-colors">Events</a>
            <a href="#venues" className="hover:text-foreground transition-colors">Venues</a>
            <a href="#liquor" className="hover:text-foreground transition-colors">Liquor Stores</a>
            <a href="#organizers" className="hover:text-foreground transition-colors">Organizers</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-full border border-border hover:bg-white/5 transition-colors">
            Organizer Login
          </button>
          <button className="text-sm font-semibold px-5 py-2 rounded-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-colors">
            Sign Up
          </button>
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
        className="pointer-events-none absolute -top-40 -right-32 h-[480px] w-[480px] rounded-full blur-3xl"
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

function TrendingEvents() {
  return (
    <section id="events" className="py-12 bg-white/[0.02] border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          {...fadeUp}
          className="flex justify-between items-end mb-10"
        >
          <h2 className="text-3xl font-extrabold tracking-tight">Trending Events</h2>
          <a href="#" className="text-sm font-mono text-accent hover:underline underline-offset-4">
            View All →
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingEvents.map((e, i) => (
            <motion.article
              key={e.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 ring-1 ring-white/10">
                <img
                  src={e.image}
                  alt={e.title}
                  width={800}
                  height={1024}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-foreground text-[10px] font-mono px-2 py-1 rounded">
                    {e.badge.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start mb-1 gap-3">
                <h3 className="font-bold text-lg group-hover:text-accent transition-colors">
                  {e.title}
                </h3>
                <span className="font-mono text-accent shrink-0">{e.price}</span>
              </div>
              <p className="text-sm text-muted-foreground">{e.venue} · {e.when}</p>
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
          <button className="mt-8 w-full py-4 bg-foreground text-background rounded-xl font-bold hover:bg-accent hover:text-accent-foreground transition-colors">
            Browse Venues from ZMW 1,200 / night
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function Organizers() {
  return (
    <section id="organizers" className="py-12 border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest shrink-0">
            Trusted Organizers
          </p>
          <div className="flex gap-6 items-center">
            {[
              { name: "The Lab Zambia", tier: "Partner" },
              { name: "R&B Sundays", tier: "Verified" },
              { name: "Circuit Nights", tier: "Verified" },
              { name: "Afro Roots Co.", tier: "Partner" },
            ].map((o) => (
              <div key={o.name} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center">
                  <div className="w-4 h-4 rounded-full bg-accent/40" />
                </div>
                <span className="text-sm font-semibold">{o.name}</span>
                <span
                  className={
                    "text-[10px] px-1.5 py-0.5 rounded border " +
                    (o.tier === "Partner"
                      ? "bg-accent/10 text-accent border-accent/20"
                      : "bg-white/10 text-foreground border-white/20")
                  }
                >
                  {o.tier.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
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
          Real analytics. Built for Zambian organizers.
        </motion.p>
        <motion.div {...fadeUp} className="flex flex-wrap gap-3 justify-center">
          <button className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-bold hover:bg-accent hover:text-accent-foreground transition-colors">
            Create Organizer Account
          </button>
          <button className="px-6 py-3 rounded-full border border-border text-sm font-medium hover:bg-white/5 transition-colors">
            How payouts work
          </button>
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

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <TrendingEvents />
      <LiquorAndVenues />
      <Organizers />
      <CTA />
      <Footer />
    </main>
  );
}
