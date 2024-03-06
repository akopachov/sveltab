function getMedia() {
  return matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
}

export function observeScreenResolution(callback: () => void) {
  let media = getMedia();

  function pixelRatioUpdated() {
    media.removeEventListener('change', pixelRatioUpdated);
    media = getMedia();
    callback();
  }

  window.addEventListener('resize', callback);
  media.addEventListener('change', pixelRatioUpdated);

  return () => {
    window.removeEventListener('resize', callback);
    media.removeEventListener('change', pixelRatioUpdated);
  };
}
