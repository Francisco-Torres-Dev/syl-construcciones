import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Readable } from 'stream';
import { config } from '../config';

const s3 = () =>
  new S3Client({
    region: config.storage.s3.region,
    endpoint: config.storage.s3.endpoint,
    forcePathStyle: Boolean(config.storage.s3.endpoint),
    credentials: {
      accessKeyId: config.storage.s3.accessKeyId,
      secretAccessKey: config.storage.s3.secretAccessKey,
    },
  });

const localPath = (key: string) => {
  const full = path.resolve(config.storage.localDir, key);
  if (!full.startsWith(path.resolve(config.storage.localDir) + path.sep)) throw new Error('Ruta inválida');
  return full;
};

export async function saveFile(buf: Buffer, ext: string, folder: string, mime: string): Promise<string> {
  const key = `${folder}/${crypto.randomUUID()}${ext}`;
  if (config.storage.driver === 's3') {
    await s3().send(new PutObjectCommand({ Bucket: config.storage.s3.bucket, Key: key, Body: buf, ContentType: mime }));
  } else {
    const full = localPath(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, buf);
  }
  return key;
}

export async function readFile(key: string): Promise<Readable> {
  if (config.storage.driver === 's3') {
    const out = await s3().send(new GetObjectCommand({ Bucket: config.storage.s3.bucket, Key: key }));
    return out.Body as Readable;
  }
  const handle = await fs.open(localPath(key));
  return handle.createReadStream();
}

export async function deleteFile(key: string) {
  if (config.storage.driver === 's3') {
    await s3().send(new DeleteObjectCommand({ Bucket: config.storage.s3.bucket, Key: key }));
  } else {
    await fs.rm(localPath(key), { force: true });
  }
}
