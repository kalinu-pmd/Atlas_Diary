import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

export default function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(value || { lat: 20.5937, lng: 78.9629 }); // Default: India

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onChange && onChange(e.latlng);
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  return (
    <div style={{ height: 300, width: "100%", marginBottom: 16 }}>
      <MapContainer center={position} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}
