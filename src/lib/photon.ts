export type PhotonProperties = {
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
};

export type PhotonFeature = {
  properties: PhotonProperties;
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

export function formatPhotonAddress(properties: PhotonProperties): string {
  const streetLine = [properties.housenumber, properties.street]
    .filter(Boolean)
    .join(" ");
  const cityLine = [properties.postcode, properties.city]
    .filter(Boolean)
    .join(" ");

  return [streetLine || properties.name, cityLine, properties.state, properties.country]
    .filter(Boolean)
    .join(", ");
}

export function formatPhotonSuggestion(properties: PhotonProperties): string {
  return formatPhotonAddress(properties);
}

export async function searchPhotonAddresses(
  query: string,
): Promise<PhotonFeature[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=5&lang=en`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not search addresses");
  }

  const data = (await response.json()) as PhotonResponse;
  return data.features ?? [];
}
