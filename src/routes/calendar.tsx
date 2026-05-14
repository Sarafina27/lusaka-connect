import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPin, Plus, Ticket, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import eventWarehouse from "@/assets/event-warehouse.jpg";
import eventSunset from "@/assets/event-sunset.jpg";
import eventConcert from "@/assets/event-concert.jpg";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Event Calendar — Kuwala Lusaka" },
      {
        name: "description",
        content:
          "Browse Lusaka events by date, track tickets you've booked, and manage your organizer schedule on Kuwala.",
      },
      { property: "og:title", content: "Event Calendar — Kuwala Lusaka" },
      {
        property: "og:description",
        content: "Discover what's on in Lusaka, by the day.",
      },
    ],
  }),
  component: CalendarPage,
});

type CalEvent = {
  id: string;
  title: string;
  venue: string;
  date: Date;
  time: string;
  price: string;
  badge: string;
  image: string;
  category: "nightlife" | "concert" | "private" | "chill";
};

const today = new Date();
const d = (offset: number, h = 20, m = 0) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  dt.setHours(h, m, 0, 0);
  return dt;
};

const discoverEvents: CalEvent[] = [
  { id: "e1", title: "Warehouse Sessions", venue: "Rhodes Park", date: d(0, 22), time: "22:00", price: "ZMW 150", badge: "MoMo", image: eventWarehouse, category: "nightlife" },
  { id: "e2", title: "Afro House Rooftop", venue: "Cairo Road", date: d(1, 21), time: "21:00", price: "ZMW 100", badge: "Free Entry B/4 22:00", image: eventConcert, category: "nightlife" },
  { id: "e3", title: "Sunset Soirée", venue: "Leopards Hill", date: d(2, 16), time: "16:00", price: "ZMW 450", badge: "Limited", image: eventSunset, category: "chill" },
  { id: "e4", title: "Echoes of the Copperbelt", venue: "Showgrounds", date: d(3, 19), time: "19:00", price: "ZMW 200", badge: "Verified", image: eventConcert, category: "concert" },
  { id: "e5", title: "Sunday Brunch & Vinyl", venue: "Kabulonga", date: d(5, 12), time: "12:00", price: "ZMW 250", badge: "All Ages", image: eventSunset, category: "chill" },
  { id: "e6", title: "Amapiano Takeover", venue: "Manda Hill", date: d(7, 22), time: "22:00", price: "ZMW 180", badge: "Hot", image: eventWarehouse, category: "nightlife" },
];

const myTickets: CalEvent[] = [discoverEvents[0], discoverEvents[3]];
const myOrganizing: CalEvent[] = [
  { id: "o1", title: "Kuwala x Lush — Private Launch", venue: "Riverside", date: d(4, 19), time: "19:00", price: "Invite Only", badge: "Draft", image: eventSunset, category: "private" },
  { id: "o2", title: "Lusaka Night Market", venue: "East Park", date: d(9, 17), time: "17:00", price: "ZMW 50", badge: "Published", image: eventConcert, category: "chill" },
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function fmtDay(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function EventRow({ ev }: { ev: CalEvent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group flex gap-4 rounded-xl border border-border bg-card/40 p-3 hover:border-accent/40 hover:bg-card/70 transition-colors"
    >
      <div
        className="h-20 w-20 shrink-0 rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${ev.image})` }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate">{ev.title}</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {ev.venue} · {ev.time}
            </p>
          </div>
          <span className="font-mono text-xs text-accent shrink-0">{ev.price}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="border-border text-[10px] uppercase tracking-wider">
            {ev.category}
          </Badge>
          <Badge className="bg-accent/15 text-accent hover:bg-accent/20 text-[10px]">{ev.badge}</Badge>
        </div>
      </div>
    </motion.div>
  );
}

function CalendarColumn({
  events,
  selected,
  onSelect,
  emptyLabel,
}: {
  events: CalEvent[];
  selected: Date | undefined;
  onSelect: (d: Date | undefined) => void;
  emptyLabel: string;
}) {
  const eventDays = useMemo(() => events.map((e) => e.date), [events]);
  const dayEvents = useMemo(
    () => (selected ? events.filter((e) => isSameDay(e.date, selected)) : []),
    [events, selected],
  );

  return (
    <div className="grid lg:grid-cols-[auto_1fr] gap-8">
      <div className="rounded-2xl border border-border bg-card/30 p-2 w-fit mx-auto lg:mx-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          modifiers={{ hasEvent: eventDays }}
          modifiersClassNames={{
            hasEvent:
              "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-accent",
          }}
          className={cn("p-3 pointer-events-auto")}
        />
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Schedule</p>
            <h3 className="text-xl font-semibold mt-1">
              {selected ? fmtDay(selected) : "Select a date"}
            </h3>
          </div>
          <Badge variant="outline" className="border-border">
            {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
          </Badge>
        </div>
        <div className="space-y-3">
          {dayEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {emptyLabel}
            </div>
          ) : (
            dayEvents.map((ev) => <EventRow key={ev.id} ev={ev} />)
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarPage() {
  const [discoverDate, setDiscoverDate] = useState<Date | undefined>(today);
  const [ticketDate, setTicketDate] = useState<Date | undefined>(today);
  const [organizerDate, setOrganizerDate] = useState<Date | undefined>(today);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-extrabold tracking-tighter text-xl italic uppercase">
            Kuwala
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/calendar" className="text-foreground" activeProps={{ className: "text-foreground" }}>
              Calendar
            </Link>
          </div>
          <Button size="sm" className="rounded-full">
            <Plus className="h-4 w-4" /> Create event
          </Button>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <CalendarIcon className="h-3 w-3 text-accent" /> Lusaka · This month
          </div>
          <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight">
            Plan your <span className="text-accent">nights out</span>.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Browse what's on by date, keep your tickets close, and manage events you're hosting — all in one calendar.
          </p>
        </motion.div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="bg-card/40 border border-border h-11 p-1">
            <TabsTrigger value="discover" className="gap-2">
              <CalendarIcon className="h-4 w-4" /> Discover
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <Ticket className="h-4 w-4" /> My events
            </TabsTrigger>
            <TabsTrigger value="organizer" className="gap-2">
              <Users className="h-4 w-4" /> Organizer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-8">
            <CalendarColumn
              events={discoverEvents}
              selected={discoverDate}
              onSelect={setDiscoverDate}
              emptyLabel="No events on this day. Try another date or check back soon."
            />
          </TabsContent>

          <TabsContent value="tickets" className="mt-8">
            <CalendarColumn
              events={myTickets}
              selected={ticketDate}
              onSelect={setTicketDate}
              emptyLabel="You don't have tickets for this day."
            />
          </TabsContent>

          <TabsContent value="organizer" className="mt-8">
            <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card/30 p-4">
              <div>
                <p className="text-sm font-semibold">Organizer schedule</p>
                <p className="text-xs text-muted-foreground">
                  {myOrganizing.length} events scheduled · drafts and published
                </p>
              </div>
              <Button size="sm" variant="outline" className="rounded-full">
                <Plus className="h-4 w-4" /> New event
              </Button>
            </div>
            <CalendarColumn
              events={myOrganizing}
              selected={organizerDate}
              onSelect={setOrganizerDate}
              emptyLabel="Nothing scheduled for this day."
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
