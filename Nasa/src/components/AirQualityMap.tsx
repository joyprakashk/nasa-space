import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AirQualityStation } from '../types/airQuality';
import { getAQITextColor } from '../types/airQuality';
import { getAQIHex, getAQIOpacity, getColorForPercent } from '../types/airQuality';
import { stateAQIData, computeRegionSummaries, RegionSummary } from '../data/airQualityData';
import RegionDetailsPanel from './RegionDetailsPanel';
import { useMemo } from 'react';

interface AirQualityMapProps {
  stations: AirQualityStation[];
  onStationClick: (station: AirQualityStation) => void;
  onRegionClick?: (region: RegionSummary) => void;
}

const AirQualityMap = ({ stations, onStationClick, onRegionClick }: AirQualityMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);
  const stateMarkersRef = useRef<L.Marker[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'aqi' | 'pm25' | 'pm10' | 'o3' | 'no2'>('aqi');
  const [showStates, setShowStates] = useState(true);
  const [selectedBasemap, setSelectedBasemap] = useState<'osm' | 'stamen' | 'carto'>('osm');
  const [showOverlays, setShowOverlays] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  // Initialize the Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
      minZoom: 1,
    });

    // Start with selected basemap (default OSM)
    const basemaps: Record<string, { url: string; options?: L.TileLayerOptions }> = {
      osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', options: { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 } },
      stamen: { url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', options: { attribution: 'Map tiles by Stamen Design', maxZoom: 18 } },
      carto: { url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', options: { attribution: '&copy; OpenStreetMap & CartoDB', maxZoom: 19 } },
    };

  const chosen = basemaps[selectedBasemap];
  const tl = L.tileLayer(chosen.url, chosen.options);
  tl.addTo(map);
  tileLayerRef.current = tl;

    mapRef.current = map;

    return () => {
      // cleanup
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers and shaded circles when stations or metric change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // remove previous markers/circles
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    circlesRef.current.forEach(c => c.remove());
    circlesRef.current = [];
    stateMarkersRef.current.forEach(m => m.remove());
    stateMarkersRef.current = [];

    const metricMax: Record<string, number> = {
      aqi: 500,
      pm25: 150,
      pm10: 250,
      o3: 200,
      no2: 100,
    };

  stations.forEach(station => {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:${getAQIHex(station.aqi)};color:#fff;font-weight:700;box-shadow:0 4px 8px rgba(0,0,0,0.15);">${station.aqi}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker(station.coords, { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:200px;padding:8px;font-family:Inter,Arial,sans-serif;">
            <div style="font-weight:700;margin-bottom:6px;color:#0f172a;">${station.name}</div>
            <div style="font-size:13px;color:#334155;display:flex;justify-content:space-between;">
              <span>AQI:</span>
              <span style="font-weight:700;color:${getAQITextColor(station.aqi)}">${station.aqi}</span>
            </div>
            <div style="font-size:12px;color:#64748b;margin-top:6px;">${station.level ?? ''}</div>
            <div style="margin-top:8px;border-top:1px solid #e6eef8;padding-top:8px;">
              <button onclick="window.selectStation('${station.id}')" style="width:100%;padding:6px 8px;background:#2563eb;color:#fff;border-radius:6px;border:none;cursor:pointer;font-size:13px;">View Details</button>
            </div>
          </div>
        `);

      marker.on('click', () => onStationClick(station));

      markersRef.current.push(marker);

  // Draw shaded circle based on selected metric
  const metricValue = selectedMetric === 'aqi' ? station.aqi : ((station.pollutants as any) ?? {})[selectedMetric];
      const max = metricMax[selectedMetric];
      const percent = Math.min(1, Math.max(0, (metricValue ?? 0) / max));

      const fillColor = selectedMetric === 'aqi' ? getAQIHex(station.aqi) : getColorForPercent(percent);
      // For opacity, if metric is AQI we use AQI-based helper, otherwise scale percent
      const fillOpacity = selectedMetric === 'aqi' ? getAQIOpacity(station.aqi) : Math.min(0.85, 0.25 + percent * 0.75);

      const radius = 20000 + percent * 160000; // visual radius in meters

      const circle = L.circle(station.coords, {
        radius,
        color: fillColor,
        weight: 0,
        fillColor,
        fillOpacity,
      }).addTo(map);
      if (showOverlays) {
        circle.addTo(map);
        circle.bindTooltip(`${station.name}: ${selectedMetric.toUpperCase()} ${Math.round((metricValue ?? 0) * 10) / 10}`, { direction: 'center', permanent: false, className: 'text-sm' });
        circlesRef.current.push(circle);
      } else {
        // don't add to map
        circle.remove();
      }
    });

    // Add state markers if enabled
    if (showStates) {
  stateAQIData.forEach(state => {
        const stateIcon = L.divIcon({
          className: 'state-marker',
          html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:6px;background:${getAQIHex(state.aqi)};color:#fff;font-weight:600;font-size:11px;box-shadow:0 2px 4px rgba(0,0,0,0.1);border:2px solid white;">${state.aqi}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const stateMarker = L.marker(state.coords as [number, number], { icon: stateIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:150px;padding:6px;font-family:Inter,Arial,sans-serif;">
              <div style="font-weight:700;margin-bottom:4px;color:#0f172a;font-size:14px;">${state.name}</div>
              <div style="font-size:12px;color:#334155;display:flex;justify-content:space-between;">
                <span>State Avg AQI:</span>
                <span style="font-weight:700;color:${getAQITextColor(state.aqi)}">${state.aqi}</span>
              </div>
            </div>
          `);

        stateMarkersRef.current.push(stateMarker);
      });
    }

    // expose a global function used by popup buttons to notify React
    (window as any).selectStation = (stationId: string) => {
      const station = stations.find(s => s.id === stationId);
      if (station) onStationClick(station);
    };

    return () => {
      // cleanup global
      delete (window as any).selectStation;
    };
  }, [stations, selectedMetric, onStationClick, showOverlays, showStates]);

  // Compute region summaries from stations
  const regionSummaries = useMemo(() => computeRegionSummaries(stations), [stations]);
  const [selectedRegion, setSelectedRegion] = useState<RegionSummary | null>(null);

  // Render the region details panel when a region is selected
  useEffect(() => {
    // no-op; effect kept to prevent linter unused-vars for setSelectedRegion usage above
  }, [selectedRegion]);

  return (
    <div className="w-full h-full relative flex">
      {/* Sidebar */}
      <aside className={`h-full w-80 bg-white/95 border-r border-slate-200 p-4 z-50 overflow-y-auto`}> 
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Map Controls</h2>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-sm text-slate-600">{isSidebarOpen ? 'Close' : 'Open'}</button>
        </div>

        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-2">Basemap</div>
          <div className="flex gap-2">
            <button onClick={() => {
              if (!mapRef.current) return;
              if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
              const tl = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 });
              tl.addTo(mapRef.current); tileLayerRef.current = tl;
              setSelectedBasemap('osm');
            }} className="px-2 py-1 bg-slate-100 rounded">OSM</button>
            <button onClick={() => {
              if (!mapRef.current) return;
              if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
              const tl = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', { attribution: 'Stamen', maxZoom: 18 });
              tl.addTo(mapRef.current); tileLayerRef.current = tl;
              setSelectedBasemap('stamen');
            }} className="px-2 py-1 bg-slate-100 rounded">Terrain</button>
            <button onClick={() => {
              if (!mapRef.current) return;
              if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
              const tl = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', { attribution: 'CartoDB', maxZoom: 19 });
              tl.addTo(mapRef.current); tileLayerRef.current = tl;
              setSelectedBasemap('carto');
            }} className="px-2 py-1 bg-slate-100 rounded">Light</button>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-2">Visualize</div>
          <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value as any)} className="w-full rounded border px-2 py-1">
            <option value="aqi">AQI</option>
            <option value="pm25">PM2.5</option>
            <option value="pm10">PM10</option>
            <option value="o3">O3</option>
            <option value="no2">NO2</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showOverlays} onChange={(e) => { setShowOverlays(e.target.checked); if (!e.target.checked) { circlesRef.current.forEach(c => c.remove()); } }} /> <span className="text-sm">Show Overlays</span></label>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showStates} onChange={(e) => setShowStates(e.target.checked)} /> <span className="text-sm">Show State AQI</span></label>
        </div>

        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-2">Regional Summary</div>
          <div className="space-y-2">
            {regionSummaries.map((region) => (
              <div key={region.name} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                <div>
                  <div className="font-medium">{region.name}</div>
                  <div className="text-xs text-slate-500">Avg AQI {region.aqi}</div>
                </div>
                <div className="flex flex-col">
                  <button onClick={() => { if (!mapRef.current) return; mapRef.current.setView(region.coords as any, 6); }} className="text-xs px-2 py-1 bg-blue-600 text-white rounded mb-1">Zoom</button>
                  <button 
                    onClick={() => onRegionClick ? onRegionClick(region) : setSelectedRegion(region)} 
                    className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 transition-colors rounded"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-2">Individual States</div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {stateAQIData.map(state => (
              <div key={state.name} className="flex items-center justify-between p-1.5 bg-slate-50 rounded text-xs">
                <span className="font-medium">{state.name}</span>
                <div className="flex items-center gap-2">
                  <span style={{color: getAQITextColor(state.aqi)}} className="font-bold">{state.aqi}</span>
                  <button onClick={() => { if (!mapRef.current) return; mapRef.current.setView(state.coords as any, 7); }} className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-xs">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500">Tip: Toggle "Show State AQI" to see individual state values. Large circles are monitoring stations, small squares are state averages.</div>
      </aside>

      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        {selectedRegion && (
          <RegionDetailsPanel region={selectedRegion} onClose={() => setSelectedRegion(null)} />
        )}
      </div>
    </div>
  );
};

export default AirQualityMap;
