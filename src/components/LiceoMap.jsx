import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useSite } from "../site/SiteContext"

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

export default function LiceoMap() {
  const { institution } = useSite()
  const mapElement = useRef(null)
  const name = institution.legalName
  const address = institution.address
  const { lat, lng } = institution.coords

  useEffect(() => {
    const map = L.map(mapElement.current, {
      center: [lat, lng],
      zoom: 17,
      scrollWheelZoom: false,
      zoomControl: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
    })

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const logoMarker = L.divIcon({
      className: "lpl-map-marker-shell",
      html: '<span class="lpl-map-marker"><strong>Liceo</strong><small>Laprida</small></span>',
      iconSize: [92, 72],
      iconAnchor: [46, 68],
      popupAnchor: [0, -65],
    })

    L.marker([lat, lng], {
      icon: logoMarker,
      title: name,
      alt: name,
      keyboard: true,
    })
      .addTo(map)
      .bindPopup(`<strong>${escapeHtml(name)}</strong><br>${escapeHtml(address)}`)
      .openPopup()

    const refresh = () => map.invalidateSize()
    requestAnimationFrame(refresh)
    const observer = new ResizeObserver(refresh)
    observer.observe(mapElement.current)

    return () => {
      observer.disconnect()
      map.remove()
    }
  }, [address, lat, lng, name])

  return (
    <div
      ref={mapElement}
      className="lpl-map"
      role="region"
      tabIndex={0}
      aria-label={`Mapa interactivo de ${name}. Usá los controles para acercar, alejar o desplazar el mapa.`}
    />
  )
}
