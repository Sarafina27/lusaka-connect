import { createFileRoute } from "@tanstack/react-router";
import { PayChanguError, verifyPayChanguWebhook } from "@/server/paychangu";

export const Route = createFileRoute("/api/paychangu/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const result = await verifyPayChanguWebhook(
            await request.text(),
            request.headers.get("Signature"),
          );
          return Response.json({ received: true, status: result.status });
        } catch (error) {
          if (error instanceof PayChanguError) {
            return Response.json({ error: error.message }, { status: error.statusCode });
          }
          console.error("Unexpected PayChangu webhook error.", error);
          return Response.json({ error: "Unable to process payment webhook." }, { status: 500 });
        }
      },
    },
  },
});
