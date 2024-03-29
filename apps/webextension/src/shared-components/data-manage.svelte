<script lang="ts">
  import type { WorkspaceInstance } from '$lib/workspace-instance';
  import type { WorkspaceSettingsInitial } from '$lib/workspace-settings';
  import { FileButton } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
  import { logger } from '$lib/logger';
  import { Workspaces } from '$stores/workspace-index';
  import { CommonToastType, getToastFacade } from '$lib/toast-facade';

  const log = logger.getSubLogger({ prefix: ['Shared Components', 'ImportExport'] });
  const toastFacade = getToastFacade();

  type WorkspacesExportObject = { [key: string]: WorkspaceSettingsInitial };
  type ExportObject = { version: number; workspaces: WorkspacesExportObject; defaultWorkspaceId: string };

  export let activeWorkspaceId: string;
  export let activeWorkspace: WorkspaceInstance | undefined;

  let importFiles: FileList;

  async function exportData() {
    if (activeWorkspace?.hasChanges.value === true) {
      await Workspaces.save(activeWorkspaceId, activeWorkspace);
    }

    const workspacesExportData: WorkspacesExportObject = {};
    for (const wi of Workspaces.entries) {
      const workspaceSettings = await Workspaces.getInitialSettings(wi.id);
      workspacesExportData[wi.id] = workspaceSettings;
    }
    const exportObject: ExportObject = {
      version: 1,
      workspaces: workspacesExportData,
      defaultWorkspaceId: activeWorkspaceId,
    };
    const blob = new Blob([JSON.stringify(exportObject, null, '  ')], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `SvelTab_Export_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.insertAdjacentElement('beforeend', link);
      link.click();
      link.remove();
    } finally {
      URL.revokeObjectURL(downloadUrl);
    }
  }

  async function importData() {
    if (importFiles.length <= 0) {
      return;
    }

    if (activeWorkspace?.hasChanges.value === true) {
      await Workspaces.save(activeWorkspaceId, activeWorkspace);
    }

    const file = importFiles.item(0)!;
    try {
      const importData = <Partial<ExportObject>>JSON.parse(await file.text());
      if (importData?.version !== 1) {
        throw new Error(m.DataManage_Restore_Error_VersionMistmatch());
      }

      if (typeof importData.workspaces !== 'object') {
        throw new Error(m.DataManage_Restore_Error_MissingWorkspacesObject());
      }

      const importedWorkspaces = Object.entries(importData.workspaces);

      if (importedWorkspaces.length <= 0) {
        throw new Error(m.DataManage_Restore_Error_NothingToImport());
      }

      await Workspaces.wipeAll();
      for (const [id, initial] of importedWorkspaces) {
        await Workspaces.save(id, initial);
      }

      await Workspaces.setDefault(importData.defaultWorkspaceId || Workspaces.entries[0].id);
      ({ id: activeWorkspaceId, workspace: activeWorkspace } = await Workspaces.getDefault());
      activeWorkspace = activeWorkspace;
      toastFacade.show(
        m.DataManage_Restore_SuccessfullyDone({ count: importedWorkspaces.length }),
        CommonToastType.Success,
      );
    } catch (e) {
      log.warn('An error occurred during importing', e);
      toastFacade.show(m.DataManage_Restore_Error(), CommonToastType.Error, { errorObj: e });
    }
  }
</script>

<div class="flex flex-col gap-1">
  <button class="btn btn-md variant-soft" on:click={exportData}>{m.DataManage_Backup()}</button>
  <FileButton
    class="btn btn-md variant-soft"
    name="files"
    button=""
    width="w-full"
    bind:files={importFiles}
    on:change={importData}
    accept=".json">
    {m.DataManage_Restore()}
  </FileButton>
</div>
