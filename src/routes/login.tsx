import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CLIENT_AUTH_STORAGE_KEY = "kuwala-client-auth";
const CLIENT_USERS_STORAGE_KEY = "kuwala-client-users";

type ClientUser = { email: string; name: string; phone: string; password?: string };

function loadClientUsers(): ClientUser[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(CLIENT_USERS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ClientUser[]) : [];
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Kuwala" },
      { name: "description", content: "Login to manage events and inventory for Kuwala." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    const normalized = email.trim().toLowerCase();
    setMessage(null);
    if (!normalized) {
      setMessage("Please enter your email to continue.");
      return;
    }

    const users = loadClientUsers();
    const user = users.find((u) => u.email === normalized);
    if (!user) {
      setMessage("No account found. Please sign up first.");
      return;
    }

    if (!password) {
      setMessage("Please enter your password.");
      return;
    }

    if ((user.password || "") !== password) {
      setMessage("Incorrect password. Please try again.");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(CLIENT_AUTH_STORAGE_KEY, normalized);
    }

    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-20 w-full">
        <div className="rounded-3xl border border-border bg-card/50 p-8">
          <h1 className="text-3xl font-extrabold mb-2">Welcome to Kuwala</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Discover events across Lusaka, book tickets with mobile money or card, and manage
            your bookings all in one place.
          </p>

          {message ? (
            <div className="rounded-2xl border p-4 mb-4 border-border bg-background/80">{message}</div>
          ) : null}

          <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent mb-4"
            placeholder="you@example.com"
          />

          <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent mb-4"
            placeholder="Your password"
          />

          <Button onClick={handleLogin} className="w-full rounded-full mb-4">
            Continue
          </Button>

          <div className="flex flex-col gap-3">
            <Link
              to="/signup"
              className="inline-flex w-full justify-center rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
