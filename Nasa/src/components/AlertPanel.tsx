import { useState, useEffect } from 'react';
import { AlertTriangle, X, Bell, BellOff } from 'lucide-react';
import { AirQualityStation, getAQISuggestedActions } from '../types/airQuality';
import { generateForecast } from '../data/airQualityData';

interface AlertPanelProps {
  stations: AirQualityStation[];
}

interface Alert {
  id: string;
  stationName: string;
  aqi: number;
  level: string;
  timestamp: Date;
  actions?: string[];
}

const AlertPanel = ({ stations }: AlertPanelProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [thresholds, setThresholds] = useState<{ pm25: number }>({ pm25: 35 });
  const [channels, setChannels] = useState<{ inApp: boolean; email: boolean; sms: boolean; webhook: string | null }>({ inApp: true, email: false, sms: false, webhook: null });
  const [forecastWindowHours] = useState<number>(24);

  // Alert evaluation: nowcast (current) and forecast exceedance
  useEffect(() => {
    if (!notificationsEnabled) return;

    const newAlerts: Alert[] = [];

    stations.forEach(station => {
      // Nowcast: PM2.5 spike over threshold
      const nowTrigger = station.pollutants.pm25 > thresholds.pm25;

      // Forecast: generate short forecast and check if any predicted PM2.5 exceeds threshold
      const forecasts = generateForecast(station.aqi);
      const windowEnd = Date.now() + forecastWindowHours * 60 * 60 * 1000;
      const forecastTrigger = forecasts.some(f => new Date(f.timestamp).getTime() <= windowEnd && (f.pm25 ?? 0) > thresholds.pm25);

      if (nowTrigger || forecastTrigger) {
        newAlerts.push({
          id: station.id + '-' + Date.now(),
          stationName: station.name,
          aqi: station.aqi,
          level: station.level,
          timestamp: new Date(),
          actions: getAQISuggestedActions(station.aqi),
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => {
        // dedupe by stationName - keep latest
        const map = new Map(prev.map(a => [a.stationName, a]));
        newAlerts.forEach(a => map.set(a.stationName, a));
        return Array.from(map.values());
      });
      setIsExpanded(true);
      // Fire multi-channel notifications (simulate)
      if (channels.webhook) {
        newAlerts.forEach(a => {
          fetch(channels.webhook!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alert: a }),
          }).catch(() => {
            // ignore network errors in demo
          });
        });
      }
    }
  }, [stations, notificationsEnabled, thresholds, channels, forecastWindowHours]);

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const clearAll = () => {
    setAlerts([]);
    setIsExpanded(false);
  };

  const testWebhook = async () => {
    if (!channels.webhook) return;
    try {
      await fetch(channels.webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true }) });
      alert('Webhook test sent (check endpoint)');
    } catch (e) {
      alert('Webhook test failed: ' + (e as any).message);
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="absolute top-4 right-4 z-[999]">
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={`p-3 rounded-lg shadow-lg transition-all ${
            notificationsEnabled
              ? 'bg-white hover:bg-slate-50 text-slate-700'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
          title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
        >
          {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-[999]">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="relative p-3 bg-red-600 hover:bg-red-700 rounded-lg shadow-lg text-white transition-all"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-600 rounded-full text-xs font-bold flex items-center justify-center">
            {alerts.length}
          </span>
        </button>
      ) : (
        <div className="w-80 bg-white rounded-lg shadow-2xl border border-red-200 overflow-hidden">
          <div className="bg-red-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold">Air Quality Alerts</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>

              {/* Channels & Thresholds */}
              <div className="ml-2 flex items-center gap-2">
                <label className="text-xs text-white">PM2.5 Alert &gt;</label>
                <input
                  type="number"
                  value={thresholds.pm25}
                  onChange={(e) => setThresholds({ ...thresholds, pm25: Number(e.target.value) })}
                  className="w-16 text-sm rounded px-2 py-1"
                />
                <select value={channels.webhook ?? ''} onChange={(e) => setChannels({ ...channels, webhook: e.target.value || null })} className="text-sm rounded px-2 py-1">
                  <option value="">No Webhook</option>
                  <option value="https://example.com/webhook">Example Webhook</option>
                </select>
                <button onClick={testWebhook} className="text-xs px-2 py-1 bg-white/10 rounded">Test</button>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="p-3 border-b border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{alert.stationName}</div>
                    <div className="text-sm text-slate-600">{alert.level}</div>
                  </div>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-lg font-bold text-red-600">AQI {alert.aqi}</span>
                </div>
                {alert.actions && (
                  <div className="mt-2 text-sm text-slate-700">
                    <div className="font-medium text-slate-900">Suggested actions:</div>
                    <ul className="list-disc list-inside">
                      {alert.actions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <button
              onClick={clearAll}
              className="w-full py-2 px-3 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg font-medium transition-colors"
            >
              Clear All Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertPanel;
