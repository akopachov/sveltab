import { GeoPosition } from "geo-position.ts";

export interface Env {
  OWM_API_KEY: string;
}

type OWMFindResponseResultItem = {
  id: number;
  coord: { lat: number; lon: number };
};
type OWMFindResponse = { list: OWMFindResponseResultItem[] };

function getFailedResponse() {
  return Response.redirect("https://openweathermap.org/", 308);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const city = url.searchParams.get("city");
    const country = url.searchParams.get("country");

    if (!city || !country) {
      return getFailedResponse();
    }

    const lat = Number(url.searchParams.get("lat"));
    const lon = Number(url.searchParams.get("lon"));
    const targetPosition = new GeoPosition(lat, lon);

    const q = encodeURIComponent(`${city}, ${country}`);
    const owmResponse = await fetch(
      `https://openweathermap.org/data/2.5/find?q=${q}&appid=${env.OWM_API_KEY}`,
    ).then<OWMFindResponse>((r) => r.json());
    if (!owmResponse || !owmResponse.list || owmResponse.list.length <= 0) {
      return getFailedResponse();
    }

    let cityId;
    if (owmResponse.list.length === 1) {
      cityId = owmResponse.list[0].id;
    } else {
      cityId = owmResponse.list
        .map((item) => ({
          id: item.id,
          distance: targetPosition.Distance(
            new GeoPosition(item.coord.lat, item.coord.lon),
          ),
        }))
        .reduce((a, b) => (a.distance < b.distance ? a : b)).id;
    }
    return Response.redirect(`https://openweathermap.org/city/${cityId}`, 308);
  },
};
