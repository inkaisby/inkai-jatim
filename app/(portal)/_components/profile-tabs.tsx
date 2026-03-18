export const PROFILE_SECTIONS = [
  { id: "sejarah-inkai", label: "Sejarah INKAI" },
  { id: "logo-inkai", label: "Logo INKAI" },
  { id: "struktur-organisasi", label: "Struktur Organisasi" },
  { id: "visi-misi", label: "Visi & Misi" },
] as const;

type SectionId = (typeof PROFILE_SECTIONS)[number]["id"];

export function ProfileTabs({
  activeId,
  onChange,
}: {
  activeId: SectionId;
  onChange: (id: SectionId) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 text-sm">
      {PROFILE_SECTIONS.map((section) => {
        const isActive = activeId === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={[
              "rounded-full border border-border px-3 py-1 shadow-sm backdrop-blur transition",
              isActive
                ? "bg-foreground text-background"
                : "bg-background/40 text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            {section.label}
          </button>
        );
      })}
    </div>
  );
}

