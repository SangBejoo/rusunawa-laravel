import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CAMPUS_COORDS = {
    lat: -6.371355292523935,
    lng: 106.82418567314572,
};

function haversineDistance(latlng1, latlng2) {
    const toRad = deg => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(latlng2.lat - latlng1.lat);
    const dLng = toRad(latlng2.lng - latlng1.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(latlng1.lat)) *
            Math.cos(toRad(latlng2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function LocationPicker({ onLocationSelect }) {
    const [position, setPosition] = useState(null);
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            if (onLocationSelect) onLocationSelect(e.latlng);
        },
    });
    return position ? <Marker position={position} /> : null;
}

export default function DistancePicker({ onLocationSelect }) {
    const [selected, setSelected] = useState(null);
    const polyline = selected ? [CAMPUS_COORDS, selected] : null;
    const distance = selected ? haversineDistance(CAMPUS_COORDS, selected) : null;
    return (
        <div style={{ height: '400px', width: '100%', border: '2px solid #4ade80' }}>
            <MapContainer center={CAMPUS_COORDS} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Marker for campus */}
                <Marker position={CAMPUS_COORDS} icon={L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [32, 32], iconAnchor: [16, 32] })}>
                </Marker>
                {/* Marker for selected location */}
                {selected && <Marker position={selected} />}
                {/* Polyline from home to campus */}
                {polyline && <Polyline positions={polyline} color="red" />} 
                <LocationPicker onLocationSelect={loc => {
                    setSelected(loc);
                    if (onLocationSelect) onLocationSelect(loc);
                }} />
            </MapContainer>
            {selected && (
                <div style={{ marginTop: 10 }}>
                    Jarak ke kampus: <b>{distance.toFixed(2)} km</b>
                </div>
            )}
        </div>
    );
}
