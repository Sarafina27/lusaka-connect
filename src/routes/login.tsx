import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const CLIENT_AUTH_STORAGE_KEY = "tiyenza-client-auth";
const CLIENT_USERS_STORAGE_KEY = "tiyenza-client-users";

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
      { title: "Login — Tiyenza" },
      { name: "description", content: "Login to manage events and inventory for Tiyenza." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          <h1 className="text-3xl font-extrabold mb-2">Welcome to Tiyenza</h1>
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
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-foreground outline-none focus:border-accent"
              placeholder="Your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

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
