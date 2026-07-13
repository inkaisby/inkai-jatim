import type { HierarchyNode } from "@/lib/dashboard/context";
import { Building2, MapPin, Landmark, Globe2 } from "lucide-react";

const LEVEL_ICON = {
  pusat: Globe2,
  provinsi: Landmark,
  cabang: MapPin,
  dojo: Building2,
};

export function HierarchyBanner({ hierarchy }: { hierarchy: HierarchyNode[] }) {
  return (
    <div className="glass-card-static overflow-hidden p-0 animate-fade-in-up">
      <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
        <h2 className="text-sm font-semibold">Hierarki Organisasi Anda</h2>
        <p className="text-xs text-muted-foreground">
          Pusat (Nasional) → Provinsi → Cabang → Dojo/Ranting
        </p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {hierarchy.map((node, index) => {
          const Icon = LEVEL_ICON[node.level];
          return (
            <div
              key={`${node.level}-${node.id ?? node.name}`}
              className="rounded-2xl border border-border/70 bg-background/50 p-4 transition-all duration-300 hover:border-accent/30 hover:shadow-md animate-scale-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-3 inline-flex rounded-xl bg-accent/10 p-2 text-accent">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {node.level === "pusat"
                  ? "Pusat"
                  : node.level === "provinsi"
                    ? "Provinsi"
                    : node.level === "cabang"
                      ? "Cabang"
                      : "Dojo/Ranting"}
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug">{node.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
