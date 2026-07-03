import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, MapPin } from "lucide-react";
import { useEventStore } from "@/lib/event-store";
import { getBookingsForUser, UserBooking } from "@/lib/bookings";

const CLIENT_AUTH_STORAGE_KEY = "kuwala-client-auth";
const CLIENT_USERS_STORAGE_KEY = "kuwala-client-users";

type ClientUser = { email: string; name: string; phone: string; password?: string };

function loadClientUsers(): ClientUser[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(CLIENT_USERS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ClientUser[]) : [];
  } catch {
    return [];
  }
}

function saveClientUsers(users: ClientUser[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLIENT_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Kuwala" },
      { name: "description", content: "Manage your Kuwala account and view booked events." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [activeTab, setActiveTab] = useState<"tickets" | "rsvps">("tickets");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { events } = useEventStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const auth = window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY);
    if (!auth) {
      navigate({ to: "/login" });
      return;
    }

    const users = loadClientUsers();
    const user = users.find((u) => u.email === auth);
    if (!user) {
      window.localStorage.removeItem(CLIENT_AUTH_STORAGE_KEY);
      navigate({ to: "/login" });
      return;
    }

    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setBookings(getBookingsForUser(auth));
  }, [navigate]);

  const ticketBookings = useMemo(() => bookings.filter((booking) => !booking.rsvp), [bookings]);
  const rsvpBookings = useMemo(() => bookings.filter((booking) => booking.rsvp), [bookings]);
  const currentBookings = activeTab === "tickets" ? ticketBookings : rsvpBookings;

  const eventDays = useMemo(
    () => currentBookings.map((booking) => new Date(booking.eventDate)),
    [currentBookings],
  );

  const dayBookings = useMemo(
    () =>
      selectedDate
        ? currentBookings.filter((booking) => isSameDay(new Date(booking.eventDate), selectedDate))
        : [],
    [currentBookings, selectedDate],
  );

  const stats = useMemo(
    () => ({
      tickets: ticketBookings.length,
      rsvps: rsvpBookings.length,
      upcoming: bookings.filter((booking) => new Date(booking.eventDate) >= new Date()).length,
    }),
    [bookings, ticketBookings.length, rsvpBookings.length],
  );

  const handleSave = () => {
    setMessage(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setMessage("Name, email and phone are required.");
      return;
    }

    const normalized = email.trim().toLowerCase();
    const users = loadClientUsers();
    const auth = typeof window !== "undefined" ? window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY) : null;
    if (!auth) {
      navigate({ to: "/login" });
      return;
    }

    if (normalized !== auth && users.some((u) => u.email === normalized)) {
      setMessage("Another account with that email already exists.");
      return;
    }

    const next = users.map((u) => {
      if (u.email === auth) {
        return { ...u, name: name.trim(), phone: phone.trim(), email: normalized };
      }
      return u;
    });

    saveClientUsers(next);
    window.localStorage.setItem(CLIENT_AUTH_STORAGE_KEY, normalized);
    setEmail(normalized);
    setMessage("Profile updated.");
  };

  const handleChangePassword = () => {
    setMessage(null);
    setMessage("Password management is available from the login page.");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CLIENT_AUTH_STORAGE_KEY);
    }
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
          <aside className="rounded-3xl border border-border bg-card/50 p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">My account</p>
                <h1 className="mt-3 text-3xl font-extrabold">Profile</h1>
              </div>
              <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl border border-border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Account</p>
                <p className="mt-2 text-lg font-semibold">{name || "Your name"}</p>
                <p className="text-sm text-muted-foreground">{email || "No email saved"}</p>
                <p className="text-sm text-muted-foreground">{phone || "No phone number"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-border bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Booked tickets</p>
                  <p className="mt-3 text-3xl font-semibold">{stats.tickets}</p>
                </div>
                <div className="rounded-3xl border border-border bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">RSVPs</p>
                  <p className="mt-3 text-3xl font-semibold">{stats.rsvps}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Upcoming schedule</p>
                <p className="mt-3 text-lg font-semibold">{stats.upcoming} upcoming event{stats.upcoming === 1 ? "" : "s"}</p>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-border bg-card/50 p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Your calendar</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Upcoming activity</h2>
                </div>
                <Badge className="rounded-full bg-accent/10 text-accent">{currentBookings.length} entries</Badge>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
                <div className="rounded-3xl border border-border bg-background/90 p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={{ hasEvent: eventDays }}
                    modifiersClassNames={{
                      hasEvent:
                        "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-accent",
                    }}
                    className="p-3"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected date</p>
                      <p className="mt-2 text-lg font-semibold">{selectedDate ? formatDate(selectedDate) : "Choose a day"}</p>
                    </div>
                    <Badge variant="outline" className="border-border">{dayBookings.length} events</Badge>
                  </div>

                  <div className="mt-4 rounded-3xl border border-dashed border-border p-6 min-h-55">
                    {dayBookings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No bookings or RSVPs for this day yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {dayBookings.map((booking) => {
                          const event = events.find((event) => event.id === booking.eventId);
                          return (
                            <div key={booking.id} className="rounded-3xl border border-border bg-card/70 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{booking.eventTitle}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <MapPin className="inline h-3 w-3" /> {event?.venue ?? "Venue TBD"} · {booking.eventTime}
                                  </p>
                                </div>
                                <Badge variant="outline" className="uppercase tracking-[0.16em] text-[10px] border-border">
                                  {booking.rsvp ? "RSVP" : "Ticket"}
                                </Badge>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span>{booking.quantity ? `${booking.quantity} ticket${booking.quantity === 1 ? "" : "s"}` : "RSVP only"}</span>
                                {!booking.rsvp && <span>Paid ZMW {booking.totalPrice.toLocaleString()}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/50 p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Event history</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Tickets & RSVPs</h2>
                </div>
                <div className="inline-flex overflow-hidden rounded-full border border-border bg-background">
                  <button
                    onClick={() => setActiveTab("tickets")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === "tickets" ? "bg-accent text-background" : "text-muted-foreground"
                    }`}
                  >
                    Tickets
                  </button>
                  <button
                    onClick={() => setActiveTab("rsvps")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === "rsvps" ? "bg-accent text-background" : "text-muted-foreground"
                    }`}
                  >
                    RSVPs
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {currentBookings.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    {activeTab === "tickets"
                      ? "You haven't purchased any tickets yet."
                      : "You haven't RSVPed to any events yet."}
                  </div>
                ) : (
                  currentBookings
                    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                    .map((booking) => {
                      const event = events.find((event) => event.id === booking.eventId);
                      return (
                        <div key={booking.id} className="rounded-3xl border border-border bg-background/80 p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{formatDate(new Date(booking.eventDate))}</p>
                              <p className="mt-2 text-lg font-semibold">{booking.eventTitle}</p>
                              <p className="text-sm text-muted-foreground mt-1">{event?.venue ?? "Venue TBD"} · {booking.eventTime}</p>
                            </div>
                            <Badge className="rounded-full bg-accent/10 text-accent text-[11px] uppercase tracking-[0.18em]">
                              {booking.rsvp ? "RSVP" : "Booked"}
                            </Badge>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
                            <div>
                              <p className="font-semibold text-foreground">Quantity</p>
                              <p>{booking.quantity || "—"}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Status</p>
                              <p>{booking.rsvp ? "RSVP confirmed" : "Paid"}</p>
                            </div>
                            {!booking.rsvp ? (
                              <div>
                                <p className="font-semibold text-foreground">Amount</p>
                                <p>ZMW {booking.totalPrice.toLocaleString()}</p>
                              </div>
                            ) : null}
                          </div>

                          {!booking.rsvp && booking.ticketNumber ? (
                            <div className="mt-4 rounded-3xl border border-border bg-card/50 p-4">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ticket pass</p>
                                  <p className="mt-2 font-mono text-sm font-semibold">{booking.ticketNumber}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Sent to {booking.deliveryChannel === "sms" ? "phone" : "email"}: {booking.deliveryTarget ?? "your saved contact"}
                                  </p>
                                </div>
                                {booking.qrCode ? (
                                  <img src={booking.qrCode} alt="Ticket QR code" className="h-24 w-24 rounded-2xl border border-border bg-white p-2" />
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
