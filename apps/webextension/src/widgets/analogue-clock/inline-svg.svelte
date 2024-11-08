<script lang="ts">
  let { src, class: exClass, ...otherProps }: { src: string; class?: string; [key: string]: unknown } = $props();

  let container: HTMLDivElement | undefined = $state();

  $effect(() => {
    loadSvg(src);
  });

  async function loadSvg(uri: string) {
    if (!container) {
      return;
    }

    let plainSvg: string = '';
    if (uri) {
      plainSvg = await fetch(uri).then(r => r.text());
    }

    container.innerHTML = plainSvg;
  }
</script>

<div bind:this={container} class="contents {exClass || ''}" {...otherProps}></div>
