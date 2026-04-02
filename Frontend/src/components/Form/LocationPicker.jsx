import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { searchLocations } from "../../utils/locationCountry";

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

  const broadPlaceTypes = new Set([
    "city",
    "town",
    "village",
    "municipality",
    "hamlet",
    "suburb",
    "locality",
  ]);

  const narrowPlaceTypes = new Set([
    "road",
    "residential",
    "house",
    "building",
    "neighbourhood",
    "quarter",
    "highway",
    "aeroway",
    "bus_stop",
  ]);

  const landmarkPlaceTypes = new Set([
    "place_of_worship",
    "tourism",
    "attraction",
    "museum",
    "historic",
    "monument",
  ]);

  const landmarkTerms = [
    "stupa",
    "temple",
    "monastery",
    "shrine",
    "pagoda",
    "buddha",
    "boudha",
    "boudhanath",
    "bouddha",
  ];

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

  const extractPrimaryName = (displayName) => {
    const firstPart = String(displayName || "").split(",")[0] || "";
    return normalizeText(firstPart);
  };

  const rankSearchResult = (query, item) => {
    const normalizedQuery = normalizeText(query);
    const display = normalizeText(item.display_name);
    const primaryName = extractPrimaryName(item.display_name);
    const resultType = normalizeText(item.type || item.addresstype || "");
    const resultClass = normalizeText(item.class || "");

    let score = fuzzyScore(normalizedQuery, display);

    // Strongly prioritize exact place-name matches (first label in display_name).
    if (primaryName && primaryName === normalizedQuery) score += 70;
    else if (primaryName && primaryName.startsWith(normalizedQuery)) score += 35;
    else if (primaryName && normalizedQuery.startsWith(primaryName)) score += 25;

    // Prefer broad location entities for short city/village queries.
    if (broadPlaceTypes.has(resultType)) score += 12;

    // Landmark terms matter a lot for places like Boudha / Boudhanath.
    if (landmarkPlaceTypes.has(resultType) || landmarkPlaceTypes.has(resultClass)) {
      score += 18;
    }

    if (landmarkTerms.some((term) => display.includes(term))) {
      score += 30;
    }

    if (landmarkTerms.some((term) => normalizedQuery.includes(term))) {
      score += 15;
    }

    if (
      landmarkTerms.some((term) => display.includes(term)) &&
      !narrowPlaceTypes.has(resultType)
    ) {
      score += 10;
    }

    // De-prioritize very narrow places (roads/buildings) unless user clearly asks for them.
    const isSpecificQuery =
      normalizedQuery.includes("road") ||
      normalizedQuery.includes("street") ||
      normalizedQuery.includes("airport") ||
      normalizedQuery.includes("highway") ||
      normalizedQuery.includes("bus") ||
      normalizedQuery.includes("stop");
    if (!isSpecificQuery && narrowPlaceTypes.has(resultType)) score -= 18;

    const importance = Number(item.importance || 0);
    score += Math.min(10, Math.round(importance * 10));

    return score;
  };

  const isSpecificPlaceQuery = (query) => {
    const normalized = normalizeText(query);
    if (!normalized) return false;

    const specificTerms = [
      "road",
      "street",
      "airport",
      "highway",
      "bus",
      "stop",
      "ward",
      "hospital",
      "school",
      "hotel",
      "temple",
      "chowk",
    ];

    if (specificTerms.some((term) => normalized.includes(term))) {
      return true;
    }

    return /\d/.test(normalized) || normalized.includes(",");
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
      const normalized = await searchLocations(query, {
        limit: 8,
        language: "en",
      });

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
          _score: rankSearchResult(query, item),
        }))
        .sort((a, b) => {
          if (b._score !== a._score) return b._score - a._score;
          if ((b.importance || 0) !== (a.importance || 0)) {
            return (b.importance || 0) - (a.importance || 0);
          }
          return (a.place_rank || 0) - (b.place_rank || 0);
        })
        .map(({ _score, ...item }) => item);

      const normalizedQuery = normalizeText(query);
      const specificQuery = isSpecificPlaceQuery(query);

        const landmarkMatches = rankedResults.filter((item) => {
          const display = normalizeText(item.display_name);
          const resultType = normalizeText(item.type || item.addresstype || "");
          const resultClass = normalizeText(item.class || "");

          return (
            landmarkTerms.some((term) => display.includes(term)) ||
            landmarkPlaceTypes.has(resultType) ||
            landmarkPlaceTypes.has(resultClass)
          );
        });

      let finalResults = rankedResults;
      if (!specificQuery) {
        // Prefer exact city/town/village/locality level matches.
        const exactCityLevelMatches = rankedResults.filter((item) => {
          const primaryName = extractPrimaryName(item.display_name);
          return (
            primaryName === normalizedQuery &&
            Number(item.place_rank || 99) <= 20
          );
        });

        if (exactCityLevelMatches.length > 0) {
          finalResults = exactCityLevelMatches;
        } else if (landmarkMatches.length > 0) {
          finalResults = landmarkMatches;
        } else {
          // Otherwise, still suppress very narrow results for generic queries.
          const broadLevelMatches = rankedResults.filter(
            (item) => Number(item.place_rank || 99) <= 20,
          );
          if (broadLevelMatches.length > 0) {
            finalResults = broadLevelMatches;
          }
        }
      } else if (landmarkMatches.length > 0) {
        // For specific queries that still point to a destination area,
        // keep landmark results near the top so the intended attraction appears.
        finalResults = [
          ...landmarkMatches,
          ...rankedResults.filter((item) => !landmarkMatches.some((match) => match.lat === item.lat && match.lng === item.lng)),
        ];
      }

      setSearchResults(finalResults);

      if (!finalResults.length) {
        setSearchError("No places found. Try a more specific search.");
      }
    } catch (err) {
      if (err?.code === "rate_limited") {
        setSearchError("Location search is busy right now. Please wait a moment and try again.");
      } else {
        setSearchError("Could not search locations right now. Try again.");
      }
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
