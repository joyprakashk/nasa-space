export interface AirQualityStation {
  id: string;
  name: string;
  location: string;
  coords: [number, number];
  aqi: number;
  level: string;
  pollutants: Pollutants;
  weather: Weather;
}

export interface Pollutants {
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}

export interface Weather {
  temperature: number;
  humidity: number;
  windSpeed: number;
}

export interface AirQualityForecast {
  timestamp: string;
  aqi: number;
  pm25: number;
  o3: number;
  no2: number;
}

export const getAQILevel = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'bg-green-500';
  if (aqi <= 100) return 'bg-yellow-500';
  if (aqi <= 150) return 'bg-orange-500';
  if (aqi <= 200) return 'bg-red-500';
  if (aqi <= 300) return 'bg-purple-600';
  return 'bg-red-900';
};

export const getAQITextColor = (aqi: number): string => {
  if (aqi <= 50) return 'text-green-600';
  if (aqi <= 100) return 'text-yellow-600';
  if (aqi <= 150) return 'text-orange-600';
  if (aqi <= 200) return 'text-red-600';
  if (aqi <= 300) return 'text-purple-600';
  return 'text-red-900';
};

export const getAQIDescription = (aqi: number): string => {
  if (aqi <= 50) return 'Air quality is satisfactory, and air pollution poses little or no risk.';
  if (aqi <= 100) return 'Air quality is acceptable. However, there may be a risk for some people.';
  if (aqi <= 150) return 'Members of sensitive groups may experience health effects.';
  if (aqi <= 200) return 'Some members of the general public may experience health effects.';
  if (aqi <= 300) return 'Health alert: The risk of health effects is increased for everyone.';
  return 'Health warning of emergency conditions: everyone is more likely to be affected.';
};

// Return a hex color string approximating the AQI color scale (for leaflet fillColor)
export const getAQIHex = (aqi: number): string => {
  if (aqi <= 50) return '#16a34a'; // green-500
  if (aqi <= 100) return '#eab308'; // yellow-500
  if (aqi <= 150) return '#fb923c'; // orange-500
  if (aqi <= 200) return '#ef4444'; // red-500
  if (aqi <= 300) return '#7c3aed'; // purple-600
  return '#7f1d1d'; // red-900
};

// Return an opacity value (0-0.9) scaled by AQI or a proxy severity value
export const getAQIOpacity = (value: number): number => {
  // value expected 0-500; map to 0.15 - 0.85
  const v = Math.max(0, Math.min(500, value));
  return 0.15 + (v / 500) * 0.7;
};

// Generate a color for an arbitrary percent [0,1] from green -> yellow -> orange -> red
export const getColorForPercent = (p: number): string => {
  const pct = Math.max(0, Math.min(1, p));
  if (pct < 0.25) return '#16a34a';
  if (pct < 0.5) return '#eab308';
  if (pct < 0.75) return '#fb923c';
  return '#ef4444';
};

// --- AQI calculation helpers (simplified EPA breakpoints for PM2.5 and PM10)
interface Breakpoint { cLow: number; cHigh: number; iLow: number; iHigh: number }

const pm25Breakpoints: Breakpoint[] = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
  { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

const pm10Breakpoints: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 504, iLow: 301, iHigh: 400 },
  { cLow: 505, cHigh: 604, iLow: 401, iHigh: 500 },
];

const calcAQI = (c: number, breakpoints: Breakpoint[]): number => {
  for (const bp of breakpoints) {
    if (c >= bp.cLow && c <= bp.cHigh) {
      const a = (bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow);
      const b = bp.iLow - a * bp.cLow;
      return Math.round(a * c + b);
    }
  }
  return 500; // capped
};

export const getAQIFromPollutants = (pollutants: Pollutants): number => {
  const aqiPm25 = calcAQI(pollutants.pm25, pm25Breakpoints);
  const aqiPm10 = calcAQI(pollutants.pm10, pm10Breakpoints);
  // Choose the highest (worst) index as overall AQI
  return Math.max(aqiPm25, aqiPm10);
};

export const getAQISuggestedActions = (aqi: number): string[] => {
  if (aqi <= 50) return ['Air quality is good — no special precautions needed.'];
  if (aqi <= 100) return ['Some people may be sensitive — consider reducing prolonged outdoor exertion.'];
  if (aqi <= 150) return ['Sensitive groups should reduce outdoor exertion; consider wearing masks.'];
  if (aqi <= 200) return ['Reduce prolonged outdoor exertion; keep windows closed if possible; consider N95 masks.'];
  if (aqi <= 300) return ['Avoid outdoor exertion; use air purifiers indoors; follow local health guidance.'];
  return ['Health warning: everyone should avoid outdoor activity; seek medical advice if symptoms occur.'];
};
