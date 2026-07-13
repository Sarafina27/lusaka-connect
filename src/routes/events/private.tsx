import { createFileRoute } from "@tanstack/react-router";
import EventCategoryPage from "@/components/EventCategoryPage";

export const Route = createFileRoute("/events/private")({
  head: () => ({
    meta: [
      { title: "Private Events — Kuwala Lusaka" },
      { name: "description", content: "Exclusive private events and gatherings in Lusaka" },
    ],
  }),
  component: () => <EventCategoryPage category="private" title="Private Events" description="Exclusive private parties, corporate events, and curated gatherings for invitation holders." />,
});
