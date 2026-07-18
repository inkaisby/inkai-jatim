export function billingStatusLabel(status: string): string {
  switch (status) {
    case "PAID":
      return "Lunas";
    case "WAITING_VERIFICATION":
      return "Menunggu verifikasi";
    case "PENDING":
      return "Belum bayar";
    case "REJECTED":
      return "Ditolak";
    case "CANCELLED":
      return "Dibatalkan";
    default:
      return status || "—";
  }
}

export function memberStatusLabel(status: string): string {
  switch (status) {
    case "Active":
    case "ACTIVE":
    case "AKTIF":
      return "Aktif";
    case "PENDING":
      return "Pending";
    case "REJECTED":
      return "Ditolak";
    case "INACTIVE":
      return "Nonaktif";
    case "SUSPENDED":
      return "Ditangguhkan";
    default:
      return status || "—";
  }
}
