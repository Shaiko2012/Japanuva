/** Parse Google Maps / place links into a searchable query + optional coords. */
export function parseGoogleMapsInput(input: string): {
  query: string;
  mapsLink: string;
  lat?: number;
  lng?: number;
  titleHint?: string;
} {
  const raw = input.trim();
  if (!raw) {
    return { query: "", mapsLink: "" };
  }

  // Bare coordinates
  const coordOnly = raw.match(
    /^(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)$/,
  );
  if (coordOnly) {
    const lat = Number(coordOnly[1]);
    const lng = Number(coordOnly[2]);
    return {
      query: `${lat},${lng}`,
      mapsLink: buildMapsSearchUrl(`${lat},${lng}`),
      lat,
      lng,
    };
  }

  // Looks like a URL
  if (
    /^https?:\/\//i.test(raw) ||
    raw.includes("google.com/maps") ||
    raw.includes("maps.app.goo.gl")
  ) {
    let mapsLink = raw.startsWith("http") ? raw : `https://${raw}`;
    let query = raw;
    let lat: number | undefined;
    let lng: number | undefined;
    let titleHint: string | undefined;

    try {
      const url = new URL(mapsLink);

      const q = url.searchParams.get("q") || url.searchParams.get("query");
      if (q) {
        query = decodeURIComponent(q.replace(/\+/g, " "));
        const cq = query.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
        if (cq) {
          lat = Number(cq[1]);
          lng = Number(cq[2]);
        }
      }

      // /place/Name/
      const place = url.pathname.match(/\/place\/([^/]+)/);
      if (place) {
        titleHint = decodeURIComponent(place[1].replace(/\+/g, " "));
        if (!q) query = titleHint;
      }

      // !3dLAT!4dLNG — exact place pin (prefer over map viewport @coords)
      const bang = mapsLink.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (bang) {
        lat = Number(bang[1]);
        lng = Number(bang[2]);
      } else {
        // /@lat,lng,zoom — viewport center, less accurate fallback
        const at = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (at) {
          lat = Number(at[1]);
          lng = Number(at[2]);
          if (!q) query = `${lat},${lng}`;
        }
      }
    } catch {
      query = raw;
    }

    if (lat != null && lng != null) {
      const placeLabel =
        titleHint ||
        (query && !/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/.test(query.trim())
          ? query
          : undefined);
      mapsLink = buildMapsOpenUrl({
        name: placeLabel,
        lat,
        lng,
      });
    }

    return { query, mapsLink, lat, lng, titleHint };
  }

  // Plain address / place name
  const query = raw;
  return {
    query,
    mapsLink: buildMapsSearchUrl(query),
    titleHint: raw,
  };
}

export function buildMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Open a named place in Google Maps (not raw coordinates when a label exists). */
export function buildMapsOpenUrl(options: {
  name?: string;
  address?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}): string {
  const name = options.name?.trim();
  const address = options.address?.trim();
  const label = address || name || "";

  if (options.placeId && label) {
    const params = new URLSearchParams({
      api: "1",
      query: label,
      query_place_id: options.placeId,
    });
    return `https://www.google.com/maps/search/?${params.toString()}`;
  }

  if (label && !/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/.test(label)) {
    return buildMapsSearchUrl(label);
  }

  if (options.lat != null && options.lng != null) {
    return buildMapsSearchUrl(`${options.lat},${options.lng}`);
  }

  return buildMapsSearchUrl(label || "Japan");
}

export function formatMapsLocation(
  label: string,
  coords?: { lat?: number; lng?: number },
): string {
  if (
    coords?.lat != null &&
    coords?.lng != null &&
    !Number.isNaN(coords.lat) &&
    !Number.isNaN(coords.lng)
  ) {
    return `${coords.lat},${coords.lng}`;
  }
  const trimmed = label.trim();
  if (trimmed && !/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed || "Tokyo, Japan";
}

export function buildMapsDirectionsUrl(
  from: { label: string; lat?: number; lng?: number },
  to: { label: string; lat?: number; lng?: number },
  travelmode: "transit" | "walking" | "driving" = "transit",
) {
  const params = new URLSearchParams({
    api: "1",
    origin: formatMapsLocation(from.label, from),
    destination: formatMapsLocation(to.label, to),
    travelmode,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function buildMapsDayRouteUrl(
  stops: Array<{ label: string; lat?: number; lng?: number }>,
  travelmode: "transit" | "walking" | "driving" = "transit",
) {
  if (stops.length < 2) return buildMapsSearchUrl(stops[0]?.label || "Tokyo");

  const origin = formatMapsLocation(stops[0].label, stops[0]);
  const destination = formatMapsLocation(
    stops[stops.length - 1].label,
    stops[stops.length - 1],
  );
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode,
  });

  if (stops.length > 2) {
    const waypoints = stops
      .slice(1, -1)
      .map((s) => formatMapsLocation(s.label, s))
      .join("|");
    params.set("waypoints", waypoints);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
