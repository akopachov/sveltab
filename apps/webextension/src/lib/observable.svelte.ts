export type Unobserved<T> = {
  -readonly [K in keyof T]: T[K] extends Observable<infer U> ? U : Unobserved<T[K]>;
};

export interface Subscribable<T> {
  subscribe: (run: (value: T) => void) => () => void;
}

export interface ReadOnlyObservable<T> extends Subscribable<T> {
  get: () => T;
  toJSON: () => T;
  value: T;
}

export class Observable<T> implements ReadOnlyObservable<T> {
  #subscribers = new Set<(value: T) => void>();
  #value: T | undefined = $state();

  constructor(initial: T) {
    this.set(initial);
  }

  set(value: T) {
    if (value === this.#value) return;
    this.#value = value;
    this.#subscribers.forEach(run => run(value));
  }

  get() {
    return this.#value!;
  }

  toJSON() {
    return this.value!;
  }

  subscribe(run: (value: T) => void) {
    this.#subscribers.add(run);
    run(this.value);
    return () => {
      this.#subscribers.delete(run);
    };
  }

  get value() {
    return this.get();
  }
  set value(v) {
    this.set(v);
  }
}

export function useObservable<T>(initial: T): Observable<T> {
  return new Observable(initial);
}

export function unobserve<T>(instance: T): Unobserved<T> {
  return JSON.parse(JSON.stringify(instance));
}
