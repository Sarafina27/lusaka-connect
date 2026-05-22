import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

function saveClientUsers(users: ClientUser[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLIENT_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

export const Route = (createFileRoute as any)("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Kuwala" },
      { name: "description", content: "Manage your Kuwala account." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const auth = window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY);
    if (!auth) {
      navigate({ to: "/login" });
      return;
    }

    const users = loadClientUsers();
    const user = users.find((u) => u.email === auth);
    if (!user) {
      // invalid auth, clear and redirect
      window.localStorage.removeItem(CLIENT_AUTH_STORAGE_KEY);
      navigate({ to: "/login" });
      return;
    }

    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
  }, [navigate]);

  const handleSave = () => {
    setMessage(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setMessage("Name, email and phone are required.");
      return;
    }

    const normalized = email.trim().toLowerCase();
    const users = loadClientUsers();
    const auth = typeof window !== "undefined" ? window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY) : null;
    if (!auth) {
      navigate({ to: "/login" });
      return;
    }

    // if email changed, ensure no duplicate
    if (normalized !== auth && users.some((u) => u.email === normalized)) {
      setMessage("Another account with that email already exists.");
      return;
    }

    const next = users.map((u) => {
      if (u.email === auth) {
        return { ...u, name: name.trim(), phone: phone.trim(), email: normalized };
      }
      return u;
    });

    saveClientUsers(next);
    window.localStorage.setItem(CLIENT_AUTH_STORAGE_KEY, normalized);
    setMessage("Profile updated.");
  };

  const handleChangePassword = () => {
    setMessage(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please complete all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New password and confirmation do not match.");
      return;
    }

    const auth = typeof window !== "undefined" ? window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY) : null;
    if (!auth) {
      navigate({ to: "/login" });
      return;
    }

    const users = loadClientUsers();
    const user = users.find((u) => u.email === auth);
    if (!user) {
      setMessage("Account not found.");
      return;
    }

    if ((user.password || "") !== currentPassword) {
      setMessage("Current password is incorrect.");
      return;
    }

    const next = users.map((u) => (u.email === auth ? { ...u, password: newPassword } : u));
    saveClientUsers(next);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password updated.");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CLIENT_AUTH_STORAGE_KEY);
    }
    navigate({ to: "/login" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-20 w-full">
        <div className="rounded-3xl border border-border bg-card/50 p-8">
          <h1 className="text-3xl font-extrabold mb-2">Your profile</h1>
          <p className="text-sm text-muted-foreground mb-6">Manage your account details and password.</p>

          {message ? (
            <div className="rounded-2xl border p-4 mb-4 border-border bg-background/80">{message}</div>
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
              <span className="text-sm font-medium text-muted-foreground">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="+260 97 000 0000"
              />
            </label>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="w-full rounded-full">Save changes</Button>
              <Button variant="outline" onClick={handleLogout} className="w-full rounded-full">Logout</Button>
            </div>

            <hr className="border-border my-6" />

            <h2 className="text-lg font-semibold">Change password</h2>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="Current password"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="New password"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Confirm new password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                placeholder="Confirm new password"
              />
            </label>

            <Button onClick={handleChangePassword} className="w-full rounded-full">Change password</Button>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            Back to <Link to="/" className="text-accent hover:underline">home</Link>.
          </div>
        </div>
      </div>
    </main>
  );
}
