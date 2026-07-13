import type { Metadata } from "next";
import { OrganisasiView } from "../_components/organisasi-view";

export const metadata: Metadata = {
  title: "Organisasi",
};

export default function DashboardOrganisasiPage() {
  return <OrganisasiView />;
}
