"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { coords } from "@/lib/institution";

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export default function LiceoMap({ name, address }: { name: string; address: string }) {
  const mapElement = useRef<HTMLDivElement>(null);

  // Leaflet owns this DOM node: the map is created on mount and torn down when the address changes.
  useEffect(() => {
    if (!mapElement.current) return;
    const map = L.map(mapElement.current, {
      center: [coords.lat, coords.lng],
      zoom: 17,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const logoMarker = L.divIcon({
      className: "lpl-map-marker-shell",
      html: '<span class="lpl-map-marker"><strong>Liceo</strong><small>Laprida</small></span>',
      iconSize: [92, 72],
      iconAnchor: [46, 68],
      popupAnchor: [0, -65],
    });

    L.marker([coords.lat, coords.lng], { icon: logoMarker, title: name, alt: name, keyboard: true })
      .addTo(map)
      .bindPopup(`<strong>${escapeHtml(name)}</strong><br>${escapeHtml(address)}`)
      .openPopup();

    const refresh = () => map.invalidateSize();
    requestAnimationFrame(refresh);
    const observer = new ResizeObserver(refresh);
    observer.observe(mapElement.current);

    return () => {
      observer.disconnect();
      map.remove();
    };
  }, [address, name]);

  return (
    <section
      ref={mapElement}
      className="lpl-map"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the Leaflet map is keyboard-operable once focused
      tabIndex={0}
      aria-label={`Mapa interactivo de ${name}. Usá los controles para acercar, alejar o desplazar el mapa.`}
    />
  );
}
