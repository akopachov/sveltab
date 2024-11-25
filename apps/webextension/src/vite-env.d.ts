/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_FOR: 'webextension' | 'web' | undefined;
  readonly VITE_TARGET_BROWSER: 'chromium' | 'firefox' | undefined;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
