<script lang="ts">
  import emblaCarouselSvelte from 'embla-carousel-svelte';
  import { onMount } from 'svelte';

  let emblaApi: any;
  let screenshotDialog: HTMLDialogElement;
  let clickedScreenshot: Screenshot | undefined;

  type Screenshot = {
    fullSrc: any;
    previewSrc: any;
    alt: string;
  };

  let screenshots: Screenshot[] = [];

  function onInit(event: any) {
    emblaApi = event.detail;
  }

  function openScreenshotDialog(screenshot: Screenshot) {
    clickedScreenshot = screenshot;
    screenshotDialog.showModal();
  }

  function onCloseScreenshotDialog() {
    clickedScreenshot = undefined;
  }

  onMount(() => {
    const fullPictures = import.meta.glob('../lib/screenshots/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}', {
      query: {
        enhanced: true,
      },
      eager: true,
    });
    const previewPictures = import.meta.glob('../lib/screenshots/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}', {
      query: {
        enhanced: true,
        w: 768,
      },
      eager: true,
    });
    screenshots = Object.entries(fullPictures).map(([path, src], i) => ({
      fullSrc: (<any>src).default,
      previewSrc: (<any>previewPictures[path]).default,
      alt: `Screenshot #${i + 1}`,
    }));
  });
</script>

<div>
  <div class="relative flex flex-col justify-center items-center mb-8" data-aos="zoom-y-out" data-aos-delay="450">
    <div class="relative flex flex-col justify-center items-center w-full">
      <div class="mockup-browser border bg-base-300 w-full md:w-[768px]">
        <div class="mockup-browser-toolbar">
          <div class="input"></div>
        </div>
        <div class="flex justify-center p-0 h-auto w-full bg-base-200">
          <section
            class="embla w-full h-full"
            use:emblaCarouselSvelte={{ options: { loop: true }, plugins: [] }}
            on:emblaInit={onInit}>
            <div class="embla__container w-full h-full">
              {#each screenshots as screenshot}
                <div class="flex-[0_0_100%] w-full h-full">
                  <button class="embla__slide__number" on:click={() => openScreenshotDialog(screenshot)}>
                    <enhanced:img
                      class="max-w-full max-h-full"
                      loading="lazy"
                      src={screenshot.previewSrc}
                      alt={screenshot.alt} />
                  </button>
                </div>
              {/each}
            </div>
          </section>
        </div>
      </div>
      <div
        class="flex flex-row justify-between min-w-fit w-full max-mdd:max-w-60 max-mdd:mt-3 mdd:absolute mdd:top-[calc(50%-1.5rem)] mdd:left-[calc(50%-384px-5rem)] mdd:w-[calc(768px+10rem)] pointer-events-none">
        <button
          class="btn btn-ghost pointer-events-auto"
          type="button"
          on:click={() => emblaApi.scrollPrev()}
          aria-label="Previous screenshot">
          <span class="w-9 h-9 icon-[ooui--previous-ltr]"></span>
        </button>

        <button
          class="btn btn-ghost pointer-events-auto"
          type="button"
          on:click={() => emblaApi.scrollNext()}
          aria-label="Next screenshot">
          <span class="w-9 h-9 icon-[ooui--previous-rtl]"></span>
        </button>
      </div>
    </div>
  </div>
  <dialog bind:this={screenshotDialog} class="modal">
    <div class="modal-box flex max-w-[calc(100vw-5em)] w-auto h-auto [&>picture]:contents">
      {#if clickedScreenshot}
        <enhanced:img class="object-contain" src={clickedScreenshot.fullSrc} alt={clickedScreenshot.alt} />
      {/if}
    </div>
    <form method="dialog" class="modal-backdrop">
      <button on:click={onCloseScreenshotDialog}>close</button>
    </form>
  </dialog>
</div>

<style lang="postcss">
  .embla {
    margin: auto;
    overflow: hidden;
  }
  .embla__container {
    backface-visibility: hidden;
    display: flex;
    touch-action: pan-y;
  }
  .embla__slide__number {
    box-shadow: inset 0 0 0 0.2rem var(--detail-medium-contrast);
    border-radius: 1.8rem;
    font-size: 4rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: fit-content;
  }
</style>
