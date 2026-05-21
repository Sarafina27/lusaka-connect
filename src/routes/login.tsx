import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Kuwala Lusaka" },
      { name: "description", content: "Organizer login for Kuwala. Access your dashboard and manage events." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Organizer Login</h1>
          <p className="text-muted-foreground max-w-2xl">Sign in to your Kuwala account and manage your events, tickets, and payouts.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card/50 p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">example@kuwala.com</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">••••••••</div>
            </div>
            <button className="w-full rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-colors">
              Login
            </button>
          </div>
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          New here? <Link to="/signup" className="text-accent hover:underline">Create an account</Link>.
        </div>

        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
