import Dexie from 'dexie';

const filesDb = new Dexie('FilesStorage');

const oneWeekInMS = 604_800_000;
const twelveHoursInMS = 43_200_000;

const lastCacheCheckKey = 'last_cache_check';

filesDb.version(1).stores({
  files: 'fileId,file,created',
});

export function dropOldCache() {
  const lastCheckTime: number = Number(localStorage.getItem(lastCacheCheckKey));

  if (Date.now() - lastCheckTime < twelveHoursInMS) {
    return;
  }

  return (filesDb as any).files
    .where('created')
    .below(Date.now() - oneWeekInMS)
    .delete()
    .then(() => localStorage.setItem(lastCacheCheckKey, String(Date.now())));
}

export async function addFileToDb(fileId: string, file: File): Promise<void> {
  try {
    await (filesDb as any).files.add({ fileId, file, created: Date.now() });
  } catch (e: unknown) {
    // @ts-ignore
    if (e.message.includes('Key already exists in the object store.')) return;

    throw e;
  }
}

export async function getFileFromDb(fileId: string): Promise<Nullable<File>> {
  try {
    const result = await (filesDb as any).files
      .where('fileId')
      .equals(fileId)
      .first();

    return result?.file;
  } catch (_) {
    return null;
  }
}

export function removeFileFromDb(fileId: string): Promise<void> {
  return (filesDb as any).files.where('fileId').equals(fileId).delete();
}
