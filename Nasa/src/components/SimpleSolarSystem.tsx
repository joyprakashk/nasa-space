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
    scene.background = new THREE.Color(0x000000); // Pure black space background
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
  try { renderer.domElement.style.zIndex = '0'; } catch (e) {}

    // Enhanced Starfield background
    const starGeometry = new THREE.BufferGeometry();
    const starVertices: number[] = [];
    const starColors: number[] = [];
    for (let i = 0; i < 25000; i++) {
      const x = (Math.random() - 0.5) * 6000;
      const y = (Math.random() - 0.5) * 6000;
      const z = (Math.random() - 0.5) * 6000;
      starVertices.push(x, y, z);
      
      // Add color variation for stars (white to blue-white)
      const colorVariation = Math.random() * 0.3 + 0.7;
      starColors.push(colorVariation, colorVariation, Math.min(1, colorVariation + 0.2));
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    
    const starMaterial = new THREE.PointsMaterial({ 
      size: Math.random() * 2 + 0.5, 
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Add distant nebula effect
    const nebulaGeometry = new THREE.PlaneGeometry(8000, 8000);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.z = -3000;
    scene.add(nebula);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(20, 64, 64);
    // Use MeshPhongMaterial so emissive is a valid property with TypeScript typings
    const sunMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xfdb813,
      emissive: 0xfdb813,
      emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Sun light
    const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0x222222);
  scene.add(ambientLight);

  // Add subtle hemisphere light for nicer shading
  const hemi = new THREE.HemisphereLight(0xaaaaee, 0x222233, 0.35);
  scene.add(hemi);

    // Create realistic Earth with texture maps (day, normal, specular, night) + cloud layer
    const earthGroup = new THREE.Group();
    const detailedEarthGeometry = new THREE.SphereGeometry(50, 128, 128);

    // Fallback material (vertex-color-like) while textures load
    const detailedEarthMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.0
    });

    const detailedEarth = new THREE.Mesh(detailedEarthGeometry, detailedEarthMaterial);
    earthGroup.add(detailedEarth);

    // Cloud mesh (will get texture when available)
    const cloudGeometry = new THREE.SphereGeometry(51.5, 128, 128);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    // Ensure cloud layer renders cleanly on top
    try { (cloudMaterial as any).depthTest = false; } catch (e) {}
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earthGroup.add(clouds);

    // Load high-quality Earth textures from threejs examples CDN as they are permissively hosted
    const loader = new THREE.TextureLoader();
    const basePath = 'https://threejs.org/examples/textures/planets';
    const dayUrl = `${basePath}/earth_atmos_2048.jpg`;
    const normalUrl = `${basePath}/earth_normal_2048.jpg`;
    const specularUrl = `${basePath}/earth_specular_2048.jpg`;
    const cloudsUrl = `${basePath}/earth_clouds_1024.png`;
    const nightUrl = `${basePath}/earth_lights_2048.png`;

    // Load textures and apply when ready; keep fallback until then
    loader.load(dayUrl, (map) => {
      detailedEarthMaterial.map = map;
      detailedEarthMaterial.needsUpdate = true;
      try { console.info('Earth day texture loaded'); } catch (e) {}
      if (debugOverlay) debugOverlay.innerText = updateDebugStatus();
    });

    // Ensure material renders from both sides (helps avoid culling issues)
    try { (detailedEarthMaterial as any).side = THREE.DoubleSide; } catch (e) {}

    loader.load(normalUrl, (nm) => {
      detailedEarthMaterial.normalMap = nm;
      detailedEarthMaterial.normalScale = new THREE.Vector2(1, 1);
      detailedEarthMaterial.needsUpdate = true;
      try { console.info('Earth normal map loaded'); } catch (e) {}
      if (debugOverlay) debugOverlay.innerText = updateDebugStatus();
    });

    loader.load(specularUrl, (sm) => {
      // specular map improves water highlights
      (detailedEarthMaterial as any).specularMap = sm; // MeshStandard doesn't have specularMap but MeshPhong does; this is a soft enhancement if available
      detailedEarthMaterial.needsUpdate = true;
      try { console.info('Earth specular map loaded'); } catch (e) {}
      if (debugOverlay) debugOverlay.innerText = updateDebugStatus();
    });

    loader.load(nightUrl, (nm) => {
      // Use as emissiveMap to show night city lights
      detailedEarthMaterial.emissiveMap = nm;
      detailedEarthMaterial.emissive = new THREE.Color(0xffffff);
      detailedEarthMaterial.emissiveIntensity = 0.3;
      detailedEarthMaterial.needsUpdate = true;
      try { console.info('Earth night lights loaded'); } catch (e) {}
      if (debugOverlay) debugOverlay.innerText = updateDebugStatus();
    });

    loader.load(cloudsUrl, (cmap) => {
      cloudMaterial.map = cmap;
      cloudMaterial.alphaMap = cmap;
      cloudMaterial.opacity = 0.7;
      cloudMaterial.needsUpdate = true;
      try { console.info('Cloud texture loaded'); } catch (e) {}
      if (debugOverlay) debugOverlay.innerText = updateDebugStatus();
    });
    
    // Latitude/Longitude grid lines
    const gridGroup = new THREE.Group();
    
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const radius = 52;
      const latRad = (lat * Math.PI) / 180;
      const latRadius = radius * Math.cos(latRad);
      const latY = radius * Math.sin(latRad);
      
      const latGeometry = new THREE.BufferGeometry();
      const latPoints: number[] = [];
      for (let lon = 0; lon <= 360; lon += 2) {
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
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
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
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
      );
      gridGroup.add(lonLine);
    }
    
    earthGroup.add(gridGroup);
    
    // Create satellite orbits and satellites
    const satellites: THREE.Mesh[] = [];
    const satelliteOrbits: THREE.Line[] = [];
  // Planet moons map
  const moonsByPlanet: Record<string, THREE.Mesh[]> = {};
  const moonOrbitLinesByPlanet: Record<string, THREE.Line[]> = {};
    
    for (let i = 0; i < 8; i++) {
      const orbitRadius = 58 + i * 4;
      const orbitInclination = (Math.random() - 0.5) * Math.PI * 0.8;
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
        new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.4 })
      );
      orbitLine.rotation.z = orbitRotation;
      earthGroup.add(orbitLine);
      satelliteOrbits.push(orbitLine);
      
      // Satellite
      const satGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const satMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const satellite = new THREE.Mesh(satGeometry, satMaterial);
      
      (satellite.userData as SatelliteUserData) = {
        orbitRadius: orbitRadius,
        orbitInclination: orbitInclination,
        orbitRotation: orbitRotation,
        angle: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.01,
        name: satelliteNames[i] || `Satellite ${i + 1}`
      };
      
      earthGroup.add(satellite);
      satellites.push(satellite);
    }

    // Add moons for select planets (procedural small spheres)
    const createMoon = (parentPlanet: THREE.Mesh, name: string, distance: number, size: number, speed: number, inclination = 0) => {
      const moonGeo = new THREE.SphereGeometry(size, 16, 16);
      const moonMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      (moon.userData as any) = { name, angle: Math.random() * Math.PI * 2, speed, distance, inclination };

      // orbit line
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
      const orbitLine = new THREE.Line(orbitG, new THREE.LineBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.3 }));
      orbitLine.rotation.z = Math.random() * Math.PI * 2;

      // Attach to scene but position will be computed relative to parent
      scene.add(orbitLine);
      scene.add(moon);

      moonsByPlanet[parentPlanet.userData.name] = moonsByPlanet[parentPlanet.userData.name] || [];
      moonOrbitLinesByPlanet[parentPlanet.userData.name] = moonOrbitLinesByPlanet[parentPlanet.userData.name] || [];
      moonsByPlanet[parentPlanet.userData.name].push(moon);
      moonOrbitLinesByPlanet[parentPlanet.userData.name].push(orbitLine);
    };
    
    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(54, 128, 128);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphere);
    
    earthGroup.position.set(0, 0, 0);
    // Make Earth visible by default so close-up view renders reliably
    earthGroup.visible = true;
    scene.add(earthGroup);

    // --- debug overlay to show texture/visibility status ---
    const debugOverlay = document.createElement('div');
    debugOverlay.style.position = 'absolute';
    debugOverlay.style.right = '12px';
    debugOverlay.style.bottom = '12px';
    debugOverlay.style.padding = '8px 12px';
    debugOverlay.style.background = 'rgba(0,0,0,0.6)';
    debugOverlay.style.color = 'white';
    debugOverlay.style.fontSize = '12px';
    debugOverlay.style.zIndex = '3';
    debugOverlay.style.borderRadius = '6px';
    debugOverlay.innerText = 'Earth: initializing...';
    if (mountRef.current) mountRef.current.appendChild(debugOverlay);

    const updateDebugStatus = () => {
      const parts: string[] = [];
      parts.push(`earthGroup.visible=${earthGroup.visible}`);
      try { parts.push(`detailedEarth.visible=${(detailedEarth as any).visible}`); } catch (e) {}
      try { parts.push(`clouds.visible=${(clouds as any).visible}`); } catch (e) {}
      return parts.join(' | ');
    };

    // If textures don't load in 4s, tint the Earth so it's obviously visible
    setTimeout(() => {
      if (!detailedEarthMaterial.map) {
        try {
          (detailedEarthMaterial as any).color = new THREE.Color(0xff4444);
          detailedEarthMaterial.needsUpdate = true;
          if (debugOverlay) debugOverlay.innerText = updateDebugStatus() + ' | fallback tint applied';
        } catch (e) {}
      }
    }, 4000);

    // Create planets
    const planets: THREE.Mesh[] = [];
    const planetConfigs: PlanetConfig[] = [
      { name: 'mercury', size: 2, distance: 40, color: 0x8c7853, speed: 0.008 },
      { name: 'venus', size: 4, distance: 60, color: 0xffc649, speed: 0.006 },
      { name: 'earth', size: 4, distance: 85, color: 0x4169e1, speed: 0.005 },
      { name: 'mars', size: 3, distance: 115, color: 0xcd5c5c, speed: 0.004 },
      { name: 'jupiter', size: 14, distance: 180, color: 0xdaa520, speed: 0.002 },
      { name: 'saturn', size: 12, distance: 240, color: 0xf4a460, speed: 0.0015 },
      { name: 'uranus', size: 7, distance: 300, color: 0x4fd0e7, speed: 0.001 },
      { name: 'neptune', size: 7, distance: 350, color: 0x4166f5, speed: 0.0008 }
    ];

  planetConfigs.forEach(config => {
      let planet: THREE.Mesh;
      
      if (config.name === 'earth') {
        const earthSolarGeometry = new THREE.SphereGeometry(config.size, 64, 64);
        const earthSolarMaterial = new THREE.MeshPhongMaterial({
          color: 0x4169e1,
          emissive: 0x002244,
          emissiveIntensity: 0.3,
          specular: 0x444444,
          shininess: 15
        });
        
        const positions = earthSolarGeometry.attributes.position;
        const colors: number[] = [];
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5) * Math.sin(z * 0.5);
          const isLand = noise > 0.4;
          
          if (isLand) {
            colors.push(0.15, 0.4, 0.08);
          } else {
            colors.push(0.1, 0.25, 0.5);
          }
        }
        earthSolarGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        earthSolarMaterial.vertexColors = true;
        
        planet = new THREE.Mesh(earthSolarGeometry, earthSolarMaterial);
        
        const cloudGeo = new THREE.SphereGeometry(config.size * 1.02, 32, 32);
        const cloudMat = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.2
        });
        const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        planet.add(cloudMesh);
        
        // Earth glow
        const glowGeo = new THREE.SphereGeometry(config.size * 1.15, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0x4169e1,
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
          angle: Math.random() * Math.PI * 2,
          cloudMesh: cloudMesh
        };
        // add axial tilt for realism
        try { planet.rotation.x = (Math.random() - 0.5) * 0.7; } catch (e) {}
      } else {
        const geometry = new THREE.SphereGeometry(config.size, 64, 64);
        // Use MeshStandardMaterial for more realistic PBR-like shading
        const material = new THREE.MeshStandardMaterial({
          color: config.color,
          roughness: 0.6,
          metalness: 0.05,
          emissive: config.color,
          emissiveIntensity: 0.06
        });
        planet = new THREE.Mesh(geometry, material);
        
        // Add atmospheric glow matching planet color
        const glowGeo = new THREE.SphereGeometry(config.size * 1.15, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: config.color,
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
          angle: Math.random() * Math.PI * 2 
        };
        // small axial tilt for non-earth planets
        try { planet.rotation.x = (Math.random() - 0.5) * 0.6; } catch (e) {}
      }
      
      planet.castShadow = true;
      planet.receiveShadow = true;
      scene.add(planet);
      planets.push(planet);

      // Orbit line
      const orbitGeometry = new THREE.RingGeometry(config.distance - 0.5, config.distance + 0.5, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x444444, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      if (config.name === 'saturn') {
        const ringGeometry = new THREE.RingGeometry(config.size * 1.5, config.size * 2.5, 64);
        const ringMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xc4a86c,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
      }
    });

    // After creating planets, create moons for some
    // Find planet meshes by name
    const findPlanet = (n: string) => planets.find(p => (p.userData as PlanetUserData).name === n);
    const earthPlanet = findPlanet('earth');
    const marsPlanet = findPlanet('mars');
    const jupiterPlanet = findPlanet('jupiter');
    const saturnPlanet = findPlanet('saturn');

    if (earthPlanet) createMoon(earthPlanet, 'Moon', 10, 1.2, 0.02, 0.02);
    if (marsPlanet) {
      createMoon(marsPlanet, 'Phobos', 4, 0.6, 0.03, 0.05);
      createMoon(marsPlanet, 'Deimos', 6, 0.5, 0.02, 0.03);
    }
    if (jupiterPlanet) {
      createMoon(jupiterPlanet, 'Io', 16, 1.0, 0.015, 0.02);
      createMoon(jupiterPlanet, 'Europa', 20, 0.9, 0.012, 0.01);
      createMoon(jupiterPlanet, 'Ganymede', 24, 1.3, 0.009, 0.015);
    }
    if (saturnPlanet) {
      createMoon(saturnPlanet, 'Titan', 22, 1.4, 0.008, 0.02);
    }

    camera.position.set(0, 150, 300);
    camera.lookAt(0, 0, 0);

  let isDragging = false;
    let previousMousePosition: MousePosition = { x: 0, y: 0 };
    let cameraAngle: CameraAngle = { theta: 0, phi: Math.PI / 6 };
    let cameraDistance = 350;
    let isEarthMode = false;
  let timeScale = 1.0; // multiplies orbital/rotation speeds

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
        cameraDistance = Math.max(100, Math.min(800, cameraDistance));
      } else {
        cameraDistance += e.deltaY * 0.1;
        cameraDistance = Math.max(70, Math.min(200, cameraDistance));
      }
    };

    const onClick = (e: MouseEvent): void => {
      // If already viewing Earth, clicking anywhere should navigate to the map
      if (isEarthMode) {
        if (onEnterMap) {
          // small delay to allow any UI feedback/animation to finish
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
          planets.forEach(p => p.visible = false);
          scene.children.forEach(child => {
            if ((child as THREE.Mesh).geometry && (child as THREE.Mesh).geometry.type === 'RingGeometry') {
              child.visible = false;
            }
          });
          
          // Make sure detailed Earth meshes are visible
          earthGroup.visible = true;
          try {
            (detailedEarth as THREE.Mesh).visible = true;
            (clouds as THREE.Mesh).visible = true;
            // scale up slightly for close-up visibility
            try { (detailedEarth as any).scale.set(1.4, 1.4, 1.4); } catch (e) {}
          } catch (e) {}

          // Place camera for a good default close-up view and look at Earth center
          cameraDistance = 120;
          cameraAngle = { theta: 0, phi: Math.PI / 2 };
          camera.position.set(120, 10, 0);
          camera.lookAt(earthGroup.position);
          
          setTimeout(() => setTransitioning(false), 1000);
          // If parent provided onEnterMap, navigate to the map shortly after the zoom completes
          if (onEnterMap) setTimeout(() => onEnterMap(), 1100);
        } else {
          setSelectedPlanet(planetData[planetName]);
          setShowInfo(true);
        }
      }
    };

    // Create HTML label overlay for planets
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
      lbl.className = 'planet-label text-xs text-white font-semibold px-2 py-1 rounded bg-black bg-opacity-50 border border-white/20';
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
        camera.position.x = cameraDistance * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
        camera.position.y = cameraDistance * Math.cos(cameraAngle.phi);
        camera.position.z = cameraDistance * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
        camera.lookAt(0, 0, 0);

        sun.rotation.y += 0.001;

        planets.forEach(planet => {
          const userData = planet.userData as PlanetUserData;
          userData.angle += userData.speed * timeScale;
          planet.position.x = Math.cos(userData.angle) * userData.distance;
          planet.position.z = Math.sin(userData.angle) * userData.distance;
          planet.rotation.y += 0.01 * timeScale;
          
          if (userData.name === 'earth' && userData.cloudMesh) {
            userData.cloudMesh.rotation.y += 0.012;
          }
        });

        // update moons positions
        Object.keys(moonsByPlanet).forEach(pname => {
          const moons = moonsByPlanet[pname];
          const lines = moonOrbitLinesByPlanet[pname] || [];
          const parent = planets.find(p => (p.userData as PlanetUserData).name === pname);
          if (!parent) return;
          moons.forEach((moon, idx) => {
            const mu = moon.userData as any;
            mu.angle += mu.speed * timeScale;
            const px = parent.position.x;
            const pz = parent.position.z;
            const x = px + mu.distance * Math.cos(mu.angle);
            const y = mu.distance * Math.sin(mu.angle) * Math.sin(mu.inclination);
            const z = pz + mu.distance * Math.sin(mu.angle) * Math.cos(mu.inclination);
            moon.position.set(x, y, z);
            // position orbit line centered on parent
            const line = lines[idx];
            if (line) line.position.set(px, 0, pz);
          });
        });

  stars.rotation.y += 0.0001;
        
        // Add shooting stars animation
        if (Math.random() < 0.001) { // 0.1% chance per frame
          const shootingStar = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 4, 4),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
          );
          
          const startX = (Math.random() - 0.5) * 2000;
          const startY = (Math.random() - 0.5) * 2000;
          const startZ = (Math.random() - 0.5) * 2000;
          
          shootingStar.position.set(startX, startY, startZ);
          scene.add(shootingStar);
          
          // Animate shooting star
          const animateShootingStar = () => {
            shootingStar.position.x += (Math.random() - 0.5) * 10;
            shootingStar.position.y += (Math.random() - 0.5) * 10;
            shootingStar.position.z += (Math.random() - 0.5) * 10;
            shootingStar.material.opacity -= 0.02;
            
            if (shootingStar.material.opacity > 0) {
              requestAnimationFrame(animateShootingStar);
            } else {
              scene.remove(shootingStar);
            }
          };
          
          animateShootingStar();
        }
      } else {
        camera.position.x = cameraDistance * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
        camera.position.y = cameraDistance * Math.cos(cameraAngle.phi);
        camera.position.z = cameraDistance * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
        camera.lookAt(0, 0, 0);
        
        detailedEarth.rotation.y += 0.001;
        clouds.rotation.y += 0.0015;
        clouds.rotation.x += 0.0002;
        
        // Animate satellites
        satellites.forEach(sat => {
          const userData = sat.userData as SatelliteUserData;
          userData.angle += userData.speed;
          const angle = userData.angle;
          const radius = userData.orbitRadius;
          const inclination = userData.orbitInclination;
          const rotation = userData.orbitRotation;
          
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle) * Math.sin(inclination);
          const z = radius * Math.sin(angle) * Math.cos(inclination);
          
          sat.position.x = x * Math.cos(rotation) - z * Math.sin(rotation);
          sat.position.y = y;
          sat.position.z = x * Math.sin(rotation) + z * Math.cos(rotation);
        });
      }
      // Update planet label positions (screen space)
      try {
        Object.keys(labelElements).forEach(name => {
          const lbl = labelElements[name];
          const planet = planets.find(p => (p.userData as PlanetUserData).name === name);
          if (!planet) return;
          const pos = planet.position.clone();
          pos.project(camera);
          const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
          const behind = pos.z > 1;
          lbl.style.transform = `translate(${x}px, ${y}px)`;
          lbl.style.display = behind ? 'none' : 'block';
          // hide labels when in Earth detailed group view
          if (earthGroup.visible && (name === 'earth')) {
            lbl.style.display = 'none';
          }
        });
      } catch (e) {
        // ignore overlay update errors
      }

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
      planets.forEach(p => p.visible = true);
      scene.children.forEach(child => {
        if ((child as THREE.Mesh).geometry && (child as THREE.Mesh).geometry.type === 'RingGeometry') {
          child.visible = true;
        }
      });
      
      earthGroup.visible = false;
      cameraDistance = 350;
      cameraAngle = { theta: 0, phi: Math.PI / 6 };
      
      setTimeout(() => setTransitioning(false), 1000);
    };

    const enterEarthView = (): void => {
      isEarthMode = true;
      
      sun.visible = false;
      planets.forEach(p => p.visible = false);
      scene.children.forEach(child => {
        if ((child as THREE.Mesh).geometry && (child as THREE.Mesh).geometry.type === 'RingGeometry') {
          child.visible = false;
        }
      });
      
      // Ensure Earth meshes are visible and set camera to good close-up
      earthGroup.visible = true;
      try {
        (detailedEarth as THREE.Mesh).visible = true;
        (clouds as THREE.Mesh).visible = true;
      } catch (e) {}
      cameraDistance = 80;
      cameraAngle = { theta: 0, phi: Math.PI / 2 };
      camera.position.set(80, 20, 0);
      try { (detailedEarth as any).scale.set(1.4, 1.4, 1.4); } catch (e) {}
      camera.lookAt(earthGroup.position);

      // keep the sun light on so Earth is lit even if Sun mesh is hidden
      try {
        sunLight.intensity = Math.max(0.8, sunLight.intensity);
      } catch (e) {}

      setTimeout(() => setTransitioning(false), 1000);
    };

    // Store functions on window for access from React
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
        // remove label container
        const existing = mountRef.current.querySelector('.planet-labels-container');
        if (existing) mountRef.current.removeChild(existing);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* NASA Header for Earth View (smaller) */}
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
      
      {/* View Earth button */}
      {!earthView && (
        <>
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
        </>
      )}

      {/* LIVE indicator removed per request */}

      {/* Back button for Earth view */}
      {earthView && (
        <button 
          onClick={() => (window as any).exitEarthView && (window as any).exitEarthView()}
          className="absolute top-6 right-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all border border-white"
        >
          ← Solar System
        </button>
      )}

      {/* Transition overlay */}
      {transitioning && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm transition-opacity duration-1000">
          <div className="text-white text-2xl font-bold animate-pulse">
            {earthView ? '🌍 Zooming to Earth...' : '🌌 Returning to Solar System...'}
          </div>
        </div>
      )}

      {/* Planet Info Panel (right side) */}
      {showInfo && selectedPlanet && (
        <div className="absolute right-6 top-20 w-96 bg-gradient-to-b from-black/60 via-gray-900/60 to-black/60 text-white p-6 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
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
              <div className="mt-2 bg-white bg-opacity-6 p-3 rounded">
                <p><span className="font-semibold">Diameter:</span> {selectedPlanet.diameter}</p>
                <p><span className="font-semibold">Distance from Sun:</span> {selectedPlanet.distance}</p>
                <p><span className="font-semibold">Atmosphere:</span> {selectedPlanet.atmosphere}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs text-yellow-300 font-semibold">Orbit & Rotation</h3>
              <div className="mt-2 bg-white bg-opacity-6 p-3 rounded">
                <p><span className="font-semibold">Estimated orbital speed:</span> {Math.round(Math.random() * 50 + 10)} km/s</p>
                <p><span className="font-semibold">Axial tilt:</span> {Math.round((Math.random() * 50) * 10) / 10}°</p>
                <p><span className="font-semibold">Rotation period:</span> {Math.round(Math.random() * 100 + 1)} hours</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs text-yellow-300 font-semibold">Notable Missions / Satellites</h3>
              <div className="mt-2 bg-white bg-opacity-6 p-3 rounded max-h-36 overflow-auto">
                <ul className="list-disc list-inside">
                  {(selectedPlanet.name.toLowerCase() === 'earth' ? satelliteNames : ['Voyager 1', 'Voyager 2', 'Pioneer 10']).map((m, i) => (
                    <li key={i} className="text-sm">{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => setShowInfo(false)} className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-bold">Close</button>
            <button onClick={() => { setShowInfo(false); if ((window as any).enterEarthView) (window as any).enterEarthView(); }} className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 py-2 rounded-md font-bold">View in Scene</button>
          </div>
        </div>
      )}

      {/* Legend removed per request */}
    </div>
  );
};

export default SolarSystem;