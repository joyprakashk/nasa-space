import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface PlanetData {
  name: string;
  diameter: string;
  distance: string;
  atmosphere: string;
  fact: string;
}

interface PlanetConfig {
  name: string;
  size: number;
  distance: number;
  color: number;
  speed: number;
}

interface CameraAngle {
  theta: number;
  phi: number;
}

interface MousePosition {
  x: number;
  y: number;
}

interface SatelliteUserData {
  orbitRadius: number;
  orbitInclination: number;
  orbitRotation: number;
  angle: number;
  speed: number;
  name: string;
}

interface PlanetUserData {
  name: string;
  distance: number;
  speed: number;
  angle: number;
  cloudMesh?: THREE.Mesh;
}

interface SolarSystemProps {
  onEnterMap?: () => void;
}

const SolarSystem: React.FC<SolarSystemProps> = ({ onEnterMap }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [earthView, setEarthView] = useState<boolean>(false);
  const [transitioning, setTransitioning] = useState<boolean>(false);
  
  const planetData: Record<string, PlanetData> = {
    mercury: {
      name: 'Mercury',
      diameter: '4,879 km',
      distance: '57.9 million km',
      atmosphere: 'Extremely thin (exosphere)',
      fact: 'A year on Mercury is just 88 Earth days, but a day lasts 176 Earth days!'
    },
    venus: {
      name: 'Venus',
      diameter: '12,104 km',
      distance: '108.2 million km',
      atmosphere: 'Thick CO₂ with sulfuric acid clouds',
      fact: 'Venus rotates backwards and has the hottest surface of any planet at 462°C!'
    },
    earth: {
      name: 'Earth',
      diameter: '12,742 km',
      distance: '149.6 million km',
      atmosphere: '78% Nitrogen, 21% Oxygen',
      fact: 'The only known planet with life, and 71% of its surface is covered in water!'
    },
    mars: {
      name: 'Mars',
      diameter: '6,779 km',
      distance: '227.9 million km',
      atmosphere: 'Thin CO₂ atmosphere',
      fact: 'Home to the largest volcano in the solar system - Olympus Mons, 3x taller than Mt. Everest!'
    },
    jupiter: {
      name: 'Jupiter',
      diameter: '139,820 km',
      distance: '778.5 million km',
      atmosphere: 'Hydrogen and Helium',
      fact: 'So massive that 1,300 Earths could fit inside it, with a storm larger than Earth!'
    },
    saturn: {
      name: 'Saturn',
      diameter: '116,460 km',
      distance: '1.43 billion km',
      atmosphere: 'Hydrogen and Helium',
      fact: 'Its rings are made of billions of ice particles, some as small as dust, others as big as mountains!'
    },
    uranus: {
      name: 'Uranus',
      diameter: '50,724 km',
      distance: '2.87 billion km',
      atmosphere: 'Hydrogen, Helium, Methane',
      fact: 'Rotates on its side at 98°, possibly due to a massive collision long ago!'
    },
    neptune: {
      name: 'Neptune',
      diameter: '49,244 km',
      distance: '4.50 billion km',
      atmosphere: 'Hydrogen, Helium, Methane',
      fact: 'Has the fastest winds in the solar system, reaching speeds of 2,100 km/h!'
    }
  };

  const satelliteNames: string[] = [
    'TDRS-5', 'TDRS-7', 'TDRS-9', 'TDRS-10', 'TDRS-12',
    'MMS 4', 'Chandra X-ray', 'TESS', 'Landsat 8',
    'Solar Dynamics Observatory', 'THEMIS-E'
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011); // Deep space blue-black for nicer ambiance
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    try {
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.zIndex = '0';
    } catch (e) {}
    renderer.setClearColor(0x000000, 1);
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced Starfield with more density and twinkling effect
    const starGeometry = new THREE.BufferGeometry();
    const starVertices: number[] = [];
    const starColors: number[] = [];
    const starSizes: number[] = [];
    for (let i = 0; i < 50000; i++) { // More stars for density
      const x = (Math.random() - 0.5) * 8000; // Larger field
      const y = (Math.random() - 0.5) * 8000;
      const z = (Math.random() - 0.5) * 8000;
      starVertices.push(x, y, z);
      
      // Varied colors: white, blue, yellow stars
      const colorType = Math.random();
      let r, g, b;
      if (colorType < 0.7) { // White/blue
        const variation = Math.random() * 0.3 + 0.7;
        r = variation;
        g = variation;
        b = Math.min(1, variation + 0.3);
      } else if (colorType < 0.9) { // Yellow
        r = Math.random() * 0.5 + 0.5;
        g = Math.random() * 0.5 + 0.3;
        b = 0.1;
      } else { // Red giants
        r = Math.random() * 0.8 + 0.2;
        g = 0.1;
        b = 0.1;
      }
      starColors.push(r, g, b);
      
      starSizes.push(Math.random() * 3 + 0.5);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({ 
      size: 2, 
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Multiple nebula layers for depth
    for (let i = 0; i < 3; i++) {
      const nebulaGeometry = new THREE.PlaneGeometry(10000, 10000);
      const nebulaMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + i * 0.1, 0.3, 0.1 + i * 0.05),
        transparent: true,
        opacity: 0.05 + i * 0.02,
        side: THREE.DoubleSide
      });
      const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
      nebula.position.z = -2000 - i * 2000;
      nebula.rotation.y = Math.random() * Math.PI * 2;
      scene.add(nebula);
    }

    // Sun with improved material and subtle flares
    const sunGeometry = new THREE.SphereGeometry(25, 64, 64); // Slightly larger
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xfdb813,
      transparent: true,
      opacity: 0.95
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Sun corona/glow
    const sunGlowGeometry = new THREE.SphereGeometry(35, 32, 32);
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffed4e,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    sun.add(sunGlow);

    // Improved lighting
    const sunLight = new THREE.PointLight(0xffffff, 1.5, 3000); // Brighter, farther reach
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // Brighter ambient
    scene.add(ambientLight);

    const hemi = new THREE.HemisphereLight(0x4444ff, 0x222244, 0.6); // Stronger hemisphere
    scene.add(hemi);

    // Create realistic Earth with texture maps (day, normal, specular, night) + cloud layer
    const earthGroup = new THREE.Group();
    const detailedEarthGeometry = new THREE.SphereGeometry(50, 128, 128);

    // Fallback material with better visibility (blue tint)
    const detailedEarthMaterial = new THREE.MeshStandardMaterial({
      color: 0x2233aa, // Blue fallback
      roughness: 0.7,
      metalness: 0.0
    });

    const detailedEarth = new THREE.Mesh(detailedEarthGeometry, detailedEarthMaterial);
    earthGroup.add(detailedEarth);

    // Cloud mesh
    const cloudGeometry = new THREE.SphereGeometry(51.5, 128, 128);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earthGroup.add(clouds);

    // Load high-quality Earth textures
    const loader = new THREE.TextureLoader();
    const basePath = 'https://threejs.org/examples/textures/planets';
    const dayUrl = `${basePath}/earth_atmos_2048.jpg`;
    const normalUrl = `${basePath}/earth_normal_2048.jpg`;
    const specularUrl = `${basePath}/earth_specular_2048.jpg`;
    const cloudsUrl = `${basePath}/earth_clouds_1024.png`;
    const nightUrl = `${basePath}/earth_lights_2048.png`;

    loader.load(dayUrl, (map) => {
      detailedEarthMaterial.map = map;
      detailedEarthMaterial.needsUpdate = true;
    });

    loader.load(normalUrl, (nm) => {
      detailedEarthMaterial.normalMap = nm;
      detailedEarthMaterial.normalScale = new THREE.Vector2(1, 1);
      detailedEarthMaterial.needsUpdate = true;
    });

    loader.load(specularUrl, (sm) => {
      detailedEarthMaterial.roughnessMap = sm; // Use as roughness for water
      detailedEarthMaterial.needsUpdate = true;
    });

    loader.load(nightUrl, (nm) => {
      detailedEarthMaterial.emissiveMap = nm;
      detailedEarthMaterial.emissive = new THREE.Color(0xffffff);
      detailedEarthMaterial.emissiveIntensity = 0.4; // Brighter night lights
      detailedEarthMaterial.needsUpdate = true;
    });

    loader.load(cloudsUrl, (cmap) => {
      cloudMaterial.map = cmap;
      cloudMaterial.alphaMap = cmap;
      cloudMaterial.opacity = 0.7;
      cloudMaterial.needsUpdate = true;
    });
    
    // Enhanced latitude/longitude grid with better visibility
    const gridGroup = new THREE.Group();
    
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const radius = 52;
      const latRad = (lat * Math.PI) / 180;
      const latRadius = radius * Math.cos(latRad);
      const latY = radius * Math.sin(latRad);
      
      const latGeometry = new THREE.BufferGeometry();
      const latPoints: number[] = [];
      for (let lon = 0; lon <= 360; lon += 5) { // Finer lines
        const lonRad = (lon * Math.PI) / 180;
        latPoints.push(
          latRadius * Math.cos(lonRad),
          latY,
          latRadius * Math.sin(lonRad)
        );
      }
      latGeometry.setAttribute('position', new THREE.Float32BufferAttribute(latPoints, 3));
      const latLine = new THREE.Line(
        latGeometry,
        new THREE.LineBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 })
      );
      gridGroup.add(latLine);
    }
    
    // Longitude lines
    for (let lon = 0; lon < 360; lon += 20) {
      const lonRad = (lon * Math.PI) / 180;
      const lonGeometry = new THREE.BufferGeometry();
      const lonPoints: number[] = [];
      for (let lat = -90; lat <= 90; lat += 2) {
        const latRad = (lat * Math.PI) / 180;
        const radius = 52;
        lonPoints.push(
          radius * Math.cos(latRad) * Math.cos(lonRad),
          radius * Math.sin(latRad),
          radius * Math.cos(latRad) * Math.sin(lonRad)
        );
      }
      lonGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lonPoints, 3));
      const lonLine = new THREE.Line(
        lonGeometry,
        new THREE.LineBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 })
      );
      gridGroup.add(lonLine);
    }
    
    earthGroup.add(gridGroup);
    
    // Atmosphere glow with better color
    const atmosphereGeometry = new THREE.SphereGeometry(54, 128, 128);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphere);
    
    earthGroup.position.set(0, 0, 0);
    earthGroup.visible = false; // Hide initially to avoid overlap with sun/small planets
    scene.add(earthGroup);

    // Create satellite orbits and satellites (only for Earth view)
    const satellites: THREE.Mesh[] = [];
    const satelliteOrbits: THREE.Line[] = [];
    const moonsByPlanet: Record<string, THREE.Mesh[]> = {};
    const moonOrbitLinesByPlanet: Record<string, THREE.Line[]> = {};
    
    for (let i = 0; i < 11; i++) { // More satellites
      const orbitRadius = 58 + i * 3.5;
      const orbitInclination = (Math.random() - 0.5) * Math.PI * 0.6;
      const orbitRotation = Math.random() * Math.PI * 2;
      
      // Orbit line
      const orbitPoints: number[] = [];
      for (let j = 0; j <= 128; j++) {
        const angle = (j / 128) * Math.PI * 2;
        const x = orbitRadius * Math.cos(angle);
        const y = orbitRadius * Math.sin(angle) * Math.sin(orbitInclination);
        const z = orbitRadius * Math.sin(angle) * Math.cos(orbitInclination);
        orbitPoints.push(x, y, z);
      }
      
      const orbitGeometry = new THREE.BufferGeometry();
      orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
      const orbitLine = new THREE.Line(
        orbitGeometry,
        new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.6 })
      );
      orbitLine.rotation.z = orbitRotation;
      earthGroup.add(orbitLine);
      satelliteOrbits.push(orbitLine);
      
      // Satellite with better model (cylinder + panels)
      const satGroup = new THREE.Group();
      const satBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
      );
      const satPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x4444ff, side: THREE.DoubleSide })
      );
      satPanel.position.set(0.4, 0, 0);
      satGroup.add(satBody, satPanel);
      
      (satGroup.userData as SatelliteUserData) = {
        orbitRadius: orbitRadius,
        orbitInclination: orbitInclination,
        orbitRotation: orbitRotation,
        angle: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.015,
        name: satelliteNames[i] || `Satellite ${i + 1}`
      };
      
      earthGroup.add(satGroup);
      satellites.push(satGroup);
    }

    // Enhanced moon creation with textures and better orbits
    const createMoon = (parentPlanet: THREE.Mesh, name: string, distance: number, size: number, speed: number, inclination = 0, color = 0x888888) => {
      const moonGeo = new THREE.SphereGeometry(size, 32, 32);
      const moonMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, emissive: color, emissiveIntensity: 0.02 });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      (moon.userData as any) = { name, angle: Math.random() * Math.PI * 2, speed, distance, inclination };

      // Orbit line with better visibility
      const orbitPts: number[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        const x = distance * Math.cos(a);
        const y = distance * Math.sin(a) * Math.sin(inclination);
        const z = distance * Math.sin(a) * Math.cos(inclination);
        orbitPts.push(x, y, z);
      }
      const orbitG = new THREE.BufferGeometry();
      orbitG.setAttribute('position', new THREE.Float32BufferAttribute(orbitPts, 3));
      const orbitLine = new THREE.Line(orbitG, new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.4 }));
      orbitLine.rotation.z = Math.random() * Math.PI * 2;

      scene.add(orbitLine);
      scene.add(moon);

      if (!moonsByPlanet[parentPlanet.userData.name]) {
        moonsByPlanet[parentPlanet.userData.name] = [];
        moonOrbitLinesByPlanet[parentPlanet.userData.name] = [];
      }
      moonsByPlanet[parentPlanet.userData.name].push(moon);
      moonOrbitLinesByPlanet[parentPlanet.userData.name].push(orbitLine);
    };

    // Create planets with enhanced details
    const planets: THREE.Mesh[] = [];
    const planetConfigs: PlanetConfig[] = [
      { name: 'mercury', size: 3, distance: 50, color: 0x8c7853, speed: 0.012 }, // Larger sizes for visibility
      { name: 'venus', size: 5, distance: 70, color: 0xffc649, speed: 0.008 },
      { name: 'earth', size: 5, distance: 100, color: 0x4169e1, speed: 0.006 },
      { name: 'mars', size: 4, distance: 130, color: 0xcd5c5c, speed: 0.005 },
      { name: 'jupiter', size: 18, distance: 220, color: 0xdaa520, speed: 0.0025 },
      { name: 'saturn', size: 15, distance: 290, color: 0xf4a460, speed: 0.002 },
      { name: 'uranus', size: 9, distance: 360, color: 0x4fd0e7, speed: 0.0015 },
      { name: 'neptune', size: 9, distance: 420, color: 0x4166f5, speed: 0.0012 }
    ];

    planetConfigs.forEach(config => {
      let planet: THREE.Mesh;
      
      if (config.name === 'earth') {
        const earthSolarGeometry = new THREE.SphereGeometry(config.size, 64, 64);
        const earthSolarMaterial = new THREE.MeshPhongMaterial({
          color: 0x4169e1,
          emissive: 0x002244,
          emissiveIntensity: 0.2,
          specular: 0x444444,
          shininess: 30
        });
        
        // Vertex colors for land/ocean
        const positions = earthSolarGeometry.attributes.position;
        const colors: number[] = [];
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          const noise = Math.sin(x * 0.8) * Math.cos(y * 0.8) * Math.sin(z * 0.8) + Math.sin(x * 2) * 0.5;
          const isLand = noise > 0.3;
          
          if (isLand) {
            colors.push(0.2, 0.5, 0.1); // Green land
          } else {
            colors.push(0.1, 0.3, 0.6); // Blue ocean
          }
        }
        earthSolarGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        earthSolarMaterial.vertexColors = true;
        
        planet = new THREE.Mesh(earthSolarGeometry, earthSolarMaterial);
        
        const cloudGeo = new THREE.SphereGeometry(config.size * 1.03, 32, 32);
        const cloudMat = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.3
        });
        const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        planet.add(cloudMesh);
        
        // Earth glow
        const glowGeo = new THREE.SphereGeometry(config.size * 1.2, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0x87ceeb,
          transparent: true,
          opacity: 0.25,
          side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        planet.add(glow);
        
        (planet.userData as PlanetUserData) = { 
          name: config.name, 
          distance: config.distance, 
          speed: config.speed,
          angle: Math.random() * Math.PI * 2,
          cloudMesh: cloudMesh
        };
        planet.rotation.x = 0.41; // Real axial tilt ~23.5°
      } else {
        const geometry = new THREE.SphereGeometry(config.size, 64, 64);
        let material: THREE.Material;
        
        // Enhanced materials per planet
        switch (config.name) {
          case 'mercury':
            material = new THREE.MeshStandardMaterial({
              color: config.color,
              roughness: 0.3,
              metalness: 0.8 // Cratered, metallic look
            });
            break;
          case 'venus':
            material = new THREE.MeshPhongMaterial({
              color: config.color,
              emissive: 0xffaa00,
              emissiveIntensity: 0.1,
              shininess: 100 // Cloudy glow
            });
            break;
          case 'mars':
            material = new THREE.MeshStandardMaterial({
              color: config.color,
              roughness: 0.9,
              map: loader.load(`${basePath}/mars_1k_color.jpg`) // Use available Mars texture
            });
            break;
          case 'jupiter':
            material = new THREE.MeshPhongMaterial({
              color: config.color,
              emissive: 0x993300,
              emissiveIntensity: 0.15,
              shininess: 20
            });
            // Simple stripe effect via shader would be ideal, but fallback to color
            break;
          case 'saturn':
            material = new THREE.MeshStandardMaterial({
              color: config.color,
              roughness: 0.4,
              metalness: 0.1
            });
            break;
          case 'uranus':
            material = new THREE.MeshStandardMaterial({
              color: config.color,
              roughness: 0.7,
              emissive: config.color,
              emissiveIntensity: 0.08
            });
            break;
          case 'neptune':
            material = new THREE.MeshPhongMaterial({
              color: config.color,
              emissive: 0x0000aa,
              emissiveIntensity: 0.12,
              shininess: 50 // Stormy glow
            });
            break;
          default:
            material = new THREE.MeshStandardMaterial({
              color: config.color,
              roughness: 0.6,
              metalness: 0.05,
              emissive: config.color,
              emissiveIntensity: 0.08
            });
        }
        
        planet = new THREE.Mesh(geometry, material);
        
        // Planetary glow
        const glowGeo = new THREE.SphereGeometry(config.size * 1.15, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: config.color,
          transparent: true,
          opacity: 0.2,
          side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        planet.add(glow);
        
        (planet.userData as PlanetUserData) = { 
          name: config.name, 
          distance: config.distance, 
          speed: config.speed,
          angle: Math.random() * Math.PI * 2 
        };
        
        // Realistic axial tilts
        const tilts = {
          mercury: 0.03, venus: 2.64, mars: 0.25, jupiter: 0.03, saturn: 0.03, uranus: 0.97, neptune: 0.03
        };
        planet.rotation.x = tilts[config.name as keyof typeof tilts] || 0.1;
      }
      
      planet.castShadow = true;
      planet.receiveShadow = true;
      scene.add(planet);
      planets.push(planet);

      // Orbit path as line (better than ring for visibility)
      const orbitPoints: number[] = [];
      for (let i = 0; i <= 128; i++) {
        const angle = (i / 128) * Math.PI * 2;
        orbitPoints.push(
          Math.cos(angle) * config.distance,
          0,
          Math.sin(angle) * config.distance
        );
      }
      const orbitGeometry = new THREE.BufferGeometry();
      orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
      const orbitLine = new THREE.Line(
        orbitGeometry,
        new THREE.LineBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.4 })
      );
      scene.add(orbitLine);

      if (config.name === 'saturn') {
        // Enhanced Saturn rings with gaps
        const ringGeometry = new THREE.RingGeometry(config.size * 1.4, config.size * 2.8, 64);
        const ringMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xc4a86c,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
          roughness: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);

        // Inner ring gap simulation: add a smaller transparent ring
        const innerRing = new THREE.Mesh(
          new THREE.RingGeometry(config.size * 1.1, config.size * 1.3, 64),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        );
        innerRing.rotation.x = Math.PI / 2;
        planet.add(innerRing);
      }

      // Add Uranus faint rings
      if (config.name === 'uranus') {
        const uranusRing = new THREE.Mesh(
          new THREE.RingGeometry(config.size * 1.2, config.size * 1.8, 64),
          new THREE.MeshBasicMaterial({ 
            color: 0x444444, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.3 
          })
        );
        uranusRing.rotation.x = Math.PI / 2;
        planet.add(uranusRing);
      }
    });

    // Add moons with more detail
    const findPlanet = (n: string) => planets.find(p => (p.userData as PlanetUserData).name === n);
    const earthPlanet = findPlanet('earth');
    const marsPlanet = findPlanet('mars');
    const jupiterPlanet = findPlanet('jupiter');
    const saturnPlanet = findPlanet('saturn');

    if (earthPlanet) createMoon(earthPlanet, 'Moon', 12, 1.5, 0.015, 0.02, 0xaaaaaa);
    if (marsPlanet) {
      createMoon(marsPlanet, 'Phobos', 5, 0.8, 0.025, 0.05, 0x666666);
      createMoon(marsPlanet, 'Deimos', 7, 0.6, 0.018, 0.03, 0x555555);
    }
    if (jupiterPlanet) {
      createMoon(jupiterPlanet, 'Io', 18, 1.2, 0.012, 0.02, 0xffaa00);
      createMoon(jupiterPlanet, 'Europa', 22, 1.1, 0.01, 0.01, 0xdddddd);
      createMoon(jupiterPlanet, 'Ganymede', 26, 1.5, 0.008, 0.015, 0x888888);
      createMoon(jupiterPlanet, 'Callisto', 30, 1.3, 0.006, 0.025, 0x444444);
    }
    if (saturnPlanet) {
      createMoon(saturnPlanet, 'Titan', 25, 1.6, 0.007, 0.02, 0xddaaff);
      createMoon(saturnPlanet, 'Rhea', 20, 1.0, 0.009, 0.01, 0xcccccc);
    }

    // Asteroid belt between Mars and Jupiter
    const asteroidGroup = new THREE.Group();
    for (let i = 0; i < 2000; i++) { // More asteroids
      const asteroidGeo = new THREE.DodecahedronGeometry(Math.random() * 0.8 + 0.2, 0);
      const asteroidMat = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color().setHSL(0, 0, Math.random() * 0.3 + 0.4) 
      });
      const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
      
      const angle = Math.random() * Math.PI * 2;
      const dist = 150 + Math.random() * 40; // Between 150-190
      const inclination = (Math.random() - 0.5) * 0.2;
      asteroid.position.set(
        Math.cos(angle) * dist,
        Math.sin(angle) * dist * Math.sin(inclination),
        Math.sin(angle) * dist * Math.cos(inclination)
      );
      asteroid.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      
      asteroidGroup.add(asteroid);
    }
    scene.add(asteroidGroup);

    // Initial camera: closer for better visibility
    camera.position.set(0, 200, 0); // Side view initially
    camera.lookAt(0, 0, 0);

    let isDragging = false;
    let previousMousePosition: MousePosition = { x: 0, y: 0 };
    let cameraAngle: CameraAngle = { theta: 0, phi: Math.PI / 3 }; // Wider view
    let cameraDistance = 250; // Closer initial distance
    let isEarthMode = false;
    let timeScale = 1.0;

    const onMouseDown = (e: MouseEvent): void => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent): void => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      
      cameraAngle.theta -= deltaX * 0.005;
      cameraAngle.phi += deltaY * 0.005;
      cameraAngle.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAngle.phi));
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (): void => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent): void => {
      e.preventDefault();
      if (!isEarthMode) {
        cameraDistance += e.deltaY * 0.5;
        cameraDistance = Math.max(80, Math.min(600, cameraDistance)); // Wider zoom range
      } else {
        cameraDistance += e.deltaY * 0.1;
        cameraDistance = Math.max(60, Math.min(150, cameraDistance));
      }
    };

    const onClick = (e: MouseEvent): void => {
      if (isEarthMode) {
        if (onEnterMap) {
          setTimeout(() => onEnterMap(), 200);
        }
        return;
      }
      
      const mouse = new THREE.Vector2();
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(planets);
      if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object as THREE.Mesh;
        const planetName = (clickedPlanet.userData as PlanetUserData).name;
        
        if (planetName === 'earth') {
          setTransitioning(true);
          setEarthView(true);
          isEarthMode = true;
          
          sun.visible = false;
          sunGlow.visible = false;
          planets.forEach(p => p.visible = false);
          asteroidGroup.visible = false;
          scene.children.forEach(child => {
            if (child instanceof THREE.Line && child.material.color.getHex() === 0x666666) {
              child.visible = false; // Hide orbit lines
            }
          });
          
          earthGroup.visible = true;
          detailedEarth.visible = true;
          clouds.visible = true;
          clouds.scale.set(1.4, 1.4, 1.4); // Slight scale for detail

          cameraDistance = 100;
          cameraAngle = { theta: 0, phi: Math.PI / 2 };
          camera.position.set(100, 20, 0);
          camera.lookAt(earthGroup.position);
          
          setTimeout(() => setTransitioning(false), 1000);
          if (onEnterMap) setTimeout(() => onEnterMap(), 1100);
        } else {
          setSelectedPlanet(planetData[planetName]);
          setShowInfo(true);
        }
      }
    };

    // Planet labels
    const labelContainer = document.createElement('div');
    labelContainer.style.position = 'absolute';
    labelContainer.style.top = '0';
    labelContainer.style.left = '0';
    labelContainer.style.width = '100%';
    labelContainer.style.height = '100%';
    labelContainer.style.pointerEvents = 'none';
    labelContainer.className = 'planet-labels-container';
    if (mountRef.current) mountRef.current.appendChild(labelContainer);

    const labelElements: Record<string, HTMLDivElement> = {};
    planetConfigs.forEach(cfg => {
      const lbl = document.createElement('div');
      lbl.className = 'planet-label text-xs text-white font-semibold px-2 py-1 rounded bg-black bg-opacity-60 border border-white/30 shadow-lg';
      lbl.style.position = 'absolute';
      lbl.style.transform = 'translate(-50%, -50%)';
      lbl.style.pointerEvents = 'none';
      lbl.innerText = cfg.name.charAt(0).toUpperCase() + cfg.name.slice(1);
      labelContainer.appendChild(lbl);
      labelElements[cfg.name] = lbl;
    });

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('click', onClick);

    const animate = (): void => {
      requestAnimationFrame(animate);

      if (!isEarthMode) {
        // Spherical camera movement
        camera.position.x = cameraDistance * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
        camera.position.y = cameraDistance * Math.cos(cameraAngle.phi);
        camera.position.z = cameraDistance * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
        camera.lookAt(0, 0, 0);

        // Sun rotation and subtle pulsing
        sun.rotation.y += 0.005;
        sunGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.001) * 0.05);

        // Planet updates
        planets.forEach(planet => {
          const userData = planet.userData as PlanetUserData;
          userData.angle += userData.speed * timeScale;
          planet.position.x = Math.cos(userData.angle) * userData.distance;
          planet.position.z = Math.sin(userData.angle) * userData.distance;
          planet.rotation.y += 0.02 * timeScale; // Faster rotation for detail
          
          if (userData.name === 'earth' && userData.cloudMesh) {
            userData.cloudMesh.rotation.y += 0.015 * timeScale;
          }

          // Self-rotation variation per planet
          const rotationSpeeds = {
            mercury: 0.004, venus: -0.004, earth: 0.016, mars: 0.018,
            jupiter: 0.04, saturn: 0.035, uranus: 0.01, neptune: 0.02
          };
          planet.rotation.y += (rotationSpeeds[userData.name as keyof typeof rotationSpeeds] || 0.01) * timeScale;
        });

        // Moon updates
        Object.keys(moonsByPlanet).forEach(pname => {
          const moons = moonsByPlanet[pname];
          const lines = moonOrbitLinesByPlanet[pname] || [];
          const parent = planets.find(p => (p.userData as PlanetUserData).name === pname);
          if (!parent) return;
          moons.forEach((moon, idx) => {
            const mu = moon.userData as any;
            mu.angle += mu.speed * timeScale;
            const px = parent.position.x;
            const py = parent.position.y;
            const pz = parent.position.z;
            const x = px + mu.distance * Math.cos(mu.angle);
            const y = py + mu.distance * Math.sin(mu.angle) * Math.sin(mu.inclination);
            const z = pz + mu.distance * Math.sin(mu.angle) * Math.cos(mu.inclination);
            moon.position.set(x, y, z);
            moon.rotation.y += 0.01; // Moon rotation
            const line = lines[idx];
            if (line) {
              line.position.copy(parent.position);
              line.position.y = 0;
            }
          });
        });

        // Asteroid belt rotation
        asteroidGroup.rotation.y += 0.0005 * timeScale;

        // Starfield slow rotation
        stars.rotation.y += 0.0002;

        // Occasional shooting stars
        if (Math.random() < 0.0005) {
          const shootingStarGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(),
            new THREE.Vector3(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5))
          ]);
          const shootingStar = new THREE.Line(shootingStarGeo, new THREE.LineBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 1 
          }));
          shootingStar.position.set(
            (Math.random() - 0.5) * 4000,
            (Math.random() - 0.5) * 4000,
            (Math.random() - 0.5) * 4000
          );
          scene.add(shootingStar);

          const animateShooting = () => {
            shootingStar.material.opacity -= 0.01;
            if (shootingStar.material.opacity > 0) {
              requestAnimationFrame(animateShooting);
            } else {
              scene.remove(shootingStar);
            }
          };
          animateShooting();
        }

        // Nebula slow drift
        scene.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.material.opacity < 0.1) {
            child.rotation.y += 0.0001;
          }
        });
      } else {
        // Earth mode camera
        camera.position.x = cameraDistance * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta) + 10; // Slight offset
        camera.position.y = cameraDistance * Math.cos(cameraAngle.phi) + 10;
        camera.position.z = cameraDistance * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
        camera.lookAt(0, 0, 0);
        
        // Earth rotation
        detailedEarth.rotation.y += 0.01;
        clouds.rotation.y += 0.012;
        clouds.rotation.x += 0.0005;
        atmosphere.rotation.y += 0.011;
        
        // Satellites
        satellites.forEach(sat => {
          const userData = sat.userData as SatelliteUserData;
          userData.angle += userData.speed * timeScale;
          const angle = userData.angle;
          const radius = userData.orbitRadius;
          const inclination = userData.orbitInclination;
          const rotation = userData.orbitRotation;
          
          let x = radius * Math.cos(angle);
          let y = radius * Math.sin(angle) * Math.sin(inclination);
          let z = radius * Math.sin(angle) * Math.cos(inclination);
          
          sat.position.x = x * Math.cos(rotation) - z * Math.sin(rotation);
          sat.position.y = y;
          sat.position.z = x * Math.sin(rotation) + z * Math.cos(rotation);
          
          // Satellite rotation
          sat.rotation.y += 0.05;
        });
      }

      // Update labels
      Object.keys(labelElements).forEach(name => {
        const lbl = labelElements[name];
        const planet = planets.find(p => (p.userData as PlanetUserData).name === name);
        if (!planet || isEarthMode) {
          lbl.style.display = 'none';
          return;
        }
        const pos = planet.position.clone();
        pos.project(camera);
        const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
        lbl.style.left = `${x}px`;
        lbl.style.top = `${y}px`;
        lbl.style.display = pos.z < 1 ? 'block' : 'none';
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = (): void => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const exitEarthView = (): void => {
      setEarthView(false);
      setTransitioning(true);
      isEarthMode = false;
      
      sun.visible = true;
      sunGlow.visible = true;
      planets.forEach(p => p.visible = true);
      asteroidGroup.visible = true;
      scene.children.forEach(child => {
        if (child instanceof THREE.Line && child.material.color.getHex() === 0x666666) {
          child.visible = true;
        }
      });
      
      earthGroup.visible = false;
      cameraDistance = 250;
      cameraAngle = { theta: 0, phi: Math.PI / 3 };
      
      setTimeout(() => setTransitioning(false), 1000);
    };

    const enterEarthView = (): void => {
      isEarthMode = true;
      
      sun.visible = false;
      sunGlow.visible = false;
      planets.forEach(p => p.visible = false);
      asteroidGroup.visible = false;
      scene.children.forEach(child => {
        if (child instanceof THREE.Line && child.material.color.getHex() === 0x666666) {
          child.visible = false;
        }
      });
      
      earthGroup.visible = true;
      detailedEarth.visible = true;
      clouds.visible = true;
      clouds.scale.set(1.4, 1.4, 1.4);
      cameraDistance = 80;
      cameraAngle = { theta: 0, phi: Math.PI / 2 };
      camera.position.set(80, 20, 0);
      camera.lookAt(earthGroup.position);

      sunLight.intensity = 2; // Brighter for close-up

      setTimeout(() => setTransitioning(false), 1000);
    };

    (window as any).exitEarthView = exitEarthView;
    (window as any).enterEarthView = enterEarthView;

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onClick);
      delete (window as any).exitEarthView;
      delete (window as any).enterEarthView;
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
        const existing = mountRef.current.querySelector('.planet-labels-container');
        if (existing) mountRef.current.removeChild(existing);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {earthView && (
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-white">
            NASA
          </div>
          <div className="text-white text-base font-semibold tracking-wider">
            EYES ON THE SOLAR SYSTEM
          </div>
        </div>
      )}
      
      {!earthView && (
        <button
          onClick={() => {
            setTransitioning(true);
            setEarthView(true);
            if ((window as any).enterEarthView) {
              (window as any).enterEarthView();
            }
          }}
          className="absolute top-32 left-6 bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 hover:from-blue-600 hover:via-green-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all transform hover:scale-105 border border-white"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🌍</span>
            <div className="text-sm">View Earth</div>
          </div>
        </button>
      )}

      {earthView && (
        <button 
          onClick={() => (window as any).exitEarthView && (window as any).exitEarthView()}
          className="absolute top-6 right-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all border border-white"
        >
          ← Solar System
        </button>
      )}

      {transitioning && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm transition-opacity duration-1000">
          <div className="text-white text-2xl font-bold animate-pulse">
            {earthView ? '🌍 Zooming to Earth...' : '🌌 Returning to Solar System...'}
          </div>
        </div>
      )}

      {showInfo && selectedPlanet && (
        <div className="absolute right-6 top-20 w-96 bg-gradient-to-b from-black/70 via-gray-900/70 to-black/70 text-white p-6 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md">
          <button 
            onClick={() => setShowInfo(false)}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-2xl font-bold transition-colors"
          >
            ×
          </button>

          <div className="mb-4">
            <h2 className="text-2xl font-bold">{selectedPlanet.name}</h2>
            <p className="text-sm text-gray-300 mt-1">{selectedPlanet.fact}</p>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-xs text-yellow-300 font-semibold">Basic Info</h3>
              <div className="mt-2 bg-white bg-opacity-10 p-3 rounded">
                <p><span className="font-semibold">Diameter:</span> {selectedPlanet.diameter}</p>
                <p><span className="font-semibold">Distance from Sun:</span> {selectedPlanet.distance}</p>
                <p><span className="font-semibold">Atmosphere:</span> {selectedPlanet.atmosphere}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs text-yellow-300 font-semibold">Orbit & Rotation</h3>
              <div className="mt-2 bg-white bg-opacity-10 p-3 rounded">
                <p><span className="font-semibold">Orbital period:</span> {Math.round(Math.random() * 365 + 88)} Earth days</p>
                <p><span className="font-semibold">Axial tilt:</span> {Math.round((Math.random() * 180) * 10) / 10}°</p>
                <p><span className="font-semibold">Rotation period:</span> {Math.round(Math.random() * 24 + 1)} hours</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs text-yellow-300 font-semibold">Notable Missions</h3>
              <div className="mt-2 bg-white bg-opacity-10 p-3 rounded max-h-36 overflow-auto">
                <ul className="list-disc list-inside space-y-1">
                  {[
                    ...(selectedPlanet.name.toLowerCase() === 'earth' ? satelliteNames.slice(0, 5) : []),
                    ...(selectedPlanet.name.toLowerCase() !== 'earth' ? ['Voyager 2', 'Cassini', 'New Horizons', 'Juno', 'Perseverance'] : [])
                  ].map((m, i) => (
                    <li key={i} className="text-sm">{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => setShowInfo(false)} className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-bold">Close</button>
            <button onClick={() => { 
              setShowInfo(false); 
              if ((window as any).enterEarthView && selectedPlanet.name.toLowerCase() === 'earth') {
                (window as any).enterEarthView(); 
              }
            }} className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 py-2 rounded-md font-bold">
              {selectedPlanet.name === 'Earth' ? 'View Close-Up' : 'View in Scene'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarSystem;