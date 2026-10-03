/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_GITHUB_CLIENT_ID?: string
  readonly VITE_USE_MOCK?: string
  /** 'switch' 이면 dev 서버 스위치 API(로그인 없음, ?secret= 방식)를 쓴다. 비우면 기존 API. */
  readonly VITE_API_MODE?: string
  readonly VITE_SWITCH_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
