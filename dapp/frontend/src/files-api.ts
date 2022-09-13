import { addFileToDb, getFileFromDb } from '~/files-db';
import { files_backend as filesActor } from '../../../declarations/files_backend';

export const CHUNK_SIZE = 1024 * 1024;
export const MAX_FILE_SIZE = 1024 * 1024 * 50;

export function splitFile(file: File, chunksCount: number): Array<Blob> {
  const chunks = new Array(chunksCount).fill(null).map((_, index) => index);

  return chunks.map((chunkIndex: number) =>
    file.slice(chunkIndex * CHUNK_SIZE, chunkIndex * CHUNK_SIZE + CHUNK_SIZE),
  );
}

/**
 * @param {File} file
 * @returns {Promise<string>} uploaded file uuid
 */
export function uploadFile(file: File): Promise<string> {
  return filesActor
    .createFile({
      name: file.name,
      size: BigInt(file.size),
      mimeType: file.type,
    })
    .then((response) => {
      if ('ok' in response) {
        const fileInfo = response.ok;
        const fileChunks = splitFile(file, Number(fileInfo.chunkCount));

        return Promise.all([
          Promise.resolve(fileInfo),
          Promise.all(
            fileChunks.map(async (chunk: Blob, index: number) => {
              const buffer = await chunk.arrayBuffer();

              return filesActor.uploadChunk(
                fileInfo.id,
                BigInt(index),
                Array.from(new Uint8Array(buffer)),
              );
            }),
          ),
        ]);
      }
    })
    .then((response) => {
      if (!response) {
        throw new Error('failed to upload file');
      }

      const [fileInfo] = response;

      return fileInfo.id;
    });
}

export function downloadFile(fileId: string): Promise<File | undefined> {
  return filesActor
    .getFile(fileId)
    .then((response) => {
      if ('ok' in response) {
        const fileInfo = response.ok;
        const chunks = new Array(Number(fileInfo.chunkCount))
          .fill(null)
          .map((_, index) => index);

        return Promise.all([
          Promise.resolve(fileInfo),
          Promise.all(
            chunks.map((chunkIndex) =>
              filesActor.getChunk(fileInfo.id, BigInt(chunkIndex)),
            ),
          ),
        ]);
      }
    })
    .then((response) => {
      if (!response) {
        return;
      }

      const [fileInfo, chunks] = response;

      const buffers: Array<Uint8Array> = chunks.map((res) => {
        if ('ok' in res) {
          return new Uint8Array(res.ok);
        }

        throw new Error('Failed to get chunk');
      });

      return new File(buffers, fileInfo.name, {
        type: fileInfo.mimeType,
      });
    });
}

export async function getFileUrl(fileId: string): Promise<string> {
  const cachedFile = await getFileFromDb(fileId);

  if (cachedFile) {
    return URL.createObjectURL(cachedFile);
  }

  return downloadFile(fileId)
    .then((file) => {
      if (!file) {
        throw new Error(`Failed to load file with id ${fileId}`);
      }

      return Promise.all([Promise.resolve(file), addFileToDb(fileId, file)]);
    })
    .then(([file]) => URL.createObjectURL(file));
}
