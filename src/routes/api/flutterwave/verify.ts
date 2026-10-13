import { createFileRoute } from "@tanstack/react-router";
import { FlutterwaveError, verifyFlutterwavePayment } from "@/server/flutterwave";

export const Route = createFileRoute("/api/flutterwave/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            tx_ref?: unknown;
            transaction_id?: unknown;
          };
          if (
            typeof body.tx_ref !== "string" ||
            (typeof body.transaction_id !== "string" && typeof body.transaction_id !== "number")
          ) {
            throw new FlutterwaveError("Invalid transaction reference or ID.", 400);
          }
          return Response.json(
            await verifyFlutterwavePayment(body.tx_ref, String(body.transaction_id)),
          );
        } catch (error) {
          if (error instanceof FlutterwaveError) {
            return Response.json({ error: error.message }, { status: error.statusCode });
          }
          console.error("Unexpected Flutterwave verification error.", error);
          return Response.json({ error: "Unable to verify payment." }, { status: 500 });
        }
      },
    },
  },
});
