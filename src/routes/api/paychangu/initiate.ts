import { createFileRoute } from "@tanstack/react-router";
import { initiatePayChanguCheckout, PayChanguError } from "@/server/paychangu";

export const Route = createFileRoute("/api/paychangu/initiate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as Record<string, unknown>;
          if (
            typeof body.eventId !== "string" ||
            typeof body.email !== "string" ||
            typeof body.firstName !== "string" ||
            typeof body.lastName !== "string" ||
            typeof body.quantity !== "number"
          ) {
            throw new PayChanguError("Invalid payment request.", 400);
          }

          const result = await initiatePayChanguCheckout({
            eventId: body.eventId,
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            quantity: body.quantity,
          });
          return Response.json(result);
        } catch (error) {
          if (error instanceof PayChanguError) {
            return Response.json({ error: error.message }, { status: error.statusCode });
          }
          console.error("Unexpected PayChangu checkout error.", error);
          return Response.json({ error: "Unable to start payment." }, { status: 500 });
        }
      },
    },
  },
});
