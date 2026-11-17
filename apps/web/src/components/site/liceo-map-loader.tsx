"use client";

import dynamic from "next/dynamic";

const LiceoMap = dynamic(() => import("./liceo-map"), {
  ssr: false,
  loading: () => (
    <div className="map-loading" role="status">
      Cargando mapa…
    </div>
  ),
});

export function LiceoMapLoader(props: { name: string; address: string }) {
  return <LiceoMap {...props} />;
}
