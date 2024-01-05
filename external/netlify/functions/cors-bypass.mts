// Port from https://github.com/Zibri/cloudflare-cors-anywhere

const BLACKLIST: RegExp[] = [];
const WHITELIST: RegExp[] = [
  /^https:\/\/ac.duckduckgo.com\/ac\/.*/,
  /^https:\/\/suggestqueries.google.com\/complete\/search?.*/,
];

function isListed(uri: string, listing: RegExp[]) {
  if (!uri || listing.length <= 0) return false;
  return listing.some(v => uri.match(v));
}

export default async (request: Request) => {
  const isOPTIONS = request.method == 'OPTIONS';
  const origin_url = new URL(request.url);
  const fetch_url = decodeURIComponent(origin_url.search.slice(1));

  if (!isListed(fetch_url, BLACKLIST) && isListed(fetch_url, WHITELIST)) {
    let xheaders = request.headers.get('x-cors-headers');
    if (xheaders != null) {
      try {
        xheaders = JSON.parse(xheaders);
      } catch (e) {
        /* empty */
      }
    }

    if (fetch_url) {
      const recv_headers = {};
      for (const pair of request.headers.entries()) {
        if (
          pair[0].match('^origin') == null &&
          pair[0].match('eferer') == null &&
          pair[0].match('^cf-') == null &&
          pair[0].match('^x-forw') == null &&
          pair[0].match('^x-cors-headers') == null
        ) {
          recv_headers[pair[0]] = pair[1];
        }
      }

      if (xheaders != null) {
        Object.entries(xheaders).forEach(c => (recv_headers[c[0]] = c[1]));
      }

      const newreq = new Request(request, {
        redirect: 'follow',
        headers: recv_headers,
      });

      const response = await fetch(fetch_url, newreq);
      const myHeaders = new Headers(response.headers);
      const cors_headers: string[] = [];
      const allh = {};
      for (const pair of response.headers.entries()) {
        cors_headers.push(pair[0]);
        allh[pair[0]] = pair[1];
      }

      cors_headers.push('cors-received-headers');
      myHeaders.set('Access-Control-Allow-Origin', request.headers.get('Origin') || '');
      if (isOPTIONS) {
        myHeaders.set('Access-Control-Allow-Methods', request.headers.get('access-control-request-method') || '*');
        const acrh = request.headers.get('access-control-request-headers');
        if (acrh) {
          myHeaders.set('Access-Control-Allow-Headers', acrh);
        }

        myHeaders.delete('X-Content-Type-Options');
      }
      myHeaders.set('Access-Control-Expose-Headers', cors_headers.join(','));
      myHeaders.set('cors-received-headers', JSON.stringify(allh));

      let body: any;
      if (isOPTIONS) {
        body = null;
      } else {
        body = await response.arrayBuffer();
      }

      const init = {
        headers: myHeaders,
        status: isOPTIONS ? 200 : response.status,
        statusText: isOPTIONS ? 'OK' : response.statusText,
      };

      return new Response(body, init);
    } else {
      return new Response(null, { status: 400 });
    }
  } else {
    return new Response(null, { status: 403 });
  }
};
