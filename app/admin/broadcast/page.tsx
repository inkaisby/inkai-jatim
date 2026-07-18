import type { Metadata } from "next";
import { BroadcastView } from "../_components/broadcast-view";

export const metadata: Metadata = {
  title: "Broadcast",
};

export default function AdminBroadcastPage() {
  return <BroadcastView />;
}
