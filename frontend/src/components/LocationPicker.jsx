import { useState, useEffect } from "react";
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

  // 🔹 debounce effect
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=sg&limit=5&q=${encodeURIComponent(search)}`,
          {
            credentials: "omit",
            headers: { "Accept-Language": "en" }, // ✅ force English names
            signal: controller.signal,
          }
        );

        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Search error:", err);
      }
    }, 500); // wait 0.5s before querying

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [search]);

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
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search Singapore location..."
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

      <MapContainer
        center={selected || [1.3521, 103.8198]} // Default SG center
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {selected && (
          <Marker position={selected}>
            <Popup>{search || "Selected Location"}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
