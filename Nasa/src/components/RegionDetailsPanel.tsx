import { useMemo } from 'react';
import { generateForecast } from '../data/airQualityData';
import { getAQITextColor, getAQILevel } from '../types/airQuality';

interface RegionDetailsPanelProps {
  region: any | null;
  onClose: () => void;
}

const RegionDetailsPanel = ({ region, onClose }: RegionDetailsPanelProps) => {
  if (!region) return null;

  const forecasts = useMemo(() => generateForecast(region.aqi), [region.aqi]);
  const hourly = forecasts.slice(0, 24);

  return (
    <div className="absolute left-4 bottom-4 w-96 max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-2xl z-[1000] border border-slate-200">
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-xl flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{region.name} Region</h3>
          <div className="text-sm text-indigo-100">Avg AQI {region.aqi} — {region.level}</div>
        </div>
        <button onClick={onClose} className="text-white">Close</button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="font-semibold">24-Hour Forecast</h4>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {hourly.map((f, i) => {
              const hour = new Date(f.timestamp).getHours();
              return (
                <div key={i} className="bg-slate-50 rounded-lg p-2 text-center border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</div>
                  <div className={`text-lg font-bold ${getAQITextColor(f.aqi)}`}>{f.aqi}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{getAQILevel(f.aqi).split(' ')[0]}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Pollutant Levels</h4>
          <div className="mt-2 text-sm text-slate-700 space-y-1">
            <div>PM2.5: {region.pollutants.pm25} µg/m³</div>
            <div>PM10: {region.pollutants.pm10} µg/m³</div>
            <div>O₃: {region.pollutants.o3} ppb</div>
            <div>NO₂: {region.pollutants.no2} ppb</div>
            <div>SO₂: {region.pollutants.so2} ppb</div>
            <div>CO: {region.pollutants.co} ppm</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Weather Conditions</h4>
          <div className="mt-2 text-sm text-slate-700 grid grid-cols-3 gap-2">
            <div className="bg-slate-50 rounded p-2 text-center border">Temperature<br/><strong>{region.weather.temperature}°C</strong></div>
            <div className="bg-slate-50 rounded p-2 text-center border">Humidity<br/><strong>{region.weather.humidity}%</strong></div>
            <div className="bg-slate-50 rounded p-2 text-center border">Wind<br/><strong>{region.weather.windSpeed} m/s</strong></div>
          </div>
        </div>

        <div className="bg-slate-100 rounded p-3 text-xs text-slate-600">
          Data integrates NASA TEMPO satellite observations with ground-based measurements. Forecasts use machine learning models trained on historical patterns and meteorological data.
        </div>
      </div>
    </div>
  );
};

export default RegionDetailsPanel;
