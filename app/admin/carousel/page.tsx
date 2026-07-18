import type { Metadata } from "next";
import { Suspense } from "react";
import { CarouselView } from "../_components/carousel-view";

export const metadata: Metadata = {
  title: "Carousel Beranda",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <CarouselView />
    </Suspense>
  );
}
