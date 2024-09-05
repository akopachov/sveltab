/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_FOR: 'webextension' | 'web' | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
