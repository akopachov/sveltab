import { WeakLazy, type LazyLike } from './lazy';

export class OpfsManager {
  #opfsRoot: LazyLike<Promise<FileSystemDirectoryHandle>>;

  constructor() {
    this.#opfsRoot = new WeakLazy(() => navigator.storage.getDirectory());
  }

  async save(opfsFileUrl: string, data: ArrayBufferLike | Blob) {
    const [dirHandle, fileName] = await this.#parseOpfsUrl(opfsFileUrl, true);
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }

  async remove(opfsFileUrl: string) {
    const [dirHandle, fileName] = await this.#parseOpfsUrl(opfsFileUrl);
    await dirHandle.removeEntry(fileName, { recursive: true });
  }

  async wipe() {
    const opfsRoot = await this.#opfsRoot.getValue();
    for await (let name of (<any>opfsRoot).keys()) {
      opfsRoot.removeEntry(name, { recursive: true });
    }
  }

  async get(opfsFileUrl: string) {
    const [dirHandle, fileName] = await this.#parseOpfsUrl(opfsFileUrl);
    return await dirHandle.getFileHandle(fileName, { create: false }).then(h => h.getFile());
  }

  async #parseOpfsUrl(opfsUrl: string, create?: boolean): Promise<[FileSystemDirectoryHandle, string]> {
    if (opfsUrl.startsWith('opfs://')) {
      opfsUrl = opfsUrl.substring(7);
    }

    const parts = opfsUrl.split('/');
    const fileName = parts.pop()!;
    let dirHandle = await this.#opfsRoot.getValue();
    for (const part of parts) {
      dirHandle = await dirHandle.getDirectoryHandle(part, { create: create });
    }

    return [dirHandle, fileName];
  }
}

export const Opfs = new OpfsManager();
