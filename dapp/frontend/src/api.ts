// eslint-disable-next-line import/no-extraneous-dependencies
import { ActorMethod, Identity } from '@dfinity/agent';
// eslint-disable-next-line no-restricted-imports
import { AuthClient } from '@dfinity/auth-client';
// eslint-disable-next-line no-restricted-imports
import { canisterId, createActor } from '../../../declarations/dun_backend';
// eslint-disable-next-line no-restricted-imports
import type { _SERVICE } from '../../../declarations/dun_backend/dun_backend.did';

let identity: Identity;

export function setIdentity(authClient: AuthClient) {
  identity = authClient.getIdentity();
}

export function getBackendActor() {
  return createActor(
    canisterId as string,
    identity ? { agentOptions: { identity } } : {},
  );
}

export type ApiResponse<T extends keyof _SERVICE> =
  _SERVICE[T] extends ActorMethod<
    // eslint-disable-next-line no-unused-vars
    infer _,
    infer R
  >
    ? R
    : never;

export type ExtractedResponseType<T extends keyof _SERVICE> = Extract<
  ApiResponse<T>,
  { ok: unknown }
>['ok'];

export function call<T extends keyof _SERVICE>(
  request: T,
  ...params: _SERVICE[T] extends ActorMethod<infer P> ? P : never
) {
  const args = params || [];

  return new Promise<ExtractedResponseType<T>>((resolve, reject) => {
    const backendActor = getBackendActor();
    // @ts-ignore
    backendActor[request](...args)
      .then((response: any) => {
        if ('ok' in response) {
          resolve(response.ok);
          return;
        }

        reject(response.err);
      })
      .catch((error: any) => {
        if (error instanceof Error && error.name === 'AbortError') return;

        throw error;
      });
  });
}

// eslint-disable-next-line no-restricted-imports
export * from '../../../declarations/dun_backend/dun_backend.did.js';
