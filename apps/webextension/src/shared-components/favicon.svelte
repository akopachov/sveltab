<script lang="ts">
  import { opfsSrc } from '$actions/opfs-src';
  import type { WorkspaceInstance } from '$lib/workspace-instance';

  export let workspaceInstance: WorkspaceInstance | undefined;

  $: icon16 = workspaceInstance?.favicon[16];
  $: icon32 = workspaceInstance?.favicon[32];
  $: iconIco = workspaceInstance?.favicon.ico;
</script>

<link rel="icon" type="image/png" sizes="32x32" use:opfsSrc={$icon32 || './favicon/favicon-16x16.png'} />
<link rel="icon" type="image/png" sizes="16x16" use:opfsSrc={$icon16 || './favicon/favicon-16x16.png'} />
<link rel="shortcut icon" use:opfsSrc={$iconIco || './favicon/favicon.ico'} />
