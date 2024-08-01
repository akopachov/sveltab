import { FastAverageColor, type FastAverageColorOptions } from 'fast-average-color';

const DefaultStep = 2;

export class FastAverageColorEx extends FastAverageColor {
  getViewPort(resource: HTMLImageElement) {
    const nAspect = resource.naturalWidth / resource.naturalHeight;
    const cAspect = resource.clientWidth / resource.clientHeight;

    let left = 0;
    let top = 0;

    if (nAspect < cAspect) {
      const scale = resource.naturalWidth / resource.clientWidth;
      top = Math.abs(resource.clientHeight * scale - resource.naturalHeight) / 2;
    } else {
      const scale = resource.naturalHeight / resource.clientHeight;
      left = Math.abs(resource.clientWidth * scale - resource.naturalWidth) / 2;
    }

    return { left, top, width: resource.clientWidth, height: resource.clientHeight };
  }

  getDominantColor(resource: HTMLImageElement) {
    const { top, left, width, height } = this.getViewPort(resource);
    let options: FastAverageColorOptions = {
      algorithm: 'dominant',
      mode: 'speed',
      silent: true,
    };
    if (resource.style.objectFit === 'contain') {
      const step = Math.ceil(Math.max(1, resource.naturalWidth / width, resource.naturalHeight / height)) * DefaultStep;
      options = { ...options, step: step };
    } else {
      options = { ...options, left: left, top: top, width: width, height: height, step: DefaultStep };
    }

    return this.getColor(resource, options);
  }

  getCornerColor(resource: HTMLImageElement, cornerSize: number) {
    const { left, top } = this.getViewPort(resource);

    if (resource.style.objectFit === 'contain' && (left > cornerSize || top > cornerSize)) {
      return null;
    }

    const cornerColorResult = this.getColor(resource, {
      algorithm: 'simple',
      mode: 'speed',
      silent: true,
      width: cornerSize,
      height: cornerSize,
      left: left,
      top: top,
      step: DefaultStep,
    });

    return { x: left, y: top, color: cornerColorResult };
  }
}
