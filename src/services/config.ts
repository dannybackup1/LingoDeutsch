export const isRemote = (): boolean => {
  const demoMode = (import.meta as any)?.env?.VITE_DEMO_MODE;
  switch (demoMode) {
    case 'remote':
      return true;
    case 'local':
      return false;
    default:
      console.warn('VITE_DEMO_MODE not set — defaulting to local mode');
      return false;
  }
};

export const getApiBase = (): string => {
  const base = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
  if (isRemote()) {
    if (!base) {
      throw new Error('VITE_API_BASE is required in production to reach the Worker API');
    }
    return base.replace(/\/$/, '');
  }
  // Not used in local mode
  return '';
};
