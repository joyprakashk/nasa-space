import React from 'react';
import { ArrowLeft, Wind, Droplets, Thermometer, Eye, AlertTriangle, TrendingUp, Clock, MapPin, Activity } from 'lucide-react';
import { AirQualityStation } from '../types/airQuality';

interface DetailPageProps {
  station: AirQualityStation;
  onBack: () => void;
}

const DetailPage: React.FC<DetailPageProps> = ({ station, onBack }) => {
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
    if (aqi <= 50) return 'Minimal health impact. Air quality is satisfactory.';
    if (aqi <= 100) return 'Moderate health impact for sensitive groups.';
    if (aqi <= 150) return 'Unhealthy for sensitive groups. May cause breathing difficulties.';
    if (aqi <= 200) return 'Unhealthy for everyone. Avoid outdoor activities.';
    if (aqi <= 300) return 'Very unhealthy. Health warnings in effect.';
    return 'Hazardous. Emergency conditions. Everyone should avoid outdoor activities.';
  };

  const getRecommendations = (aqi: number): string[] => {
    if (aqi <= 50) return ['Enjoy outdoor activities', 'Windows can be open', 'No special precautions needed'];
    if (aqi <= 100) return ['Sensitive groups should limit outdoor exertion', 'Consider closing windows', 'Monitor air quality updates'];
    if (aqi <= 150) return ['Sensitive groups should avoid outdoor activities', 'Keep windows closed', 'Use air purifiers indoors', 'Consider wearing masks'];
    if (aqi <= 200) return ['Everyone should limit outdoor activities', 'Keep windows and doors closed', 'Use air purifiers', 'Wear N95 masks if going outside'];
    if (aqi <= 300) return ['Avoid outdoor activities', 'Stay indoors with windows closed', 'Use air purifiers', 'Wear N95 masks if necessary'];
    return ['Stay indoors', 'Keep all windows and doors closed', 'Use air purifiers', 'Wear N95 masks', 'Follow emergency guidelines'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0">
        {Array.from({ length: 200 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      {/* Shooting Stars */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-0.5 bg-white rounded-full animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: '2s',
            transform: 'rotate(45deg)'
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 bg-black/30 backdrop-blur-sm border-b border-white/20">
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
              NASA
            </div>
            <div className="text-white text-lg font-bold tracking-wider">
              TEMPO AIR QUALITY ANALYSIS
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Station Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <MapPin className="w-6 h-6 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">{station.name}</h1>
          </div>
          <p className="text-xl text-gray-300">{station.location}</p>
        </div>

        {/* AQI Status Card */}
        <div className={`mb-8 p-8 rounded-2xl border-2 ${getAQIBgColor(station.aqi)} backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-white" />
              <h2 className="text-3xl font-bold text-white">Air Quality Index</h2>
            </div>
            <div className={`text-6xl font-bold ${getAQIColor(station.aqi)}`}>
              {station.aqi}
            </div>
          </div>
          <p className="text-2xl text-white font-semibold mb-2">{station.level}</p>
          <p className="text-lg text-gray-200">{getHealthImpact(station.aqi)}</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pollutants Analysis */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Droplets className="w-6 h-6 text-blue-400" />
              Pollutant Analysis
            </h3>
            <div className="space-y-4">
              {Object.entries(station.pollutants).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span className="text-white font-medium capitalize">{key.toUpperCase()}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-red-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (value / 100) * 100)}%` }}
                      />
                    </div>
                    <span className="text-white font-bold w-16 text-right">{value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Conditions */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Thermometer className="w-6 h-6 text-orange-400" />
              Weather Conditions
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Temperature</span>
                <span className="text-white font-bold text-xl">{station.weather.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Humidity</span>
                <span className="text-white font-bold text-xl">{station.weather.humidity}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-white font-medium">Wind Speed</span>
                <span className="text-white font-bold text-xl">{station.weather.windSpeed} m/s</span>
              </div>
            </div>
          </div>

          {/* Health Recommendations */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              Health Recommendations
            </h3>
            <div className="space-y-3">
              {getRecommendations(station.aqi).map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Analysis */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
              Advanced Analysis
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Air Quality Trend</h4>
                <p className="text-gray-300 text-sm">
                  Based on current pollutant levels, air quality is {station.aqi > 100 ? 'deteriorating' : 'stable'} 
                  with {station.pollutants.pm25 > 25 ? 'high' : 'moderate'} PM2.5 concentration.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Environmental Impact</h4>
                <p className="text-gray-300 text-sm">
                  Current conditions suggest {station.aqi > 150 ? 'significant' : 'minimal'} 
                  environmental stress with {station.weather.windSpeed > 5 ? 'good' : 'limited'} 
                  air dispersion.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-2">NASA TEMPO Data</h4>
                <p className="text-gray-300 text-sm">
                  Satellite observations indicate {station.aqi > 100 ? 'elevated' : 'normal'} 
                  atmospheric pollution levels in this region, consistent with ground measurements.
                </p>
              </div>
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
            Data provided by NASA TEMPO, OpenAQ, and EPA AirNow
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
