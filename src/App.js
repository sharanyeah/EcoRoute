import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Car, Bus, Bike, User, MapPin, Calendar, TrendingDown, Leaf, Search } from 'lucide-react';

const EcoRoute = () => {
  const [activeTab, setActiveTab] = useState('route');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapMode, setMapMode] = useState(''); // 'source' or 'destination'
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Initialize Leaflet map
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstance.current) {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        if (window.L && mapRef.current) {
          mapInstance.current = window.L.map(mapRef.current).setView([51.505, -0.09], 10);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapInstance.current);

          // Add click handler
          mapInstance.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            addMarker(lat, lng);
            reverseGeocode(lat, lng);
          });
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [showMap]);

  // Add marker to map
  const addMarker = (lat, lng) => {
    if (!mapInstance.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => mapInstance.current.removeLayer(marker));
    markersRef.current = [];

    // Add new marker
    const marker = window.L.marker([lat, lng]).addTo(mapInstance.current);
    markersRef.current.push(marker);

    // Update coordinates based on mode
    if (mapMode === 'source') {
      setSourceCoords({ lat, lng });
    } else if (mapMode === 'destination') {
      setDestCoords({ lat, lng });
    }
  };

  // Reverse geocode coordinates to get place name using Mapbox
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const place = data.features[0];
        const name = place.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        if (mapMode === 'source') {
          setSource(name);
        } else if (mapMode === 'destination') {
          setDestination(name);
        }
      }
    } catch (error) {
      console.error('Mapbox reverse geocoding failed:', error);
      // Fallback to coordinates
      const coordString = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      if (mapMode === 'source') {
        setSource(coordString);
      } else if (mapMode === 'destination') {
        setDestination(coordString);
      }
    }
  };

  // Mapbox API configuration
  const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hhcmFueWFrMDcyMSIsImEiOiJjbWVrdmJ6NWswOGVzMndxcjN4OG5jcXJ5In0.-VdDABlLGeHGiirfk2xtpg';

  // Fallback location data for common Indian cities
  const fallbackLocations = {
    'delhi': { name: 'Delhi', display: 'Delhi, India', coordinates: { lat: 28.6139, lng: 77.2090 }, isIndian: true },
    'mumbai': { name: 'Mumbai', display: 'Mumbai, Maharashtra, India', coordinates: { lat: 19.0760, lng: 72.8777 }, isIndian: true },
    'bangalore': { name: 'Bangalore', display: 'Bangalore, Karnataka, India', coordinates: { lat: 12.9716, lng: 77.5946 }, isIndian: true },
    'bengaluru': { name: 'Bengaluru', display: 'Bengaluru, Karnataka, India', coordinates: { lat: 12.9716, lng: 77.5946 }, isIndian: true },
    'chennai': { name: 'Chennai', display: 'Chennai, Tamil Nadu, India', coordinates: { lat: 13.0827, lng: 80.2707 }, isIndian: true },
    'kolkata': { name: 'Kolkata', display: 'Kolkata, West Bengal, India', coordinates: { lat: 22.5726, lng: 88.3639 }, isIndian: true },
    'hyderabad': { name: 'Hyderabad', display: 'Hyderabad, Telangana, India', coordinates: { lat: 17.3850, lng: 78.4867 }, isIndian: true },
    'pune': { name: 'Pune', display: 'Pune, Maharashtra, India', coordinates: { lat: 18.5204, lng: 73.8567 }, isIndian: true },
    'ahmedabad': { name: 'Ahmedabad', display: 'Ahmedabad, Gujarat, India', coordinates: { lat: 23.0225, lng: 72.5714 }, isIndian: true },
    'jaipur': { name: 'Jaipur', display: 'Jaipur, Rajasthan, India', coordinates: { lat: 26.9124, lng: 75.7873 }, isIndian: true },
    'lucknow': { name: 'Lucknow', display: 'Lucknow, Uttar Pradesh, India', coordinates: { lat: 26.8467, lng: 80.9462 }, isIndian: true },
    'kanpur': { name: 'Kanpur', display: 'Kanpur, Uttar Pradesh, India', coordinates: { lat: 26.4499, lng: 80.3319 }, isIndian: true },
    'nagpur': { name: 'Nagpur', display: 'Nagpur, Maharashtra, India', coordinates: { lat: 21.1458, lng: 79.0882 }, isIndian: true },
    'indore': { name: 'Indore', display: 'Indore, Madhya Pradesh, India', coordinates: { lat: 22.7196, lng: 75.8577 }, isIndian: true },
    'thane': { name: 'Thane', display: 'Thane, Maharashtra, India', coordinates: { lat: 19.2183, lng: 72.9781 }, isIndian: true },
    'bhopal': { name: 'Bhopal', display: 'Bhopal, Madhya Pradesh, India', coordinates: { lat: 23.2599, lng: 77.4126 }, isIndian: true },
    'visakhapatnam': { name: 'Visakhapatnam', display: 'Visakhapatnam, Andhra Pradesh, India', coordinates: { lat: 17.6868, lng: 83.2185 }, isIndian: true },
    'pimpri': { name: 'Pimpri-Chinchwad', display: 'Pimpri-Chinchwad, Maharashtra, India', coordinates: { lat: 18.6298, lng: 73.7997 }, isIndian: true },
    'patna': { name: 'Patna', display: 'Patna, Bihar, India', coordinates: { lat: 25.5941, lng: 85.1376 }, isIndian: true },
    'vadodara': { name: 'Vadodara', display: 'Vadodara, Gujarat, India', coordinates: { lat: 22.3072, lng: 73.1812 }, isIndian: true }
  };

  // Function to search in fallback data
  const searchFallbackLocations = (query) => {
    const searchTerm = query.toLowerCase().trim();
    const matches = [];
    
    Object.entries(fallbackLocations).forEach(([key, location]) => {
      if (key.includes(searchTerm) || location.name.toLowerCase().includes(searchTerm)) {
        matches.push({
          ...location,
          type: 'city'
        });
      }
    });
    
    return matches.slice(0, 5); // Return top 5 matches
  };

  // Search for places using Mapbox Geocoding API with India focus and fallback
  const searchPlaces = async (query, type) => {
    if (query.length < 2) {
      if (type === 'source') setSourceSuggestions([]);
      if (type === 'destination') setDestSuggestions([]);
      return;
    }

    // First try fallback locations for instant results
    const fallbackResults = searchFallbackLocations(query);
    if (fallbackResults.length > 0) {
      if (type === 'source') setSourceSuggestions(fallbackResults);
      if (type === 'destination') setDestSuggestions(fallbackResults);
    }

    try {
      // First try with India country filter for better local results
      let response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `autocomplete=true&limit=5&country=IN&access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let data = await response.json();
      
      // If no Indian results found, try global search as fallback
      if (!data.features || data.features.length === 0) {
        response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `autocomplete=true&limit=5&access_token=${MAPBOX_TOKEN}`
        );
        data = await response.json();
      }
      
      if (data.features && data.features.length > 0) {
        const suggestions = data.features.map(feature => {
          // Extract place components from Mapbox response
          const placeName = feature.place_name;
          const text = feature.text;
          
          // Determine if this is an Indian location
          const isIndianLocation = placeName.toLowerCase().includes(', india') || 
                                 placeName.toLowerCase().endsWith(' india');
          
          // Get place type from feature properties
          let placeType = 'place';
          if (feature.properties && feature.properties.category) {
            placeType = feature.properties.category;
          } else if (feature.place_type && feature.place_type.length > 0) {
            placeType = feature.place_type[0];
          }

          // Customize display for Indian locations
          let displayName = placeName;
          if (isIndianLocation) {
            // For Indian places, highlight the local name more prominently
            const parts = placeName.split(', ');
            if (parts.length >= 3) {
              // Format as "City, State" for cleaner Indian address display
              displayName = `${parts[0]}, ${parts[1]}, India`;
            }
          }
          
          return {
            name: text,
            display: displayName,
            coordinates: {
              lat: feature.center[1],
              lng: feature.center[0]
            },
            type: placeType,
            isIndian: isIndianLocation,
            bbox: feature.bbox
          };
        });

        // Sort to prioritize Indian locations
        suggestions.sort((a, b) => {
          if (a.isIndian && !b.isIndian) return -1;
          if (!a.isIndian && b.isIndian) return 1;
          return 0;
        });

        // Merge with fallback results, removing duplicates
        const mergedSuggestions = [...fallbackResults];
        suggestions.forEach(apiResult => {
          const isDuplicate = fallbackResults.some(fallback => 
            fallback.name.toLowerCase() === apiResult.name.toLowerCase()
          );
          if (!isDuplicate) {
            mergedSuggestions.push(apiResult);
          }
        });

        const finalSuggestions = mergedSuggestions.slice(0, 5);
        if (type === 'source') setSourceSuggestions(finalSuggestions);
        if (type === 'destination') setDestSuggestions(finalSuggestions);
      } else if (fallbackResults.length === 0) {
        // No results found in both API and fallback
        const noResults = [{ 
          name: 'No results found', 
          display: `No locations found for "${query}". Try a different spelling or nearby city.`,
          coordinates: null,
          isNoResult: true 
        }];
        if (type === 'source') setSourceSuggestions(noResults);
        if (type === 'destination') setDestSuggestions(noResults);
      }
    } catch (error) {
      console.error('Mapbox geocoding failed:', error);
      
      // If API fails but we have fallback results, keep showing them
      if (fallbackResults.length > 0) {
        // Add a note that API is unavailable but fallback data is being used
        const fallbackWithNote = [
          {
            name: 'Using offline data',
            display: 'API unavailable - showing saved locations',
            coordinates: null,
            isNote: true
          },
          ...fallbackResults
        ];
        if (type === 'source') setSourceSuggestions(fallbackWithNote);
        if (type === 'destination') setDestSuggestions(fallbackWithNote);
        return;
      }
      
      // Show error message in dropdown only if no fallback results
      let errorMessage = 'Unable to search locations. Please check your connection.';
      if (error.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your Mapbox token.';
      } else if (error.message.includes('403')) {
        errorMessage = 'API access denied. Please check your Mapbox account.';
      }
      
      const errorSuggestion = [{ 
        name: 'Search error', 
        display: errorMessage,
        coordinates: null,
        isError: true 
      }];
      if (type === 'source') setSourceSuggestions(errorSuggestion);
      if (type === 'destination') setDestSuggestions(errorSuggestion);
    }
  };

  // Handle place selection
  const selectPlace = (place, type) => {
    // Don't select if it's an error, no result, or note item
    if (place.isNoResult || place.isError || place.isNote || !place.coordinates) {
      return;
    }

    if (type === 'source') {
      setSource(place.display);
      setSourceCoords(place.coordinates);
      setSourceSuggestions([]);
    } else {
      setDestination(place.display);
      setDestCoords(place.coordinates);
      setDestSuggestions([]);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Save trips to state (removed localStorage dependency)
  const saveTrip = (tripData) => {
    const newTrip = {
      id: Date.now(),
      ...tripData,
      date: new Date().toLocaleDateString()
    };
    const updatedTrips = [newTrip, ...trips].slice(0, 5); // Keep only last 5
    setTrips(updatedTrips);
  };

  // Calculate emissions based on distance and mode
  const calculateEmissions = (distance, mode) => {
    const emissionFactors = {
      car: 0.12, // kg CO2 per km
      bus: 0.027,
      bike: 0,
      walk: 0
    };
    return (distance * emissionFactors[mode]).toFixed(2);
  };

  // Get route data based on coordinates
  const getRouteData = (sourceCoords, destCoords) => {
    const distance = calculateDistance(sourceCoords.lat, sourceCoords.lng, destCoords.lat, destCoords.lng);
    const baseTime = Math.max(distance * 2, 5); // Minimum 5 minutes
    
    return {
      car: { distance: Math.round(distance * 10) / 10, duration: Math.round(baseTime * 0.8) },
      bus: { distance: Math.round(distance * 1.1 * 10) / 10, duration: Math.round(baseTime * 1.4) },
      bike: { distance: Math.round(distance * 1.05 * 10) / 10, duration: Math.round(baseTime * 3.5) },
      walk: { distance: Math.round(distance * 1.05 * 10) / 10, duration: Math.round(baseTime * 12) }
    };
  };

  const handleSearch = async () => {
    if (!source.trim() || !destination.trim()) {
      setError('Please enter both source and destination');
      return;
    }

    // If we don't have coordinates, try to geocode the text
    let srcCoords = sourceCoords;
    let dstCoords = destCoords;

    if (!srcCoords || !dstCoords) {
      setLoading(true);
      setError('');

      try {
        // If we don't have coordinates, try to geocode the text using Mapbox (India-focused)
        if (!srcCoords) {
          // Try India-focused search first
          let srcResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(source)}.json?limit=1&country=IN&access_token=${MAPBOX_TOKEN}`
          );
          let srcData = await srcResponse.json();
          
          // Fallback to global search if no Indian results
          if (!srcData.features || srcData.features.length === 0) {
            srcResponse = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(source)}.json?limit=1&access_token=${MAPBOX_TOKEN}`
            );
            srcData = await srcResponse.json();
          }
          
          if (srcData.features && srcData.features.length > 0) {
            srcCoords = {
              lat: srcData.features[0].center[1],
              lng: srcData.features[0].center[0]
            };
            setSourceCoords(srcCoords);
          }
        }

        // Geocode destination if needed
        if (!dstCoords) {
          // Try India-focused search first
          let dstResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?limit=1&country=IN&access_token=${MAPBOX_TOKEN}`
          );
          let dstData = await dstResponse.json();
          
          // Fallback to global search if no Indian results
          if (!dstData.features || dstData.features.length === 0) {
            dstResponse = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?limit=1&access_token=${MAPBOX_TOKEN}`
            );
            dstData = await dstResponse.json();
          }
          
          if (dstData.features && dstData.features.length > 0) {
            dstCoords = {
              lat: dstData.features[0].center[1],
              lng: dstData.features[0].center[0]
            };
            setDestCoords(dstCoords);
          }
        }

        if (!srcCoords || !dstCoords) {
          throw new Error('Could not find coordinates for one or both locations');
        }
      } catch (err) {
        setError('Failed to find location coordinates. Please try different place names or use the map.');
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError('');
    
    try {
      const routeData = getRouteData(srcCoords, dstCoords);
      
      const transportModes = [
        {
          mode: 'car',
          name: 'Car',
          icon: Car,
          color: '#ef4444',
          ...routeData.car,
          emissions: calculateEmissions(routeData.car.distance, 'car')
        },
        {
          mode: 'bus',
          name: 'Public Transport',
          icon: Bus,
          color: '#3b82f6',
          ...routeData.bus,
          emissions: calculateEmissions(routeData.bus.distance, 'bus')
        },
        {
          mode: 'bike',
          name: 'Bicycle',
          icon: Bike,
          color: '#34A853',
          ...routeData.bike,
          emissions: calculateEmissions(routeData.bike.distance, 'bike')
        },
        {
          mode: 'walk',
          name: 'Walking',
          icon: User,
          color: '#34A853',
          ...routeData.walk,
          emissions: calculateEmissions(routeData.walk.distance, 'walk')
        }
      ];

      // Find the best eco option
      const ecoFriendly = transportModes.reduce((best, current) => 
        parseFloat(current.emissions) < parseFloat(best.emissions) ? current : best
      );

      setResults({
        source,
        destination,
        modes: transportModes,
        ecoFriendly: ecoFriendly.mode
      });

      // Save the eco-friendly trip
      saveTrip({
        source,
        destination,
        mode: ecoFriendly.name,
        distance: ecoFriendly.distance,
        emissions: ecoFriendly.emissions
      });

    } catch (err) {
      setError('Failed to calculate route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openMap = (mode) => {
    setMapMode(mode);
    setShowMap(true);
  };

  const closeMap = () => {
    setShowMap(false);
    setMapMode('');
  };

  const getTotalSavings = () => {
    const totalEmissions = trips.reduce((sum, trip) => sum + parseFloat(trip.emissions || 0), 0);
    const carEmissions = trips.reduce((sum, trip) => sum + (trip.distance * 0.12), 0);
    return Math.max(0, carEmissions - totalEmissions).toFixed(2);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const chartData = results?.modes.map(mode => ({
    name: mode.name,
    emissions: parseFloat(mode.emissions),
    color: mode.color
  })) || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Map Modal */}
      {showMap && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1rem',
            width: '90%',
            maxWidth: '800px',
            height: '80%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1a202c' }}>
                Select {mapMode === 'source' ? 'Starting Point' : 'Destination'}
              </h3>
              <button
                onClick={closeMap}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>
            <div
              ref={mapRef}
              style={{
                flex: 1,
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            />
            <p style={{ margin: '1rem 0 0 0', color: '#64748b', fontSize: '0.875rem', textAlign: 'center' }}>
              Click anywhere on the map to select a location
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Leaf style={{ color: '#34A853', width: '28px', height: '28px' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>EcoRoute</h1>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <button
              onClick={() => setActiveTab('route')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'route' ? '#34A853' : '#64748b',
                fontWeight: activeTab === 'route' ? '600' : '400',
                fontSize: '1rem',
                cursor: 'pointer',
                borderBottom: activeTab === 'route' ? '2px solid #34A853' : 'none',
                paddingBottom: '0.5rem'
              }}
            >
              Route Planner
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'dashboard' ? '#34A853' : '#64748b',
                fontWeight: activeTab === 'dashboard' ? '600' : '400',
                fontSize: '1rem',
                cursor: 'pointer',
                borderBottom: activeTab === 'dashboard' ? '2px solid #34A853' : 'none',
                paddingBottom: '0.5rem'
              }}
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {activeTab === 'route' && (
          <>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a202c', margin: '0 0 1rem 0' }}>
                Travel Smarter. Travel Greener.
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                Compare your routes and see the real impact of your choices on the environment.
              </p>
            </div>

            {/* Search Form */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>From</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '20px', height: '20px' }} />
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => {
                        setSource(e.target.value);
                        searchPlaces(e.target.value, 'source');
                      }}
                      placeholder="Enter starting location (e.g., Delhi, Mumbai, Bangalore)"
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 40px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#34A853'}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        // Delay hiding suggestions to allow click selection
                        setTimeout(() => setSourceSuggestions([]), 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setSourceSuggestions([]);
                        }
                      }}
                    />
                    <button
                      onClick={() => openMap('source')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: '4px'
                      }}
                      title="Select on map"
                    >
                      <Search style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                  {sourceSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      zIndex: 20,
                      marginTop: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {sourceSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          onMouseDown={() => selectPlace(suggestion, 'source')}
                          style={{
                            padding: '12px 16px',
                            cursor: suggestion.isNoResult || suggestion.isError || suggestion.isNote ? 'default' : 'pointer',
                            borderBottom: idx < sourceSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                            color: suggestion.isNoResult || suggestion.isError ? '#9ca3af' : suggestion.isNote ? '#3b82f6' : '#374151',
                            fontStyle: suggestion.isNoResult || suggestion.isError ? 'italic' : 'normal',
                            fontSize: '0.875rem',
                            lineHeight: '1.4',
                            transition: 'background-color 0.15s ease',
                            backgroundColor: suggestion.isNote ? '#f0f9ff' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!suggestion.isNoResult && !suggestion.isError && !suggestion.isNote) {
                              e.target.style.backgroundColor = '#f8fafc';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!suggestion.isNote) {
                              e.target.style.backgroundColor = 'white';
                            } else {
                              e.target.style.backgroundColor = '#f0f9ff';
                            }
                          }}
                        >
                          <div style={{ fontWeight: suggestion.isNoResult || suggestion.isError ? 'normal' : suggestion.isNote ? '600' : '500' }}>
                            {suggestion.display}
                            {suggestion.isIndian && !suggestion.isNote && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '0.7rem', 
                                backgroundColor: '#34A853', 
                                color: 'white', 
                                padding: '2px 6px', 
                                borderRadius: '10px',
                                fontWeight: '600'
                              }}>
                                🇮🇳 IN
                              </span>
                            )}
                          </div>
                          {suggestion.type && !suggestion.isNoResult && !suggestion.isError && !suggestion.isNote && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', textTransform: 'capitalize' }}>
                              {suggestion.type.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>To</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '20px', height: '20px' }} />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        searchPlaces(e.target.value, 'destination');
                      }}
                      placeholder="Enter destination (e.g., Chennai, Pune, Kolkata)"
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 40px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#34A853'}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        // Delay hiding suggestions to allow click selection
                        setTimeout(() => setDestSuggestions([]), 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setDestSuggestions([]);
                        }
                      }}
                    />
                    <button
                      onClick={() => openMap('destination')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: '4px'
                      }}
                      title="Select on map"
                    >
                      <Search style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                  {destSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      zIndex: 20,
                      marginTop: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {destSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          onMouseDown={() => selectPlace(suggestion, 'destination')}
                          style={{
                            padding: '12px 16px',
                            cursor: suggestion.isNoResult || suggestion.isError || suggestion.isNote ? 'default' : 'pointer',
                            borderBottom: idx < destSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                            color: suggestion.isNoResult || suggestion.isError ? '#9ca3af' : suggestion.isNote ? '#3b82f6' : '#374151',
                            fontStyle: suggestion.isNoResult || suggestion.isError ? 'italic' : 'normal',
                            fontSize: '0.875rem',
                            lineHeight: '1.4',
                            transition: 'background-color 0.15s ease',
                            backgroundColor: suggestion.isNote ? '#f0f9ff' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!suggestion.isNoResult && !suggestion.isError && !suggestion.isNote) {
                              e.target.style.backgroundColor = '#f8fafc';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!suggestion.isNote) {
                              e.target.style.backgroundColor = 'white';
                            } else {
                              e.target.style.backgroundColor = '#f0f9ff';
                            }
                          }}
                        >
                          <div style={{ fontWeight: suggestion.isNoResult || suggestion.isError ? 'normal' : suggestion.isNote ? '600' : '500' }}>
                            {suggestion.display}
                            {suggestion.isIndian && !suggestion.isNote && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '0.7rem', 
                                backgroundColor: '#34A853', 
                                color: 'white', 
                                padding: '2px 6px', 
                                borderRadius: '10px',
                                fontWeight: '600'
                              }}>
                                🇮🇳 IN
                              </span>
                            )}
                          </div>
                          {suggestion.type && !suggestion.isNoResult && !suggestion.isError && !suggestion.isNote && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', textTransform: 'capitalize' }}>
                              {suggestion.type.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#9ca3af' : '#34A853',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    minWidth: '140px',
                    height: '48px'
                  }}
                >
                  {loading ? 'Calculating...' : 'Find My EcoRoute'}
                </button>
              </div>
              {error && (
                <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</p>
              )}
            </div>

            {/* Results */}
            {results && (
              <>
                {/* Transport Mode Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {results.modes.map((mode) => {
                    const Icon = mode.icon;
                    const isEcoFriendly = mode.mode === results.ecoFriendly;
                    return (
                      <div
                        key={mode.mode}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          border: isEcoFriendly ? '2px solid #34A853' : '1px solid #e2e8f0',
                          position: 'relative'
                        }}
                      >
                        {isEcoFriendly && (
                          <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '16px',
                            backgroundColor: '#34A853',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            ECO CHOICE
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                          <Icon style={{ color: mode.color, width: '24px', height: '24px' }} />
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a202c', margin: 0 }}>{mode.name}</h3>
                        </div>
                        <div style={{ space: '0.5rem' }}>
                          <p style={{ margin: '0.25rem 0', color: '#64748b' }}>
                            <strong style={{ color: '#374151' }}>{mode.distance} km</strong> • {formatDuration(mode.duration)}
                          </p>
                          <p style={{ margin: '0.25rem 0', fontSize: '1.25rem', fontWeight: 'bold', color: mode.emissions === '0.00' ? '#34A853' : '#ef4444' }}>
                            {mode.emissions} kg CO₂
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Emissions Chart */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a202c', marginBottom: '1.5rem' }}>
                    Carbon Emissions Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Emissions']} />
                      <Bar dataKey="emissions" fill="#34A853" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Offset Suggestion */}
                <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                  <Leaf style={{ color: '#34A853', width: '32px', height: '32px', margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a202c', margin: '0 0 0.5rem 0' }}>
                    Carbon Offset Suggestion
                  </h4>
                  <p style={{ color: '#64748b', margin: 0 }}>
                    Planting 1 tree could offset the carbon footprint of your most eco-friendly route choice.
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'dashboard' && (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', margin: '0 0 0.5rem 0' }}>
                Your EcoRoute Dashboard
              </h2>
              <p style={{ color: '#64748b', margin: 0 }}>
                Track your sustainable travel choices and environmental impact.
              </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <TrendingDown style={{ color: '#34A853', width: '20px', height: '20px' }} />
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Trips
                  </h3>
                </div>
                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>{trips.length}</p>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Leaf style={{ color: '#34A853', width: '20px', height: '20px' }} />
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CO₂ Saved
                  </h3>
                </div>
                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#34A853', margin: 0 }}>{getTotalSavings()} kg</p>
              </div>
            </div>

            {/* Trip History */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a202c', marginBottom: '1.5rem' }}>
                Recent Eco-Friendly Trips
              </h3>
              {trips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <Calendar style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.125rem', margin: 0 }}>
                    No trips yet – start your journey toward a smaller footprint.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600', color: '#374151' }}>From</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600', color: '#374151' }}>To</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600', color: '#374151' }}>Mode</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600', color: '#374151' }}>Distance</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600', color: '#374151' }}>Emissions</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600', color: '#374151' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map((trip) => (
                        <tr key={trip.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem', color: '#64748b' }}>{trip.source}</td>
                          <td style={{ padding: '0.75rem', color: '#64748b' }}>{trip.destination}</td>
                          <td style={{ padding: '0.75rem', color: '#64748b' }}>{trip.mode}</td>
                          <td style={{ padding: '0.75rem', color: '#64748b' }}>{trip.distance} km</td>
                          <td style={{ padding: '0.75rem', color: trip.emissions === '0.00' ? '#34A853' : '#64748b', fontWeight: '600' }}>
                            {trip.emissions} kg CO₂
                          </td>
                          <td style={{ padding: '0.75rem', color: '#64748b' }}>{trip.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1a202c', color: 'white', padding: '2rem', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Leaf style={{ color: '#34A853', width: '24px', height: '24px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>EcoRoute</h3>
          </div>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: '#9ca3af', lineHeight: 1.6 }}>
            Making sustainable transportation accessible to everyone. Every journey matters in the fight against climate change. 
            Choose your route, reduce your impact, and help build a greener future.
          </p>
          <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
            Built with care for the planet • 2025 • Powered by OpenStreetMap & Mapbox
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EcoRoute;
