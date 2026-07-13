import { createFileRoute } from "@tanstack/react-router";
import EventCategoryPage from "@/components/EventCategoryPage";

export const Route = createFileRoute("/events/nightlife")({
  head: () => ({
    meta: [
      { title: "Nightlife Events — Kuwala Lusaka" },
      { name: "description", content: "Discover the best nightlife events in Lusaka" },
    ],
  }),
  component: () => <EventCategoryPage category="nightlife" title="Nightlife Events" description="Experience Lusaka's hottest clubs, DJ nights, and late-night parties." />,
});
