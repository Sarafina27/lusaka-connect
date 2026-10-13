import { createFileRoute } from "@tanstack/react-router";
import { getFlutterwaveAvailability } from "@/server/flutterwave";

export const Route = createFileRoute("/api/flutterwave/config")({
  server: {
    handlers: {
      GET: async () => Response.json(getFlutterwaveAvailability()),
    },
  },
});
