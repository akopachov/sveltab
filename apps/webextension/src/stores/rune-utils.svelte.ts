import debounce from 'debounce';

export function derivedDebounce<T>(getter: () => T, wait: number, immediate: boolean = false): () => T {
  let current = $state(getter());
  const update = debounce(v => (current = v), wait, { immediate });
  $effect(() => update(getter()));

  return () => current;
}
