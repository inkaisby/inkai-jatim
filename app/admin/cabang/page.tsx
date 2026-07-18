import type { Metadata } from "next";
import { CabangView } from "../_components/cabang-view";

export const metadata: Metadata = {
  title: "Cabang",
};

export default function AdminCabangPage() {
  return <CabangView />;
}
