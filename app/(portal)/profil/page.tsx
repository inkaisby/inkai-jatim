"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { ProfileTabs, PROFILE_SECTIONS } from "../_components/profile-tabs";

export const dynamic = "force-static";

type SectionId = (typeof PROFILE_SECTIONS)[number]["id"];

export default function ProfilPage() {
  const [active, setActive] = useState<SectionId>("sejarah-inkai");
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initialHash = window.location.hash.replace("#", "");
    if (initialHash && PROFILE_SECTIONS.some((s) => s.id === initialHash)) {
      setActive(initialHash as SectionId);
    }
  }, []);

  const handleChange = (id: SectionId) => {
    setActive(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <main>
      <Breadcrumbs
        items={[
          { href: "/", label: "Portal" },
          { href: "/profil", label: "Profil INKAI" },
        ]}
      />

      <ProfileTabs activeId={active} onChange={handleChange} />

      <section className="grid gap-8">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-background/80 via-background/60 to-background/30 p-6 shadow-sm">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {active === "sejarah-inkai" && (
              <>
                  <div className="mb-4 text-center">
                    <h1 className="mb-2 text-xl font-semibold md:text-2xl">
                      Sejarah Berdirinya INKAI
                    </h1>
                    <button
                      type="button"
                      onClick={() => setShowVideo(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2 text-xs font-semibold shadow-sm hover:bg-muted"
                    >
                      <span>▶</span>
                      <span>Tonton Versi Video</span>
                    </button>
                  </div>

                  <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-muted">
                    <img
                      src="/images/sejarah-berdirinya-inkai.png"
                      alt="Foto sejarah berdirinya INKAI"
                      className="h-auto w-full object-cover"
                    />
                  </div>

                  <p className="mb-4 text-justify">
                    Berdirinya INKAI berawal dari rapat yang dilaksanakan di
                    Jalan Matraman Dalam I No. 1 – Jakarta Pusat pada tanggal 15
                    April 1971 yang akhirnya diputuskan mendirikan Perguruan
                    INKAI.
                  </p>

                  <p className="mb-4 text-justify">
                    Dalam rapat yang berlangsung dari mulai pukul 09.00 hingga
                    18.00 WIB tersebut dihadiri oleh beberapa karateka eks PORKI
                    (Persatuan Olah Raga Karate Indonesia) seperti, Sabet
                    Muchsin, Nico A. Lumenta (Tuan Rumah), Abdul Latief, Sori
                    Tua Hutagalung (alm.), Albert L. Tobing (alm.), Wono
                    Sarono, A.Sy. Siregar (alm) dan salah satu karateka INKAI
                    sebagai pembuat dan menggambar lambang INKAI bernama
                    Harsono Rubio (alm). Dalam rapat tersebut disetujui bahwa
                    sebagai Ketua Umum INKAI Pusat pertama adalah Letnan Jendral
                    G.H. Mantik dan sebagai ketua Dewan Guru INKAI Pertama
                    adalah Sabet Muchsin.
                  </p>

                  <p className="mb-4 text-justify">
                    Dalam rapat tersebut, juga dibahas tentang lambang INKAI
                    yang digambar oleh Harsono. Harsono Rubio yang kemudian
                    dikoreksi dan dikritisi oleh tujuh orang anggota dewan guru
                    INKAI tersebut. Belakangan Harsono Rubio menyatakan bahwa
                    lambang INKAI memang dibuat dan digambar oleh beliau, tetapi
                    beliau mengatakan tidak akan mengklaim bahwa beliau yang
                    menggambar lambang INKAI tersebut, melainkan adalah hasil
                    pembahasan bersama antara anggota rapat yang hadir dengan
                    memberikan makna bahwa INKAI adalah milik bersama. Dalam
                    perjalanan sejarahnya INKAI telah banyak melalui rintangan
                    dan cobaan, namun itu tidak membuat INKAI sebagai perguruan
                    karate tidak patah arang, pada perjalanan sejarahnya INKAI
                    telah banyak mencetak karateka–karateka yang mengharumkan
                    nama Indonesia melalui prestasi mereka, baik di tingkat
                    nasional maupun internasional – juara – juara dunia karate.
                  </p>

                  <p className="mb-4 text-justify">
                    Tanggal 25 Mei 1971, INKAI resmi berdiri sebagai perguruan
                    anggota FORKI dan oleh PB FORKI, INKAI ditunjuk mewakili
                    Indonesia mengikuti kejuaraan karate WUKO 1 di Jepang. Dalam
                    perjalanannya, perkembangan INKAI di Indonesia mengalami
                    perkembangan yang begitu pesat ini terbukti bahwa di setiap
                    pelosok tanah air terdapat Cabang–cabang dan Ranting–Ranting
                    Perguruan INKAI. Saat ini INKAI berada di 34 Provinsi di
                    seluruh Tanah Air, dengan jumlah karateka penyandang Sabuk
                    Hitam mencapai lebih dari 22.000 orang dan nomor keanggotaan
                    tingkatan KYU (sabuk putih s.d coklat) mencapai 2 juta orang
                    yang mana terdiri dari kalangan Pelajar, Mahasiswa,
                    TNI/POLRI, ASN, Perbankan, BUMN, BUMD, Swasta serta
                    Affiliasi Pemerintah Daerah dan lain sebagainya.
                  </p>
              </>
            )}

            {showVideo && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="relative w-full max-w-3xl rounded-2xl bg-background p-4 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setShowVideo(false)}
                    className="absolute right-3 top-3 rounded-full border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-muted"
                  >
                    Tutup
                  </button>
                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                    <iframe
                      className="h-full w-full"
                      src="https://www.youtube.com/embed/ZqCoUzRUuQk"
                      title="Sejarah Berdirinya INKAI"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            )}

            {active === "logo-inkai" && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="mb-6 flex justify-center">
                    <img
                      src="/images/logo-inkai.png"
                      alt="Logo resmi INKAI"
                      className="h-40 w-40 rounded-full bg-white object-contain shadow-md md:h-48 md:w-48"
                    />
                  </div>
                  <h1 className="text-2xl font-semibold md:text-3xl">
                    Makna Lambang INKAI
                  </h1>
                </div>

                <div className="flex justify-center">
                  <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                    <img
                      src="/images/makna-lambang-inkai.png"
                      alt="Penjelasan makna lambang INKAI"
                      className="h-auto max-h-[480px] w-full object-contain"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="mb-1 text-xl font-semibold md:text-2xl">
                    Logo INKAI
                  </h2>
                  <p className="mb-6 text-sm text-muted-foreground md:text-base">
                    Silakan download logo INKAI untuk keperluan organisasi.
                  </p>
                  <a
                    href="/files/logo-inkai.png"
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-700"
                    download
                  >
                    <span className="text-lg">⭳</span>
                    <span>Download Logo INKAI</span>
                  </a>
                </div>
              </div>
            )}

            {active === "struktur-organisasi" && (
              <>
                <h2>Struktur Organisasi</h2>
                <p>
                  Struktur organisasi INKAI tersusun dari Pengurus Pusat,
                  pengurus provinsi, pengurus cabang/kabupaten-kota, hingga
                  unit-unit dojo di lapangan. Setiap level memiliki peran dalam
                  pembinaan, administrasi, dan koordinasi kegiatan, sehingga
                  jalur komunikasi dan pembinaan dapat berjalan efektif.
                </p>
                <p>
                  Di Jawa Timur, struktur organisasi mengikuti garis besar
                  tersebut, dengan pengurus provinsi yang membina dan
                  mengoordinasikan cabang dan dojo-dojo anggota di seluruh
                  wilayah Jatim.
                </p>
              </>
            )}

            {active === "visi-misi" && (
              <>
                <h2>Visi &amp; Misi</h2>
                <p>
                  Visi INKAI adalah menjadi perguruan karate yang berkelas dunia,
                  berakar pada nilai-nilai luhur bangsa dan filosofi karate-do.
                </p>
                <p>Misi utama antara lain:</p>
                <ul>
                  <li>
                    Membina karateka yang berakhlak mulia, disiplin, dan tangguh.
                  </li>
                  <li>
                    Mengembangkan prestasi karate di tingkat daerah, nasional,
                    dan internasional.
                  </li>
                  <li>
                    Menyelenggarakan pendidikan dan pelatihan karate yang
                    terstruktur dan berkualitas.
                  </li>
                  <li>
                    Menjaga keharmonisan organisasi dan kemitraan dengan lembaga
                    olahraga terkait.
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

