import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
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

export default function LocationPicker({ value, onChange, radiusMeters = null, showSearch = true }) {
  const [position, setPosition] = useState(value || { lat: 20.5937, lng: 78.9629 }); // Default: India
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const adminDenyTerms = [
    "state",
    "province",
    "region",
    "administrative",
    "district",
    "county",
    "zone",
    "municipality",
  ];

  const adminDenyTypes = new Set([
    "administrative",
    "state",
    "province",
    "region",
    "county",
    "district",
  ]);

  const normalizeText = (text) => {
    const lower = (text || "").toLowerCase();

    // Keep all Unicode letters/numbers (Nepali, Hindi, etc.) for matching.
    // Fallback keeps behavior safe in environments without Unicode regex props.
    try {
      return lower
        .replace(/[^\p{L}\p{N}\s,.-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
    } catch {
      return lower
        .replace(/[^a-z0-9\s,.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
  };

  const fuzzyScore = (query, target) => {
    const q = normalizeText(query);
    const t = normalizeText(target);
    if (!q || !t) return 0;

    if (t === q) return 100;
    if (t.startsWith(q)) return 90;
    if (t.includes(q)) return 80;

    const qParts = q.split(/\s+/).filter(Boolean);
    const tParts = t.split(/\s+/).filter(Boolean);
    if (!qParts.length || !tParts.length) return 0;

    let tokenHits = 0;
    qParts.forEach((qp) => {
      if (tParts.some((tp) => tp.includes(qp) || qp.includes(tp))) {
        tokenHits += 1;
      }
    });

    return Math.round((tokenHits / qParts.length) * 70);
  };

  const isAdministrativeResult = (item, query) => {
    const normalizedQuery = normalizeText(query);
    const isQueryAskingAdmin = adminDenyTerms.some((term) =>
      normalizedQuery.includes(term),
    );

    // If user intentionally searches an admin area, don't deny it.
    if (isQueryAskingAdmin) return false;

    const display = normalizeText(item.display_name);
    const resultType = normalizeText(item.type || item.addresstype || "");
    const resultClass = normalizeText(item.class || "");

    const deniedByType =
      adminDenyTypes.has(resultType) || adminDenyTypes.has(resultClass);
    const deniedByText = adminDenyTerms.some((term) => display.includes(term));

    return deniedByType || deniedByText;
  };

  useEffect(() => {
    if (
      value &&
      typeof value.lat === "number" &&
      typeof value.lng === "number"
    ) {
      setPosition(value);
    }
  }, [value]);

  function RecenterMap({ center }) {
    const map = useMap();

    useEffect(() => {
      if (!center) return;
      map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);

    return null;
  }

  async function handleSearch(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setSearchError("Please enter a place to search.");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      const normalized = Array.isArray(data)
        ? data
            .filter((item) => item?.lat && item?.lon)
            .map((item) => ({
              display_name: item.display_name,
              lat: Number(item.lat),
              lng: Number(item.lon),
              class: item.class,
              type: item.type,
              addresstype: item.addresstype,
            }))
        : [];

      const filtered = normalized.filter(
        (item) => !isAdministrativeResult(item, query),
      );

      // Fallback: some valid Nepali place queries can come back with
      // administrative tags only. If filtering removes everything,
      // keep the original list instead of showing no results.
      const candidates = filtered.length > 0 ? filtered : normalized;

      const rankedResults = candidates
        .map((item) => ({
          ...item,
          _score: fuzzyScore(query, item.display_name),
        }))
        .sort((a, b) => b._score - a._score)
        .map(({ _score, ...item }) => item);

      setSearchResults(rankedResults);

      if (!rankedResults.length) {
        setSearchError("No places found. Try a more specific search.");
      }
    } catch (err) {
      setSearchError("Could not search locations right now. Try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelectSearchResult(result) {
    const nextPosition = { lat: result.lat, lng: result.lng };
    setPosition(nextPosition);
    if (onChange) {
      onChange(nextPosition, {
        source: "search",
        placeName: result.display_name,
      });
    }
    setSearchQuery(result.display_name || "");
    setSearchResults([]);
    setSearchError("");
  }

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        setSearchResults([]);
        setSearchError("");
        onChange && onChange(e.latlng, { source: "map" });
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  return (
    <div className="w-full mb-4">
      {showSearch && (
        <div className="mb-3 rounded-lg border border-light-green/60 bg-gradient-to-r from-light-green/10 to-off-white p-3">
          <p className="text-xs font-semibold text-dark-green mb-2">
            🔎 Search location (recommended)
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const nextValue = e.target.value;
                setSearchQuery(nextValue);
                if (!nextValue.trim()) {
                  setSearchResults([]);
                  setSearchError("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(e);
                }
              }}
              placeholder="Search a place (e.g. Pokhara Lakeside)"
              className="flex-1 bg-white border-2 border-dark-green/30 hover:border-light-green focus:border-dark-green focus:outline-none rounded-md px-3 py-2 text-sm text-text-dark transition-colors"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 rounded-md bg-dark-green text-off-white text-sm font-semibold hover:bg-dark-green-hover disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
          <p className="text-[11px] text-text-gray mt-2">
            If search does not match exactly, click on the map to fine-tune the pin.
          </p>
        </div>
      )}

      {searchError && (
        <p className="text-xs text-orange mb-2">{searchError}</p>
      )}

      {showSearch && searchResults.length > 0 && (
        <div className="max-h-44 overflow-y-auto border border-dark-green/20 rounded-md bg-white mb-2 shadow-sm">
          {searchResults.map((result, index) => (
            <button
              key={`${result.lat}-${result.lng}-${index}`}
              type="button"
              onClick={() => handleSelectSearchResult(result)}
              className="w-full text-left px-3 py-2 text-xs text-text-dark hover:bg-light-green/20 border-b border-dark-green/10 last:border-b-0"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-dark-green/20" style={{ height: 300, width: "100%" }}>
        <MapContainer center={position} zoom={5} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={position} />
          <LocationMarker />
          {position && radiusMeters ? (
            <Circle
              center={position}
              radius={radiusMeters}
              pathOptions={{
                color: "#2f6b4f",
                weight: 2,
                fillColor: "#affa01",
                fillOpacity: 0.16,
              }}
            />
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}
