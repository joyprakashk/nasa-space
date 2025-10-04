import { AirQualityStation, AirQualityForecast } from '../types/airQuality';
import { apiService, OpenAQMeasurement, EPAAirNowData } from '../services/apiService';
import { getAQIFromPollutants } from '../types/airQuality';

export const airQualityStations: AirQualityStation[] = [
  {
    id: '1',
    name: 'NYC Central',
    location: 'New York City, NY',
    coords: [40.7128, -74.0060],
    aqi: 68,
    level: 'Moderate',
    pollutants: {
      pm25: 20.5,
      pm10: 45.2,
      o3: 42.5,
      no2: 25.3,
      so2: 8.5,
      co: 0.8,
    },
    weather: {
      temperature: 22.5,
      humidity: 65,
      windSpeed: 3.2,
    },
  },
  {
    id: '2',
    name: 'LA Downtown',
    location: 'Los Angeles, CA',
    coords: [34.0522, -118.2437],
    aqi: 102,
    level: 'Unhealthy for Sensitive Groups',
    pollutants: {
      pm25: 35.2,
      pm10: 68.5,
      o3: 58.3,
      no2: 38.5,
      so2: 12.3,
      co: 1.2,
    },
    weather: {
      temperature: 26.8,
      humidity: 55,
      windSpeed: 2.8,
    },
  },
  {
    id: '3',
    name: 'Chicago Loop',
    location: 'Chicago, IL',
    coords: [41.8781, -87.6298],
    aqi: 45,
    level: 'Good',
    pollutants: {
      pm25: 12.8,
      pm10: 28.3,
      o3: 35.2,
      no2: 18.2,
      so2: 6.5,
      co: 0.5,
    },
    weather: {
      temperature: 18.3,
      humidity: 72,
      windSpeed: 4.5,
    },
  },
  {
    id: '4',
    name: 'Houston Central',
    location: 'Houston, TX',
    coords: [29.7604, -95.3698],
    aqi: 58,
    level: 'Moderate',
    pollutants: {
      pm25: 18.3,
      pm10: 38.7,
      o3: 48.7,
      no2: 28.7,
      so2: 9.8,
      co: 0.9,
    },
    weather: {
      temperature: 28.2,
      humidity: 78,
      windSpeed: 2.3,
    },
  },
  {
    id: '5',
    name: 'Phoenix Metro',
    location: 'Phoenix, AZ',
    coords: [33.4484, -112.0740],
    aqi: 89,
    level: 'Moderate',
    pollutants: {
      pm25: 28.7,
      pm10: 55.2,
      o3: 52.8,
      no2: 32.4,
      so2: 8.9,
      co: 1.0,
    },
    weather: {
      temperature: 32.5,
      humidity: 25,
      windSpeed: 3.8,
    },
  },
  {
    id: '6',
    name: 'Denver Mile High',
    location: 'Denver, CO',
    coords: [39.7392, -104.9903],
    aqi: 52,
    level: 'Moderate',
    pollutants: {
      pm25: 15.4,
      pm10: 32.8,
      o3: 38.5,
      no2: 22.8,
      so2: 7.2,
      co: 0.7,
    },
    weather: {
      temperature: 20.8,
      humidity: 45,
      windSpeed: 5.2,
    },
  },
  {
    id: '7',
    name: 'Seattle Downtown',
    location: 'Seattle, WA',
    coords: [47.6062, -122.3321],
    aqi: 38,
    level: 'Good',
    pollutants: {
      pm25: 10.2,
      pm10: 22.5,
      o3: 28.3,
      no2: 15.2,
      so2: 5.8,
      co: 0.4,
    },
    weather: {
      temperature: 16.5,
      humidity: 82,
      windSpeed: 3.5,
    },
  },
  {
    id: '8',
    name: 'SF Bay Area',
    location: 'San Francisco, CA',
    coords: [37.7749, -122.4194],
    aqi: 55,
    level: 'Moderate',
    pollutants: {
      pm25: 16.8,
      pm10: 35.4,
      o3: 32.7,
      no2: 18.9,
      so2: 6.8,
      co: 0.6,
    },
    weather: {
      temperature: 19.2,
      humidity: 68,
      windSpeed: 4.2,
    },
  },
];

// State-level AQI averages
export const stateAQIData = [
  { name: 'Alabama', aqi: 52, coords: [32.806671, -86.791130] },
  { name: 'Alaska', aqi: 28, coords: [61.370716, -152.404419] },
  { name: 'Arizona', aqi: 89, coords: [33.729759, -111.431221] },
  { name: 'Arkansas', aqi: 48, coords: [34.969704, -92.373123] },
  { name: 'California', aqi: 78, coords: [36.116203, -119.681564] },
  { name: 'Colorado', aqi: 52, coords: [39.059811, -105.311104] },
  { name: 'Connecticut', aqi: 61, coords: [41.597782, -72.755371] },
  { name: 'Delaware', aqi: 58, coords: [39.318523, -75.507141] },
  { name: 'Florida', aqi: 55, coords: [27.766279, -81.686783] },
  { name: 'Georgia', aqi: 54, coords: [33.040619, -83.643074] },
  { name: 'Hawaii', aqi: 32, coords: [21.094318, -157.498337] },
  { name: 'Idaho', aqi: 41, coords: [44.240459, -114.478828] },
  { name: 'Illinois', aqi: 62, coords: [40.349457, -88.986137] },
  { name: 'Indiana', aqi: 65, coords: [39.849426, -86.258278] },
  { name: 'Iowa', aqi: 48, coords: [42.011539, -93.210526] },
  { name: 'Kansas', aqi: 46, coords: [38.526600, -96.726486] },
  { name: 'Kentucky', aqi: 58, coords: [37.668140, -84.670067] },
  { name: 'Louisiana', aqi: 64, coords: [31.169546, -91.867805] },
  { name: 'Maine', aqi: 42, coords: [44.693947, -69.381927] },
  { name: 'Maryland', aqi: 67, coords: [39.063946, -76.802101] },
  { name: 'Massachusetts', aqi: 59, coords: [42.230171, -71.530106] },
  { name: 'Michigan', aqi: 56, coords: [43.326618, -84.536095] },
  { name: 'Minnesota', aqi: 44, coords: [45.694454, -93.900192] },
  { name: 'Mississippi', aqi: 49, coords: [32.741646, -89.678696] },
  { name: 'Missouri', aqi: 53, coords: [38.456085, -92.288368] },
  { name: 'Montana', aqi: 38, coords: [47.052952, -110.454353] },
  { name: 'Nebraska', aqi: 43, coords: [41.125370, -98.268082] },
  { name: 'Nevada', aqi: 72, coords: [38.313515, -117.055374] },
  { name: 'New Hampshire', aqi: 45, coords: [43.452492, -71.563896] },
  { name: 'New Jersey', aqi: 71, coords: [40.298904, -74.521011] },
  { name: 'New Mexico', aqi: 56, coords: [34.840515, -106.248482] },
  { name: 'New York', aqi: 68, coords: [42.165726, -74.948051] },
  { name: 'North Carolina', aqi: 51, coords: [35.630066, -79.806419] },
  { name: 'North Dakota', aqi: 39, coords: [47.528912, -99.784012] },
  { name: 'Ohio', aqi: 63, coords: [40.388783, -82.764915] },
  { name: 'Oklahoma', aqi: 47, coords: [35.565342, -96.928917] },
  { name: 'Oregon', aqi: 49, coords: [44.931109, -120.767178] },
  { name: 'Pennsylvania', aqi: 66, coords: [40.590752, -77.209755] },
  { name: 'Rhode Island', aqi: 57, coords: [41.680893, -71.511780] },
  { name: 'South Carolina', aqi: 50, coords: [33.856892, -80.945007] },
  { name: 'South Dakota', aqi: 41, coords: [44.299782, -99.438828] },
  { name: 'Tennessee', aqi: 56, coords: [35.747845, -86.692345] },
  { name: 'Texas', aqi: 61, coords: [31.054487, -97.563461] },
  { name: 'Utah', aqi: 68, coords: [40.150032, -111.862434] },
  { name: 'Vermont', aqi: 40, coords: [44.045876, -72.710686] },
  { name: 'Virginia', aqi: 54, coords: [37.769337, -78.169968] },
  { name: 'Washington', aqi: 43, coords: [47.400902, -121.490494] },
  { name: 'West Virginia', aqi: 59, coords: [38.491226, -80.954570] },
  { name: 'Wisconsin', aqi: 47, coords: [44.268543, -89.616508] },
  { name: 'Wyoming', aqi: 35, coords: [42.755966, -107.302490] }
];

// Convert OpenAQ data to station format
export const convertOpenAQToStations = (measurements: OpenAQMeasurement[]): AirQualityStation[] => {
  const stationMap = new Map<string, any>();
  
  measurements.forEach(m => {
    if (!m.coordinates || !m.coordinates.latitude || !m.coordinates.longitude) return;
    
    const key = `${m.location}-${m.coordinates.latitude}-${m.coordinates.longitude}`;
    if (!stationMap.has(key)) {
      stationMap.set(key, {
        id: m.locationId.toString(),
        name: m.location || 'Unknown Station',
        location: `${m.city || 'Unknown'}, ${m.country || 'US'}`,
        coords: [m.coordinates.latitude, m.coordinates.longitude],
        pollutants: { pm25: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0 },
        weather: { temperature: 20, humidity: 50, windSpeed: 3 },
        lastUpdated: m.date?.utc || new Date().toISOString()
      });
    }
    
    const station = stationMap.get(key);
    if (m.parameter === 'pm25') station.pollutants.pm25 = Math.max(0, m.value || 0);
    if (m.parameter === 'pm10') station.pollutants.pm10 = Math.max(0, m.value || 0);
    if (m.parameter === 'o3') station.pollutants.o3 = Math.max(0, m.value || 0);
    if (m.parameter === 'no2') station.pollutants.no2 = Math.max(0, m.value || 0);
    if (m.parameter === 'so2') station.pollutants.so2 = Math.max(0, m.value || 0);
    if (m.parameter === 'co') station.pollutants.co = Math.max(0, m.value || 0);
  });
  
  return Array.from(stationMap.values()).map(station => {
    // Calculate AQI using EPA formula approximation
    const pm25Aqi = (station.pollutants.pm25 || 0) * 4.17;
    const o3Aqi = (station.pollutants.o3 || 0) * 1.28;
    const no2Aqi = (station.pollutants.no2 || 0) * 0.53;
    const aqi = Math.round(Math.max(pm25Aqi, o3Aqi, no2Aqi, 1));
    
    return {
      ...station,
      aqi: Math.min(500, aqi),
      level: getAQILevel(aqi)
    };
  });
};

// Convert EPA data to stations
export const convertEPAToStations = (epaData: EPAAirNowData[]): AirQualityStation[] => {
  return epaData.map((data, idx) => ({
    id: `epa-${idx}`,
    name: data.ReportingArea,
    location: `${data.ReportingArea}, ${data.StateCode}`,
    coords: [data.Latitude, data.Longitude],
    aqi: data.AQI,
    level: data.CategoryName,
    pollutants: { pm25: data.AQI * 0.4, pm10: data.AQI * 0.6, o3: data.AQI * 0.5, no2: data.AQI * 0.3, so2: data.AQI * 0.2, co: data.AQI * 0.01 },
    weather: { temperature: 20, humidity: 50, windSpeed: 3 }
  }));
};

const getAQILevel = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

// Fetch real-time data with enhanced error handling
export const fetchRealTimeStations = async (epaApiKey?: string): Promise<AirQualityStation[]> => {
  try {
    console.log('Fetching real-time data from OpenAQ, EPA AirNow, and NASA TolNet...');
    const realTimeData = await apiService.fetchRealTimeData(epaApiKey);
    
    const openaqStations = convertOpenAQToStations(realTimeData.openaq);
    const epaStations = convertEPAToStations(realTimeData.epa);
    
    // Add TolNet data as specialized ozone monitoring stations
    const tolnetStations: AirQualityStation[] = realTimeData.tolnet.map((site, idx) => ({
      id: `tolnet-${idx}`,
      name: `NASA TolNet ${site.site}`,
      location: `${site.site} Observatory`,
      coords: [site.latitude, site.longitude],
      aqi: Math.round((site.ozone_column - 250) / 2), // Convert ozone column to approximate AQI
      level: getAQILevel(Math.round((site.ozone_column - 250) / 2)),
      pollutants: {
        pm25: 0,
        pm10: 0,
        o3: site.ozone_column / 10, // Convert to ppb equivalent
        no2: site.no2_column / 1e13, // Convert to ppb equivalent
        so2: 0,
        co: 0
      },
      weather: { temperature: 20, humidity: 50, windSpeed: 3 }
    }));
    
    const allStations = [...openaqStations.slice(0, 15), ...epaStations.slice(0, 10), ...tolnetStations];
    console.log(`Fetched ${allStations.length} real-time stations`);
    
    return allStations.length > 0 ? allStations : airQualityStations;
  } catch (error) {
    console.error('Failed to fetch real-time data:', error);
    return airQualityStations;
  }
};

export const generateForecast = (currentAqi: number): AirQualityForecast[] => {
  const now = new Date();
  const forecasts: AirQualityForecast[] = [];

  for (let i = 1; i <= 24; i++) {
    const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    const variance = Math.random() * 20 - 10;
    const predictedAqi = Math.max(0, Math.min(500, Math.round(currentAqi + variance)));

    forecasts.push({
      timestamp: forecastTime.toISOString(),
      aqi: predictedAqi,
      pm25: Math.max(0, (currentAqi * 0.3 + variance * 0.5)),
      o3: Math.max(0, (currentAqi * 0.4 + variance * 0.3)),
      no2: Math.max(0, (currentAqi * 0.25 + variance * 0.4)),
    });
  }

  return forecasts;
};

// --- Global air report (country-level aggregation) ---
export interface CountryAirSummary {
  country: string;
  count: number;
  avgPm25: number;
  avgPm10: number;
  avgO3: number;
  avgNo2: number;
  aqi: number;
  level: string;
}

export const fetchGlobalAirReport = async (limit = 2000): Promise<CountryAirSummary[]> => {
  try {
    const measurements = await apiService.fetchGlobalOpenAQ(limit);
    if (!measurements || measurements.length === 0) return [];

    const countryMap = new Map<string, { count: number; pm25: number; pm10: number; o3: number; no2: number }>();

    for (const m of measurements) {
      const country = (m.country || 'Unknown').toUpperCase();
      if (!countryMap.has(country)) {
        countryMap.set(country, { count: 0, pm25: 0, pm10: 0, o3: 0, no2: 0 });
      }

      const entry = countryMap.get(country)!;
      entry.count += 1;
      if (m.parameter === 'pm25') entry.pm25 += (m.value || 0);
      if (m.parameter === 'pm10') entry.pm10 += (m.value || 0);
      if (m.parameter === 'o3') entry.o3 += (m.value || 0);
      if (m.parameter === 'no2') entry.no2 += (m.value || 0);
    }

    const summaries: CountryAirSummary[] = [];
    for (const [country, vals] of countryMap.entries()) {
      const avgPm25 = vals.count > 0 ? vals.pm25 / vals.count : 0;
      const avgPm10 = vals.count > 0 ? vals.pm10 / vals.count : 0;
      const avgO3 = vals.count > 0 ? vals.o3 / vals.count : 0;
      const avgNo2 = vals.count > 0 ? vals.no2 / vals.count : 0;

      // Build a pollutants object compatible with getAQIFromPollutants
      const pollutants = { pm25: avgPm25, pm10: avgPm10, o3: avgO3, no2: avgNo2, so2: 0, co: 0 } as any;
      const aqi = getAQIFromPollutants(pollutants);

      summaries.push({
        country,
        count: vals.count,
        avgPm25: Number(avgPm25.toFixed(2)),
        avgPm10: Number(avgPm10.toFixed(2)),
        avgO3: Number(avgO3.toFixed(2)),
        avgNo2: Number(avgNo2.toFixed(2)),
        aqi,
        level: getAQILevel(aqi)
      });
    }

    // Sort by worst AQI first
    summaries.sort((a, b) => b.aqi - a.aqi);
    return summaries;
  } catch (error) {
    console.error('Failed to fetch global air report:', error);
    return [];
  }
};

export interface RegionSummary {
  name: string;
  coords: [number, number];
  aqi: number;
  level: string;
  pollutants: { pm25: number; pm10: number; o3: number; no2: number; so2: number; co: number };
  weather: { temperature: number; humidity: number; windSpeed: number };
  count: number;
}

/**
 * Compute simple regional summaries (avg AQI and pollutant averages) from station list.
 * Regions are defined by rough bounding boxes for the continental US.
 */
export const computeRegionSummaries = (stations: any[]): RegionSummary[] => {
  const regions = [
    { name: 'West', bounds: { latMin: 32, latMax: 49, lonMin: -125, lonMax: -102 }, coords: [37.7749, -122.4194] as [number, number] },
    { name: 'Midwest', bounds: { latMin: 36, latMax: 49, lonMin: -103, lonMax: -84 }, coords: [41.8781, -87.6298] as [number, number] },
    { name: 'Northeast', bounds: { latMin: 40, latMax: 47, lonMin: -80, lonMax: -66 }, coords: [40.7128, -74.0060] as [number, number] },
    { name: 'South', bounds: { latMin: 24, latMax: 37.5, lonMin: -100, lonMax: -75 }, coords: [29.7604, -95.3698] as [number, number] },
  ];

  const summaries: RegionSummary[] = regions.map(r => ({
    name: r.name,
    coords: r.coords,
    aqi: 0,
    level: 'Unknown',
    pollutants: { pm25: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0 },
    weather: { temperature: 20, humidity: 50, windSpeed: 3 },
    count: 0
  }));

  for (const s of stations) {
    const lat = Number(s.coords?.[0] ?? s.coords?.[1] ?? 0);
    const lon = Number(s.coords?.[1] ?? 0);
    if (!isFinite(lat) || !isFinite(lon)) continue;

    regions.forEach((r, idx) => {
      const b = r.bounds;
      if (lat >= b.latMin && lat <= b.latMax && lon >= b.lonMin && lon <= b.lonMax) {
        const sum = summaries[idx];
        sum.count += 1;
        sum.aqi += (s.aqi || 0);
        sum.pollutants.pm25 += (s.pollutants?.pm25 || 0);
        sum.pollutants.pm10 += (s.pollutants?.pm10 || 0);
        sum.pollutants.o3 += (s.pollutants?.o3 || 0);
        sum.pollutants.no2 += (s.pollutants?.no2 || 0);
        sum.pollutants.so2 += (s.pollutants?.so2 || 0);
        sum.pollutants.co += (s.pollutants?.co || 0);
        sum.weather.temperature += (s.weather?.temperature || 20);
        sum.weather.humidity += (s.weather?.humidity || 50);
        sum.weather.windSpeed += (s.weather?.windSpeed || 3);
      }
    });
  }

  return summaries.map(s => {
    if (s.count === 0) return { ...s, aqi: 63, level: getAQILevel(63) };
    const avgAqi = Math.round(s.aqi / s.count);
    return {
      ...s,
      aqi: avgAqi,
      level: getAQILevel(avgAqi),
      pollutants: {
        pm25: Number((s.pollutants.pm25 / s.count).toFixed(2)),
        pm10: Number((s.pollutants.pm10 / s.count).toFixed(2)),
        o3: Number((s.pollutants.o3 / s.count).toFixed(2)),
        no2: Number((s.pollutants.no2 / s.count).toFixed(2)),
        so2: Number((s.pollutants.so2 / s.count).toFixed(2)),
        co: Number((s.pollutants.co / s.count).toFixed(2)),
      },
      weather: {
        temperature: Number((s.weather.temperature / s.count).toFixed(1)),
        humidity: Number((s.weather.humidity / s.count).toFixed(0)),
        windSpeed: Number((s.weather.windSpeed / s.count).toFixed(1)),
      }
    } as RegionSummary;
  });
};
