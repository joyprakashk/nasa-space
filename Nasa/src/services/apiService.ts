// Real-time API integrations for air quality data
export interface OpenAQMeasurement {
  locationId: number;
  location: string;
  parameter: string;
  value: number;
  unit: string;
  country: string;
  city: string;
  coordinates: { latitude: number; longitude: number };
  date: { utc: string; local: string };
}

export interface EPAAirNowData {
  DateObserved: string;
  HourObserved: number;
  LocalTimeZone: string;
  ReportingArea: string;
  StateCode: string;
  Latitude: number;
  Longitude: number;
  ParameterName: string;
  AQI: number;
  CategoryName: string;
}

export interface TolNetData {
  site: string;
  latitude: number;
  longitude: number;
  date: string;
  ozone_column: number;
  no2_column: number;
}

class APIService {
  private readonly OPENAQ_BASE = 'https://api.openaq.org/v2';
  private readonly EPA_BASE = 'https://www.airnowapi.org/aq';
  // NOTE: TolNet data is simulated in fetchTolNetData; no base URL required here.

  async fetchOpenAQData(country = 'US', limit = 100): Promise<OpenAQMeasurement[]> {
    try {
      const response = await fetch(
        `${this.OPENAQ_BASE}/measurements?country=${country}&limit=${limit}&order_by=datetime&sort=desc&parameter=pm25,pm10,o3,no2`
      );
      
      if (!response.ok) {
        throw new Error(`OpenAQ API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('OpenAQ API error:', error);
      return [];
    }
  }

  /**
   * Fetch a global snapshot from OpenAQ (/latest) and flatten measurements.
   * This endpoint does not require an API key.
   */
  async fetchGlobalOpenAQ(limit = 1000): Promise<OpenAQMeasurement[]> {
    try {
      const params = `limit=${limit}&order_by=lastUpdated&sort=desc&parameter=pm25,pm10,o3,no2,so2,co`;
      const response = await fetch(`${this.OPENAQ_BASE}/latest?${params}`);

      if (!response.ok) {
        throw new Error(`OpenAQ global API error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.results || [];

      // Flatten the /latest results: each result has a measurements[] array
      const flattened: OpenAQMeasurement[] = [];
      for (const r of results) {
        if (!r || !r.measurements) continue;
        for (const m of r.measurements) {
          flattened.push({
            locationId: r.id || 0,
            location: r.location || m.parameter || 'Unknown',
            parameter: m.parameter,
            value: m.value,
            unit: m.unit || m?.unit || '',
            country: r.country || 'US',
            city: r.city || '',
            coordinates: r.coordinates || { latitude: 0, longitude: 0 },
            date: { utc: m.lastUpdated || new Date().toISOString(), local: m.lastUpdated || new Date().toISOString() }
          });
        }
      }

      return flattened;
    } catch (error) {
      console.error('OpenAQ global API error:', error);
      return [];
    }
  }

  async fetchEPAAirNowData(apiKey?: string): Promise<EPAAirNowData[]> {
    const key = apiKey || import.meta.env.VITE_EPA_API_KEY;
    if (!key) {
      console.warn('EPA AirNow API key required');
      return [];
    }
    
    try {
      // Fetch multiple zip codes for better coverage
      const zipCodes = ['10001', '90210', '60601', '77001', '85001'];
      const promises = zipCodes.map(zip => 
        fetch(`${this.EPA_BASE}/observation/zipCode/current/?format=application/json&zipCode=${zip}&distance=50&API_KEY=${key}`)
          .then(res => res.json())
          .catch(() => [])
      );
      
      const results = await Promise.all(promises);
      return results.flat().filter(Array.isArray).flat();
    } catch (error) {
      console.error('EPA AirNow API error:', error);
      return [];
    }
  }

  async fetchTolNetData(): Promise<TolNetData[]> {
    try {
      // NASA TolNet sites with real coordinates
      const tolnetSites: TolNetData[] = [
        { site: 'GSFC', latitude: 38.9967, longitude: -76.8397, date: new Date().toISOString(), ozone_column: 320 + Math.random() * 40, no2_column: (2.1 + Math.random() * 0.5) * 1e15 },
        { site: 'JPL', latitude: 34.2048, longitude: -118.1712, date: new Date().toISOString(), ozone_column: 310 + Math.random() * 30, no2_column: (1.8 + Math.random() * 0.4) * 1e15 },
        { site: 'Huntsville', latitude: 34.7304, longitude: -86.5861, date: new Date().toISOString(), ozone_column: 315 + Math.random() * 35, no2_column: (1.9 + Math.random() * 0.3) * 1e15 },
        { site: 'Boulder', latitude: 40.0150, longitude: -105.2705, date: new Date().toISOString(), ozone_column: 325 + Math.random() * 25, no2_column: (2.0 + Math.random() * 0.6) * 1e15 },
      ];
      return tolnetSites;
    } catch (error) {
      console.error('TolNet API error:', error);
      return [];
    }
  }

  async fetchRealTimeData(epaApiKey?: string) {
    const [openaqData, epaData, tolnetData] = await Promise.all([
      this.fetchOpenAQData(),
      this.fetchEPAAirNowData(epaApiKey),
      this.fetchTolNetData()
    ]);

    return {
      openaq: openaqData,
      epa: epaData,
      tolnet: tolnetData,
      timestamp: new Date().toISOString()
    };
  }
}

export const apiService = new APIService();