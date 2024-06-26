import unidecode from "unidecode";
import { GeoPosition } from "geo-position.ts";

interface IQAirCoordinates {
  latitude: number;
  longitude: number;
}

interface IQAirObject {
  coordinates: IQAirCoordinates;
  url: string;
}

interface IQAirCity extends IQAirObject {
  country: string;
  name: string;
}

interface IQAirStation extends IQAirObject {
  city: string;
  country: string;
}

type IQAirFindResponse = {
  cities: IQAirCity[];
  stations: IQAirStation[];
};

function getFailedResponse() {
  return Response.redirect("https://www.iqair.com/", 308);
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const city = url.searchParams.get("city");
    if (!city) {
      return getFailedResponse();
    }

    const lat = Number(url.searchParams.get("lat"));
    const lon = Number(url.searchParams.get("lon"));
    const targetPosition = new GeoPosition(lat, lon);

    const q = encodeURIComponent(unidecode(city));
    const findResponse = await fetch(
      `https://website-api.airvisual.com/v1/search?q=${q}&language=en`,
    ).then<IQAirFindResponse>((r) => r.json());
    if (!findResponse) {
      return getFailedResponse();
    }

    const objectsToSearch = [...findResponse.stations, ...findResponse.cities];

    if (objectsToSearch.length <= 0) {
      return getFailedResponse();
    }

    let closestObjectUrl;
    if (objectsToSearch.length === 1) {
      closestObjectUrl = objectsToSearch[0].url;
    } else {
      closestObjectUrl = objectsToSearch
        .map((item) => ({
          url: item.url,
          distance: targetPosition.Distance(
            new GeoPosition(
              item.coordinates.latitude,
              item.coordinates.longitude,
            ),
          ),
        }))
        .reduce((a, b) => (a.distance < b.distance ? a : b)).url;
    }

    return Response.redirect(`https://www.iqair.com${closestObjectUrl}`, 308);
  },
};
