const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

const DEFAULT_HEADERS = {
	Accept: "application/json",
};

const normalizeCountryKey = (value) =>
	String(value || "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();

const countryNames = (() => {
	try {
		const displayNames = new Intl.DisplayNames(["en"], {
			type: "region",
		});
		const regionCodes = Intl.supportedValuesOf("region");
		return new Set(
			regionCodes
				.map((code) => displayNames.of(code))
				.filter(Boolean)
				.map((name) => normalizeCountryKey(name)),
		);
	} catch (_error) {
		return new Set([
			"nepal",
			"india",
			"china",
			"united states",
			"united kingdom",
		]);
	}
})();

const formatCountryLabel = (value) => {
	const normalized = normalizeCountryKey(value);
	if (!normalized) return "";

	return normalized
		.split(" ")
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export const extractCountryFromLocationName = (locationName) => {
	const cleaned = String(locationName || "").trim();
	if (!cleaned) return "";

	const normalizedFull = normalizeCountryKey(cleaned);
	if (normalizedFull.includes("nepal") || cleaned.includes("नेपाल")) {
		return "Nepal";
	}

	const parts = cleaned
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	for (let i = parts.length - 1; i >= 0; i -= 1) {
		const candidate = normalizeCountryKey(parts[i]);
		if (countryNames.has(candidate)) {
			return formatCountryLabel(parts[i]);
		}
	}

	return "";
};

export const areSameCountry = (first, second) => {
	const left = normalizeCountryKey(first);
	const right = normalizeCountryKey(second);
	if (!left || !right) return false;
	return left === right;
};

const pickLocationLabel = (address = {}) => {
	const preferredKeys = [
		"city",
		"town",
		"village",
		"municipality",
		"hamlet",
		"suburb",
		"neighbourhood",
		"quarter",
		"county",
		"state",
		"region",
		"country",
	];

	for (const key of preferredKeys) {
		const value = address?.[key];
		if (value) return String(value).trim();
	}

	return "";
};

export async function getLocationInfoFromCoordinates(location) {
	const lat = Number(location?.lat);
	const lng = Number(location?.lng);
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
		return { country: "", label: "" };
	}

	const params = new URLSearchParams({
		format: "jsonv2",
		lat: String(lat),
		lon: String(lng),
		addressdetails: "1",
		"accept-language": "en",
	});

	const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params.toString()}`, {
		headers: DEFAULT_HEADERS,
	});

	if (!response.ok) {
		const error = new Error("Location lookup failed");
		if (response.status === 429) {
			error.code = "rate_limited";
		}
		throw error;
	}

	const data = await response.json();
	const label = pickLocationLabel(data?.address);
	const country = data?.address?.country;
	if (country) {
		return {
			country: formatCountryLabel(country),
			label: label || formatCountryLabel(country),
		};
	}

	const countryCode = data?.address?.country_code;
	if (countryCode) {
		try {
			const displayNames = new Intl.DisplayNames(["en"], {
				type: "region",
			});
			const resolvedCountry = displayNames.of(countryCode.toUpperCase()) || "";
			return { country: resolvedCountry, label: label || resolvedCountry };
		} catch (_error) {
			const resolvedCountry = formatCountryLabel(countryCode);
			return { country: resolvedCountry, label: label || resolvedCountry };
		}
	}

	return {
		country: "",
		label: label || "",
	};
};

export async function getCountryFromCoordinates(location) {
	const info = await getLocationInfoFromCoordinates(location);
	return info.country;
}

export async function getLocationNameFromCoordinates(location) {
	const info = await getLocationInfoFromCoordinates(location);
	return info.label;
}

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
