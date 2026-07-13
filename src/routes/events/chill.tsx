import { createFileRoute } from "@tanstack/react-router";
import EventCategoryPage from "@/components/EventCategoryPage";

export const Route = createFileRoute("/events/chill")({
  head: () => ({
    meta: [
      { title: "Chill Events — Kuwala Lusaka" },
      { name: "description", content: "Relaxing daytime and evening events in Lusaka" },
    ],
  }),
  component: () => <EventCategoryPage category="chill" title="Chill Events" description="Unwind with laid-back vibes, lounge experiences, and daytime socials in Lusaka." />,
});
