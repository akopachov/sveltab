<script lang="ts">
  let { ...restProps } = $props();
</script>

<nav {...restProps}>
  <a href="https://github.com/akopachov/sveltab" class="btn text-gray-200 bg-gray-900 hover:bg-gray-800 ml-3">
    <span class="w-6 h-6 icon-[mdi--github]"></span>
    GitHub
  </a>
</nav>
