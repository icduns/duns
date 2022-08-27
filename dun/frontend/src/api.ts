// eslint-disable-next-line import/no-extraneous-dependencies
import { ActorMethod } from '@dfinity/agent';
import type { _SERVICE } from '../../../declarations/dun_backend/dun_backend.did';
import { dun_backend as backend } from '../../../declarations/dun_backend/index.js';

export function call<T extends keyof _SERVICE>(
  request: T,
  ...params: _SERVICE[T] extends ActorMethod<infer P> ? P : never
) {
  // eslint-disable-next-line no-unused-vars
  type Response = _SERVICE[T] extends ActorMethod<infer _, infer R> ? R : never;
  type ExtractedResponseType = Extract<Response, { ok: any }>['ok'];

  return new Promise<ExtractedResponseType>((resolve, reject) => {
    const args = params || [];

    // @ts-ignore
    backend[request](...args).then((response) => {
      if ('ok' in response) {
        resolve(response.ok);
        return;
      }

      reject(response.err);
    });
  });
}

export * from '../../../declarations/dun_backend/dun_backend.did.js';
