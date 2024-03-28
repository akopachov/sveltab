<script lang="ts">
  import { Accordion, AccordionItem, Tab, TabGroup } from '@skeletonlabs/skeleton';
  import FlatUIColorPallets from 'flat-ui-colors-json/palettes.json';
  import 'vanilla-colorful/hex-alpha-color-picker.js';
  import 'vanilla-colorful/hex-input.js';

  export let color: string;
  export let hexInput: boolean;

  enum Tabs {
    Picker,
    Pallet,
  }

  let currentTab: Tabs = Tabs.Picker;

  function onColorChanged(event: CustomEvent<{ value: string }>) {
    color = event.detail.value;
  }
</script>

<TabGroup>
  <Tab bind:group={currentTab} name="picker" value={Tabs.Picker}>Color picker</Tab>
  <Tab bind:group={currentTab} name="pallet" value={Tabs.Pallet}>Pallet</Tab>
  <svelte:fragment slot="panel">
    {#if currentTab === Tabs.Picker}
      <div class="flex flex-col items-center gap-3 w-min px-4 pt-1 pb-3">
        <hex-alpha-color-picker {color} on:color-changed={onColorChanged}></hex-alpha-color-picker>
        {#if hexInput}
          <hex-input {color} alpha="true" prefixed="true" on:color-changed={onColorChanged} class="w-2/3">
            <input type="text" class="input text-center" />
          </hex-input>
        {/if}
      </div>
    {:else if currentTab === Tabs.Pallet}
      <div class="w-72">
        <Accordion autocollapse>
          {#each FlatUIColorPallets as pallet}
            <AccordionItem>
              <svelte:fragment slot="lead">{pallet.emoji}</svelte:fragment>
              <svelte:fragment slot="summary">{pallet.name}</svelte:fragment>
              <svelte:fragment slot="content">
                <div class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(1.8rem,1fr))] w-full">
                  {#each pallet.colors as c}
                    <label
                      style:--sv-outline-color={c.hex}
                      class="[&>input:checked_~_span]:outline-[var(--sv-outline-color)] [&>input:checked~span]:outline-3 [&>input:checked~span]:outline aspect-square">
                      <input type="radio" class="hidden" value={c.hex} bind:group={color} />
                      <span style:background-color={c.hex} class="block w-full h-full cursor-pointer"></span>
                    </label>
                  {/each}
                </div>
              </svelte:fragment>
            </AccordionItem>
          {/each}
        </Accordion>
      </div>
    {/if}
  </svelte:fragment>
</TabGroup>

<style lang="postcss">
  hex-alpha-color-picker::part(saturation-pointer),
  hex-alpha-color-picker::part(hue-pointer),
  hex-alpha-color-picker::part(alpha-pointer) {
    @apply h-[24px] w-[24px];
  }
</style>
