import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Kuwala Lusaka" },
      { name: "description", content: "Browse upcoming events in Lusaka, filter by category, and book the best nights out." },
    ],
  }),
  component: EventsLayout,
});

function EventsLayout() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Outlet />
    </main>
  );
}
