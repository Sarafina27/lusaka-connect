import { createFileRoute } from "@tanstack/react-router";
import EventCategoryPage from "@/components/EventCategoryPage";

export const Route = createFileRoute("/events/concerts")({
  head: () => ({
    meta: [
      { title: "Concert Events — Kuwala Lusaka" },
      { name: "description", content: "Find live concerts and music performances in Lusaka" },
    ],
  }),
  component: () => <EventCategoryPage category="concert" title="Concert Events" description="Discover live performances, DJ sets, and musical experiences across Lusaka." />,
});
