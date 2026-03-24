import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Ensure Leaflet marker icon works in bundled builds (Vite + Render/Vercel)
// Reset internal default URL resolver so our imported asset URLs are used
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
