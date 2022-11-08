interface Environment {
  apiUrl: string;
}

declare global {
  interface Window {
    planningPoker: Environment;
  }
}
