<script lang="ts" module>
  export type TagDisplayInfo = {
    value: string;
    label: string;
  };
</script>

<script lang="ts">
  import type { SizeOptions } from '@floating-ui/dom';

  import { InputChip, popup, ProgressRadial, type PopupSettings } from '@skeletonlabs/skeleton';
  import { nanoid } from 'nanoid/non-secure';
  import VirtualScroll from 'svelte-virtual-scroll-list';

  let {
    availableTags,
    tags = $bindable(),
    placeholder = '',
    id = `tagSelector_${nanoid()}`,
  }: {
    availableTags: TagDisplayInfo[] | Promise<TagDisplayInfo[]> | (() => TagDisplayInfo[] | Promise<TagDisplayInfo[]>);
    tags: string[];
    placeholder?: string;
    id?: string;
  } = $props();

  let tagInput: string = $state('');

  let availableTagOptionsPromise: TagDisplayInfo[] | Promise<TagDisplayInfo[]> | undefined = $state();
  let tagsPopup: PopupSettings = {
    event: 'focus-click',
    target: `tagsPopup_${id}`,
    middleware: {
      size: {
        apply(args: Parameters<Required<SizeOptions>['apply']>[0]) {
          args.elements.floating.style.maxHeight = `${args.availableHeight - 5}px`;
          args.elements.floating.style.maxWidth = `${args.availableWidth - 20}px`;
          args.elements.floating.style.width = args.elements.floating.style.maxWidth;
        },
      },
    },
    state(event) {
      if (event.state && !availableTagOptionsPromise) {
        availableTagOptionsPromise = availableTags instanceof Function ? availableTags() : availableTags;
      }
    },
  };

  function onIncludeTagSelected(e: TagDisplayInfo) {
    if (e) {
      tags = [...tags, e.value];
      tagInput = '';
    }
  }

  function filterOptions(options: TagDisplayInfo[], search: string) {
    return options.filter(option => option.value.includes(search.toLowerCase()));
  }
</script>

<div class="relative" {id}>
  <InputChip
    placeholder=""
    allowDuplicates={false}
    class="[&_.input-chip-field]:invisible"
    bind:input={tagInput}
    bind:value={tags}
    id="{id}_IncludeTags"
    name="{id}_IncludeTags" />
  <input
    class="input absolute border-none left-0 top-0 w-full !bg-transparent"
    id="{id}_InputSearch"
    type="search"
    bind:value={tagInput}
    {placeholder}
    use:popup={tagsPopup} />
</div>

<div
  class="card w-fit max-h-[100cqh] max-w-[100cqw] box-border shadow-xl overflow-y-hidden z-10"
  data-popup={tagsPopup.target}>
  {#await availableTagOptionsPromise}
    <ProgressRadial width="w-12 mx-auto my-4" />
  {:then availableOptions}
    <div class="flex max-h-[inherit] h-[inherit] w-full [&>.virtual-scroll-root]:w-full">
      <VirtualScroll data={filterOptions(availableOptions || [], tagInput)} let:data key="value">
        <button class="btn variant-soft w-full mb-1 rounded-sm fontloading" onclick={() => onIncludeTagSelected(data)}>
          {data.label}
        </button>
      </VirtualScroll>
    </div>
  {/await}
</div>
