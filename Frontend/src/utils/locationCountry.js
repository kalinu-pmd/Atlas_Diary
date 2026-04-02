const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

const DEFAULT_HEADERS = {
	Accept: "application/json",
};

const normalizeLocation = (item) => {
	const lat = Number(item?.lat);
	const lng = Number(item?.lon);

	return {
		...item,
		lat,
		lng,
		importance: Number(item?.importance || 0),
		place_rank: Number(item?.place_rank || 0),
	};
};

export async function searchLocations(query, options = {}) {
	const trimmedQuery = String(query || "").trim();
	if (!trimmedQuery) {
		return [];
	}

	const params = new URLSearchParams({
		format: "jsonv2",
		q: trimmedQuery,
		limit: String(options.limit || 8),
		addressdetails: "1",
		namedetails: "1",
	});

	if (options.language) {
		params.set("accept-language", options.language);
	}

	if (options.countryCodes) {
		params.set("countrycodes", options.countryCodes);
	}

	if (options.viewbox && Array.isArray(options.viewbox) && options.viewbox.length === 4) {
		params.set("viewbox", options.viewbox.join(","));
		params.set("bounded", "1");
	}

	const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, {
		headers: DEFAULT_HEADERS,
	});

	if (!response.ok) {
		const error = new Error("Location search failed");
		if (response.status === 429) {
			error.code = "rate_limited";
		}
		throw error;
	}

	const data = await response.json();
	if (!Array.isArray(data)) {
		return [];
	}

	return data.map(normalizeLocation).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
}
