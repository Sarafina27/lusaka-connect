import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3, Trash2, LogOut } from "lucide-react";
import {
  EventData,
  formatTicketPrice,
  getTicketProgressInterval,
  getTicketProgressPercent,
  getTicketsAvailable,
  useEventStore,
} from "@/lib/event-store";
import eventWarehouse from "@/assets/event-warehouse.jpg";

type AdminForm = {
  title: string;
  venue: string;
  when: string;
  time: string;
  date: string;
  description: string;
  badge: string;
  price: string;
  category: EventData["category"];
  capacity: string;
  sold: string;
};

type AdminField = {
  label: string;
  key: keyof AdminForm;
  type?: "select" | "date" | "textarea";
  placeholder?: string;
  options?: AdminForm["category"][];
};

const ADMIN_FIELDS: AdminField[] = [
  { label: "Title", key: "title" },
  { label: "Venue", key: "venue" },
  { label: "Description", key: "description", type: "textarea", placeholder: "Short event summary" },
  { label: "When", key: "when" },
  { label: "Date", key: "date", type: "date" },
  { label: "Time", key: "time" },
  { label: "Badge", key: "badge" },
  { label: "Category", key: "category", type: "select", options: ["nightlife", "concert", "private", "chill"] },
  { label: "Price", key: "price", placeholder: "150" },
  { label: "Capacity", key: "capacity", placeholder: "200" },
  { label: "Sold", key: "sold", placeholder: "0" },
];

const ADMIN_AUTH_STORAGE_KEY = "kuwala-admin-auth";
const ADMIN_EMAILS: string[] = ((import.meta.env?.VITE_ADMIN_EMAIL || "admin@kuwala.com")
  .split(",")
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean));

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Kuwala" },
      { name: "description", content: "Admin-only event management for Kuwala." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { events, addEvent, removeEvent, updateEvent } = useEventStore();
  const [email, setEmail] = useState(ADMIN_EMAILS[0] ?? "");
  const [status, setStatus] = useState<"idle" | "authenticated" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminForm>({
    title: "",
    venue: "",
    when: "",
    time: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    badge: "",
    price: "0",
    category: "nightlife",
    capacity: "100",
    sold: "0",
  });

  const isAuthorizedEmail = useMemo(
    () => ADMIN_EMAILS.includes(email.trim().toLowerCase()),
    [email],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (saved === email.trim().toLowerCase()) {
      setStatus("authenticated");
    }
  }, [email]);

  const handleLogin = () => {
    setMessage(null);
    if (!isAuthorizedEmail) {
      setMessage("Use the approved admin email.");
      setStatus("error");
      return;
    }

    window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, email.trim().toLowerCase());
    setStatus("authenticated");
    setMessage("Admin access granted.");
  };

  const handleLogout = () => {
    window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    setStatus("idle");
    setMessage("Logged out.");
  };

  const handleFieldChange = (key: keyof AdminForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "category" ? (value as AdminForm["category"]) : value,
    }));
  };

  const startEditing = (event: EventData) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      venue: event.venue,
      when: event.when,
      time: event.time,
      date: event.date.slice(0, 10),
      description: event.description,
      badge: event.badge,
      price: String(event.price),
      category: event.category,
      capacity: String(event.capacity),
      sold: String(event.sold),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      venue: "",
      when: "",
      time: "",
      date: new Date().toISOString().slice(0, 10),
      description: "",
      badge: "",
      price: "0",
      category: "nightlife",
      capacity: "100",
      sold: "0",
    });
  };

  const handleDelete = (event: EventData) => {
    if (typeof window !== "undefined" && !window.confirm(`Delete "${event.title}"?`)) {
      return;
    }

    removeEvent(event.id);
    if (editingId === event.id) {
      resetForm();
    }
    setMessage(`Deleted "${event.title}".`);
    setStatus("authenticated");
  };

  const handleSubmit = () => {
    const parsedPrice = Number(form.price);
    const parsedCapacity = Number(form.capacity);
    const parsedSold = Number(form.sold);
    const parsedDate = new Date(form.date);

    if (!form.title || !form.venue) {
      setMessage("Please complete the event title and venue.");
      setStatus("error");
      return;
    }

    if (!form.date || isNaN(parsedDate.getTime())) {
      setMessage("Please select a valid event date.");
      setStatus("error");
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice < 0 || isNaN(parsedCapacity) || parsedCapacity < 0 || isNaN(parsedSold) || parsedSold < 0) {
      setMessage("Enter valid numeric values for price, capacity, and sold tickets.");
      setStatus("error");
      return;
    }

    const update = {
      title: form.title,
      venue: form.venue,
      when: form.when,
      time: form.time,
      date: parsedDate.toISOString(),
      description: form.description,
      badge: form.badge,
      price: parsedPrice,
      category: form.category as EventData["category"],
      capacity: parsedCapacity,
      sold: Math.min(parsedSold, parsedCapacity),
    };

    if (editingId) {
      updateEvent(editingId, update);
      setMessage("Event updated.");
    } else {
      addEvent({
        id: `admin-${Date.now()}`,
        image: eventWarehouse,
        ...update,
      });
      setMessage("Event added.");
    }

    setStatus("authenticated");
    resetForm();
  };

  const canEdit = status === "authenticated";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Kuwala Admin</h1>
            <p className="text-muted-foreground max-w-2xl">
              Hidden admin access for event inventory and ticket management. Use the approved admin email to log in.
            </p>
          </div>
          {canEdit && (
            <Button variant="outline" onClick={handleLogout} className="rounded-full">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          )}
        </div>

        {message ? (
          <div className={`rounded-2xl border p-4 mb-8 ${status === "error" ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-card/50 text-foreground"}`}>
            {message}
          </div>
        ) : null}

        {!canEdit ? (
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl border border-border bg-card/50 p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Admin email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  placeholder="admin@kuwala.com"
                />
              </div>
              <div>
                <Button onClick={handleLogin} className="w-full rounded-full">
                  Log in
                </Button>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-card/50 p-8">
              <h2 className="text-xl font-semibold mb-4">Admin access</h2>
              <p className="text-sm text-muted-foreground">
                This page is not linked from the public UI. Keep the URL private and use the approved admin email to log in.
              </p>
              <div className="mt-6 text-sm text-muted-foreground space-y-3">
                <p>Approved admin email(s):</p>
                <ul className="list-disc pl-5 space-y-1">
                  {ADMIN_EMAILS.map((approvedEmail) => (
                    <li key={approvedEmail}>{approvedEmail}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <section className="space-y-8">
            <div className="rounded-3xl border border-border bg-card/50 p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Event Inventory</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add, edit, and remove events. Set total capacity and keep sold tickets in sync with purchases.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="rounded-full bg-border px-3 py-2">{events.length} events</span>
                  <Badge variant="outline">Admin only</Badge>
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {events.map((event) => {
                  const available = getTicketsAvailable(event);
                  return (
                    <div key={event.id} className="rounded-3xl border border-border bg-background/80 p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Badge>{event.badge}</Badge>
                            <span>{event.when}</span>
                            <span>{event.time}</span>
                          </div>
                          <h3 className="text-xl font-semibold mt-3">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{event.venue}</p>
                          {event.description ? (
                            <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEditing(event)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleDelete(event)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-border bg-card/75 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Capacity</p>
                          <p className="mt-2 text-xl font-semibold">{event.capacity}</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card/75 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sold</p>
                          <p className="mt-2 text-xl font-semibold">{event.sold}</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card/75 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Available</p>
                          <p className="mt-2 text-xl font-semibold">{available}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-2 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${getTicketProgressPercent(event)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Sold {getTicketProgressInterval(event)}% — {formatTicketPrice(event.price)} per ticket
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/50 p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{editingId ? "Edit event" : "Add new event"}</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Save ticket capacity and sold inventory so customer checkout reflects live availability.
                  </p>
                </div>
                <Badge>{editingId ? "Editing" : "New event"}</Badge>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {ADMIN_FIELDS.map((field) => (
                  <label key={field.key} className={`block ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
                    <span className="text-sm font-medium text-muted-foreground">{field.label}</span>
                    {field.type === "select" ? (
                      <select
                        value={form[field.key]}
                        onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={form[field.key] as string}
                        onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                        placeholder={field.placeholder ?? ""}
                        rows={4}
                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
                      />
                    ) : (
                      <input
                        type={field.key === "price" || field.key === "capacity" || field.key === "sold" ? "number" : field.key === "date" ? "date" : "text"}
                        value={form[field.key] as string}
                        onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                        placeholder={field.placeholder ?? ""}
                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
                      />
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={handleSubmit} className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" /> {editingId ? "Save changes" : "Add event"}
                </Button>
                {editingId ? (
                  <Button variant="outline" onClick={resetForm} className="rounded-full">
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>
          </section>
        )}

        <div className="mt-10">
          <Link to="/" className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
