# 🌌 NASA TEMPO Air Quality Monitor

A comprehensive real-time air quality monitoring system built with React, TypeScript, and Three.js, featuring an interactive 3D solar system and detailed air quality analysis with space-themed UI.

![NASA TEMPO Air Quality Monitor](https://img.shields.io/badge/NASA-TEMPO-blue?style=for-the-badge&logo=nasa)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=for-the-badge&logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-0.180.0-black?style=for-the-badge&logo=three.js)

## 🚀 Features

### 🌍 Interactive 3D Solar System
- **Realistic 3D Solar System** with all 8 planets
- **Interactive Earth View** with detailed surface mapping
- **Animated Planets** with realistic orbits and rotations
- **Satellite Orbits** showing NASA satellites around Earth
- **Enhanced Space Background** with 25,000+ stars and shooting stars
- **Smooth Camera Controls** - drag to rotate, scroll to zoom
- **Planet Information Cards** with detailed facts

### 🗺️ Air Quality Monitoring
- **Real-time Air Quality Data** from multiple sources:
  - OpenAQ API
  - EPA AirNow API
  - NASA TolNet data
- **Interactive Map** with Leaflet integration
- **Regional Analysis** for West, Midwest, Northeast, and South regions
- **Station Details** with comprehensive pollutant analysis
- **Weather Integration** showing temperature, humidity, and wind data

### 📊 Detailed Analysis Pages
- **Station Detail Pages** with space-themed backgrounds
- **Regional Detail Pages** with comprehensive regional analysis
- **Health Recommendations** based on AQI levels
- **Advanced Analytics** with trend analysis
- **NASA TEMPO Integration** with satellite data insights

### 🎨 Space-Themed UI
- **Consistent Space Background** across all pages
- **Animated Starfields** with shooting stars
- **NASA Branding** and professional styling
- **Responsive Design** for all screen sizes
- **Dark Theme** optimized for space exploration

## 🛠️ Technology Stack

- **Frontend**: React 18.3.1 with TypeScript
- **3D Graphics**: Three.js 0.180.0
- **Maps**: Leaflet 1.9.4
- **Styling**: Tailwind CSS 3.4.1
- **Build Tool**: Vite 5.4.2
- **Icons**: Lucide React
- **Data Sources**: OpenAQ, EPA AirNow, NASA TolNet

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nasa-tempo-air-quality.git
   cd nasa-tempo-air-quality
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   Create a `.env` file in the root directory:
   ```env
   VITE_EPA_API_KEY=your_epa_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎮 Usage

### Solar System Explorer
1. **Navigate the Solar System**: Drag to rotate, scroll to zoom
2. **Click Planets**: Get detailed information about each planet
3. **Enter Earth View**: Click Earth or the "Enter Earth View" button
4. **Switch to Air Quality**: Use the toggle button in the header

### Air Quality Monitoring
1. **View the Map**: See real-time air quality stations
2. **Click Stations**: Get detailed analysis of specific locations
3. **Regional Analysis**: Click "View" on regional summaries
4. **Toggle Views**: Switch between Solar System and Air Quality Map

### Detailed Analysis
1. **Station Details**: Click any station marker for comprehensive analysis
2. **Regional Details**: Click "View" on regional summaries
3. **Navigate Back**: Use the "Back to Map" button to return

## 🏗️ Project Structure

```
src/
├── components/
│   ├── AirQualityMap.tsx          # Interactive air quality map
│   ├── SimpleSolarSystem.tsx      # 3D solar system component
│   ├── DetailPage.tsx             # Station detail page
│   ├── RegionalDetailPage.tsx     # Regional detail page
│   ├── AlertPanel.tsx             # Air quality alerts
│   ├── ForecastPanel.tsx          # Weather forecasts
│   ├── AQILegend.tsx              # AQI color legend
│   └── RegionDetailsPanel.tsx     # Regional summary panel
├── data/
│   └── airQualityData.ts          # Data management and API calls
├── services/
│   └── apiService.ts              # API service layer
├── types/
│   └── airQuality.ts              # TypeScript type definitions
├── App.tsx                        # Main application component
├── main.tsx                       # Application entry point
└── index.css                      # Global styles
```

## 🔧 Configuration

### Vite Configuration
The project uses Vite with optimized settings for Three.js:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['three'],
  },
});
```

### API Configuration
The application integrates with multiple air quality data sources:
- **OpenAQ**: No API key required
- **EPA AirNow**: Optional API key for enhanced data
- **NASA TolNet**: Simulated data for demonstration

## 📊 Data Sources

### Real-time Air Quality Data
- **OpenAQ API**: Global air quality measurements
- **EPA AirNow API**: US air quality data
- **NASA TolNet**: Ozone and NO2 column data

### Regional Analysis
- **West Region**: California, Nevada, Arizona, etc.
- **Midwest Region**: Illinois, Ohio, Michigan, etc.
- **Northeast Region**: New York, Massachusetts, Pennsylvania, etc.
- **South Region**: Texas, Florida, Georgia, etc.

## 🎨 UI Components

### Space Theme
- **Starfield Backgrounds**: Animated stars across all pages
- **Shooting Stars**: Dynamic shooting star animations
- **Nebula Effects**: Subtle space atmosphere
- **NASA Branding**: Consistent NASA styling

### Interactive Elements
- **3D Solar System**: Fully interactive with mouse controls
- **Air Quality Map**: Clickable stations and regions
- **Detail Pages**: Comprehensive analysis with space backgrounds
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
The project is configured for easy deployment to modern hosting platforms:
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

## 🔬 Scientific Features

### Air Quality Index (AQI) Calculation
- **EPA Standard**: Uses official EPA AQI calculation methods
- **Pollutant Analysis**: PM2.5, PM10, O3, NO2, SO2, CO
- **Health Impact Assessment**: Real-time health recommendations
- **Regional Aggregation**: Area-wide air quality analysis

### NASA TEMPO Integration
- **Satellite Data**: Integration with NASA TEMPO mission data
- **Ozone Monitoring**: Real-time ozone column measurements
- **NO2 Tracking**: Nitrogen dioxide concentration monitoring
- **Scientific Accuracy**: Based on NASA research and data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for the TEMPO mission and scientific data
- **OpenAQ** for global air quality data
- **EPA** for US air quality monitoring
- **Three.js** community for 3D graphics library
- **React** team for the amazing framework

## 📞 Support

For support, email support@nasa-tempo-air-quality.com or create an issue in the GitHub repository.

## 🔮 Future Enhancements

- [ ] Real-time satellite imagery integration
- [ ] Historical data analysis and trends
- [ ] Mobile app development
- [ ] Advanced machine learning predictions
- [ ] Global air quality monitoring
- [ ] Custom alert notifications
- [ ] Data export functionality
- [ ] Multi-language support

---

**Built with ❤️ for NASA and the environment**

*This project demonstrates the power of combining modern web technologies with scientific data to create meaningful environmental monitoring tools.*