import { redirect } from "next/navigation";

/** Alias: di inkai-sby cabang ada di Pengaturan Cabang. */
export default function AdminCabangRedirectPage() {
  redirect("/admin/pengaturan/cabang");
}
