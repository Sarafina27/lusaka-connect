import { query } from "@/server/db";

export async function GET() {
  try {
    const result = await query("SELECT NOW() AS currentTime");
    return Response.json({ ok: true, result });
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}