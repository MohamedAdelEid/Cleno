import { ExternalLink } from 'lucide-react'

import { cn } from '@/presentation/utils'

interface ShipmentMapPreviewProps {
  mapUrl: string
  openMapLabel: string
  className?: string
}

const parseCoordsFromMapUrl = (mapUrl: string) => {
  const atMatch = mapUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (!atMatch) return null

  return {
    latitude: Number(atMatch[1]),
    longitude: Number(atMatch[2]),
  }
}

export const buildMapEmbedUrl = (mapUrl: string) => {
  const coords = parseCoordsFromMapUrl(mapUrl)
  if (coords) {
    return `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&hl=en&z=17&output=embed`
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(mapUrl)}&hl=en&z=17&output=embed`
}

export const ShipmentMapPreview = ({ mapUrl, openMapLabel, className }: ShipmentMapPreviewProps) => (
  <div className={cn('group relative h-44 overflow-hidden rounded-xl border border-border/60', className)}>
    <iframe
      title={openMapLabel}
      src={buildMapEmbedUrl(mapUrl)}
      className="h-full w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />

    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute end-2 bottom-2 inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/95 px-2 py-1 text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm transition-opacity hover:bg-background"
    >
      <ExternalLink className="size-3" strokeWidth={2} />
      {openMapLabel}
    </a>
  </div>
)
