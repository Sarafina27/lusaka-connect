import { createFileRoute } from "@tanstack/react-router";
import { FlutterwaveError, verifyFlutterwaveWebhook } from "@/server/flutterwave";

export const Route = createFileRoute("/api/flutterwave/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const result = await verifyFlutterwaveWebhook(await request.text(), request);
          return Response.json({ received: true, status: result.status });
        } catch (error) {
          if (error instanceof FlutterwaveError) {
            return Response.json({ error: error.message }, { status: error.statusCode });
          }
          console.error("Unexpected Flutterwave webhook error.", error);
          return Response.json({ error: "Unable to process payment webhook." }, { status: 500 });
        }
      },
    },
  },
});
