import { useMemo } from 'react';
import { TrendingUp, Clock, Wind } from 'lucide-react';
import { AirQualityStation, getAQILevel, getAQIColor, getAQITextColor, getAQIDescription } from '../types/airQuality';
import { generateForecast } from '../data/airQualityData';

interface ForecastPanelProps {
  station: AirQualityStation | null;
  onClose: () => void;
}

const ForecastPanel = ({ station, onClose }: ForecastPanelProps) => {
  const forecasts = useMemo(() => {
    if (!station) return [];
    return generateForecast(station.aqi);
  }, [station]);

  if (!station) return null;

  const hourlyForecasts = forecasts.slice(0, 8);

  return (
    <div className="absolute top-4 right-4 w-96 max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-xl shadow-2xl z-[1000] border border-slate-200">
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{station.name}</h2>
            <p className="text-sm text-blue-100">{station.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 ${getAQIColor(station.aqi)} rounded-xl flex items-center justify-center shadow-lg`}>
            <span className="text-2xl font-bold text-white">{station.aqi}</span>
          </div>
          <div>
            <div className="text-lg font-semibold">{station.level}</div>
            <div className="text-xs text-blue-100 mt-0.5">Current Air Quality</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-700">
              {getAQIDescription(station.aqi)}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">24-Hour Forecast</h3>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {hourlyForecasts.map((forecast, index) => {
              const hour = new Date(forecast.timestamp).getHours();
              return (
                <div
                  key={index}
                  className="bg-slate-50 rounded-lg p-2 text-center border border-slate-200"
                >
                  <div className="text-xs text-slate-600 mb-1">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                  <div className={`text-lg font-bold ${getAQITextColor(forecast.aqi)}`}>
                    {forecast.aqi}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {getAQILevel(forecast.aqi).split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Pollutant Levels</h3>
          <div className="space-y-2">
            <PollutantBar label="PM2.5" value={station.pollutants.pm25} max={150} unit="µg/m³" />
            <PollutantBar label="PM10" value={station.pollutants.pm10} max={250} unit="µg/m³" />
            <PollutantBar label="O₃" value={station.pollutants.o3} max={200} unit="ppb" />
            <PollutantBar label="NO₂" value={station.pollutants.no2} max={100} unit="ppb" />
            <PollutantBar label="SO₂" value={station.pollutants.so2} max={50} unit="ppb" />
            <PollutantBar label="CO" value={station.pollutants.co} max={9} unit="ppm" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Wind className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Weather Conditions</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-600 mb-1">Temperature</div>
              <div className="text-lg font-bold text-slate-900">{station.weather.temperature}°C</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-600 mb-1">Humidity</div>
              <div className="text-lg font-bold text-slate-900">{station.weather.humidity}%</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-600 mb-1">Wind</div>
              <div className="text-lg font-bold text-slate-900">{station.weather.windSpeed} m/s</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 rounded-lg p-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Data integrates NASA TEMPO satellite observations with ground-based measurements.
            Forecasts use machine learning models trained on historical patterns and meteorological data.
          </p>
        </div>
      </div>
    </div>
  );
};

const PollutantBar = ({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const color = value < max * 0.5 ? 'bg-green-500' : value < max * 0.75 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm text-slate-600">{value.toFixed(1)} {unit}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ForecastPanel;
