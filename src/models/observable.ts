import { get, writable, type Writable } from 'svelte/store';

export type Unobserved<T> = {
  [K in keyof T]: T[K] extends Observable<infer U> ? U : Unobserved<T[K]>;
};

export type Observed<T> = {
  [K in keyof T]: Observable<T[K]>;
};

export type Subscribable<T> = Pick<Writable<T>, 'subscribe'>;

export type Observable<T> = {
  value: T;
  get: () => T;
  toJSON: () => T;
} & Subscribable<T> &
  Pick<Writable<T>, 'set'>;

export function useObservable<T>(initial: T): Observable<T> {
  const w = writable(initial);
  const getter = () => get(w);
  const setter = w.set;
  return {
    set: setter,
    get: getter,
    subscribe: w.subscribe,
    get value() {
      return getter();
    },
    set value(v) {
      setter(v);
    },
    toJSON: getter,
  };
}
