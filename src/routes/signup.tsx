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

function saveClientUsers(users: { email: string; name: string; phone: string }[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLIENT_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Kuwala" },
      { name: "description", content: "Create a Kuwala account to browse and book events in Lusaka." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !normalizedEmail || !phone.trim() || !password) {
      setMessage("Please fill out name, email, phone and a password to create an account.");
      return;
    }

    const users = loadClientUsers();
    if (users.some((user) => user.email === normalizedEmail)) {
      setMessage("An account with that email already exists. Please login.");
      return;
    }

    const nextUsers = [...users, { email: normalizedEmail, name: name.trim(), phone: phone.trim(), password }];
    saveClientUsers(nextUsers);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(CLIENT_AUTH_STORAGE_KEY, normalizedEmail);
    }

    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-20 w-full">
        <div className="rounded-3xl border border-border bg-card/50 p-8">
          <h1 className="text-3xl font-extrabold mb-2">Create your Kuwala account</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign up to discover events, buy tickets, and manage your booking history in Lusaka.
          </p>

          {message ? (
            <div className="rounded-2xl border p-4 mb-4 border-border bg-background/80 text-sm text-destructive">
              {message}
            </div>
          ) : null}

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="Your name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="Choose a password"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="+260 97 000 0000"
              />
            </label>
            <Button onClick={handleSignup} className="w-full rounded-full">
              Create account
            </Button>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-accent hover:underline">Login</Link>.
          </div>

          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
