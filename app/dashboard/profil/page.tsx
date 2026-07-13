import type { Metadata } from "next";
import { ProfilView } from "../_components/profil-view";

export const metadata: Metadata = {
  title: "Profil Akun",
};

export default function DashboardProfilPage() {
  return <ProfilView />;
}
