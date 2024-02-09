<script lang="ts">
  export let src: string;

  let container: HTMLDivElement;

  let { class: exClass, ...otherProps } = $$restProps;

  $: {
    loadSvg(src);
  }

  async function loadSvg(uri: string) {
    let plainSvg: string = '';
    if (uri) {
      plainSvg = await fetch(uri).then(r => r.text());
    }

    container.innerHTML = plainSvg;
  }
</script>

<div bind:this={container} class="contents {exClass || ''}" {...otherProps}></div>
