import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Kuwala Lusaka" },
      { name: "description", content: "Create a Kuwala organizer account to start selling tickets and managing events." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Sign Up</h1>
          <p className="text-muted-foreground max-w-2xl">Create your account and start listing events on Kuwala's Lusaka platform.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card/50 p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Full name</label>
              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">Your name</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">example@kuwala.com</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Phone</label>
              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">+260 97 000 0000</div>
            </div>
            <button className="w-full rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-colors">
              Create account
            </button>
          </div>
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-accent hover:underline">Login</Link>.
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
