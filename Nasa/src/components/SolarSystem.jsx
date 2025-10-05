import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SolarSystem = ({ onEnterMap }) => {
  const mountRef = useRef(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [earthView, setEarthView] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  
  const planetData = {
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

  const satelliteNames = [
    'TDRS-5', 'TDRS-7', 'TDRS-9', 'TDRS-10', 'TDRS-12',
    'MMS 4', 'Chandra X-ray', 'TESS', 'Landsat 8',
    'Solar Dynamics Observatory', 'THEMIS-E'
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Starfield background
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 15000; i++) {
      const x = (Math.random() - 0.5) * 4000;
      const y = (Math.random() - 0.5) * 4000;
      const z = (Math.random() - 0.5) * 4000;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(20, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
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

    // Create realistic Earth with actual photo-like appearance
    const earthGroup = new THREE.Group();
    const detailedEarthGeometry = new THREE.SphereGeometry(50, 256, 256);
    
    const detailedEarthMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      specular: 0x555555,
      shininess: 30,
      flatShading: false
    });
    
    const detailedEarth = new THREE.Mesh(detailedEarthGeometry, detailedEarthMaterial);
    
    // Create highly detailed, realistic Earth surface matching NASA Blue Marble
    const positions = detailedEarthGeometry.attributes.position;
    const colors = [];
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      const lat = Math.asin(y / 50);
      const lon = Math.atan2(z, x);
      
      // Create realistic continent patterns based on actual Earth geography
      // Africa and Europe
      const africa = Math.sin(lon * 2 - 0.3) * Math.cos(lat * 3) > 0.5 && lon > -0.5 && lon < 1.2 && lat > -0.7 && lat < 0.8;
      
      // Americas
      const northAmerica = Math.sin(lon * 1.5 + 2.5) * Math.cos(lat * 2 - 0.3) > 0.3 && lon > -2.8 && lon < -1.3 && lat > 0.3 && lat < 1.3;
      const southAmerica = Math.sin(lon * 2 + 2.3) * Math.cos(lat * 3 + 0.5) > 0.4 && lon > -1.8 && lon < -0.8 && lat > -1.2 && lat < 0.3;
      
      // Asia
      const asia = Math.sin(lon * 1.2 - 0.5) * Math.cos(lat * 2.5) > 0.2 && lon > 0.5 && lon < 2.8 && lat > 0.2 && lat < 1.4;
      
      // Australia
      const australia = Math.sin(lon * 3 - 0.8) * Math.cos(lat * 4 + 1.5) > 0.6 && lon > 2.2 && lon < 3.2 && lat > -0.8 && lat < -0.1;
      
      // Antarctica
      const antarctica = lat < -1.1;
      
      // Greenland and Arctic
      const arctic = lat > 1.15 && (Math.sin(lon * 2 - 1) * Math.cos(lat * 1.5) > -0.3);
      
      // Add noise for coastal details
      const coastalNoise1 = Math.sin(x * 0.15) * Math.cos(y * 0.15) * Math.sin(z * 0.15);
      const coastalNoise2 = Math.sin(x * 0.25 + 10) * Math.cos(y * 0.25 + 10) * Math.sin(z * 0.25 + 10);
      const detailNoise = (coastalNoise1 + coastalNoise2 * 0.5) * 0.15;
      
      const isLand = africa || northAmerica || southAmerica || asia || australia || antarctica || arctic;
      
      if (isLand || detailNoise > 0.12) {
        const landVariation = (coastalNoise1 + 1) * 0.5;
        
        if (antarctica || (arctic && landVariation > 0.3)) {
          // Ice and snow - bright white
          colors.push(0.95, 0.97, 1.0);
        } else if (africa && lat < 0.4 && lat > -0.3 && landVariation < 0.35) {
          // Sahara desert - sandy yellow/brown
          colors.push(0.85, 0.75, 0.55);
        } else if (northAmerica && lat < 0.8 && landVariation < 0.3) {
          // North American plains/deserts
          colors.push(0.75, 0.65, 0.45);
        } else if (landVariation > 0.7) {
          // Dense forests - dark green
          colors.push(0.12, 0.38, 0.12);
        } else if (landVariation > 0.5) {
          // Regular forests - medium green
          colors.push(0.2, 0.48, 0.15);
        } else if (landVariation > 0.3) {
          // Grasslands - light green
          colors.push(0.35, 0.52, 0.2);
        } else {
          // Mountains and rocky terrain - brown/gray
          colors.push(0.55, 0.45, 0.35);
        }
      } else {
        // Ocean colors with realistic depth
        const depth = Math.abs(coastalNoise1) * 0.3;
        const oceanBase = 0.05;
        
        // Shallow coastal waters
        if (detailNoise > 0.08) {
          colors.push(0.15, 0.35, 0.55);
        } else {
          // Deep ocean - dark blue
          colors.push(
            oceanBase + depth * 0.08,
            oceanBase + 0.1 + depth * 0.15,
            0.25 + depth * 0.25
          );
        }
      }
    }
    
    detailedEarthGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    detailedEarthMaterial.vertexColors = true;
    earthGroup.add(detailedEarth);
    
    // Highly realistic cloud layer with swirling patterns
    const cloudGeometry = new THREE.SphereGeometry(51.5, 128, 128);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    
    const cloudPositions = cloudGeometry.attributes.position;
    const cloudColors = [];
    for (let i = 0; i < cloudPositions.count; i++) {
      const x = cloudPositions.getX(i);
      const y = cloudPositions.getY(i);
      const z = cloudPositions.getZ(i);
      
      // Create realistic cloud patterns
      const cloud1 = Math.sin(x * 0.12 + 5) * Math.cos(y * 0.15) * Math.sin(z * 0.13);
      const cloud2 = Math.sin(x * 0.08) * Math.cos(y * 0.1 + 3) * Math.sin(z * 0.09 + 7);
      const cloudSwirl = Math.sin(x * 0.05 + y * 0.08) * Math.cos(z * 0.06);
      
      const combinedClouds = (cloud1 + cloud2 * 0.6 + cloudSwirl * 0.4) / 2;
      const hasCloud = combinedClouds > 0.25;
      
      if (hasCloud) {
        const cloudDensity = (combinedClouds - 0.25) * 2;
        cloudColors.push(1, 1, 1);
      } else {
        cloudColors.push(1, 1, 1);
      }
    }
    cloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute(cloudColors, 3));
    cloudMaterial.vertexColors = true;
    
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earthGroup.add(clouds);
    
    // Latitude/Longitude grid lines
    const gridGroup = new THREE.Group();
    
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const radius = 52;
      const latRad = (lat * Math.PI) / 180;
      const latRadius = radius * Math.cos(latRad);
      const latY = radius * Math.sin(latRad);
      
      const latGeometry = new THREE.BufferGeometry();
      const latPoints = [];
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
      const lonPoints = [];
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
    const satellites = [];
    const satelliteOrbits = [];
    
    for (let i = 0; i < 8; i++) {
      const orbitRadius = 58 + i * 4;
      const orbitInclination = (Math.random() - 0.5) * Math.PI * 0.8;
      const orbitRotation = Math.random() * Math.PI * 2;
      
      // Orbit line
      const orbitPoints = [];
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
      
      satellite.userData = {
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
    earthGroup.visible = false;
    scene.add(earthGroup);

    // Create planets
    const planets = [];
    const planetConfigs = [
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
      let planet;
      
      if (config.name === 'earth') {
        const earthSolarGeometry = new THREE.SphereGeometry(config.size, 64, 64);
        const earthSolarMaterial = new THREE.MeshPhongMaterial({
          color: 0x4169e1,
          emissive: 0x001122,
          specular: 0x222222,
          shininess: 10
        });
        
        const positions = earthSolarGeometry.attributes.position;
        const colors = [];
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
        
        planet.userData = { 
          name: config.name, 
          distance: config.distance, 
          speed: config.speed,
          angle: Math.random() * Math.PI * 2,
          cloudMesh: cloudMesh
        };
      } else {
        const geometry = new THREE.SphereGeometry(config.size, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
          color: config.color,
          roughness: 0.7,
          metalness: 0.3
        });
        planet = new THREE.Mesh(geometry, material);
        planet.userData = { 
          name: config.name, 
          distance: config.distance, 
          speed: config.speed,
          angle: Math.random() * Math.PI * 2 
        };
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

    camera.position.set(0, 150, 300);
    camera.lookAt(0, 0, 0);

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraAngle = { theta: 0, phi: Math.PI / 6 };
    let cameraDistance = 350;
    let isEarthMode = false;

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      
      cameraAngle.theta -= deltaX * 0.005;
      cameraAngle.phi += deltaY * 0.005;
      cameraAngle.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAngle.phi));
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (!isEarthMode) {
        cameraDistance += e.deltaY * 0.5;
        cameraDistance = Math.max(100, Math.min(800, cameraDistance));
      } else {
        cameraDistance += e.deltaY * 0.1;
        cameraDistance = Math.max(70, Math.min(200, cameraDistance));
      }
    };

    const onClick = (e) => {
      // If already viewing Earth, clicking anywhere should navigate to the map
      if (isEarthMode) {
        if (onEnterMap) setTimeout(() => onEnterMap(), 200);
        return;
      }
      
      const mouse = new THREE.Vector2();
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(planets);
      if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        const planetName = clickedPlanet.userData.name;
        
        if (planetName === 'earth') {
          setTransitioning(true);
          setEarthView(true);
          isEarthMode = true;
          
          sun.visible = false;
          planets.forEach(p => p.visible = false);
          scene.children.forEach(child => {
            if (child.geometry && child.geometry.type === 'RingGeometry') {
              child.visible = false;
            }
          });
          
          earthGroup.visible = true;
          cameraDistance = 120;
          cameraAngle = { theta: 0, phi: Math.PI / 2 };
          
          setTimeout(() => setTransitioning(false), 1000);
          // notify parent to switch to map view after transition (if handler provided)
          if (onEnterMap) setTimeout(() => onEnterMap(), 1100);
        } else {
          setSelectedPlanet(planetData[planetName]);
          setShowInfo(true);
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);

      if (!isEarthMode) {
        camera.position.x = cameraDistance * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
        camera.position.y = cameraDistance * Math.cos(cameraAngle.phi);
        camera.position.z = cameraDistance * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
        camera.lookAt(0, 0, 0);

        sun.rotation.y += 0.001;

        planets.forEach(planet => {
          planet.userData.angle += planet.userData.speed;
          planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
          planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
          planet.rotation.y += 0.01;
          
          if (planet.userData.name === 'earth' && planet.userData.cloudMesh) {
            planet.userData.cloudMesh.rotation.y += 0.012;
          }
        });

        stars.rotation.y += 0.0001;
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
          sat.userData.angle += sat.userData.speed;
          const angle = sat.userData.angle;
          const radius = sat.userData.orbitRadius;
          const inclination = sat.userData.orbitInclination;
          const rotation = sat.userData.orbitRotation;
          
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle) * Math.sin(inclination);
          const z = radius * Math.sin(angle) * Math.cos(inclination);
          
          sat.position.x = x * Math.cos(rotation) - z * Math.sin(rotation);
          sat.position.y = y;
          sat.position.z = x * Math.sin(rotation) + z * Math.cos(rotation);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    window.exitEarthView = () => {
      setEarthView(false);
      setTransitioning(true);
      isEarthMode = false;
      
      sun.visible = true;
      planets.forEach(p => p.visible = true);
      scene.children.forEach(child => {
        if (child.geometry && child.geometry.type === 'RingGeometry') {
          child.visible = true;
        }
      });
      
      earthGroup.visible = false;
      cameraDistance = 350;
      cameraAngle = { theta: 0, phi: Math.PI / 6 };
      
      setTimeout(() => setTransitioning(false), 1000);
    };

    window.enterEarthView = () => {
      isEarthMode = true;
      
      sun.visible = false;
      planets.forEach(p => p.visible = false);
      scene.children.forEach(child => {
        if (child.geometry && child.geometry.type === 'RingGeometry') {
          child.visible = false;
        }
      });
      
      earthGroup.visible = true;
      cameraDistance = 120;
      cameraAngle = { theta: 0, phi: Math.PI / 2 };
      
      setTimeout(() => setTransitioning(false), 1000);
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onClick);
      delete window.exitEarthView;
      delete window.enterEarthView;
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
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
      
      {/* Instructions (compact) */}
      {!earthView && (
        <>
          <div className="absolute top-6 left-6 text-white bg-black bg-opacity-60 p-3 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-0 text-yellow-400">Solar System Explorer</h2>
          </div>
          
          <button
            onClick={() => {
              setTransitioning(true);
              setEarthView(true);
              
              if (window.enterEarthView) {
                window.enterEarthView();
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
          onClick={() => window.exitEarthView && window.exitEarthView()}
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

      {/* Planet Info Card */}
      {showInfo && selectedPlanet && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-8 rounded-2xl shadow-2xl max-w-md border-2 border-purple-400 backdrop-blur-md">
          <button 
            onClick={() => setShowInfo(false)}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-2xl font-bold transition-colors"
          >
            ×
          </button>
          
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              {selectedPlanet.name}
            </h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="bg-white bg-opacity-10 p-3 rounded-lg">
              <p className="text-yellow-300 font-semibold mb-1">📏 Diameter</p>
              <p className="text-lg">{selectedPlanet.diameter}</p>
            </div>
            
            <div className="bg-white bg-opacity-10 p-3 rounded-lg">
              <p className="text-yellow-300 font-semibold mb-1">🌞 Distance from Sun</p>
              <p className="text-lg">{selectedPlanet.distance}</p>
            </div>
            
            <div className="bg-white bg-opacity-10 p-3 rounded-lg">
              <p className="text-yellow-300 font-semibold mb-1">🌫️ Atmosphere</p>
              <p className="text-lg">{selectedPlanet.atmosphere}</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg">
              <p className="text-yellow-300 font-semibold mb-2">✨ Fun Fact</p>
              <p className="text-sm leading-relaxed">{selectedPlanet.fact}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowInfo(false)}
            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Continue Exploring
          </button>
        </div>
      )}

      {/* Legend */}
      {!earthView && (
        <div className="absolute bottom-6 right-6 text-white bg-black bg-opacity-60 p-4 rounded-lg backdrop-blur-sm text-xs">
          <p className="font-bold mb-2 text-yellow-400">Planets (in order):</p>
          <div className="space-y-1">
            <p>☿ Mercury • ♀ Venus • 🌍 Earth • ♂ Mars</p>
            <p>♃ Jupiter • ♄ Saturn • ♅ Uranus • ♆ Neptune</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarSystem;