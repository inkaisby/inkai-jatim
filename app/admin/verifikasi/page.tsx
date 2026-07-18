import type { Metadata } from "next";
import { VerifikasiView } from "../_components/verifikasi-view";

export const metadata: Metadata = {
  title: "Verifikasi",
};

export default function AdminVerifikasiPage() {
  return <VerifikasiView />;
}
