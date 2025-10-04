import { useState, useEffect } from 'react';
import AirQualityMap from './components/AirQualityMap';
import SimpleSolarSystem from './components/SimpleSolarSystem';
import ForecastPanel from './components/ForecastPanel';
import AlertPanel from './components/AlertPanel';
import AQILegend from './components/AQILegend';
import DetailPage from './components/DetailPage';
import RegionalDetailPage from './components/RegionalDetailPage';
import { Wind, Satellite } from 'lucide-react';
import { AirQualityStation } from './types/airQuality';
import { airQualityStations, fetchRealTimeStations, RegionSummary } from './data/airQualityData';

function App() {
  const [selectedStation, setSelectedStation] = useState<AirQualityStation | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionSummary | null>(null);
  const [showSolarSystem, setShowSolarSystem] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [showRegionalDetailPage, setShowRegionalDetailPage] = useState(false);
  const [stations, setStations] = useState<AirQualityStation[]>(airQualityStations);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  

  const loadRealTimeData = async () => {
    setIsLoading(true);
    try {
      const realTimeStations = await fetchRealTimeStations();
      setStations(realTimeStations.length > 0 ? realTimeStations : airQualityStations);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load real-time data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRealTimeData();
    const interval = setInterval(loadRealTimeData, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleStationClick = (station: AirQualityStation) => {
    setSelectedStation(station);
    setShowDetailPage(true);
  };

  const enterMapFromSolar = () => {
    setShowSolarSystem(false);
  };

  const handleBackFromDetail = () => {
    setShowDetailPage(false);
    setSelectedStation(null);
  };

  const handleRegionClick = (region: RegionSummary) => {
    setSelectedRegion(region);
    setShowRegionalDetailPage(true);
  };

  const handleBackFromRegionalDetail = () => {
    setShowRegionalDetailPage(false);
    setSelectedRegion(null);
  };

  const unhealthyCount = stations.filter(s => s.aqi > 100).length;
  const avgAQI = Math.round(
    stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length
  );

  // Show regional detail page if a region is selected
  if (showRegionalDetailPage && selectedRegion) {
    return <RegionalDetailPage region={selectedRegion} stations={stations} onBack={handleBackFromRegionalDetail} />;
  }

  // Show detail page if a station is selected
  if (showDetailPage && selectedStation) {
    return <DetailPage station={selectedStation} onBack={handleBackFromDetail} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900">
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 shadow-lg z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Wind className="w-8 h-8 text-blue-400" />
              <Satellite className="w-4 h-4 text-green-400 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">NASA TEMPO Air Quality Monitor</h1>
              <p className="text-sm text-slate-400">Real-time Air Quality Forecasting System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-700/50 rounded-lg px-4 py-2 border border-slate-600">
              <div className="text-xs text-slate-400 mb-0.5">Average AQI</div>
              <div className="text-lg font-bold text-white">{avgAQI}</div>
            </div>

            <div className="bg-slate-700/50 rounded-lg px-4 py-2 border border-slate-600">
              <div className="text-xs text-slate-400 mb-0.5">Alerts</div>
              <div className="text-lg font-bold text-orange-400">{unhealthyCount}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadRealTimeData}
                disabled={isLoading}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={() => setShowSolarSystem(!showSolarSystem)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {showSolarSystem ? 'Air Quality Map' : 'Solar System'}
              </button>
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {showLegend ? 'Hide' : 'Show'} Legend
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        {showSolarSystem ? (
          <SimpleSolarSystem onEnterMap={enterMapFromSolar} />
        ) : (
          <AirQualityMap stations={stations} onStationClick={handleStationClick} onRegionClick={handleRegionClick} />
        )}

        <AlertPanel stations={stations} />

        {selectedStation && (
          <ForecastPanel station={selectedStation} onClose={() => setSelectedStation(null)} />
        )}

        {showLegend && <AQILegend />}

        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-slate-600 shadow-lg border border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span>Live Data • Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>OpenAQ</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>TolNet</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>EPA (optional)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
