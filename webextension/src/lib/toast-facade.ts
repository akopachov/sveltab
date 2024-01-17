import { getToastStore } from '@skeletonlabs/skeleton';
import * as m from '$i18n/messages';

export enum CommonToastType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

const BackgroundClasses = {
  [CommonToastType.Info]: 'variant-filled-primary',
  [CommonToastType.Success]: 'variant-filled-success',
  [CommonToastType.Warning]: 'variant-filled-warning',
  [CommonToastType.Error]: 'variant-filled-error',
};

type GlobalCommonToastShowOptions = {
  errorObj?: unknown;
  autohideTimeout?: number;
};

class ToastFacade {
  #toastStore = getToastStore();
  show(text: string, type: CommonToastType, options?: GlobalCommonToastShowOptions) {
    let toastMessage = text;
    if (options?.errorObj) {
      let errorText = options.errorObj;
      if (options.errorObj instanceof Error) {
        errorText = options.errorObj.message;
      }

      toastMessage = `<p class="block">${text}</p><p class="text-sm block mt-2">${m.Core_Toasts_ErrorDetail()}</p><pre class="pre text-xs mt-2 bg-opacity-30 bg-neutral-950">${errorText}</pre>`;
    }

    this.#toastStore.trigger({
      message: toastMessage,
      background: BackgroundClasses[type],
      autohide: options?.autohideTimeout !== undefined,
      timeout: options?.autohideTimeout,
    });
  }
}

export function getToastFacade() {
  return new ToastFacade();
}
