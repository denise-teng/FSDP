// LocationPicker.jsx
import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet"; // ✅ v2 syntax
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// ---------- Fix Leaflet default marker icons in bundlers ----------
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// SG map defaults
const SG_CENTER = [1.3521, 103.8198];
const SG_ZOOM = 13;

// Slightly wider SG bounding box for Nominatim fallback (lon,lat order)
// left,top,right,bottom
const SG_VIEWBOX = "103.57,1.485,104.114,1.160";

const LocationPicker = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [position, setPosition] = useState(SG_CENTER);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  // ------- Providers --------
  const fetchSGSuggestions = async (value, signal) => {
    const url = "https://developers.onemap.sg/commonapi/search";
    const { data } = await axios.get(url, {
      params: {
        searchVal: value,
        returnGeom: "Y",
        getAddrDetails: "Y",
        pageNum: 1,
      },
      signal,
      headers: { Accept: "application/json" },
    });

    const results = Array.isArray(data?.results) ? data.results : [];
    return results.map((r) => ({
      provider: "onemap",
      place_id: `${r.SEARCHVAL}-${r.LATITUDE}-${r.LONGITUDE}`, // ✅ fixed
      display_name: r.SEARCHVAL,
      full_address: r.ADDRESS || r.BUILDING || r.SEARCHVAL,
      lat: parseFloat(r.LATITUDE),
      lon: parseFloat(r.LONGITUDE),
    }));
  };

  const fetchNominatimSuggestions = async (value, signal) => {
    const base = "https://nominatim.openstreetmap.org/search";

    // 1) Bounded search inside SG box
    const res1 = await axios.get(base, {
      params: {
        format: "jsonv2",
        q: value,
        addressdetails: 1,
        namedetails: 1,
        limit: 8,
        viewbox: SG_VIEWBOX,
        bounded: 1,
        countrycodes: "sg",
        email: "your-contact@email.com",
      },
      signal,
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-SG,en",
      },
    });

    let list = Array.isArray(res1.data) ? res1.data : [];

    // 2) Fallback to SG-only without box
    if (list.length === 0) {
      const res2 = await axios.get(base, {
        params: {
          format: "jsonv2",
          q: `${value}, Singapore`, // ✅ fixed
          addressdetails: 1,
          namedetails: 1,
          limit: 8,
          countrycodes: "sg",
          email: "your-contact@email.com",
        },
        signal,
        headers: {
          Accept: "application/json",
          "Accept-Language": "en-SG,en",
        },
      });
      list = Array.isArray(res2.data) ? res2.data : [];
    }

    return list.map((s) => ({
      provider: "nominatim",
      place_id: String(s.place_id),
      display_name: s.namedetails?.name || s.display_name,
      full_address: s.display_name,
      lat: parseFloat(s.lat),
      lon: parseFloat(s.lon),
    }));
  };

  // ------- UI handlers -------
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        let list = await fetchSGSuggestions(value, controller.signal);

        if (!list || list.length === 0) {
          list = await fetchNominatimSuggestions(value, controller.signal);
        }

        setSuggestions(list || []);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Search error:", err?.response?.status || err?.message);
        setSuggestions([]);
      }
    }, 400);
  };

  const handleSuggestionClick = (place) => {
    const { lat, lon } = place;
    const name = place.display_name;

    setPosition([lat, lon]);
    setSearchQuery(name);
    setSuggestions([]);

    onLocationSelect?.({ lat, lng: lon, name, address: place.full_address });
  };

  return (
    <div className="w-full space-y-2">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search location..."
        className="w-full px-3 py-2 rounded text-black border border-gray-300"
        autoComplete="off"
      />

      {suggestions.length > 0 && (
        <ul className="bg-white border rounded shadow text-black max-h-48 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <li
              key={`${s.place_id}-${idx}`} // ✅ fixed
              onClick={() => handleSuggestionClick(s)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-medium">{s.display_name}</div>
              {s.full_address && (
                <div className="text-xs text-gray-500">{s.full_address}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="h-[250px] w-full">
        <Map
          center={position}
          zoom={SG_ZOOM}
          style={{ height: "100%", width: "100%" }}
        >
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
