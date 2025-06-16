import React, { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Campus location coordinates (should match your database)
const CAMPUS_LOCATION = {
  lat: -6.371355292523935,
  lng: 106.82418567314572
};

// Initialize default icon for markers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Different marker colors
const CampusIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const HomeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map click events
const MapClickHandler = ({ onMapClick }) => {
  useMapEvent('click', onMapClick);
  return null;
};

// Calculate Haversine distance between two points (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c;
  return d.toFixed(2);
};

const LocationPicker = ({ value, onChange }) => {
  const [position, setPosition] = useState(value?.lat && value?.lng ? value : null);
  const [distance, setDistance] = useState(null);
  const [mapCenter, setMapCenter] = useState(CAMPUS_LOCATION);

  useEffect(() => {
    // If user provided coordinates initially, set those
    if (value?.lat && value?.lng) {
      setPosition({ lat: value.lat, lng: value.lng });
      
      // Calculate distance
      const dist = calculateDistance(
        CAMPUS_LOCATION.lat,
        CAMPUS_LOCATION.lng,
        value.lat,
        value.lng
      );
      setDistance(dist);
    }
    
    // Try to get current location for initial map center
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        // If geolocation fails, use campus as default center
        setMapCenter(CAMPUS_LOCATION);
      }
    );
  }, [value]);

  // Update the handleMapClick function to ensure proper coordinate handling
  const handleMapClick = (e) => {
    const newPos = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };
    
    setPosition(newPos);
    
    // Calculate distance
    const dist = calculateDistance(
      CAMPUS_LOCATION.lat,
      CAMPUS_LOCATION.lng,
      newPos.lat,
      newPos.lng
    );
    setDistance(dist);
    
    // Notify parent with full position object
    if (onChange) {
      console.log("Sending location to parent:", newPos);
      onChange(newPos);
    }
  };

  return (
    <Box>
      <Box height="400px" width="100%" borderRadius="md" overflow="hidden">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Campus marker */}
          <Marker position={CAMPUS_LOCATION} icon={CampusIcon}>
            <Popup>
              <Text fontWeight="bold">Campus Location</Text>
            </Popup>
          </Marker>
          
          {/* Selected location marker */}
          {position && (
            <Marker position={position} icon={HomeIcon}>
              <Popup>
                <Text fontWeight="bold">Your Home Location</Text>
                <Text>Latitude: {position.lat.toFixed(6)}</Text>
                <Text>Longitude: {position.lng.toFixed(6)}</Text>
                <Text>Distance to campus: {distance} km</Text>
              </Popup>
            </Marker>
          )}
          
          {/* Line showing distance */}
          {position && (
            <Polyline 
              positions={[CAMPUS_LOCATION, position]}
              color="#0088FF"
              weight={3}
              opacity={0.7}
              dashArray="5, 5"
            />
          )}
          
          {/* Map click handler */}
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </Box>
      
      {distance && (
        <Text mt={2} fontWeight="semibold" color="blue.600">
          Distance to campus: {distance} km
        </Text>
      )}
      
      <Text mt={1} fontSize="sm" color="gray.600">
        Click on the map to select your home location
      </Text>
    </Box>
  );
};

export default LocationPicker;
