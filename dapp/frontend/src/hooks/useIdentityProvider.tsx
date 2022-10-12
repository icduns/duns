import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_PORT = 8000;
export function useIdentityProvider() {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    if (process.env.DFX_NETWORK === 'ic') {
      return undefined;
    }

    const { protocol, hostname, port } = window.location;
    let calculatedPortSegment = '';
    if (port && searchParams.get('canisterId')) {
      calculatedPortSegment = `:${port}`;
    } else if (port) {
      calculatedPortSegment = `:${DEFAULT_PORT}`;
    }
    return `${protocol}//${hostname}${calculatedPortSegment}?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;
  }, [searchParams]);
}
