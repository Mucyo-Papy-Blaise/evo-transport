'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Loader2 } from 'lucide-react';
import type { MapLocation } from '@/hooks/useMapBooking';
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
} from '@/components/booking/mapBookingConstants';

interface MapViewProps {
  from: MapLocation | null;
  to: MapLocation | null;
  isGeocoding: boolean;
  onMapClick: (lat: number, lng: number) => void;
}

const EMPTY_ROUTE: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  geometry: { type: 'LineString', coordinates: [] },
  properties: {},
};

function buildArc(a: MapLocation, b: MapLocation): GeoJSON.Feature<GeoJSON.LineString> {
  const dy = b.latitude - a.latitude;
  const dx = b.longitude - a.longitude;
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-10) {
    return {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[a.longitude, a.latitude]] },
      properties: {},
    };
  }
  const offset = dist * 0.25;
  const midLat = (a.latitude + b.latitude) / 2 - (dx * offset) / dist;
  const midLng = (a.longitude + b.longitude) / 2 + (dy * offset) / dist;
  const steps  = 80;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps,
      t1 = 1 - t;
    coords.push([
      t1 * t1 * a.longitude + 2 * t1 * t * midLng + t * t * b.longitude,
      t1 * t1 * a.latitude + 2 * t1 * t * midLat + t * t * b.latitude,
    ]);
  }
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates: coords },
    properties: {},
  };
}

function createPinElement(
  label: string,
  variant: "departure" | "destination",
): HTMLElement {
  const fill =
    variant === "departure" ? "var(--button)" : "var(--primary)";
  const chipFg =
    variant === "departure" ? "#0f172a" : "var(--primary-foreground)";
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "display:flex;flex-direction:column;align-items:center;cursor:pointer;";

  const chip = document.createElement("div");
  chip.textContent = label;
  chip.style.cssText = `background:${fill};color:${chipFg};font-size:11px;font-weight:700;
    padding:3px 10px;border-radius:999px;margin-bottom:2px;white-space:nowrap;
    max-width:180px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 8px rgba(0,0,0,0.25);`;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "30");
  svg.setAttribute("height", "30");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.3))";
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", fill);
  path.setAttribute('d', 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z');
  svg.appendChild(path);
  wrap.appendChild(chip);
  wrap.appendChild(svg);
  return wrap;
}

export function MapView({ from, to, isGeocoding, onMapClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const fromMarker = useRef<mapboxgl.Marker | null>(null);
  const toMarker = useRef<mapboxgl.Marker | null>(null);
  /** Avoid flying to default Europe view on first mount (map is already initialized there). */
  const hadAnyPinRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      minZoom: 2,
      maxZoom: 14,
      projection: { name: 'mercator' },
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );
    map.addControl(
      new mapboxgl.ScaleControl({ maxWidth: 100, unit: "metric" }),
      "bottom-left",
    );

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: EMPTY_ROUTE,
      });
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#3b82f6', 'line-width': 10, 'line-opacity': 0.12 },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#2563eb',
          'line-width': 2.5,
          'line-dasharray': [3, 2],
          'line-opacity': 0.9,
        },
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e: mapboxgl.MapMouseEvent) => {
      if (isGeocoding) return;
      onMapClick(e.lngLat.lat, e.lngLat.lng);
    };
    map.on("click", handler);
    map.getCanvas().style.cursor = isGeocoding ? "wait" : "crosshair";
    return () => {
      map.off("click", handler);
    };
  }, [isGeocoding, onMapClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    fromMarker.current?.remove();
    if (from) {
      fromMarker.current = new mapboxgl.Marker({
        element: createPinElement(from.city || from.name, "departure"),
        anchor: "bottom",
      }).setLngLat([from.longitude, from.latitude]).addTo(map);
    }
  }, [from]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    toMarker.current?.remove();
    if (to) {
      toMarker.current = new mapboxgl.Marker({
        element: createPinElement(to.city || to.name, "destination"),
        anchor: "bottom",
      }).setLngLat([to.longitude, to.latitude]).addTo(map);
    }
  }, [to]);

  /** Route curve + camera: both pins → fit bounds; one pin → fly to stop; none → default Europe view. */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateRouteAndCamera = () => {
      const source = map.getSource('route') as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      if (from || to) hadAnyPinRef.current = true;

      if (from && to) {
        source.setData(buildArc(from, to));
        const bounds = new mapboxgl.LngLatBounds()
          .extend([from.longitude, from.latitude])
          .extend([to.longitude, to.latitude]);
        map.fitBounds(bounds, { padding: 80, maxZoom: 10, duration: 800 });
        return;
      }

      source.setData(EMPTY_ROUTE);

      if (from) {
        map.flyTo({
          center: [from.longitude, from.latitude],
          zoom: Math.max(map.getZoom(), 6.2),
          duration: 650,
        });
        return;
      }

      if (to) {
        map.flyTo({
          center: [to.longitude, to.latitude],
          zoom: Math.max(map.getZoom(), 6.2),
          duration: 650,
        });
        return;
      }

      if (hadAnyPinRef.current) {
        map.flyTo({
          center: MAP_DEFAULT_CENTER,
          zoom: MAP_DEFAULT_ZOOM,
          duration: 800,
        });
        hadAnyPinRef.current = false;
      }
    };

    if (map.isStyleLoaded()) updateRouteAndCamera();
    else map.once('load', updateRouteAndCamera);
  }, [from, to]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />

      {isGeocoding && (
        <div
          className="absolute inset-0 flex items-center justify-center
                        bg-background/20 backdrop-blur-[1px] pointer-events-none z-20"
        >
          <div
            className="bg-background border border-border rounded-xl shadow-xl
                          px-4 py-2.5 flex items-center gap-2 text-sm font-medium"
          >
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Locating…
          </div>
        </div>
      )}
    </div>
  );
}
