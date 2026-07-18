import type { Metadata } from "next";
import { KegiatanView } from "../_components/kegiatan-view";

export const metadata: Metadata = {
  title: "Kegiatan",
};

export default function AdminKegiatanPage() {
  return <KegiatanView />;
}
