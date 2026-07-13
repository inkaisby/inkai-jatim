"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setMessage({ type: "error", text: json.error ?? "Reset gagal." });
        return;
      }
      setMessage({ type: "success", text: json.message ?? "Password diperbarui." });
    } catch {
      setMessage({ type: "error", text: "Reset gagal." });
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-destructive text-center">
        Token reset tidak valid. Minta link baru dari halaman lupa password.
      </p>
    );
  }

  return (
    <>
      {message && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Password Baru</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-background/50 py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Konfirmasi Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-background/50 py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Menyimpan..." : "Simpan Password Baru"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 animate-fade-in-up">
        <div className="mb-6 flex flex-col items-center">
          <Image src="/logo-inkai.png" alt="Logo INKAI" width={64} height={64} className="rounded-full" />
          <h1 className="mt-4 text-xl font-bold">Reset Password</h1>
        </div>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat...</p>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/forgot-password" className="text-accent hover:underline">
            Minta link baru
          </Link>
        </p>
      </div>
    </div>
  );
}
