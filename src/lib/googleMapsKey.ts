/** Server-side Google Maps API key (never exposed to client bundle). */
export function getGoogleMapsServerKey(): string | undefined {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return key?.trim() || undefined;
}
