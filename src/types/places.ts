export interface PlaceSearchResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  mapsLink: string;
}

export interface PlaceAutocompletePrediction {
  placeId: string;
  name: string;
  address: string;
}
