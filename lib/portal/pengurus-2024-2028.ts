export const PENGURUS_SK = {
  nomor: "07/SK-PP.INKAI/V/2024",
  tanggal: "22 Mei 2024",
  masaBakti: "2024–2028",
  lampiranImages: [
    {
      src: "/images/sk-pengurus-2024-2028-1.png",
      download: "/files/sk-pengurus-2024-2028-1.png",
      label: "Halaman 1 — Pelindung hingga Bidang Organisasi",
    },
    {
      src: "/images/sk-pengurus-2024-2028-2.png",
      download: "/files/sk-pengurus-2024-2028-2.png",
      label: "Halaman 2 — Bidang Pembinaan dan Prestasi",
    },
    {
      src: "/images/sk-pengurus-2024-2028-3.png",
      download: "/files/sk-pengurus-2024-2028-3.png",
      label: "Halaman 3 — Wilayah hingga Bidang Umum",
    },
  ],
  sekretariat: {
    alamat:
      "Jl. Penjaringan Asri IX.29, PS I i No.27, Penjaringan Sari, Kec. Rungkut, Surabaya, Jawa Timur 60297",
    mapsUrl: "https://share.google/CLHoV0eeRrkoGfCxy",
  },
} as const;

export type Person = {
  name: string;
  note?: string;
};

export type Officer = {
  title: string;
  name: string;
  tier: "ketua" | "wakil" | "sekretariat" | "keuangan";
};

export const PELINDUNG: Person[] = [
  { name: "Ketua Umum KONI Provinsi Jawa Timur" },
];

export const PEMBINA: Person[] = [
  { name: "Ketua Umum FORKI Provinsi Jawa Timur" },
  { name: "Drs. Totok Lusida, Apt." },
];

export const PENASEHAT: Person[] = [
  { name: "Kadar Harjanto, S.Sos." },
  { name: "Drs. Dicky Budi Setiawan, M.Pd." },
  { name: "Drs. Atjuk Sukotjo, S.H." },
  { name: "Ir. Purwanto" },
];

export const PENGURUS_INTI: Officer[] = [
  { title: "Ketua Umum", name: "Suyanto Kasdi, S.H.", tier: "ketua" },
  { title: "Wakil Ketua Umum 1", name: "Ir. Sujatmiko", tier: "wakil" },
  { title: "Wakil Ketua Umum 2", name: "Janoto, S.Pd.", tier: "wakil" },
  { title: "Wakil Ketua Umum 3", name: "Lasimin", tier: "wakil" },
  {
    title: "Sekretaris",
    name: "Aris Nur Rachman, S.Pd.Or.",
    tier: "sekretariat",
  },
  {
    title: "Wakil Sekretaris",
    name: "Diana Sri Handayani",
    tier: "sekretariat",
  },
  { title: "Bendahara", name: "Junaidi", tier: "keuangan" },
  { title: "Wakil Bendahara", name: "Kusworo", tier: "keuangan" },
];

export type BidangSection = {
  id: string;
  title: string;
  subsections: {
    title: string;
    groups?: { title: string; members: Person[] }[];
    members?: Person[];
  }[];
};

export const BIDANG: BidangSection[] = [
  {
    id: "bidang-organisasi",
    title: "1. Bidang Organisasi",
    subsections: [
      {
        title: "a. Keanggotaan dan Data",
        members: [
          { name: "Indiantoko, S.E." },
          { name: "Aprilia Kusumawardani, S.Gz." },
        ],
      },
      {
        title: "b. Kehumasan",
        members: [
          { name: "Antonius JKLB Balun, S.T." },
          { name: "Santoso" },
        ],
      },
    ],
  },
  {
    id: "bidang-pembinaan",
    title: "2. Bidang Pembinaan dan Prestasi",
    subsections: [
      {
        title: "a. Bidang Pelatihan",
        groups: [
          {
            title: "1) Provinsi",
            members: [
              { name: "Hasan A. Hamid" },
              { name: "Muhaiyang Sirathak, S.T." },
              { name: "Johan Kandou" },
              { name: "Harison P. Situmorang, S.T." },
              { name: "Ivan Adhi Baskara" },
            ],
          },
          {
            title: "2) Wilayah",
            members: [
              { name: "Gilang Vega Riantono, S.H.", note: "Barat" },
              { name: "Duchan Fanani, S.E.", note: "Tengah" },
              { name: "Ari Budiarto, S.Pd.", note: "Utara" },
              { name: "Firda Dian Permana, S.Pd.", note: "Timur" },
            ],
          },
        ],
      },
      {
        title: "b. Bidang Pertandingan",
        members: [
          { name: "Jantan Yudhistira" },
          { name: "Andrias Santoso" },
        ],
      },
      {
        title: "c. Bidang Perwasitan",
        members: [
          { name: "Didi Sumardi" },
          { name: "Subandi, S.Ag., M.Pd.I." },
          { name: "Hotma P. Siahaan, S.H." },
        ],
      },
      {
        title: "d. Bidang Gashuku dan Ujian",
        members: [
          { name: "Toni Siswanto, S.T." },
          { name: "M. Imam Muarif, S.T." },
        ],
      },
    ],
  },
  {
    id: "bidang-umum",
    title: "3. Bidang Umum",
    subsections: [
      {
        title: "a. Bidang Dana dan Usaha",
        members: [
          { name: "Andi Irawan, Ph.D." },
          { name: "Dodik Budi Santoso" },
        ],
      },
      {
        title: "b. Bidang Sarana Prasarana dan Kesekretariatan",
        members: [
          { name: "Sumaryono" },
          { name: "Setia Basuki" },
          { name: "Erna Widiyanti" },
        ],
      },
      {
        title: "c. Bidang Publikasi dan Dokumentasi",
        members: [{ name: "Aulia Rahmawati, S.Pd.Or." }],
      },
    ],
  },
];

export function initials(name: string) {
  const parts = name
    .replace(/,.*$/, "")
    .split(/\s+/)
    .filter((p) => p && !/^(drs?|ir|apt|s\.|m\.|ph\.d)/i.test(p));
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
