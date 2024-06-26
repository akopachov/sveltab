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
    const [dirHandle, fileName] = await this.#parseOpfsUrl(opfsFileUrl, true);
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable({ keepExistingData: false });
    await writable.write(data);
    await writable.close();
  }

  async createWritable(opfsFileUrl: string) {
    const [dirHandle, fileName] = await this.#parseOpfsUrl(opfsFileUrl, true);
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    return await fileHandle.createWritable({ keepExistingData: false });
  }

  async remove(opfsFileUrl: string) {
    const [dirHandle, fileName] = await this.#parseOpfsUrl(opfsFileUrl);
    await dirHandle.removeEntry(fileName, { recursive: true });
  }

  async wipe() {
    const opfsRoot = await this.#opfsRoot.value;
    for await (let name of opfsRoot.keys()) {
      opfsRoot.removeEntry(name, { recursive: true });
    }
  }

  async get(opfsFileUrl: string) {
    const [dirHandle, fileName] = await this.#parseOpfsUrl(opfsFileUrl);
    return await dirHandle.getFileHandle(fileName, { create: false }).then(h => h.getFile());
  }

  async #parseOpfsUrl(opfsUrl: string, create?: boolean): Promise<[FileSystemDirectoryHandle, string]> {
    if (opfsUrl.startsWith(`${OpfsSchema}://`)) {
      opfsUrl = opfsUrl.substring(OpfsSchema.length + 3);
    }

    const parts = opfsUrl.split('/');
    const fileName = parts.pop()!;
    let dirHandle = await this.#opfsRoot.value;
    for (const part of parts) {
      dirHandle = await dirHandle.getDirectoryHandle(part, { create: create });
    }

    return [dirHandle, fileName];
  }
}

export const Opfs = new OpfsManager();
