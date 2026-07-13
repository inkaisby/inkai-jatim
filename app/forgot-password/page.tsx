"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; resetUrl?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await response.json()) as { message?: string; error?: string; resetUrl?: string };
      if (!response.ok) {
        setMessage({ type: "error", text: json.error ?? "Permintaan gagal." });
        return;
      }
      setMessage({
        type: "success",
        text: json.message ?? "Permintaan berhasil.",
        resetUrl: json.resetUrl,
      });
    } catch {
      setMessage({ type: "error", text: "Permintaan gagal." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 animate-fade-in-up">
        <div className="mb-6 flex flex-col items-center">
          <Image src="/logo-inkai.png" alt="Logo INKAI" width={64} height={64} className="rounded-full" />
          <h1 className="mt-4 text-xl font-bold">Lupa Password</h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            Masukkan email terdaftar untuk reset password.
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
            {message.resetUrl && (
              <p className="mt-2 break-all text-xs">
                Dev link:{" "}
                <Link href={message.resetUrl} className="underline">
                  {message.resetUrl}
                </Link>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Email</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-background/50 py-2.5 pl-10 pr-4 text-sm"
                placeholder="nama@email.com"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Memproses..." : "Kirim Link Reset"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="text-accent hover:underline">
            Kembali ke Portal
          </Link>
        </p>
      </div>
    </div>
  );
}
