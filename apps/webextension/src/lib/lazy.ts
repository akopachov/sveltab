export interface LazyLike<T> {
  get value(): T;
}

export class Lazy<T> implements LazyLike<T> {
  #factory: () => T;
  #value: T | undefined;
  #valueConstructed: boolean = false;

  constructor(factory: () => T) {
    this.#factory = factory;
  }

  get value(): T {
    if (!this.#valueConstructed) {
      this.#value = this.#factory();
      this.#valueConstructed = true;
    }

    return this.#value!;
  }
}

type NonUndefined<T> = T extends undefined ? never : T;

export class WeakLazy<T extends WeakKey> implements LazyLike<T> {
  #factory: () => NonUndefined<T>;
  #value: WeakRef<T> | undefined;

  constructor(factory: () => NonUndefined<T>) {
    this.#factory = factory;
  }

  get value(): T {
    let value: T | undefined;
    if (!this.#value || (value = this.#value.deref()) === undefined) {
      value = this.#factory();
      this.#value = new WeakRef(value);
    }

    return value!;
  }
}
