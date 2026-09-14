'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

type Location = { name: string; count: number; latest: string }

export default function BatanesCaseMap({ locations }: { locations: Location[] }) {
  const max = Math.max(1, ...locations.map((location) => location.count))
  return (
    <div className="h-[360px] overflow-hidden rounded-lg border border-primary/20">
      <MapContainer center={[20.45, 121.97]} zoom={11} minZoom={10} maxZoom={15} maxBounds={[[20.05, 121.55], [20.85, 122.25]]} maxBoundsViscosity={1} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.map((location, index) => {
          const points: [number, number][] = [[20.45, 121.97], [20.33, 121.86], [20.72, 121.81], [20.17, 121.94], [20.60, 122.00], [20.36, 121.80], [20.47, 121.95], [20.67, 121.82]]
          const point = points[index % points.length]
          return <CircleMarker key={location.name} center={point} radius={10 + (location.count / max) * 18} pathOptions={{ color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.35 + (location.count / max) * 0.5 }}><Popup><strong>{location.name}</strong><br />{location.count} cases<br />Latest: {location.latest}</Popup></CircleMarker>
        })}
      </MapContainer>
    </div>
  )
}
