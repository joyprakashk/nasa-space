import { Info } from 'lucide-react';

const AQILegend = () => {
  const aqiLevels = [
    { range: '0-50', color: 'bg-green-500', label: 'Good', description: 'Air quality is satisfactory' },
    { range: '51-100', color: 'bg-yellow-500', label: 'Moderate', description: 'Acceptable for most people' },
    { range: '101-150', color: 'bg-orange-500', label: 'Unhealthy for Sensitive', description: 'Sensitive groups may be affected' },
    { range: '151-200', color: 'bg-red-500', label: 'Unhealthy', description: 'Everyone may experience effects' },
    { range: '201-300', color: 'bg-purple-600', label: 'Very Unhealthy', description: 'Health alert' },
    { range: '301+', color: 'bg-red-900', label: 'Hazardous', description: 'Emergency conditions' },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 max-w-xs z-[999] border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Air Quality Index</h3>
      </div>

      <div className="space-y-2">
        {aqiLevels.map((level, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-12 h-8 ${level.color} rounded flex-shrink-0 shadow-sm flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{level.range}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-slate-900">{level.label}</div>
              <div className="text-xs text-slate-600">{level.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          Data: NASA TEMPO + Ground Stations
        </p>
      </div>
    </div>
  );
};

export default AQILegend;
