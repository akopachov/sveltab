export class Subscribable {
  #subscribers = new Set<any>();

  subscribe(run: ((v: typeof this) => void), invalidate = () => {}) {
    const subscriber = [run, invalidate];
    this.#subscribers.add(subscriber);
    run(this);
    return () => {
      this.#subscribers.delete(subscriber);
    };
  }

  set() {
    this.notifyPropertiesChanged();
  }

  notifyPropertiesChanged() {
    this.#subscribers.forEach(f => f[0](this));
  }
}

export type OmitSubscribable<T> = Omit<T, 'subscribe' | 'set' | 'notifyPropertiesChanged'>;
