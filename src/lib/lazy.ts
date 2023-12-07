export class Lazy<T> {
  #factory: (() => T);
  #value: T | undefined;
  #valueConstructed: boolean = false;

  constructor(factory: (() => T)) {
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
