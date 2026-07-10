"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-nexus-void bg-nexus-radial flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="hud-label text-center mb-2">NEXUS ACCESS TERMINAL</p>
        <h1 className="font-display text-3xl text-center font-light mb-8">
          {mode === "login" ? "Sign in" : "Create your account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-nexus-panel border border-nexus-accent/20 rounded-sm px-4 py-3 text-sm outline-none focus:border-nexus-accent transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-nexus-panel border border-nexus-accent/20 rounded-sm px-4 py-3 text-sm outline-none focus:border-nexus-accent transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-nexus-panel border border-nexus-accent/20 rounded-sm px-4 py-3 text-sm outline-none focus:border-nexus-accent transition-colors"
          />

          {error && <p className="text-nexus-warn text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-nexus-accent text-nexus-void font-mono text-sm uppercase tracking-widest py-3 rounded-sm hover:bg-nexus-signal transition-colors disabled:opacity-50"
          >
            {submitting ? "Authenticating…" : mode === "login" ? "Sign In" : "Register"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="w-full text-center text-nexus-muted text-sm mt-6 hover:text-nexus-text transition-colors"
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
