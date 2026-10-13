import { createFileRoute } from "@tanstack/react-router";
import { getPayChanguAvailability } from "@/server/paychangu";

export const Route = createFileRoute("/api/paychangu/config")({
  server: {
    handlers: {
      GET: async () => Response.json(getPayChanguAvailability()),
    },
  },
});
