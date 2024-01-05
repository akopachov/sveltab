export class Lazy<T> {
  #factory: () => T;
  #value: T | undefined;
  #valueConstructed: boolean = false;

  constructor(factory: () => T) {
    this.#factory = factory;
  }

  getValue(): T {
    if (!this.#valueConstructed) {
      this.#value = this.#factory();
      this.#valueConstructed = true;
    }

    return this.#value!;
  }
}

export class WeakLazy<T extends WeakKey> {
  #factory: () => T;
  #value: WeakRef<T> | undefined;

  constructor(factory: () => T) {
    this.#factory = factory;
  }

  getValue(): T {
    let value: T | undefined;
    if (!this.#value || (value = this.#value.deref()) === undefined) {
      value = this.#factory();
      this.#value = new WeakRef(value);
    }

    return value!;
  }
}
