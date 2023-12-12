export class Subscribable {
  #subscribers = new Set<any>();

  subscribe(run: (v: typeof this) => void, invalidate = () => {}, skipCurrent: boolean = false) {
    const subscriber = [run, invalidate];
    this.#subscribers.add(subscriber);
    if (!skipCurrent) {
      run(this);
    }
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
