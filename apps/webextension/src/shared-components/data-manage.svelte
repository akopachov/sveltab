<script lang="ts">
  import type { WorkspaceInstance } from '$lib/workspace-instance';
  import type { WorkspaceSettingsInitial } from '$lib/workspace-settings';
  import { FileButton } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
  import { logger } from '$lib/logger';
  import { Workspaces } from '$stores/workspace-index';
  import { CommonToastType, getToastFacade } from '$lib/toast-facade';
  import { version } from '$app/environment';
  import { Opfs, OpfsSchema } from '$lib/opfs';
  import { Zip, ZipDeflate, ZipPassThrough, strToU8, Unzip, UnzipInflate } from 'fflate';
  import { secondsToMilliseconds } from 'date-fns';

  const log = logger.getSubLogger({ prefix: ['Shared Components', 'ImportExport'] });
  const toastFacade = getToastFacade();
  const BundledWorkspacesJsonFileName = 'workspaces.json';

  type WorkspacesExportObject = { [key: string]: WorkspaceSettingsInitial };
  type ExportObject = {
    version: number;
    appVersion: string;
    workspaces: WorkspacesExportObject;
    defaultWorkspaceId: string;
  };

  let {
    activeWorkspaceId = $bindable(),
    activeWorkspace = $bindable(),
    dataImported,
  }: { activeWorkspaceId: string; activeWorkspace?: WorkspaceInstance; dataImported?: () => void } = $props();

  let importFiles: FileList;

  async function* streamToIterable<T>(stream: ReadableStream<T>): AsyncGenerator<T> {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }

  async function exportData() {
    if (activeWorkspace?.hasChanges.value === true) {
      await Workspaces.save(activeWorkspaceId, activeWorkspace);
    }

    const tempExportFilePath = `${OpfsSchema}://__export.zip`;
    const exportStream = await Opfs.createWritable(tempExportFilePath);
    const bundle = new Zip(async (_err, data, final) => {
      await exportStream.write(data);
      if (final) {
        await exportStream.close();
        const blob = await Opfs.get(tempExportFilePath);
        const downloadUrl = URL.createObjectURL(blob);
        try {
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `SvelTab_Export_${new Date().toISOString().replace(/[:.]/g, '-')}.svtx`;
          document.body.append(link);
          link.click();
          link.remove();
        } finally {
          URL.revokeObjectURL(downloadUrl);
          setTimeout(() => {
            Opfs.remove(tempExportFilePath);
          }, secondsToMilliseconds(1));
        }
      }
    });
    const workspacesExportData: WorkspacesExportObject = {};
    for (const wi of await Workspaces.entries) {
      const { settings: workspaceSettings } = await Workspaces.getInitialSettings(wi.id);
      workspacesExportData[wi.id] = workspaceSettings;
      if (workspaceSettings.assets) {
        for (const assetPath of workspaceSettings.assets) {
          const zipAsset = new ZipPassThrough(assetPath.replace(`${OpfsSchema}://`, ''));
          bundle.add(zipAsset);
          const assetsFile = await Opfs.get(assetPath);
          for await (const value of streamToIterable(assetsFile.stream())) {
            zipAsset.push(value);
          }

          zipAsset.push(new Uint8Array(0), true);
        }
      }
    }

    const exportObject: ExportObject = {
      version: 1,
      appVersion: version,
      workspaces: workspacesExportData,
      defaultWorkspaceId: activeWorkspaceId,
    };

    const workspacesDeflate = new ZipDeflate(BundledWorkspacesJsonFileName, { level: 9 });
    bundle.add(workspacesDeflate);
    workspacesDeflate.push(strToU8(JSON.stringify(exportObject, null, '  ')), true);

    bundle.end();
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
      let importData: Partial<ExportObject> | undefined;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'json') {
        importData = await importDataJson(file);
      } else if (fileExtension === 'svtx' || fileExtension === 'zip') {
        importData = await importDataZip(file);
      } else {
        throw new Error(m.DataManage_Restore_Error_InvalidFileType());
      }

      await Workspaces.setDefault(importData!.defaultWorkspaceId || (await Workspaces.entries)[0].id);
      ({ id: activeWorkspaceId, workspace: activeWorkspace } = await Workspaces.getDefault());

      dataImported && dataImported();
      activeWorkspace = activeWorkspace;
      toastFacade.show(
        m.DataManage_Restore_SuccessfullyDone({ count: Object.keys(importData!.workspaces!).length }),
        CommonToastType.Success,
      );
    } catch (e) {
      log.warn('An error occurred during importing', e);
      toastFacade.show(m.DataManage_Restore_Error(), CommonToastType.Error, { errorObj: e });
    }
  }

  async function importDataZip(file: File) {
    let importedDataPromise: Promise<Partial<ExportObject>> | undefined;
    const unzipWorkspaces = new Unzip(async stream => {
      if (stream.name === BundledWorkspacesJsonFileName) {
        const workspaceBlobParts: BlobPart[] = [];
        stream.ondata = (_err, chunk, final) => {
          workspaceBlobParts.push(chunk);
          if (final) {
            const workspaceBlob = new Blob(workspaceBlobParts);
            importedDataPromise = importDataJson(workspaceBlob);
          }
        };
        stream.start();
      }
    });
    unzipWorkspaces.register(UnzipInflate);
    for await (const value of streamToIterable(file.stream())) {
      unzipWorkspaces.push(value);
      if (importedDataPromise) {
        break;
      }
    }

    unzipWorkspaces.push(new Uint8Array(0), true);

    if (!importedDataPromise) {
      throw new Error(m.DataManage_Restore_Error_NothingToImport());
    }

    const importedData = await importedDataPromise;

    const unzipAssets = new Unzip(async stream => {
      if (stream.name !== BundledWorkspacesJsonFileName) {
        const writable = await Opfs.createWritable(`${OpfsSchema}://${stream.name}`);
        stream.ondata = async (_err, chunk, final) => {
          await writable.write(chunk);
          if (final) {
            await writable.close();
          }
        };
        stream.start();
      }
    });

    unzipAssets.register(UnzipInflate);
    for await (const value of streamToIterable(file.stream())) {
      unzipAssets.push(value);
    }

    unzipAssets.push(new Uint8Array(0), true);

    return importedData;
  }

  async function importDataJson(file: File | Blob) {
    const importData = <Partial<ExportObject & { data: Record<string, string> }>>JSON.parse(await file.text());
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

    await Opfs.wipe();

    if (importData.data) {
      for (const [filePath, base64] of Object.entries(importData.data)) {
        const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
        await Opfs.save(filePath, arrayBuffer);
      }
    }

    return importData;
  }
</script>

<div class="flex flex-col gap-1">
  <button class="btn btn-md variant-soft" onclick={exportData}>{m.DataManage_Backup()}</button>
  <FileButton
    class="btn btn-md variant-soft"
    name="files"
    button=""
    width="w-full"
    bind:files={importFiles}
    on:change={importData}
    accept=".json,.svtx">
    {m.DataManage_Restore()}
  </FileButton>
</div>
