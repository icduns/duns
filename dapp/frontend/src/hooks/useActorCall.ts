import { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ActorMethod } from '@dfinity/agent';
import { _SERVICE, call, ErrorResponse, ExtractedResponseType } from '~/api';

type NullableParamsArray<T extends Array<unknown>> = {
  [K in keyof T]: T[K] | null | undefined;
};

type CallParams<T extends keyof _SERVICE> = _SERVICE[T] extends ActorMethod<
  infer P
>
  ? P
  : never;

type OptionalCallParams<T extends keyof _SERVICE> =
  _SERVICE[T] extends ActorMethod<infer P>
    ? P extends Array<unknown>
      ? NullableParamsArray<P>
      : never
    : never;

export function useActorCall<T extends keyof _SERVICE>(
  request: T,
  ...params: OptionalCallParams<T>
): [ExtractedResponseType<T> | undefined, ErrorResponse | undefined] {
  const [result, setResult] = useState<ExtractedResponseType<T>>();
  const [errors, setErrors] = useState<ErrorResponse>();

  useEffect(() => {
    if (
      params?.length &&
      params.some((param) => param === null || param === undefined)
    ) {
      return;
    }

    let cancel = false;

    call(request, ...(params as CallParams<T>))
      .then((data) => {
        if (cancel) return;

        setResult(data);
      })
      .catch((err) => {
        if (cancel) return;

        setErrors(err);
      });

    return () => {
      cancel = true;
    };
  }, [request, ...params]);

  return [result, errors];
}
