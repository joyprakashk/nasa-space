import React from 'react';
import { ArrowLeft, MapPin, Droplets, Thermometer, AlertTriangle, TrendingUp, Clock, Activity, BarChart3, Globe } from 'lucide-react';
import { RegionSummary, generateForecast } from '../data/airQualityData';
import { AirQualityStation } from '../types/airQuality';

interface RegionalDetailPageProps {
  region: RegionSummary;
  stations: AirQualityStation[];
  onBack: () => void;
}

const RegionalDetailPage: React.FC<RegionalDetailPageProps> = ({ region, stations, onBack }) => {
  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return 'text-green-400';
    if (aqi <= 100) return 'text-yellow-400';
    if (aqi <= 150) return 'text-orange-400';
    if (aqi <= 200) return 'text-red-400';
    if (aqi <= 300) return 'text-purple-400';
    return 'text-red-600';
  };

  const getAQIBgColor = (aqi: number): string => {
    if (aqi <= 50) return 'bg-green-500/20 border-green-500/50';
    if (aqi <= 100) return 'bg-yellow-500/20 border-yellow-500/50';
    if (aqi <= 150) return 'bg-orange-500/20 border-orange-500/50';
    if (aqi <= 200) return 'bg-red-500/20 border-red-500/50';
    if (aqi <= 300) return 'bg-purple-500/20 border-purple-500/50';
    return 'bg-red-600/20 border-red-600/50';
  };

  const getHealthImpact = (aqi: number): string => {
    if (aqi <= 50) return 'Minimal health impact across the region. Air quality is satisfactory.';
    if (aqi <= 100) return 'Moderate health impact for sensitive groups in the region.';
    if (aqi <= 150) return 'Unhealthy for sensitive groups. May cause breathing difficulties.';
    if (aqi <= 200) return 'Unhealthy for everyone. Avoid outdoor activities.';
    if (aqi <= 300) return 'Very unhealthy. Health warnings in effect.';
    return 'Hazardous. Emergency conditions. Everyone should avoid outdoor activities.';
  };

  const getRegionalRecommendations = (aqi: number): string[] => {
    if (aqi <= 50) return [
      'Enjoy outdoor activities throughout the region',
      'Windows can be open for natural ventilation',
      'No special precautions needed',
      'Monitor air quality updates regularly'
    ];
    if (aqi <= 100) return [
      'Sensitive groups should limit outdoor exertion',
      'Consider closing windows during peak hours',
      'Monitor air quality updates',
      'Use air purifiers in enclosed spaces'
    ];
    if (aqi <= 150) return [
      'Sensitive groups should avoid outdoor activities',
      'Keep windows closed',
      'Use air purifiers indoors',
      'Consider wearing masks outdoors',
      'Limit outdoor exercise'
    ];
    if (aqi <= 200) return [
      'Everyone should limit outdoor activities',
      'Keep windows and doors closed',
      'Use air purifiers',
      'Wear N95 masks if going outside',
      'Postpone outdoor events'
    ];
    if (aqi <= 300) return [
      'Avoid outdoor activities',
      'Stay indoors with windows closed',
      'Use air purifiers',
      'Wear N95 masks if necessary',
      'Follow local health advisories'
    ];
    return [
      'Stay indoors',
      'Keep all windows and doors closed',
      'Use air purifiers',
      'Wear N95 masks',
      'Follow emergency guidelines',
      'Evacuate if recommended'
    ];
  };

  const getRegionalInsights = (region: RegionSummary) => {
    const insights = [];
    
    if (region.aqi <= 50) {
      insights.push('Excellent air quality across the region');
      insights.push('Ideal conditions for outdoor activities');
      insights.push('Minimal environmental stress');
    } else if (region.aqi <= 100) {
      insights.push('Good air quality with minor concerns');
      insights.push('Suitable for most outdoor activities');
      insights.push('Monitor sensitive areas');
    } else if (region.aqi <= 150) {
      insights.push('Moderate air quality concerns');
      insights.push('Sensitive groups should take precautions');
      insights.push('Localized pollution hotspots detected');
    } else if (region.aqi <= 200) {
      insights.push('Poor air quality conditions');
      insights.push('Health warnings in effect');
      insights.push('Significant pollution sources active');
    } else {
      insights.push('Dangerous air quality levels');
      insights.push('Emergency conditions');
      insights.push('Multiple pollution sources contributing');
    }

    // Add region-specific insights
    if (region.name === 'West') {
      insights.push('Wildfire season may impact air quality');
      insights.push('Mountain topography affects air circulation');
    } else if (region.name === 'Northeast') {
      insights.push('Urban heat island effects present');
      insights.push('Industrial and traffic pollution sources');
    } else if (region.name === 'South') {
      insights.push('High humidity affects pollutant dispersion');
      insights.push('Agricultural activities may contribute to pollution');
    } else if (region.name === 'Midwest') {
      insights.push('Agricultural and industrial sources present');
      insights.push('Weather patterns significantly impact air quality');
    }

    return insights;
  };

  const regionalStations = stations.filter(station => {
    const lat = station.coords[0];
    const lon = station.coords[1];
    
    // Define regional boundaries (simplified)
    const regions = {
      'West': { latMin: 32, latMax: 49, lonMin: -125, lonMax: -102 },
      'Midwest': { latMin: 36, latMax: 49, lonMin: -103, lonMax: -84 },
      'Northeast': { latMin: 40, latMax: 47, lonMin: -80, lonMax: -66 },
      'South': { latMin: 24, latMax: 37.5, lonMin: -100, lonMax: -75 }
    };
    
    const bounds = regions[region.name as keyof typeof regions];
    if (!bounds) return false;
    
    return lat >= bounds.latMin && lat <= bounds.latMax && 
           lon >= bounds.lonMin && lon <= bounds.lonMax;
  });

  // Advanced analysis helpers
  const computePollutantAverages = (list: AirQualityStation[]) => {
    const totals = { pm25: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0 } as any;
    list.forEach(s => {
      totals.pm25 += s.pollutants?.pm25 || 0;
      totals.pm10 += s.pollutants?.pm10 || 0;
      totals.o3 += s.pollutants?.o3 || 0;
      totals.no2 += s.pollutants?.no2 || 0;
      totals.so2 += s.pollutants?.so2 || 0;
      totals.co += s.pollutants?.co || 0;
    });
    const n = Math.max(1, list.length);
    return {
      pm25: Number((totals.pm25 / n).toFixed(2)),
      pm10: Number((totals.pm10 / n).toFixed(2)),
      o3: Number((totals.o3 / n).toFixed(2)),
      no2: Number((totals.no2 / n).toFixed(2)),
      so2: Number((totals.so2 / n).toFixed(2)),
      co: Number((totals.co / n).toFixed(2)),
    };
  };

  const topHotspots = (list: AirQualityStation[]) => {
    return list.slice().sort((a, b) => (b.aqi || 0) - (a.aqi || 0)).slice(0, 3);
  };

  const unhealthyPercent = (list: AirQualityStation[]) => {
    if (!list || list.length === 0) return 0;
    const count = list.filter(s => (s.aqi || 0) > 100).length;
    return Math.round((count / list.length) * 100);
  };

  const shortForecast = generateForecast(region.aqi).slice(0, 6);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0">
        {Array.from({ length: 600 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              transform: `translateZ(0)`
            }}
          />
        ))}
      </div>

      {/* Shooting Stars */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-0.5 bg-white rounded-full animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: '3s',
            transform: 'rotate(45deg)'
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 bg-black/40 backdrop-blur-sm border-b border-white/30">
        <div className="flex items-center justify-between p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg font-medium">Back to Map</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-white">
              Atoms.ai
            </div>
            <div className="text-white text-lg font-bold tracking-wider">
              REGIONAL AIR QUALITY ANALYSIS
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Region Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Globe className="w-8 h-8 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">{region.name} Region</h1>
          </div>
          <p className="text-xl text-gray-300">Comprehensive Air Quality Analysis</p>
          <p className="text-lg text-gray-400">Monitoring {regionalStations.length} stations across the region</p>
        </div>

        {/* Regional AQI Status Card */}
        <div className={`mb-8 p-8 rounded-2xl border-2 ${getAQIBgColor(region.aqi)} backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-10 h-10 text-white" />
              <h2 className="text-4xl font-bold text-white">Regional Air Quality Index</h2>
            </div>
            <div className={`text-7xl font-bold ${getAQIColor(region.aqi)}`}>
              {region.aqi}
            </div>
          </div>
          <p className="text-3xl text-white font-semibold mb-2">{region.level}</p>
          <p className="text-xl text-gray-200">{getHealthImpact(region.aqi)}</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Regional Pollutants Analysis */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Droplets className="w-6 h-6 text-blue-400" />
              Regional Pollutant Levels
            </h3>
            <div className="space-y-4">
              {Object.entries(region.pollutants).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span className="text-white font-medium capitalize">{key.toUpperCase()}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-red-500 h-3 rounded-full"
                        style={{ width: `${Math.min(100, (value / 100) * 100)}%` }}
                      />
                    </div>
                    <span className="text-white font-bold w-16 text-right">{value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Weather Conditions */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Thermometer className="w-6 h-6 text-orange-400" />
              Regional Weather
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Avg Temperature</span>
                <span className="text-white font-bold text-xl">{region.weather.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Avg Humidity</span>
                <span className="text-white font-bold text-xl">{region.weather.humidity}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Avg Wind Speed</span>
                <span className="text-white font-bold text-xl">{region.weather.windSpeed} m/s</span>
              </div>
            </div>
          </div>

          {/* Regional Statistics */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-green-400" />
              Regional Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Total Stations</span>
                <span className="text-white font-bold text-xl">{region.count}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Avg AQI</span>
                <span className="text-white font-bold text-xl">{region.aqi}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Air Quality Level</span>
                <span className="text-white font-bold text-lg">{region.level}</span>
              </div>
            </div>
          </div>

          {/* Regional Health Recommendations */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              Regional Health Guidelines
            </h3>
            <div className="space-y-3">
              {getRegionalRecommendations(region.aqi).map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Insights */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              Regional Insights
            </h3>
            <div className="space-y-3">
              {getRegionalInsights(region).map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Station List */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-red-400" />
              Regional Stations
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {regionalStations.map((station) => (
                <div key={station.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{station.name}</span>
                    <p className="text-gray-400 text-sm">{station.location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getAQIColor(station.aqi)}`}>
                      {station.aqi}
                    </span>
                    <p className="text-gray-400 text-sm">{station.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Analysis */}
        <div className="mt-8 bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-4">Advanced Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-300">Top Hotspots (by AQI)</div>
              <div className="mt-2 space-y-2">
                {topHotspots(regionalStations).map(s => (
                  <div key={s.id} className="flex justify-between items-center">
                    <div className="text-white">{s.name}</div>
                    <div className={`font-bold ${getAQIColor(s.aqi)}`}>{s.aqi}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-300">Pollutant Averages</div>
              <div className="mt-2 text-white text-sm">
                {(() => {
                  const avg = computePollutantAverages(regionalStations);
                  return (
                    <div className="space-y-1">
                      <div>PM2.5: <span className="font-bold">{avg.pm25}</span> µg/m³</div>
                      <div>PM10: <span className="font-bold">{avg.pm10}</span> µg/m³</div>
                      <div>O₃: <span className="font-bold">{avg.o3}</span> ppb</div>
                      <div>NO₂: <span className="font-bold">{avg.no2}</span> ppb</div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-300">Unhealthy Stations</div>
              <div className="mt-2 text-white text-3xl font-bold">{unhealthyPercent(regionalStations)}%</div>
              <div className="text-sm text-gray-400">Percentage of stations with AQI &gt; 100</div>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">6-hour AQI Forecast (short)</div>
            <div className="flex items-center gap-4 overflow-x-auto">
              {shortForecast.map((f, idx) => (
                <div key={idx} className="min-w-[120px] p-3 bg-black/40 rounded-lg border border-white/10">
                  <div className="text-sm text-gray-300">{new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className={`text-2xl font-bold mt-1 ${getAQIColor(f.aqi)}`}>{f.aqi}</div>
                  <div className="text-xs text-gray-400">PM2.5: {Math.round(f.pm25)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-white/60">
            <Clock className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <p className="text-white/40 text-sm mt-2">
            Regional analysis based on NASA TEMPO, OpenAQ, and EPA AirNow data
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegionalDetailPage;
