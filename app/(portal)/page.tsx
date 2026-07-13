import Link from "next/link";
import Image from "next/image";
import { getLatestPosts, getPinnedPosts, getUpcomingEvents } from "@/lib/portal/queries";
import { EmptyState, ErrorState } from "./_components/states";
import { HeroSlider } from "./_components/hero-slider";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Award, 
  Newspaper, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  Flame,
  CheckCircle2
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function PortalHomePage() {
  return (
    <main className="space-y-12">
      {/* Dynamic Hero Carousel */}
      <HeroSlider />

      {/* Stats Counter Card */}
      <div className="glass-card p-6 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-accent">50+</div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Dojo Terdaftar</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-foreground">5,000+</div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Karateka Aktif</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-accent">200+</div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sabuk Hitam (DAN)</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-foreground">38</div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Cabang Kota/Kab</div>
          </div>
        </div>
      </div>

      <PortalHomeContent />
    </main>
  );
}

async function PortalHomeContent() {
  const [pinned, latest, upcoming] = await Promise.all([
    getPinnedPosts(3),
    getLatestPosts(6),
    getUpcomingEvents(5),
  ]);

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="space-y-12 lg:col-span-8">
        {/* Pinned Announcements */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-accent animate-bounce" />
              <h2 className="text-xl font-bold tracking-tight">Pengumuman Penting</h2>
            </div>
            <Link className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5" href="/berita">
              <span>Lihat semua</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pinned.ok ? (
              pinned.data.length ? (
                pinned.data.map((p) => (
                  <Link
                    key={p.id}
                    href={`/berita/${p.slug}`}
                    className="glass-card p-6 flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-accent/5 rounded-full blur-xl group-hover:bg-accent/10 transition-colors" />
                    <div>
                      <div className="inline-flex items-center gap-1 rounded bg-accent/10 dark:bg-accent/25 px-2 py-0.5 text-[10px] font-bold text-accent tracking-wider uppercase mb-3">
                        Pinned
                      </div>
                      <h3 className="font-bold text-base group-hover:text-accent transition duration-200 line-clamp-2 leading-snug">
                        {p.title}
                      </h3>
                      {p.excerpt ? (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                          {p.excerpt}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Baca Pengumuman</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState text="Belum ada pengumuman disematkan." />
                </div>
              )
            ) : (
              <div className="col-span-full">
                <ErrorState error={pinned.error} hint={pinned.hint} />
              </div>
            )}
          </div>
        </section>

        {/* Latest News */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold tracking-tight">Berita Terbaru</h2>
            </div>
            <Link className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5" href="/berita">
              <span>Lihat semua</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {latest.ok ? (
              latest.data.length ? (
                latest.data.map((p) => (
                  <Link
                    key={p.id}
                    href={`/berita/${p.slug}`}
                    className="glass-card p-6 flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        BERITA KEGIATAN
                      </span>
                      <h3 className="mt-1 font-bold text-base group-hover:text-accent transition duration-200 line-clamp-2 leading-snug">
                        {p.title}
                      </h3>
                      {p.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                          {p.excerpt}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Selengkapnya</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState text="Belum ada berita yang dipublikasikan." />
                </div>
              )
            ) : (
              <div className="col-span-full">
                <ErrorState error={latest.error} hint={latest.hint} />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sidebar: Events Calendar */}
      <aside className="lg:col-span-4">
        <section className="lg:sticky lg:top-24 space-y-4">
          <div className="flex items-end justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold tracking-tight">Agenda Terdekat</h2>
            </div>
            <Link className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5" href="/agenda">
              <span>Lihat semua</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-3">
            {upcoming.ok ? (
              upcoming.data.length ? (
                upcoming.data.map((e) => {
                  const eventDate = new Date(e.start_at);
                  const day = eventDate.getDate();
                  const month = eventDate.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
                  
                  return (
                    <Link
                      key={e.id}
                      href={`/agenda/${e.slug}`}
                      className="glass-card p-4 flex gap-4 items-center group"
                    >
                      {/* Cool Digital Calendar Ticket */}
                      <div className="flex flex-col items-center justify-center shrink-0 w-12 h-14 rounded-xl bg-accent/5 dark:bg-accent/15 border border-accent/15">
                        <span className="text-xs font-extrabold text-accent">{month}</span>
                        <span className="text-lg font-black text-foreground leading-none">{day}</span>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-foreground group-hover:text-accent transition duration-200 line-clamp-1 leading-snug">
                          {e.title}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          <span>{eventDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
                          {e.location_text && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[150px]">{e.location_text}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <EmptyState text="Belum ada agenda mendatang." />
              )
            ) : (
              <ErrorState error={upcoming.error} hint={upcoming.hint} />
            )}
          </div>

          {/* Dojo Quick Link Action */}
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-card to-muted border border-border p-5 shadow-sm space-y-4">
            <div className="absolute right-0 bottom-0 opacity-10">
              <Award className="w-24 h-24 text-foreground" />
            </div>
            <div className="relative z-10 space-y-2">
              <h4 className="font-bold text-sm">Gabung & Latihan Bersama</h4>
              <p className="text-xs text-muted-foreground">
                Cari dojo (tempat latihan) INKAI terdekat di kabupaten/kota Anda untuk memulai perjalanan karate Anda.
              </p>
              <div className="pt-2">
                <Link className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline" href="/dojo">
                  <span>Telusuri Dojo Jatim</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}


