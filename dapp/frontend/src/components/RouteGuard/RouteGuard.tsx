import { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { call } from '~/api';
import { Role } from '~/enums/role';

type RouteGuardProps = PropsWithChildren<{
  roles?: Array<Role>;
  nonAuthorized?: boolean;
}>;
export function RouteGuard(props: RouteGuardProps) {
  const { children, roles, nonAuthorized } = props;
  const [allowed, setAllowed] = useState<boolean>();
  const navigate = useNavigate();

  useEffect(() => {
    call('getUser')
      .then((user) => {
        if (roles) {
          setAllowed(roles.every((role) => user.roles.includes(role)));
          return;
        }
        setAllowed(!nonAuthorized);
      })
      .catch(() => setAllowed(nonAuthorized || false));
  }, [nonAuthorized, roles]);

  useEffect(() => {
    if (allowed === undefined) {
      return;
    }
    if (!allowed) {
      navigate('/', { replace: true });
    }
  }, [allowed, navigate]);

  return <>{allowed && children}</>;
}
