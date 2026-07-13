"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  MapPin,
  ChevronDown,
  ArrowRight,
  Building2,
} from "lucide-react";
import {
  fetchDojosByBranch,
  fetchJatimBranches,
  type BranchOption,
  type DojoOption,
} from "@/lib/portal/branches";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    branchId: "",
    dojoId: "",
  });
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [dojos, setDojos] = useState<DojoOption[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [dojosLoading, setDojosLoading] = useState(false);
  const [branchesError, setBranchesError] = useState<string | null>(null);
  const [dojosError, setDojosError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || activeTab !== "register") return;

    let cancelled = false;

    async function loadBranches() {
      setBranchesLoading(true);
      setBranchesError(null);

      const result = await fetchJatimBranches();

      if (cancelled) return;

      if (!result.ok) {
        setBranches([]);
        setBranchesError(result.error);
      } else {
        setBranches(result.data);
      }

      setBranchesLoading(false);
    }

    void loadBranches();

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (!formData.branchId) {
      setDojos([]);
      setDojosError(null);
      return;
    }

    let cancelled = false;

    async function loadDojos() {
      setDojosLoading(true);
      setDojosError(null);

      const result = await fetchDojosByBranch(formData.branchId);

      if (cancelled) return;

      if (!result.ok) {
        setDojos([]);
        setDojosError(result.error);
      } else {
        setDojos(result.data);
      }

      setDojosLoading(false);
    }

    void loadDojos();

    return () => {
      cancelled = true;
    };
  }, [formData.branchId]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "branchId") {
        return { ...prev, branchId: value, dojoId: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (activeTab === "login") {
        if (!formData.email || !formData.password) {
          setMessage({ type: "error", text: "Silakan isi semua field." });
          return;
        }

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        });

        const json = (await response.json()) as {
          ok?: boolean;
          message?: string;
          error?: string;
          user?: { profileStatus?: string | null; fullName?: string | null };
        };

        if (!response.ok) {
          setMessage({ type: "error", text: json.error ?? "Login gagal." });
          return;
        }

        if (json.user?.profileStatus === "pending") {
          setMessage({
            type: "success",
            text: "Login berhasil. Akun Anda menunggu verifikasi admin.",
          });
        } else if (json.user?.profileStatus === "rejected") {
          setMessage({
            type: "error",
            text: "Akun ditolak. Hubungi pengurus INKAI Jatim.",
          });
          await fetch("/api/auth/logout", { method: "POST" });
          return;
        } else {
          setMessage({
            type: "success",
            text: json.message ?? "Login berhasil!",
          });
        }

        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else {
        if (
          !formData.name ||
          !formData.branchId ||
          !formData.dojoId ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword
        ) {
          setMessage({ type: "error", text: "Silakan isi semua field wajib." });
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
          return;
        }
        if (formData.password.length < 6) {
          setMessage({ type: "error", text: "Password minimal 6 karakter." });
          return;
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            branchId: formData.branchId,
            dojoId: formData.dojoId,
          }),
        });

        const json = (await response.json()) as { ok?: boolean; message?: string; error?: string };

        if (!response.ok) {
          setMessage({ type: "error", text: json.error ?? "Pendaftaran gagal." });
          return;
        }

        setMessage({
          type: "success",
          text: json.message ?? "Pendaftaran berhasil! Silakan login.",
        });

        setTimeout(() => {
          setActiveTab("login");
          setMessage(null);
          setFormData({
            name: "",
            email: formData.email.trim(),
            password: "",
            confirmPassword: "",
            branchId: "",
            dojoId: "",
          });
        }, 2500);
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-background border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer active:scale-95"
          aria-label="Tutup"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="relative mb-4 flex flex-col items-center">
          <div className="relative">
            <div className="absolute -inset-1.5 rounded-full bg-accent/20 blur opacity-75 animate-pulse" />
            <Image
              src="/logo-inkai.png"
              alt="Logo INKAI"
              width={70}
              height={70}
              className="relative rounded-full bg-card p-1 ring-1 ring-border shadow-md"
              priority
            />
          </div>
          <h3 className="mt-3 text-lg font-bold tracking-tight text-center">
            PORTAL ANGGOTA <span className="text-accent">INKAI</span>
          </h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
            Jawa Timur
          </p>
        </div>

        <div className="w-full flex rounded-full bg-muted/60 p-1 border border-border/60 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setMessage(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-300 cursor-pointer ${
              activeTab === "login"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setMessage(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-300 cursor-pointer ${
              activeTab === "register"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pendaftaran
          </button>
        </div>

        {message && (
          <div
            className={`w-full p-3.5 mb-4 rounded-xl border text-xs leading-relaxed ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400"
                : "bg-destructive/10 border-destructive/20 text-destructive dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {activeTab === "register" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/80 bg-background/50 text-sm focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Provinsi</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value="Jawa Timur"
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/80 bg-muted/40 text-sm text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Cabang</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    required
                    disabled={branchesLoading || !!branchesError}
                    className="w-full appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-border/80 bg-background/50 text-sm focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all disabled:opacity-60"
                  >
                    <option value="">
                      {branchesLoading
                        ? "Memuat daftar cabang..."
                        : branchesError
                          ? "Gagal memuat cabang"
                          : "Pilih cabang"}
                    </option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                        {branch.city ? ` — ${branch.city}` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </div>
                {branchesError && (
                  <p className="text-[11px] text-destructive">{branchesError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Dojo / Ranting</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <select
                    name="dojoId"
                    value={formData.dojoId}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.branchId || dojosLoading || !!dojosError}
                    className="w-full appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-border/80 bg-background/50 text-sm focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all disabled:opacity-60"
                  >
                    <option value="">
                      {!formData.branchId
                        ? "Pilih cabang terlebih dahulu"
                        : dojosLoading
                          ? "Memuat dojo/ranting..."
                          : dojosError
                            ? "Gagal memuat dojo"
                            : "Pilih dojo/ranting"}
                    </option>
                    {dojos.map((dojo) => (
                      <option key={dojo.id} value={dojo.id}>
                        {dojo.name}
                        {dojo.address ? ` — ${dojo.address}` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </div>
                {dojosError && <p className="text-[11px] text-destructive">{dojosError}</p>}
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="nama@email.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/80 bg-background/50 text-sm focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-border/80 bg-background/50 text-sm focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Konfirmasi Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-border/80 bg-background/50 text-sm focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold tracking-wide text-accent-foreground shadow-md shadow-accent/20 transition-all duration-300 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/30 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-accent-foreground border-t-transparent" />
            ) : activeTab === "login" ? (
              <>
                <span>Masuk Ke Portal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Daftar Anggota</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          {activeTab === "login" ? (
            <p>
              Belum punya akun?{" "}
              <button
                onClick={() => {
                  setActiveTab("register");
                  setMessage(null);
                }}
                className="text-accent hover:underline font-semibold cursor-pointer"
              >
                Daftar Sekarang
              </button>
            </p>
          ) : (
            <p>
              Sudah punya akun?{" "}
              <button
                onClick={() => {
                  setActiveTab("login");
                  setMessage(null);
                }}
                className="text-accent hover:underline font-semibold cursor-pointer"
              >
                Login di sini
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
