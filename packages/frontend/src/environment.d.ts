interface Environment {
  apiUrl: string;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

declare global {
  interface Window {
    planningPoker: Environment;
  }
}
