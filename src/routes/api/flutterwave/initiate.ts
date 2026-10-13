import { createFileRoute } from "@tanstack/react-router";
import { FlutterwaveError, initiateFlutterwaveCheckout } from "@/server/flutterwave";

export const Route = createFileRoute("/api/flutterwave/initiate")({
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
            typeof body.quantity !== "number" ||
            (body.phoneNumber !== undefined && typeof body.phoneNumber !== "string")
          ) {
            throw new FlutterwaveError("Invalid payment request.", 400);
          }

          const result = await initiateFlutterwaveCheckout({
            eventId: body.eventId,
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            quantity: body.quantity,
            phoneNumber: typeof body.phoneNumber === "string" ? body.phoneNumber : undefined,
          });
          return Response.json(result);
        } catch (error) {
          if (error instanceof FlutterwaveError) {
            return Response.json({ error: error.message }, { status: error.statusCode });
          }
          console.error("Unexpected Flutterwave checkout error.", error);
          return Response.json({ error: "Unable to start payment." }, { status: 500 });
        }
      },
    },
  },
});
