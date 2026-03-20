'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Loader2, MapPin } from 'lucide-react';
import { cn } from '@/utils/utils';
import type { MapLocation } from '@/hooks/useMapBooking';

interface MapViewProps {
  from:        MapLocation | null;
  to:          MapLocation | null;
  pinMode:     'from' | 'to';
  isGeocoding: boolean;
  onMapClick:  (lat: number, lng: number) => void;
}

function buildArc(a: MapLocation, b: MapLocation): GeoJSON.Feature<GeoJSON.LineString> {
  const dy     = b.latitude  - a.latitude;
  const dx     = b.longitude - a.longitude;
  const dist   = Math.hypot(dx, dy);
  const offset = dist * 0.25;
  const midLat = (a.latitude  + b.latitude)  / 2 - dx * offset / dist;
  const midLng = (a.longitude + b.longitude) / 2 + dy * offset / dist;
  const steps  = 80;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, t1 = 1 - t;
    coords.push([
      t1*t1*a.longitude + 2*t1*t*midLng + t*t*b.longitude,
      t1*t1*a.latitude  + 2*t1*t*midLat + t*t*b.latitude,
    ]);
  }
  return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} };
}

function createPinElement(label: string, color: 'emerald' | 'rose'): HTMLElement {
  const bg = color === 'emerald' ? '#10b981' : '#f43f5e';
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;';

  const chip = document.createElement('div');
  chip.textContent = label;
  chip.style.cssText = `background:${bg};color:#fff;font-size:10px;font-weight:700;
    padding:2px 8px;border-radius:999px;margin-bottom:2px;white-space:nowrap;
    max-width:160px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 8px rgba(0,0,0,0.25);`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '28'); svg.setAttribute('height', '28'); svg.setAttribute('viewBox', '0 0 24 24');
  svg.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', bg);
  path.setAttribute('d', 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z');
  svg.appendChild(path);
  wrap.appendChild(chip);
  wrap.appendChild(svg);
  return wrap;
}

export function MapView({ from, to, pinMode, isGeocoding, onMapClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const fromMarker   = useRef<mapboxgl.Marker | null>(null);
  const toMarker     = useRef<mapboxgl.Marker | null>(null);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

    const map = new mapboxgl.Map({
      container:  containerRef.current,
      style:      'mapbox://styles/mapbox/light-v11',
      center:     [10.0, 48.5],        // Europe centre
      zoom:       4.2,                  // tight zoom → no globe
      minZoom:    2,
      maxZoom:    14,
      projection: { name: 'mercator' }, // ← flat map, kills the globe
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} },
      });
      map.addLayer({ id: 'route-glow', type: 'line', source: 'route',
        paint: { 'line-color': '#3b82f6', 'line-width': 10, 'line-opacity': 0.12 } });
      map.addLayer({ id: 'route-line', type: 'line', source: 'route',
        paint: { 'line-color': '#2563eb', 'line-width': 2.5, 'line-dasharray': [3, 2], 'line-opacity': 0.9 } });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Click ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e: mapboxgl.MapMouseEvent) => {
      if (isGeocoding) return;
      onMapClick(e.lngLat.lat, e.lngLat.lng);
    };
    map.on('click', handler);
    map.getCanvas().style.cursor = isGeocoding ? 'wait' : 'crosshair';
    return () => { map.off('click', handler); };
  }, [isGeocoding, onMapClick]);

  // ── FROM marker ───────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    fromMarker.current?.remove();
    if (from) {
      fromMarker.current = new mapboxgl.Marker({
        element: createPinElement(from.city || from.name, 'emerald'), anchor: 'bottom',
      }).setLngLat([from.longitude, from.latitude]).addTo(map);
    }
  }, [from]);

  // ── TO marker ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    toMarker.current?.remove();
    if (to) {
      toMarker.current = new mapboxgl.Marker({
        element: createPinElement(to.city || to.name, 'rose'), anchor: 'bottom',
      }).setLngLat([to.longitude, to.latitude]).addTo(map);
    }
  }, [to]);

  // ── Route arc ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const update = () => {
      const source = map.getSource('route') as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;
      if (from && to) {
        source.setData(buildArc(from, to));
        const bounds = new mapboxgl.LngLatBounds()
          .extend([from.longitude, from.latitude])
          .extend([to.longitude,   to.latitude]);
        map.fitBounds(bounds, { padding: 80, maxZoom: 10, duration: 800 });
      } else {
        source.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} });
      }
    };

    if (map.isStyleLoaded()) update();
    else map.once('load', update);
  }, [from, to]);

  return (
    // Fixed 460px height — map stays compact and proportional
    <div className="relative w-full" style={{ height: 460 }}>
      <div ref={containerRef} className="absolute inset-0" />

      {/* Geocoding spinner */}
      {isGeocoding && (
        <div className="absolute inset-0 flex items-center justify-center
                        bg-background/20 backdrop-blur-[1px] pointer-events-none z-20">
          <div className="bg-background border border-border rounded-xl shadow-xl
                          px-4 py-2.5 flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Locating…
          </div>
        </div>
      )}

      {/* Pin mode hint */}
      {!isGeocoding && (
        <div className={cn(
          'absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none',
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg',
          pinMode === 'from' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white',
        )}>
          <MapPin className="h-3 w-3" />
          {pinMode === 'from' ? 'Click map to set departure' : 'Click map to set destination'}
        </div>
      )}
    </div>
  );
}