import clear from 'browser-storage-polyfill/src/helpers/clear';
import get from 'browser-storage-polyfill/src/helpers/get';
import remove from 'browser-storage-polyfill/src/helpers/remove';
import set from 'browser-storage-polyfill/src/helpers/set';

declare global {
  var chrome: { runtime: { id: unknown } } | undefined;
}

const polyFillStorage = {
  set: set,
  get: get,
  remove: remove,
  clear: clear,
};
let AsyncStorage = {
  local: polyFillStorage,
  session: polyFillStorage,
  sync: polyFillStorage,
};

// if running locally (outside the browser extension runtime)
if (globalThis.chrome?.runtime?.id) {
  AsyncStorage = await import('webextension-polyfill').then(m => m.default.storage);
}

export default AsyncStorage;
