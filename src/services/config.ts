export const isRemote = (): boolean => {
  // If explicitly set to "local", force local demo data even in prod
  const forceLocal = (import.meta as any)?.env?.VITE_FORCE_LOCAL === 'true';
  if (forceLocal) return false;
  // Use remote when building for production
  return (import.meta as any)?.env?.PROD === true;
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
