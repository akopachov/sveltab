<script lang="ts">
  import { opfsSrc } from '$actions/opfs-src';
  import type { WorkspaceInstance } from '$lib/workspace-instance';

  let { workspaceInstance }: { workspaceInstance: WorkspaceInstance } = $props();

  let icon16 = $derived(workspaceInstance.favicon[16]);
  let icon32 = $derived(workspaceInstance.favicon[32]);
  let icon48 = $derived(workspaceInstance.favicon[48]);
  let iconIco = $derived(workspaceInstance.favicon.ico);
</script>

<link rel="icon" type="image/png" sizes="48x48" use:opfsSrc={icon48.value || './favicon/favicon-48x48.png'} />
<link rel="icon" type="image/png" sizes="32x32" use:opfsSrc={icon32.value || './favicon/favicon-32x32.png'} />
<link rel="icon" type="image/png" sizes="16x16" use:opfsSrc={icon16.value || './favicon/favicon-16x16.png'} />
<link rel="shortcut icon" use:opfsSrc={iconIco.value || './favicon/favicon.ico'} />
