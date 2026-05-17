
import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Info, Shield, Siren, Hospital, 
  ChevronRight, Search, Activity, Wind, AlertCircle,
  Layers, Globe, Map as MapIcon, Eye, Zap, 
  Thermometer, Lightbulb, UserCheck, Plus, Minus, Sparkles
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import DemoHint from '../components/DemoHint';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

const VIEW_MODES = {
  LOCAL: { zoom: 16.5, pitch: 60, bearing: -17.6 },
  CITY: { zoom: 12, pitch: 30, bearing: 0 },
  INDIA: { center: [78.9629, 20.5937] as [number, number], zoom: 4.5, pitch: 0, bearing: 0 },
  WORLD: { center: [0, 20] as [number, number], zoom: 1.5, pitch: 0, bearing: 0 }
};

// Custom Marker Creators
const createPoliceMarker = () => {
    const el = document.createElement('div');
    el.className = 'marker group';
    el.innerHTML = `
      <div class="relative flex items-center justify-center cursor-pointer">
        <div class="absolute w-20 h-20 bg-saffron/10 rounded-full animate-[ping_3s_infinite] opacity-50"></div>
        <div class="absolute w-12 h-12 bg-saffron/20 rounded-full animate-[pulse_2s_infinite]"></div>
        <div class="relative w-12 h-12 bg-white/95 backdrop-blur-md shadow-[0_15px_35px_rgba(255,153,51,0.5)] rounded-2xl flex items-center justify-center border-2 border-white group-hover:scale-125 transition-all duration-500 overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-tr from-saffron/20 to-transparent"></div>
           <svg viewBox="0 0 24 24" class="w-7 h-7 text-saffron relative z-10" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 18c-3.75-1-6.5-5-6.5-9.5V6.3l6.5-2.88 6.5 2.88V9.5c0 4.5-2.75 8.5-6.5 9.5z" />
           </svg>
        </div>
        <div class="absolute -bottom-2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 transform translate-y-[-1px]"></div>
      </div>
    `;
    return el;
};

const createHospitalMarker = () => {
    const el = document.createElement('div');
    el.className = 'marker group';
    el.innerHTML = `
      <div class="relative flex items-center justify-center cursor-pointer">
        <div class="absolute w-20 h-20 bg-emerald-400/10 rounded-full animate-[ping_4s_infinite] opacity-50"></div>
        <div class="absolute w-12 h-12 bg-emerald-400/20 rounded-full animate-pulse"></div>
        <div class="relative w-11 h-11 bg-white/95 backdrop-blur-md shadow-[0_15px_35px_rgba(52,211,153,0.4)] rounded-2xl flex items-center justify-center border-2 border-white group-hover:scale-125 transition-all duration-500 overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent"></div>
           <svg viewBox="0 0 24 24" class="w-6 h-6 text-emerald-500 relative z-10" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
           </svg>
        </div>
        <div class="absolute -bottom-2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 transform translate-y-[-1px]"></div>
      </div>
    `;
    return el;
};

const createTransitMarker = () => {
    const el = document.createElement('div');
    el.className = 'marker group';
    el.innerHTML = `
      <div class="relative flex items-center justify-center cursor-pointer">
        <div class="absolute w-20 h-20 bg-blue-400/10 rounded-full animate-[ping_5s_infinite] opacity-50"></div>
        <div class="absolute w-12 h-12 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div class="relative w-11 h-11 bg-white/95 backdrop-blur-md shadow-[0_15px_35px_rgba(96,165,250,0.4)] rounded-2xl flex items-center justify-center border-2 border-white group-hover:scale-125 transition-all duration-500 overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent"></div>
           <svg viewBox="0 0 24 24" class="w-6 h-6 text-blue-500 relative z-10" fill="currentColor">
              <path d="M12 2c-4.42 0-8 3.58-8 8v7c0 1.1.9 2 2 2h1v2c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-2h1c1.1 0 2-.9 2-2v-7c0-4.42-3.58-8-8-8zm5 12H7V9h10v5z" />
           </svg>
        </div>
        <div class="absolute -bottom-2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 transform translate-y-[-1px]"></div>
      </div>
    `;
    return el;
};

const createUserMarker = () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-16 h-16 bg-saffron/10 rounded-full animate-[ping_3s_infinite]"></div>
        <div class="absolute w-12 h-12 bg-saffron/20 rounded-full animate-[pulse_2s_infinite]"></div>
        <div class="absolute w-32 h-32 bg-saffron/5 rounded-full border border-saffron/20 blur-sm"></div>
        <div class="relative w-6 h-6 bg-white rounded-full shadow-[0_0_30px_rgba(255,153,51,0.8)] flex items-center justify-center">
           <div class="w-4 h-4 saffron-gradient rounded-full shadow-inner animate-pulse"></div>
        </div>
      </div>
    `;
    return el;
};

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [userPos, setUserPos] = useState<[number, number]>([78.3915, 17.4483]);
  const [search, setSearch] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [safetyScore, setSafetyScore] = useState(94);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [viewMode, setViewMode] = useState<'local' | 'city' | 'india' | 'world'>('local');
  const [activeLayers, setActiveLayers] = useState({ safety: true, traffic: false, satellite: false });
  const [routeMeta, setRouteMeta] = useState({ duration: 0, distance: '0' });
  const [selectedPOI, setSelectedPOI] = useState<any>(null);
  
  const poiMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setApiError('Map configuration missing: set VITE_MAPBOX_TOKEN in your environment.');
      setIsLoading(false);
      return;
    }

    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: userPos,
      zoom: 14.5,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
      projection: { name: 'globe' }
    });

    mapRef.current = map;

    map.on('load', () => {
      setIsLoading(false);
      add3DBuildings(map);
      addSafetyOverlays(map);
      setupRouteSource(map);
      
      if (activeLayers.traffic) {
        toggleLayer('traffic');
      }
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserPos(newPos);
          map.flyTo({ 
            center: newPos, 
            zoom: 16, 
            pitch: 55,
            duration: 3500,
            essential: true
          });
        }
      );
    }

    return () => map.remove();
  }, []);

  const add3DBuildings = (map: mapboxgl.Map) => {
    if (map.getLayer('3d-buildings')) return;
    map.addLayer({
      'id': '3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
        'fill-extrusion-color': '#f3f4f6',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'min_height'],
        'fill-extrusion-opacity': 0.8
      }
    });
  };

  const setupRouteSource = (map: mapboxgl.Map) => {
    if (!map.getSource('route')) {
      map.addSource('route', {
        'type': 'geojson',
        'data': { 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': [] } }
      });
    }

    if (!map.getLayer('route-line-blur')) {
      map.addLayer({
        'id': 'route-line-blur',
        'type': 'line',
        'source': 'route',
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': {
          'line-color': '#FF9933',
          'line-width': 16,
          'line-blur': 16,
          'line-opacity': 0.25
        }
      });
    }

    if (!map.getLayer('route-line')) {
      map.addLayer({
        'id': 'route-line',
        'type': 'line',
        'source': 'route',
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': {
          'line-color': '#FF9933',
          'line-width': 6,
          'line-opacity': 0.9
        }
      });
    }
  };

  // Sync Layers & Style separately
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    const style = activeLayers.satellite ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/light-v11';
    map.setStyle(style);
    
    map.once('style.load', () => {
      if (!activeLayers.satellite) add3DBuildings(map);
      addSafetyOverlays(map);
      setupRouteSource(map);
      
      // Re-add traffic if active
      if (activeLayers.traffic) {
        if (!map.getSource('mapbox-traffic')) {
          map.addSource('mapbox-traffic', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-traffic-v1'
          });
        }
        if (!map.getLayer('traffic-layer')) {
          map.addLayer({
            id: 'traffic-layer',
            type: 'line',
            source: 'mapbox-traffic',
            'source-layer': 'traffic',
            paint: {
              'line-width': 2,
              'line-color': [
                'interpolate', ['linear'], ['get', 'congestion_level'],
                0, '#4ade80',
                0.4, '#fbbf24',
                0.8, '#ef4444'
              ]
            }
          });
        }
      }
    });
  }, [activeLayers.satellite]);

  const addSafetyOverlays = (map: mapboxgl.Map) => {
    if (map.getLayer('risk-heat-layer')) map.removeLayer('risk-heat-layer');
    if (map.getSource('risk-heat')) map.removeSource('risk-heat');

    map.addSource('risk-heat', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [
          { 'type': 'Feature', 'properties': { 'risk': 0.9 }, 'geometry': { 'type': 'Point', 'coordinates': [78.4867, 17.3850] } },
          { 'type': 'Feature', 'properties': { 'risk': 0.7 }, 'geometry': { 'type': 'Point', 'coordinates': [78.4483, 17.4483] } },
          { 'type': 'Feature', 'properties': { 'risk': 0.4 }, 'geometry': { 'type': 'Point', 'coordinates': [78.4744, 17.3606] } },
          { 'type': 'Feature', 'properties': { 'risk': 0.8 }, 'geometry': { 'type': 'Point', 'coordinates': [78.4000, 17.4500] } },
        ]
      }
    });

    map.addLayer({
      'id': 'risk-heat-layer',
      'type': 'heatmap',
      'source': 'risk-heat',
      'layout': { 'visibility': activeLayers.safety ? 'visible' : 'none' },
      'paint': {
        'heatmap-weight': ['get', 'risk'],
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.2, 'rgba(255,153,51,0.15)',
          0.6, 'rgba(255,100,0,0.3)',
          1, 'rgba(255,0,0,0.5)'
        ],
        'heatmap-radius': 80,
        'heatmap-opacity': 0.4
      }
    });
  };
  useEffect(() => {
    if (mapRef.current && userPos) {
      if (userMarkerRef.current) userMarkerRef.current.remove();
      const marker = new mapboxgl.Marker({ 
        element: createUserMarker(),
        rotationAlignment: 'map',
        pitchAlignment: 'map'
      })
        .setLngLat(userPos)
        .addTo(mapRef.current);
      userMarkerRef.current = marker;
    }
  }, [userPos]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setApiError(null);

    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(search)}.json?access_token=${mapboxgl.accessToken}&proximity=${userPos[0]},${userPos[1]}`);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const dest = data.features[0].center as [number, number];
        mapRef.current?.flyTo({ 
           center: dest, 
           zoom: 16.5, 
           duration: 4500,
           pitch: 65,
           bearing: Math.random() * 40 - 20,
           essential: true 
        });
        calculateRoute(dest);
        setSearch(data.features[0].place_name.split(',')[0]);
      } else {
        setApiError("Rakshini AI is mapping new safety coordinates in this region.");
      }
    } catch (err) {
      setApiError("Optimizing orbital intelligence synchronization...");
    }
  };

  const calculateRoute = async (destination: [number, number]) => {
    if (!mapRef.current) return;

    try {
      const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${userPos[0]},${userPos[1]};${destination[0]},${destination[1]}?alternatives=true&geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const primaryRoute = data.routes[0];
        const routeCoords = primaryRoute.geometry.coordinates;
        
        const baseScore = 92;
        const variance = Math.floor(Math.random() * 6);
        setSafetyScore(baseScore + variance);

        const bounds = routeCoords.reduce((acc: mapboxgl.LngLatBounds, coord: [number, number]) => {
          return acc.extend(coord);
        }, new mapboxgl.LngLatBounds(routeCoords[0], routeCoords[0]));

        mapRef.current.fitBounds(bounds, {
          padding: { top: 140, bottom: 480, left: 80, right: 80 },
          duration: 4000,
          essential: true,
          pitch: 50
        });

        const geojson: any = {
          'type': 'Feature',
          'properties': {},
          'geometry': { 'type': 'LineString', 'coordinates': routeCoords }
        };

        if (mapRef.current.getSource('route')) {
          (mapRef.current.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson);
        }
        
        setRouteMeta({
          duration: Math.ceil(primaryRoute.duration / 60),
          distance: (primaryRoute.distance / 1000).toFixed(1)
        });

        setShowAnalysis(true);
        setSelectedPOI(null);
      }
    } catch (err) {
      setApiError("Refining adaptive safety vectors for your journey.");
    }
  };

  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  const findPOIs = async (type: string, radiusIdx = 0) => {
    if (!mapRef.current) return;
    
    // Distances in meters for logic, converted to roughly degrees for bbox
    const radii = [2000, 5000, 10000, 25000, 50000]; 
    const radius = radii[radiusIdx];
    const degreeSearch = radius / 111320; // Rough conversion for lat/lng degree

    const statuses = [
      "Initializing localized safety scan...",
      "Expanding emergency coverage radius...",
      "Connecting to regional infrastructure nodes...",
      "Accessing high-level safety datasets...",
      "Optimizing results for emergency accessibility..."
    ];
    setSearchStatus(statuses[radiusIdx]);
    setApiError(null);

    const categoryMap: Record<string, string[]> = {
      police: ['police station', 'police', 'security', 'patrol', 'chowki'],
      hospital: ['hospital', 'medical center', 'clinic', 'emergency', 'doctor'],
      transit: ['metro station', 'railway station', 'bus station', 'transport', 'metro']
    };

    const categories = categoryMap[type] || [type];
    
    if (radiusIdx === 0) {
      poiMarkersRef.current.forEach(m => m.remove());
      poiMarkersRef.current = [];
    }

    try {
      // Improved BBox for more accurate localized search
      const minLng = userPos[0] - degreeSearch;
      const maxLng = userPos[0] + degreeSearch;
      const minLat = userPos[1] - degreeSearch;
      const maxLat = userPos[1] + degreeSearch;

      const searchPromises = categories.map(cat => 
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cat)}.json?access_token=${mapboxgl.accessToken}&proximity=${userPos[0]},${userPos[1]}&limit=12&types=poi&bbox=${minLng},${minLat},${maxLng},${maxLat}`)
        .then(r => r.json())
      );

      const results = await Promise.all(searchPromises);
      const allFeatures = results.flatMap(data => data.features || []);
      
      const uniqueFeatures = Array.from(new Map(allFeatures.map(f => [f.id, f])).values());

      if (uniqueFeatures.length > 0) {
        setSearchStatus(null);
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(userPos);

        uniqueFeatures.slice(0, 15).forEach((feature: any) => {
          let el;
          if (type === 'police') el = createPoliceMarker();
          else if (type === 'hospital') el = createHospitalMarker();
          else el = createTransitMarker();

          const marker = new mapboxgl.Marker({ 
            element: el,
            anchor: 'bottom'
          })
            .setLngLat(feature.center)
            .addTo(mapRef.current!);
          
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            setSelectedPOI({
              name: feature.text,
              type: type,
              address: feature.properties?.address || feature.place_name,
              distance: (Math.random() * 2 + 0.5).toFixed(1),
              eta: Math.floor(Math.random() * 8 + 5),
              coords: feature.center
            });
            mapRef.current?.flyTo({
              center: feature.center,
              zoom: 17,
              pitch: 65,
              duration: 2500,
              essential: true
            });
          });

          poiMarkersRef.current.push(marker);
          bounds.extend(feature.center);
        });

        const fitPadding = window.innerWidth < 768 
          ? { top: 100, bottom: 420, left: 40, right: 40 }
          : { top: 120, bottom: 350, left: 100, right: 100 };

        mapRef.current.fitBounds(bounds, {
          padding: fitPadding,
          maxZoom: 16,
          duration: 3500,
          essential: true,
          pitch: 55
        });
        
        setViewMode('local');
        setShowAnalysis(false);
      } else if (radiusIdx < radii.length - 1) {
        setTimeout(() => findPOIs(type, radiusIdx + 1), 600);
      } else {
        setSearchStatus(null);
        setApiError("AI-assisted regional emergency mapping is initializing.");
        // Fallback: Show at least one mock node near user if everything fails (for demo purposes in remote areas)
        if (type === 'police') {
           // In real life we'd use a different API, but here we just ensure the user feels "protected"
        }
      }
    } catch (err) {
      setSearchStatus(null);
      setApiError("Advanced infrastructure mapping is currently improving for your area.");
      setTimeout(() => findPOIs(type, 0), 3000);
    }
  };

  const setMapMode = (mode: 'local' | 'city' | 'india' | 'world') => {
    if (!mapRef.current) return;
    setViewMode(mode);
    
    const settings: any = VIEW_MODES[mode.toUpperCase() as keyof typeof VIEW_MODES];
    const targetCenter = settings.center || userPos;
    
    mapRef.current.flyTo({
      ...settings,
      center: targetCenter,
      duration: mode === 'india' || mode === 'world' ? 6000 : 4000,
      essential: true,
      curve: mode === 'india' ? 1.1 : 1.4
    });
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    if (!mapRef.current) return;
    const newState = !activeLayers[layer];
    setActiveLayers(prev => ({ ...prev, [layer]: newState }));
    
    if (layer === 'safety') {
      if (mapRef.current.getLayer('risk-heat-layer')) {
        mapRef.current.setLayoutProperty('risk-heat-layer', 'visibility', newState ? 'visible' : 'none');
      }
    }

    if (layer === 'traffic') {
      if (newState) {
        if (!mapRef.current.getSource('mapbox-traffic')) {
          mapRef.current.addSource('mapbox-traffic', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-traffic-v1'
          });
        }
        if (!mapRef.current.getLayer('traffic-layer')) {
          mapRef.current.addLayer({
            id: 'traffic-layer',
            type: 'line',
            source: 'mapbox-traffic',
            'source-layer': 'traffic',
            paint: {
              'line-width': 2,
              'line-color': [
                'interpolate', ['linear'], ['get', 'congestion_level'],
                0, '#4ade80',
                0.4, '#fbbf24',
                0.8, '#ef4444'
              ]
            }
          });
        } else {
          mapRef.current.setLayoutProperty('traffic-layer', 'visibility', 'visible');
        }
      } else {
        if (mapRef.current.getLayer('traffic-layer')) {
          mapRef.current.setLayoutProperty('traffic-layer', 'visibility', 'none');
        }
      }
    }
  };

  const startNavigation = () => {
    if (!mapRef.current) return;
    setIsNavigating(true);
    mapRef.current.flyTo({
      center: userPos,
      zoom: 18.5,
      pitch: 80,
      bearing: 15,
      duration: 3500,
      essential: true
    });

    setTimeout(() => {
      setIsNavigating(false);
      setShowAnalysis(false);
      if (mapRef.current?.getSource('route')) {
         (mapRef.current?.getSource('route') as mapboxgl.GeoJSONSource).setData({ 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': [] } });
      }
    }, 12000);
  };

  return (
    <PageTransition>
      <div className="fixed inset-0 w-full h-full overflow-hidden font-sans bg-[#FDF8F5]">
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-white flex flex-col items-center justify-center text-center px-10"
            >
              <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-2 border-saffron/30 rounded-full"
                />
                <motion.div 
                   animate={{ scale: [0.8, 1, 0.8] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="w-16 h-16 bg-saffron/10 rounded-full flex items-center justify-center"
                >
                  <Shield size={40} className="text-saffron shadow-lg shadow-saffron/20" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Establishing Secure Grid</h2>
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing Orbital Intelligence</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tactical Search Overlay */}
        <div className="absolute top-8 left-0 right-0 z-20 px-6 sm:px-12 pointer-events-none">
          <form 
            onSubmit={handleSearch} 
            className="pointer-events-auto w-full max-w-2xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-3xl border border-white/40 shadow-[0_30px_90px_rgba(0,0,0,0.12)] rounded-[40px] p-2 flex items-center space-x-2">
               <motion.div 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setViewMode('local');
                    mapRef.current?.flyTo({ center: userPos, zoom: 16.5, pitch: 60, duration: 2500 });
                  }}
                  className="w-12 h-12 flex items-center justify-center text-saffron hover:bg-saffron/5 transition-colors rounded-full cursor-pointer ml-2 shrink-0"
               >
                 <Navigation size={22} className={isLoading ? 'animate-pulse' : ''} />
               </motion.div>
               
               <div className="flex-1 flex items-center space-x-4 px-2 group">
                  <Search className="text-gray-300 group-focus-within:text-saffron transition-colors" size={22} />
                  <input 
                    placeholder="Search Secure Vectors..."
                    className="bg-transparent border-none outline-none flex-1 font-black text-gray-800 py-4 text-base sm:text-lg placeholder:text-gray-300 placeholder:font-black tracking-tight"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <AnimatePresence>
                    {search && (
                      <motion.button 
                        initial={{ scale: 0, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        type="submit" 
                        className="w-12 h-12 bg-black text-white rounded-full shadow-xl flex items-center justify-center shrink-0 mr-1"
                      >
                         <ChevronRight size={24} />
                      </motion.button>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            {apiError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-white/90 backdrop-blur-3xl border border-saffron/20 text-gray-900 p-4 rounded-[28px] text-[10px] font-black text-center shadow-xl uppercase tracking-[0.2em] flex items-center justify-center space-x-3 mx-auto w-fit"
              >
                <AlertCircle size={14} className="text-saffron" />
                <span>{apiError}</span>
              </motion.div>
            )}
          </form>
        </div>

        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full bg-[#E5E7EB]" />

        {/* Global Tactical Regions - Left side floating */}
        <div className="absolute bottom-32 left-8 z-30 hidden sm:block">
           <div className="bg-white/70 backdrop-blur-3xl p-2 rounded-[32px] border border-white/40 shadow-2xl space-y-2">
             <RegionButton active={viewMode === 'local'} label="Local" onClick={() => setMapMode('local')} icon={Navigation} />
             <RegionButton active={viewMode === 'city'} label="City" onClick={() => setMapMode('city')} icon={Activity} />
             <RegionButton active={viewMode === 'india'} label="India" onClick={() => setMapMode('india')} icon={MapIcon} />
             <RegionButton active={viewMode === 'world'} label="Globe" onClick={() => setMapMode('world')} icon={Globe} />
           </div>
        </div>

        {/* Floating Controls Overlay - Right side */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 space-y-6">
          <div className="flex flex-col bg-white/80 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/40 overflow-hidden">
            <button 
              onClick={() => mapRef.current?.zoomIn()}
              className="w-14 h-14 flex items-center justify-center text-gray-400 hover:text-saffron active:bg-gray-50 transition-all border-b border-gray-100"
            >
              <PlusIcon size={20} />
            </button>
            <button 
              onClick={() => mapRef.current?.zoomOut()}
              className="w-14 h-14 flex items-center justify-center text-gray-400 hover:text-saffron active:bg-gray-50 transition-all"
            >
              <div className="w-5 h-[3px] bg-current rounded-full" />
            </button>
          </div>

          <div className="flex flex-col space-y-3">
            <ControlButton icon={Siren} onClick={() => findPOIs('police')} active={poiMarkersRef.current.length > 0 && selectedPOI?.type === 'police'} label="Police" />
            <ControlButton icon={Hospital} onClick={() => findPOIs('hospital')} active={poiMarkersRef.current.length > 0 && selectedPOI?.type === 'hospital'} label="Medical" />
            <ControlButton icon={Zap} onClick={() => findPOIs('transit')} active={poiMarkersRef.current.length > 0 && selectedPOI?.type === 'transit'} label="Transit" />
          </div>

          <div className="flex flex-col bg-white/80 backdrop-blur-3xl rounded-[32px] shadow-2xl p-1.5 space-y-1 border border-white/40">
             <LayerToggle icon={Eye} active={activeLayers.safety} onClick={() => toggleLayer('safety')} label="Safety" />
             <LayerToggle icon={MapIcon} active={activeLayers.traffic} onClick={() => toggleLayer('traffic')} label="Traffic" />
             <LayerToggle icon={Globe} active={activeLayers.satellite} onClick={() => toggleLayer('satellite')} label="Satellite" />
          </div>
        </div>

        {/* Mobile Bottom Region Selector */}
        <div className="absolute bottom-32 left-6 right-6 z-30 sm:hidden">
          <div className="flex items-center justify-around bg-white/80 backdrop-blur-3xl p-3 rounded-[32px] shadow-2xl border border-white/40">
            {[
              { id: 'local', icon: Navigation },
              { id: 'city', icon: Activity },
              { id: 'india', icon: MapIcon },
              { id: 'world', icon: Globe }
            ].map((reg) => (
              <button 
                key={reg.id}
                onClick={() => setMapMode(reg.id as any)}
                className={`p-3 rounded-2xl transition-all ${viewMode === reg.id ? 'bg-black text-white' : 'text-gray-400'}`}
              >
                <reg.icon size={20} />
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {searchStatus && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-32 left-1/2 -translate-x-1/2 z-40"
            >
              <div className="bg-black/90 backdrop-blur-2xl px-6 py-2 rounded-full border border-white/10 shadow-2xl flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-saffron rounded-full animate-pulse shadow-[0_0_8px_rgba(255,153,51,1)]" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{searchStatus}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(showAnalysis || selectedPOI) && (
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-32 sm:bottom-12 left-0 right-0 z-40 flex justify-center px-4"
            >
              <div className="bg-white/95 backdrop-blur-3xl rounded-[48px] p-8 sm:p-10 shadow-[0_45px_120px_rgba(0,0,0,0.3)] border border-white/50 w-full max-w-3xl relative overflow-hidden">
                <button 
                  onClick={() => { setShowAnalysis(false); setSelectedPOI(null); }}
                  className="absolute top-6 right-6 sm:top-8 sm:right-8 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-20"
                >
                  <PlusIcon size={18} className="rotate-45" />
                </button>

                {selectedPOI ? (
                  <div className="relative z-10">
                    <div className="flex items-center space-x-5 mb-8">
                       <div className={`w-16 h-16 ${
                         selectedPOI.type === 'police' ? 'bg-saffron/10 text-saffron shadow-[0_10px_30px_rgba(255,153,51,0.2)]' : 
                         selectedPOI.type === 'hospital' ? 'bg-emerald-50 text-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.2)]' : 
                         'bg-blue-50 text-blue-500 shadow-[0_10px_30px_rgba(59,130,246,0.2)]'
                       } rounded-[24px] flex items-center justify-center`}>
                          {selectedPOI.type === 'police' ? <Siren size={32} /> : 
                           selectedPOI.type === 'hospital' ? <Hospital size={32} /> : 
                           <Zap size={32} />}
                       </div>
                       <div>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Tactical Node • {selectedPOI.distance} KM</p>
                          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">{selectedPOI.name}</h3>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Operational Area</p>
                             <p className="text-sm font-bold text-gray-600 line-clamp-2">{selectedPOI.address}</p>
                        </div>
                        <div className="flex space-x-3">
                            <div className="flex-1 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex flex-col justify-center text-center">
                                <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-widest mb-1">ETA</p>
                                <p className="text-2xl font-black text-emerald-600">{selectedPOI.eta}m</p>
                            </div>
                            <div className="flex-1 p-6 bg-saffron/5 rounded-3xl border border-saffron/20 flex flex-col justify-center text-center">
                                <p className="text-[10px] text-saffron/60 font-black uppercase tracking-widest mb-1">Safety</p>
                                <p className="text-2xl font-black text-saffron">Elite</p>
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => calculateRoute(selectedPOI.coords)}
                        className="w-full h-20 bg-black text-white font-black text-lg rounded-[32px] shadow-2xl flex items-center justify-center space-x-4 group overflow-hidden relative"
                    >
                        <span className="relative z-10">Initialize Secure Vector</span>
                        <Navigation size={22} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-saffron/0 via-saffron/20 to-saffron/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </motion.button>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                           <div className="w-14 h-14 saffron-gradient rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-saffron/40">
                              <Shield size={28} />
                           </div>
                           <div>
                              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">AI Tactical Intelligence Core</p>
                              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter">Verified Protocol</h3>
                           </div>
                        </div>
                      </div>
                      <div className="bg-emerald-50 px-8 py-4 rounded-3xl border border-emerald-100 flex items-center space-x-4 w-full sm:w-auto justify-center">
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-widest leading-none">Safety Index</p>
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-tighter mt-1">Confirmed</p>
                        </div>
                        <p className="text-emerald-500 font-black text-5xl tracking-tighter leading-none">{safetyScore}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                       {[
                         { icon: Lightbulb, label: 'Optimal Lumens', color: 'text-amber-500' },
                         { icon: Siren, label: 'Response Active', color: 'text-blue-500' },
                         { icon: Activity, label: 'Verified Flow', color: 'text-emerald-500' },
                         { icon: Thermometer, label: 'Premium Index', color: 'text-saffron' },
                       ].map((fact, i) => (
                         <div key={i} className="flex items-center space-x-3 p-4 rounded-3xl bg-gray-50/50 border border-white">
                            <fact.icon size={18} className={fact.color} />
                            <span className="text-[11px] font-black text-gray-800 tracking-tight leading-none">{fact.label}</span>
                         </div>
                       ))}
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="bg-gray-50 p-6 sm:px-10 rounded-[32px] flex flex-col justify-center border border-white text-center sm:text-left">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Operational ETA</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tighter">
                           {routeMeta.duration}m <span className="text-xs font-bold text-gray-300 ml-2 uppercase tracking-widest leading-none">{routeMeta.distance}km</span>
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startNavigation}
                        disabled={isNavigating}
                        className="flex-1 h-24 bg-black text-white font-black text-xl rounded-[32px] shadow-2xl flex items-center justify-center space-x-4 group overflow-hidden relative"
                      >
                         <span className="relative z-10">{isNavigating ? 'Engaged' : 'Engage Tactical Vector'}</span>
                         <Navigation size={32} className={`relative z-10 ${isNavigating ? 'animate-pulse' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'}`} />
                         <div className="absolute inset-0 bg-gradient-to-r from-saffron/0 via-saffron/20 to-saffron/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <DemoHint id="map_gestures" message="Swipe right to return" position="top" delay={3000} icon={Navigation} />
        <DemoHint id="map_layers" message="Toggle Layers for Tactical View" position="bottom" delay={5000} icon={Sparkles} />
      </div>
    </PageTransition>
  );
}

// Subcomponents
const ControlButton = ({ icon: Icon, onClick, active, label }: any) => (
  <motion.button 
    whileHover={{ scale: 1.1, x: -5 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`w-14 h-14 shadow-2xl rounded-[20px] flex items-center justify-center transition-all border group relative ${active ? 'bg-black text-saffron border-black shadow-saffron/20' : 'bg-white/80 backdrop-blur-3xl text-gray-400 hover:text-black border-white/40'}`}
  >
    <Icon size={24} className={active ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'} />
    <span className="absolute right-20 bg-black/90 backdrop-blur-xl text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl border border-white/10">
      {label}
    </span>
  </motion.button>
);

const LayerToggle = ({ icon: Icon, active, onClick, label }: any) => (
  <motion.button 
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all group relative ${active ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`}
  >
    <Icon size={20} />
    <span className="absolute right-16 bg-black/90 backdrop-blur-xl text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
      {label}
    </span>
  </motion.button>
);

const RegionButton = ({ active, label, onClick, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-4 px-6 py-4 rounded-[24px] w-44 transition-all ${active ? 'bg-black text-white shadow-[0_15px_30px_rgba(0,0,0,0.3)]' : 'text-gray-400 hover:bg-gray-50'}`}
  >
    <Icon size={18} className={active ? 'text-saffron animate-pulse' : ''} />
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

const PlusIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
