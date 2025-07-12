import React, { useState } from "react";
import { Map, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const LocationPicker = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [position, setPosition] = useState([1.3521, 103.8198]); // Singapore default

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          format: "json",
          q: value,
          addressdetails: 1,
          limit: 5,
          viewbox: "103.6,1.48,104.1,1.2", // SG bounding box (lon min,max, lat max,min)
          bounded: 1
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Brandie/1.0 (your-email@example.com)' // ✅ Replace with valid email or URL
        }
      });

      setSuggestions(res.data);
    } catch (err) {
      console.error("Search error:", err);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    const name = place.display_name;

    setPosition([lat, lon]);
    setSearchQuery(name);
    setSuggestions([]);

    onLocationSelect({ lat, lng: lon, name });
  };

  return (
    <div className="w-full space-y-2">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search location..."
        className="w-full px-3 py-2 rounded text-black"
        autoComplete="off"
      />

      {suggestions.length > 0 && (
        <ul className="bg-white border rounded shadow text-black max-h-40 overflow-y-auto">
          {suggestions.map((sug, idx) => (
            <li
              key={idx}
              onClick={() => handleSuggestionClick(sug)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {sug.display_name}
            </li>
          ))}
        </ul>
      )}

      <div className="h-[250px] w-full">
        <Map center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
        </Map>
      </div>
    </div>
  );
};

export default LocationPicker;
