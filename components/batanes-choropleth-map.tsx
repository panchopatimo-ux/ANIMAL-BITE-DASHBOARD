'use client'

import { useEffect, useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { GeoJSON, MapContainer, ScaleControl, TileLayer, useMap } from 'react-leaflet'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

type MunicipalityCase = { name: string; count: number; latest: string }
type MunicipalityProperties = { adm3_en: string }
type MunicipalityFeature = Feature<Geometry, MunicipalityProperties>
type MunicipalityFeatureCollection = FeatureCollection<Geometry, MunicipalityProperties>

// Sequential ramp (light -> dark) for case-density choropleth, ColorBrewer YlOrRd.
const RAMP = ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026']
const NO_DATA_COLOR = '#e2e8f0'
const BOUNDARY_COLOR = '#1f2937'

const normalize = (value: string) => value.trim().toUpperCase()

function getBreaks(counts: number[]) {
  const nonZero = counts.filter((count) => count > 0)
  if (nonZero.length === 0) return [0, 0, 0, 0]
  const max = Math.max(...nonZero)
  const min = Math.min(...nonZero)
  if (max === min) return [max, max, max, max]
  const step = (max - min) / 4
  return [Math.ceil(min + step), Math.ceil(min + step * 2), Math.ceil(min + step * 3), max]
}

function getColor(count: number, breaks: number[]) {
  if (count <= 0) return NO_DATA_COLOR
  if (count <= breaks[0]) return RAMP[0]
  if (count <= breaks[1]) return RAMP[1]
  if (count <= breaks[2]) return RAMP[2]
  if (count <= breaks[3]) return RAMP[3]
  return RAMP[4]
}

function FitBoundsToData({ data }: { data: MunicipalityFeatureCollection }) {
  const map = useMap()
  useEffect(() => {
    const layer = L.geoJSON(data)
    const bounds = layer.getBounds()
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [16, 16] })
  }, [data, map])
  return null
}

function Legend({ breaks, total }: { breaks: number[]; total: number }) {
  const ranges = [
    { label: 'No recorded cases', color: NO_DATA_COLOR },
    { label: `1 – ${breaks[0]}`, color: RAMP[0] },
    { label: `${breaks[0] + 1} – ${breaks[1]}`, color: RAMP[1] },
    { label: `${breaks[1] + 1} – ${breaks[2]}`, color: RAMP[2] },
    { label: `${breaks[2] + 1} – ${breaks[3]}`, color: RAMP[3] },
  ]
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-md border border-border bg-card/95 p-2.5 text-xs shadow-md backdrop-blur-sm sm:p-3">
      <p className="mb-1.5 text-[11px] font-black uppercase tracking-wide text-foreground">Cases by municipality</p>
      <ul className="flex flex-col gap-1">
        {ranges.map((range) => (
          <li key={range.label} className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-sm border border-black/10" style={{ backgroundColor: range.color }} />
            <span className="text-[11px] font-semibold text-muted-foreground">{range.label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 border-t border-border pt-1.5 text-[11px] font-bold text-foreground">N = {total}</p>
    </div>
  )
}

function CompassRose() {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-[400] flex size-9 flex-col items-center justify-center rounded-full border border-border bg-card/95 shadow-md sm:size-11">
      <span className="text-[13px] font-black leading-none text-foreground sm:text-sm">N</span>
      <span aria-hidden="true" className="mt-0.5 h-3 w-0 border-l-2 border-primary sm:h-4" />
    </div>
  )
}

export default function BatanesChoroplethMap({ data, total }: { data: MunicipalityCase[]; total: number }) {
  const [geojson, setGeojson] = useState<MunicipalityFeatureCollection | null>(null)

  useEffect(() => {
    let active = true
    fetch('/data/batanes-municipalities.json')
      .then((res) => res.json())
      .then((json: MunicipalityFeatureCollection) => { if (active) setGeojson(json) })
      .catch(() => { /* keep boundaries empty if the static file fails to load */ })
    return () => { active = false }
  }, [])

  const caseByMunicipality = useMemo(() => {
    const lookup: Record<string, MunicipalityCase> = {}
    data.forEach((entry) => { lookup[normalize(entry.name)] = entry })
    return lookup
  }, [data])

  const breaks = useMemo(() => getBreaks(data.map((entry) => entry.count)), [data])

  if (!geojson) {
    return <div className="flex h-[420px] items-center justify-center rounded-lg border border-border bg-muted/30 text-sm font-semibold text-muted-foreground">Loading municipal boundaries…</div>
  }

  return (
    <div className="relative h-[420px] overflow-hidden rounded-lg border-2 border-border">
      <MapContainer
        center={[20.45, 121.9]}
        zoom={10}
        minZoom={9}
        maxZoom={14}
        scrollWheelZoom
        className="h-full w-full bg-[#eef4f8]"
        attributionControl={false}
      >
        <TileLayer attribution="&copy; OpenStreetMap contributors &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <GeoJSON
          data={geojson}
          style={(feature) => {
            const props = feature?.properties as MunicipalityProperties
            const match = caseByMunicipality[normalize(props?.adm3_en ?? '')]
            return {
              color: BOUNDARY_COLOR,
              weight: 1.5,
              opacity: 1,
              fillColor: getColor(match?.count ?? 0, breaks),
              fillOpacity: 0.82,
            }
          }}
          onEachFeature={(feature: MunicipalityFeature, layer) => {
            const name = feature.properties.adm3_en
            const match = caseByMunicipality[normalize(name)]
            const count = match?.count ?? 0
            const share = total ? ((count / total) * 100).toFixed(1) : '0.0'
            const pathLayer = layer as L.Path
            layer.bindTooltip(
              `<div class="text-center font-sans"><div class="font-black">${name}</div><div class="font-bold">${count} case${count === 1 ? '' : 's'}</div></div>`,
              { permanent: true, direction: 'center', className: 'batanes-municipality-label' },
            )
            layer.bindPopup(
              `<div class="font-sans text-sm"><p class="font-black">${name}</p><p>Cases: <strong>${count}</strong> (${share}% of total)</p>${match?.latest ? `<p>Latest case: <strong>${match.latest}</strong></p>` : ''}</div>`,
            )
            layer.on('mouseover', () => pathLayer.setStyle({ weight: 3, fillOpacity: 0.95 }))
            layer.on('mouseout', () => pathLayer.setStyle({ weight: 1.5, fillOpacity: 0.82 }))
          }}
        />
        <ScaleControl position="bottomright" metric imperial={false} />
        <FitBoundsToData data={geojson} />
      </MapContainer>
      <Legend breaks={breaks} total={total} />
      <CompassRose />
      <style jsx global>{`
        .batanes-municipality-label {
          background: transparent;
          border: none;
          box-shadow: none;
          color: #111827;
          font-size: 11px;
          line-height: 1.1;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9), 0 -1px 2px rgba(255, 255, 255, 0.9);
        }
        .batanes-municipality-label::before {
          display: none;
        }
      `}</style>
    </div>
  )
}
