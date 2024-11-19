import debounce from 'debounce';

export function derivedDebounce<T>(
  getter: () => T,
  wait: number,
  options?: { immediate?: boolean; activityNotificator?: () => unknown },
): () => T {
  let current = $state(getter());
  const update = debounce(() => (current = getter()), wait, { immediate: options?.immediate || false });
  const activityNotificator = options?.activityNotificator || getter;
  $effect(() => {
    void activityNotificator();
    update();
  });

  return () => current;
}
