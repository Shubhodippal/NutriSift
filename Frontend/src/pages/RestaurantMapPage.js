import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './RestaurantMapPage.css';
import HamburgerMenu from '../components/HamburgerMenu';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function ChangeView({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.length === 2 && map) {
      setTimeout(() => {
        try {
          map.setView(center, 15, {
            animate: true,
            duration: 1
          });
        } catch (err) {
          console.error("Error updating map view:", err);
        }
      }, 100);
    }
  }, [center, map]);
  
  return null;
}

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 45], 
  iconAnchor: [15, 45],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function RestaurantMapPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [restaurants, setRestaurants] = useState([]);
  const [userLocation, setUserLocation] = useState([40.7128, -74.0060]); // Default: New York
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default instead of 1km
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const locationWatchId = useRef(null);
  const [highAccuracyAttempt, setHighAccuracyAttempt] = useState(false);
  const [accuracyCircleVisible, setAccuracyCircleVisible] = useState(true);
  const watchPositionRef = useRef(null);
  const [showLocationWarning, setShowLocationWarning] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    setLocationError("Getting your precise location...");
    
    const getHighAccuracyLocation = () => {
      setHighAccuracyAttempt(true);
      setLocationError("Getting precise GPS location... This may take a moment");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`🎯 High-accuracy location: ${latitude},${longitude} (accuracy: ${accuracy}m)`);
          
          setUserLocation([latitude, longitude]);
          setLocationAccuracy(accuracy);
          
          if (accuracy < 100) {
            setLocationError(null);
          } else {
            setLocationError(`Location accuracy: ${Math.round(accuracy)}m. For better results, ensure GPS is enabled.`);
          }
          
          setMapReady(true);
          setIsLoading(false);
        },
        (error) => {
          console.error("High-accuracy geolocation error:", error);
          setLocationError("Couldn't get precise location. Please enter your location manually below.");
          setShowManualEntry(true);
          setMapReady(true);
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 30000,           
          maximumAge: 0             
        }
      );
      
      if (watchPositionRef.current) {
        navigator.geolocation.clearWatch(watchPositionRef.current);
      }
      
      watchPositionRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`📡 Watch position update: ${latitude},${longitude} (accuracy: ${accuracy}m)`);
          
          if (!locationAccuracy || accuracy < locationAccuracy) {
            setUserLocation([latitude, longitude]);
            setLocationAccuracy(accuracy);
            
            if (accuracy < 100) {
              setLocationError(null);
            } else if (accuracy < 500) {
              setLocationError(`Location accuracy: ${Math.round(accuracy)}m. Improving...`);
            }
          }
        },
        (error) => {
          console.error("Watch position error:", error);
        },
        { 
          enableHighAccuracy: true,
          timeout: Infinity,         
          maximumAge: 0              
        }
      );
    };

    if (navigator.geolocation) {
      // Try to get location directly with high accuracy
      getHighAccuracyLocation();
    } else {
      // Browser doesn't support geolocation
      setLocationError("Your browser doesn't support location services. Please enter your location manually.");
      setShowManualEntry(true);
      setUserLocation([22.5726, 88.3639]); // Default location
      setMapReady(true);
      setIsLoading(false);
    }
    
    return () => {
      if (watchPositionRef.current) {
        navigator.geolocation.clearWatch(watchPositionRef.current);
      }
      if (locationWatchId.current) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (isLoading || !mapReady) return;
    
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const [lat, lon] = userLocation;
        const radius = searchRadius;
        
        let amenityFilter;
        if (selectedCategory === 'all') {
          amenityFilter = '["amenity"~"restaurant|cafe|fast_food|bar|pizza"]';
        } else {
          amenityFilter = `["amenity"="${selectedCategory}"]`;
        }
        
        const query = `
          [out:json];
          node${amenityFilter}(around:${radius},${lat},${lon});
          out body;
        `;
        
        const response = await fetch(process.env.REACT_APP_OVERPASS_API_URL, {
          method: 'POST',
          body: query
        });
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const extractedRestaurants = await Promise.all(
          data.elements
            .filter(element => element.tags && element.tags.name)
            .map(async (node) => {
              const distance = calculateDistance(
                userLocation[0], 
                userLocation[1], 
                node.lat, 
                node.lon
              );
              
              const restaurant = {
                id: node.id,
                name: node.tags.name || 'Unnamed Restaurant',
                type: node.tags.amenity || 'restaurant',
                cuisine: node.tags.cuisine || '',
                lat: node.lat,
                lon: node.lon,
                distance: distance.toFixed(1), 
                address: node.tags['addr:street'] 
                  ? `${node.tags['addr:housenumber'] || ''} ${node.tags['addr:street'] || ''}`
                  : 'Address not available',
                website: node.tags.website || '',
                phone: node.tags.phone || '',
              };
              
              restaurant.image = await getRestaurantImage(restaurant);
              
              return restaurant;
            })
        );
        
        const filteredRestaurants = extractedRestaurants
          .filter(restaurant => parseFloat(restaurant.distance) <= searchRadius/1000)
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        
        setRestaurants(filteredRestaurants);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load nearby restaurants. Please try again later.");
        setRestaurants([
          {
            id: 1,
            name: "Sample Restaurant",
            type: "restaurant",
            cuisine: "Various",
            lat: userLocation[0] + 0.001,
            lon: userLocation[1] + 0.001,
            address: "123 Sample St",
            website: "",
            phone: ""
          },
          {
            id: 2,
            name: "Sample Cafe",
            type: "cafe",
            cuisine: "Coffee",
            lat: userLocation[0] - 0.001,
            lon: userLocation[1] - 0.001,
            address: "456 Example Ave",
            website: "",
            phone: ""
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurants();
  }, [userLocation, selectedCategory, searchRadius, mapReady]);
  
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };
  
  const handleRadiusChange = (e) => {
    setSearchRadius(Number(e.target.value));
  };
  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula to calculate distance between two points
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; 
    return distance;
  };
  
  const refreshLocation = () => {
    setIsLoading(true);
    setLocationError("Obtaining precise location...");
    
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log(`✅ Watch position update received!`);
          console.log(`📍 Coordinates: ${latitude}, ${longitude}`);
          console.log(`📏 Accuracy: ${accuracy} meters`);
          
          if (!locationAccuracy || accuracy < locationAccuracy) {
            setUserLocation([latitude, longitude]);
            setLocationAccuracy(accuracy);
            setLocationError(null);
            setMapReady(true);
            
            if (accuracy < 100) {
              navigator.geolocation.clearWatch(watchId);
            }
          }
        },
        (error) => {
          console.error("Geolocation watch error:", error);
        },
        { 
          enableHighAccuracy: true,  
          timeout: 30000,            
          maximumAge: 0              
        }
      );
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log(`✅ Current position received!`);
          console.log(`📍 Coordinates: ${latitude}, ${longitude}`);
          console.log(`📏 Accuracy: ${accuracy} meters`);
          
          if (!locationAccuracy || accuracy < locationAccuracy) {
            setUserLocation([latitude, longitude]);
            setLocationAccuracy(accuracy);
            setLocationError(null);
          }
          
          setMapReady(true);
          setTimeout(() => setIsLoading(false), 500);
        },
        (error) => {
          console.error("Geolocation current position error:", error);
          
          let errorMessage;
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please check browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Your location is currently unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Using previous location.";
              break;
            default:
              errorMessage = `Error getting location: ${error.message}`;
          }
          
          setLocationError(errorMessage);
          setMapReady(true);
          setTimeout(() => setIsLoading(false), 500);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000,           
          maximumAge: 10000         
        }
      );
      
      locationWatchId.current = watchId;
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setMapReady(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  };
  
  const handleManualLocation = async (e) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setUserLocation([parseFloat(lat), parseFloat(lon)]);
        setLocationError(null);
        setMapReady(true);
        setShowManualEntry(false);
      } else {
        setLocationError(`Could not find location "${manualLocation}". Please try again.`);
      }
    } catch (error) {
      console.error("Manual location search error:", error);
      setLocationError("Error searching for location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRestaurantImage = async (restaurant) => {
    try {
      const searchQueries = [
        `${restaurant.name} ${restaurant.cuisine || ''} ${restaurant.type.replace('_', ' ')}`,
        `${restaurant.name} ${restaurant.cuisine || ''}`,
        `${restaurant.name} restaurant`,
        `${restaurant.type.replace('_', ' ')} food`
      ];
      
      for (const query of searchQueries) {
        const searchQuery = encodeURIComponent(query);
        const pixabayApiKey = process.env.REACT_APP_PIXABAY_API_KEY;
        const response = await fetch(
          `${process.env.REACT_APP_PIXABAY_API_URL}/?key=${pixabayApiKey}&q=${searchQuery}&image_type=photo&per_page=3&category=food&orientation=horizontal&min_width=500`
        );
        
        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
          return data.hits[0].webformatURL;
        }
      }
      
      return `${process.env.REACT_APP_PLACEHOLDER_IMAGE_URL}/300x200/1a2235/ffffff?text=${encodeURIComponent(restaurant.name)}`;
    } catch (error) {
      console.error('Error fetching restaurant image:', error);
      return `${process.env.REACT_APP_PLACEHOLDER_IMAGE_URL}/300x200/1a2235/ffffff?text=${encodeURIComponent(restaurant.name)}`;
    }
  };
  
  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => {
        setError(null);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error]);

  useEffect(() => {
    let timer;
    if (locationError) {
      timer = setTimeout(() => {
        setLocationError(null);
      }, 15000); // Increase to 15 seconds or remove timeout entirely
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [locationError]);
  
  useEffect(() => {
    // Auto-show manual entry when accuracy is poor
    if (locationAccuracy && locationAccuracy > 10000) {
      setShowManualEntry(true);
      setLocationError("Your location appears to be very imprecise. For better results, please enter your location manually.");
      setShowLocationWarning(true); // Reset warning visibility when accuracy changes significantly
    }
  }, [locationAccuracy]);
  
  return (
    <div className="restaurant-map-page">
      <header className="restaurant-map-header">
        <h1>🍽️ Nearby Restaurants</h1>
        <HamburgerMenu 
          isLoggedIn={true}
        />
      </header>
      
      <div className="map-controls">
        <div className="category-filters">
          {[

            { id: 'all', name: 'All Restaurants', icon: '🍽️' },
            { id: 'restaurant', name: 'General', icon: '🍴' },
            { id: 'fast_food', name: 'Fast Food', icon: '🍔' },
            { id: 'cafe', name: 'Café', icon: '☕' },
            { id: 'bar', name: 'Bar', icon: '🍸' }
          ].map(category => (
            <button
              key={category.id}
              className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}

              onClick={() => handleCategoryChange(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}

          <button 
            className="scroll-to-results-button"
            onClick={() => document.querySelector('.restaurant-list').scrollIntoView({ behavior: 'smooth' })}

          >
            <span className="results-icon">📋</span>
            <span className="results-count">{restaurants.length}</span>
            <span className="results-text">Restaurants Found</span>
          </button>
        </div>
        
        <div className="radius-control">
          <label htmlFor="radius">Search Radius: {searchRadius/1000} km</label>
          <input
            type="range"
            id="radius"
            min="1000"
            max="50000"
            step="1000"
            value={searchRadius}
            onChange={handleRadiusChange}
          />
        </div>
        
        <div className="location-control">
          <button 
            className="refresh-location-button" 
            onClick={refreshLocation}
            disabled={isLoading}
          >
            <span>🔄</span> Refresh Location
          </button>
          
          {locationAccuracy && (
            <div className="location-accuracy">
              <span className="accuracy-icon">📍</span>
              <span>Accuracy: {locationAccuracy < 1000 ? 
                `${Math.round(locationAccuracy)} meters` : 
                `${(locationAccuracy / 1000).toFixed(1)} km`}

              </span>
            </div>
          )}
          
          {locationError && (
            <div className="location-error-message">
              {locationError}
            </div>
          )}
          
          {locationAccuracy && locationAccuracy > 500 && (
            <div className="gps-reminder">
              <span className="gps-icon">📡</span>
              <span>Please turn on your device's GPS/Location Services for better accuracy</span>
            </div>
          )}
          
          <button 
            className="manual-location-button"
            onClick={() => setShowManualEntry(!showManualEntry)}
          >
            <span>📍</span> {showManualEntry ? 'Hide Manual Entry' : 'Enter Location Manually'}
          </button>

          {showManualEntry && (
            <form className="manual-location-form" onSubmit={handleManualLocation}>
              <input
                type="text"
                placeholder="Enter city, address or place name"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
              />
              <button type="submit" disabled={!manualLocation.trim()}>
                Search
              </button>
            </form>
          )}
        </div>
        
        <div className="accuracy-toggle">
          <label>
            <input
              type="checkbox"
              checked={accuracyCircleVisible}
              onChange={() => setAccuracyCircleVisible(!accuracyCircleVisible)}
            />
            Show accuracy radius on map
          </label>
        </div>
      </div>
      
      
      {/* Location warning - now above the map */}
      {locationAccuracy && locationAccuracy > 1000 && showLocationWarning && (
        <>
          <div className="warning-backdrop" onClick={() => setShowLocationWarning(false)}></div>
          <div className="location-warning-popup">
            <button 
              className="close-warning-button" 
              onClick={() => setShowLocationWarning(false)}
              aria-label="Close warning"
            >✕</button>
            <p><strong>⚠️ Location accuracy issues detected</strong></p>
            <p>Your location appears to be approximately {Math.round(locationAccuracy/1000)}km from your actual position.</p>
            <p>For better results, try:</p>
            <ul>
              <li>Check that precise location is enabled in your browser settings</li>
              <li>Disable any VPN services you might be using</li>
            </ul>
          </div>
        </>
      )}
      
      <div className="map-container">
        {error && (
          <div className="map-error-message">
            <p>{error}</p>
          </div>
        )}
        
        {!mapReady ? (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Initializing map...</p>
          </div>
        ) : (
          <MapContainer 
            center={userLocation} 
            zoom={15} 
            style={{ height: '100%', width: '100%', cursor: 'grab' }}
            attributionControl={true}
            zoomControl={true}
            doubleClickZoom={true}
            scrollWheelZoom={true}
            dragging={true}
            animate={true}
            easeLinearity={0.35}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={userLocation} />
            
            <Marker 
              position={userLocation}
              icon={userIcon}
            >
              <Popup>
                <div>
                  <strong>Your Current Location</strong>
                  <p>Search radius: {searchRadius/1000} km</p>
                </div>
              </Popup>
              <Tooltip permanent direction="top" offset={[0, -30]} className="location-tooltip">
                <strong>YOU ARE HERE</strong>
              </Tooltip>
            </Marker>
            
            {restaurants.map(restaurant => (
              <Marker 
                key={restaurant.id}
                position={[restaurant.lat, restaurant.lon]}
                eventHandlers={{
                  click: () => {
                    setSelectedRestaurant(restaurant);
                  },
                }}
              >
                <Popup>
                  <div className="restaurant-popup">
                    {restaurant.image && (
                      <div className="popup-image">
                        <img src={restaurant.image} alt={restaurant.name} />
                      </div>
                    )}
                    <h3>{restaurant.name}</h3>
                    <p className="restaurant-distance">
                      <strong>Distance:</strong> {restaurant.distance} km
                    </p>
                    <p><strong>Type:</strong> {restaurant.type.replace('_', ' ')}</p>
                    {restaurant.cuisine && (
                      <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
                    )}
                    <p>{restaurant.address}</p>
                    {restaurant.phone && (
                      <p><strong>Phone:</strong> {restaurant.phone}</p>
                    )}
                    {restaurant.website && (
                      <p>
                        <a 
                          href={restaurant.website.startsWith('http') ? restaurant.website : `http://${restaurant.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Visit Website
                        </a>
                      </p>
                    )}
                    <p>
                      <a 
                        href={`https://www.openstreetmap.org/directions?from=${userLocation[0]},${userLocation[1]}&to=${restaurant.lat},${restaurant.lon}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Get Directions
                      </a>
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            <Circle 
              center={userLocation}
              radius={searchRadius}
              pathOptions={{
                fillColor: '#4f8cff',
                fillOpacity: 0.1,
                color: '#4f8cff',
                weight: 1
              }}
            />

            {locationAccuracy && accuracyCircleVisible && (
              <Circle 
                center={userLocation}
                radius={locationAccuracy}
                pathOptions={{
                  fillColor: '#ff4757',
                  fillOpacity: 0.1,
                  color: '#ff4757',
                  weight: 2,
                  dashArray: '5, 5'
                }}
              >
                <Tooltip permanent direction="center" offset={[0, 0]}>
                  <span style={{ fontSize: '10px' }}>
                    Accuracy: ±{locationAccuracy < 1000 ? 
                      `${Math.round(locationAccuracy)}m` : 
                      `${(locationAccuracy / 1000).toFixed(1)}km`}
                  </span>
                </Tooltip>
              </Circle>
            )}
          </MapContainer>
        )}
      </div>
      
      <div className="restaurant-list">
        <h2>{isLoading ? 'Finding restaurants...' : `${restaurants.length} Restaurants Found`}</h2>
        
        {isLoading ? (
          <div className="list-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="restaurant-grid">
            {restaurants.map(restaurant => (
              <div 
                key={restaurant.id} 
                className={`restaurant-card ${selectedRestaurant && selectedRestaurant.id === restaurant.id ? 'selected' : ''}`}
                onClick={() => setSelectedRestaurant(restaurant)}
              >
                <div className="restaurant-image">
                  <img src={restaurant.image} alt={restaurant.name} />
                  <div className="restaurant-type-badge">
                    <span className="type-icon">
                      {restaurant.type === 'restaurant' ? '🍴' : 
                       restaurant.type === 'cafe' ? '☕' : 
                       restaurant.type === 'fast_food' ? '🍔' : 
                       restaurant.type === 'bar' ? '🍸' : 
                       restaurant.type === 'pizza' ? '🍕' : '🍽️'}
                    </span>
                    <span>{restaurant.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="restaurant-content">
                  <h3>{restaurant.name}</h3>
                  <p className="restaurant-distance">
                    <span className="distance-icon">📍</span> {restaurant.distance} km away
                  </p>
                  {restaurant.cuisine && (
                    <p className="restaurant-cuisine">Cuisine: {restaurant.cuisine}</p>
                  )}
                  <p className="restaurant-address">{restaurant.address}</p>
                  <div className="restaurant-actions">
                    {restaurant.website && (
                      <a 
                        href={restaurant.website.startsWith('http') ? restaurant.website : `http://${restaurant.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="restaurant-link"
                      >
                        Website
                      </a>
                    )}
                    <a 
                      href={`https://www.openstreetmap.org/directions?from=${userLocation[0]},${userLocation[1]}&to=${restaurant.lat},${restaurant.lon}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="restaurant-link"
                    >
                      Directions
                    </a>
                  </div>
                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="no-restaurants">
            <p>No restaurants found in this area. Try increasing the search radius or changing the category.</p>
          </div>
        )}
      </div>
      
      {showManualEntry && (
        <div className="manual-location-entry">
          <h2>Enter Location Manually</h2>
          <form onSubmit={handleManualLocation}>
            <input 
              type="text" 
              value={manualLocation} 
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="Enter a city, address, or landmark"
              required
            />
            <button type="submit" className="submit-location-button">
              <span>📍</span> Find Location
            </button>
            <button 
              type="button" 
              className="cancel-location-button"
              onClick={() => setShowManualEntry(false)}
            >
              <span>❌</span> Cancel
            </button>
          </form>
          
          {locationError && (
            <div className="location-error-message">
              {locationError}
            </div>
          )}
        </div>
      )}

      <div className="image-disclaimer">
        <p>
          <span className="disclaimer-icon">ℹ️</span> 
          Restaurant images are provided for reference only and may not exactly match the actual establishment.
        </p>
      </div>
    </div>
  );
}

export default RestaurantMapPage;