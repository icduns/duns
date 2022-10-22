import { PropsWithChildren, Suspense } from 'react';
import { PageSuspenseFallback } from '~/components/PageSuspense/PageSuspenseFallback';

export function PageSuspense(props: PropsWithChildren) {
  const { children } = props;
  return <Suspense fallback={<PageSuspenseFallback />}>{children}</Suspense>;
}
