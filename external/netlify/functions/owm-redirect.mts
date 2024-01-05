declare global {
  const Netlify: {
    env: {
      get(name: string): string;
    };
  };
}

export default async (request: Request) => {
  const url = new URL(request.url);
  const city = url.searchParams.get('city');
  const country = url.searchParams.get('country');
  const lat = Number(url.searchParams.get('lat'));
  const lon = Number(url.searchParams.get('lon'));
  if (city && country) {
    const q = encodeURIComponent(`${city}, ${country}`);
    const apiKey = Netlify.env.get('OWM_API_KEY');
    const owmResponse = await fetch(`https://openweathermap.org/data/2.5/find?q=${q}&appid=${apiKey}`).then(r =>
      r.json(),
    );
    if (!owmResponse || !owmResponse.list || owmResponse.list.length <= 0) {
      return Response.redirect('https://openweathermap.org/', 308);
    }

    let cityId;
    if (owmResponse.list.length === 1) {
      cityId = owmResponse.list[0].id;
    } else {
      const idList = owmResponse.list.map(item => ({
        id: item.id,
        diff: Math.abs(item.coord.lat - lat) + Math.abs(item.coord.lon - lon),
      }));
      idList.sort((a, b) => a.diff - b.diff);
      cityId = idList[0].id;
    }
    return new Response(null, { status: 308, headers: { location: `https://openweathermap.org/city/${cityId}` } });
    return Response.redirect(`https://openweathermap.org/city/${cityId}`, 308);
  }
  return Response.redirect('https://openweathermap.org/', 308);
};
