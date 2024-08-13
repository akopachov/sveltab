import { Opfs } from './opfs';

export async function cacheDataToOpfs(opfsFilePath: string, dataProvider: () => Promise<Blob>): Promise<Blob | null> {
  if (await !Opfs.isAvailable()) {
    return null;
  }

  let file: Blob | null;
  try {
    file = await Opfs.get(opfsFilePath);
  } catch (e) {
    file = null;
  }

  if (file) {
    return file;
  }

  const data = await dataProvider();
  await Opfs.save(opfsFilePath, data);
  return data;
}

export async function cacheUrlToOpfs(opfsFilePath: string, url: string): Promise<string> {
  if (await !Opfs.isAvailable()) {
    return url;
  }

  const dataProvider = () => fetch(url).then(r => r.blob());
  const data = await cacheDataToOpfs(opfsFilePath, dataProvider);
  if (!data) {
    return url;
  }

  return URL.createObjectURL(data);
}

export async function dropCached(opfsFilePath: string) {
  if (await !Opfs.isAvailable()) {
    return;
  }

  try {
    await Opfs.remove(opfsFilePath);
  } catch (e) {
    // ignore
  }
}
