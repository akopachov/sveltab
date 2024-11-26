import { PUBLIC_FLICKR_API_KEY } from '$env/static/public';

export type FlickrSearchResponse = {
  photos: {
    page: number;
    pages: number;
    photo: Array<{
      id: string;
      owner: string;
    }>;
  };
};

export type FlickrSizesResponse = {
  sizes: {
    size: Array<{
      width: number;
      height: number;
      source: string;
    }>;
  };
};

export function searchImages(query: string, page: number) {
  return fetch(
    `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${PUBLIC_FLICKR_API_KEY}&text=${query}&safe_search=1&content_type=1&sort=interestingness-desc&per_page=20&format=json&page=${page}&nojsoncallback=1`,
  ).then<FlickrSearchResponse>(r => r.json());
}

export function getImageSizes(id: string) {
  return fetch(
    `https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${PUBLIC_FLICKR_API_KEY}&photo_id=${id}&format=json&nojsoncallback=1`,
  ).then<FlickrSizesResponse>(r => r.json());
}
