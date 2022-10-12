import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

export function SearchParamsChecker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [canisterId, setCanisterId] = useState<string>();

  useEffect(() => {
    const value = searchParams.get('canisterId');
    if (value) {
      setCanisterId(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (canisterId) {
      setSearchParams({ canisterId }, { replace: true });
    }
  }, [location.pathname, setSearchParams, canisterId]);

  return null;
}
