<script lang="ts">
  import * as m from '$i18n/messages';
  import { ActiveFilters, AvailableWidgetFilters, type Filter } from '$stores/active-filters-store';

  export let filter: Filter | undefined;

  function notifyFilterChanged(e: Event) {
    if (e.target instanceof HTMLSelectElement) {
      if (filter) {
        ActiveFilters.remove(filter);
      }
      filter = <Filter>e.target.value || undefined;
      if (filter) {
        ActiveFilters.add(filter);
      }
    }
  }
</script>

<select class="select" value={filter} on:change={notifyFilterChanged}>
  <option value={undefined}>{m.Widgets_Common_Settings_Filter_None()}</option>
  {#each AvailableWidgetFilters as wf}
    <option value={wf}>{wf}</option>
  {/each}
</select>
