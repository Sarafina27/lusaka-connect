import { createFileRoute } from "@tanstack/react-router";
import { PayChanguError, verifyPayChanguPayment } from "@/server/paychangu";

export const Route = createFileRoute("/api/paychangu/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { tx_ref?: unknown };
          if (typeof body.tx_ref !== "string") {
            throw new PayChanguError("Invalid transaction reference.", 400);
          }
          return Response.json(await verifyPayChanguPayment(body.tx_ref));
        } catch (error) {
          if (error instanceof PayChanguError) {
            return Response.json({ error: error.message }, { status: error.statusCode });
          }
          console.error("Unexpected PayChangu verification error.", error);
          return Response.json({ error: "Unable to verify payment." }, { status: 500 });
        }
      },
    },
  },
});
