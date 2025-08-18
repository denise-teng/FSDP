import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Default Leaflet marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const LocationPicker = ({ onLocationSelect }) => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value) return setSuggestions([]);

    try {
      const res = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&countrycodes=sg&q=${encodeURIComponent(value)}`,
  { credentials: "omit" }
);

      const data = await res.json();
      setSuggestions(data.slice(0, 5));
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSelect = (place) => {
    const coords = [parseFloat(place.lat), parseFloat(place.lon)];
    setSelected(coords);
    onLocationSelect({ lat: coords[0], lng: coords[1], name: place.display_name });
    setSearch(place.display_name);
    setSuggestions([]);
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search location..."
        className="w-full px-4 py-2 border rounded-md"
      />

      {suggestions.length > 0 && (
        <ul className="bg-white border rounded-md shadow-md max-h-40 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(s)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}

      {/* ✅ Use Map instead of MapContainer */}
      <Map
        center={selected || [1.3521, 103.8198]}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {selected && (
          <Marker position={selected}>
            <Popup>{search || "Selected Location"}</Popup>
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default LocationPicker;
