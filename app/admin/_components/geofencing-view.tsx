"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardData } from "./dashboard-data-context";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

export function GeofencingView() {
  const router = useRouter();
  const { allDojos } = useDashboardData();
  const [editing, setEditing] = useState<string | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("50");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(id: string) {
    setEditing(id);
    setLat("");
    setLng("");
    setRadius("50");
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/org/dojos/${editing}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat === "" ? null : Number(lat),
          longitude: lng === "" ? null : Number(lng),
          geofenceRadius: Number(radius) || 50,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal menyimpan geofence.");
        return;
      }
      setMessage("Geofence disimpan.");
      setEditing(null);
      router.refresh();
    } catch {
      setMessage("Gagal menyimpan geofence.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Sistem"
        title="Geofencing Absensi"
        description="Atur koordinat & radius absensi per dojo (Inkai API patch dojo)."
      />
      {message && <AdminMessage text={message} />}
      {allDojos.length === 0 ? (
        <AdminEmptyState message="Belum ada dojo pada cakupan." />
      ) : (
        <div className="space-y-2">
          {allDojos.map((dojo) => (
            <article key={dojo.id} className="glass-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{dojo.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {dojo.branchName ?? "—"} · {dojo.address ?? "Alamat belum diisi"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(dojo.id)}
                  className="rounded-lg border border-border/70 px-3 py-1.5 text-xs font-semibold"
                >
                  Edit lokasi
                </button>
              </div>
              {editing === dojo.id && (
                <div className="mt-3 grid gap-2 md:grid-cols-4">
                  <input
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Latitude"
                    className="rounded-xl border border-border/70 px-3 py-2 text-sm"
                  />
                  <input
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Longitude"
                    className="rounded-xl border border-border/70 px-3 py-2 text-sm"
                  />
                  <input
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    placeholder="Radius (m)"
                    className="rounded-xl border border-border/70 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void save()}
                    className="btn-outline text-xs disabled:opacity-50"
                  >
                    Simpan
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
