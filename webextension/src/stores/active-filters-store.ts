import { writable, type Subscriber } from 'svelte/store';

export const AvailableWidgetFilters = [
  'Apollo',
  'BlueNight',
  'Emerald',
  'GreenFall',
  'Noir',
  'NoirLight',
  'Rustic',
  'Summer84',
  'XPro',
] as const;

export type Filter = (typeof AvailableWidgetFilters)[number];

const activeFiltersWritable = writable(new Map<Filter, number>());
export const ActiveFilters = {
  subscribe(run: Subscriber<IterableIterator<Filter>>) {
    return activeFiltersWritable.subscribe(value => run(value.keys()));
  },
  add(filter: Filter) {
    activeFiltersWritable.update(v => {
      v.set(filter, (v.get(filter) || 0) + 1);
      return v;
    });
  },
  remove(filter: Filter) {
    activeFiltersWritable.update(v => {
      const newUsageCount = (v.get(filter) || 0) - 1;
      if (newUsageCount <= 0) {
        v.delete(filter);
      } else {
        v.set(filter, newUsageCount);
      }

      return v;
    });
  },
};
