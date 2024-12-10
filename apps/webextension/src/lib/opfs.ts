import { WeakLazy, type LazyLike } from './lazy';

declare global {
  interface FileSystemDirectoryHandle {
    /**
     * Returns an async iterator that yields the names of the entries in the directory.
     * @returns An async iterator of strings representing the names of the entries in the directory.
     */
    keys(): AsyncIterableIterator<string>;
  }
}

export const OpfsSchema = 'opfs';

export class OpfsManager {
  #opfsRoot: LazyLike<Promise<FileSystemDirectoryHandle>>;

  constructor() {
    this.#opfsRoot = new WeakLazy(() => navigator.storage.getDirectory());
  }

  async isAvailable() {
    try {
      const opfsRoot = await this.#opfsRoot.value;
      return !!opfsRoot;
    } catch {
      return false;
    }
  }

  async save(opfsFileUrl: string, data: ArrayBufferLike | Blob) {
    const [fileName, dirHandle] = await this.#parseOpfsUrl(opfsFileUrl, true);
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable({ keepExistingData: false });
    await writable.write(data);
    await writable.close();
  }

  async createWritable(opfsFileUrl: string) {
    const [fileName, dirHandle] = await this.#parseOpfsUrl(opfsFileUrl, true);
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    return await fileHandle.createWritable({ keepExistingData: false });
  }

  async remove(opfsFileUrl: string) {
    const [fileName, ...dirHandles] = await this.#parseOpfsUrl(opfsFileUrl);
    await dirHandles[0].removeEntry(fileName, { recursive: true });
    for (let i = 0; i < dirHandles.length; i++) {
      const dirHandle = dirHandles[i];
      let isEmpty = true;
      for await (let _ of dirHandle.keys()) {
        isEmpty = false;
        break;
      }

      if (isEmpty && i + 1 < dirHandles.length) {
        await dirHandles[i + 1].removeEntry(dirHandles[i].name, { recursive: true });
      } else {
        break;
      }
    }
  }

  async wipe() {
    const opfsRoot = await this.#opfsRoot.value;
    for await (let name of opfsRoot.keys()) {
      await opfsRoot.removeEntry(name, { recursive: true });
    }
  }

  async get(opfsFileUrl: string) {
    const [fileName, dirHandle] = await this.#parseOpfsUrl(opfsFileUrl);
    return await dirHandle.getFileHandle(fileName, { create: false }).then(h => h.getFile());
  }

  async #parseOpfsUrl(opfsUrl: string, create?: boolean): Promise<[string, ...FileSystemDirectoryHandle[]]> {
    if (opfsUrl.startsWith(`${OpfsSchema}://`)) {
      opfsUrl = opfsUrl.substring(OpfsSchema.length + 3);
    }

    const parts = opfsUrl.split('/');
    const fileName = parts.pop()!;
    let dirHandle = await this.#opfsRoot.value;
    const allDirHandles = [dirHandle];
    for (const part of parts) {
      dirHandle = await dirHandle.getDirectoryHandle(part, { create: create });
      allDirHandles.push(dirHandle);
    }

    allDirHandles.reverse();

    return [fileName, ...allDirHandles];
  }
}

export const Opfs = new OpfsManager();
