import crypto from "node:crypto";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

export type SavedAudio = {
  storageKey: string;
  byteSize: number;
  checksum: string;
  mimeType: string;
  originalFileName: string;
};

export type AudioDescriptor = {
  size: number;
  mimeType: string;
  createStream: (options?: { start?: number; end?: number }) => Readable;
};

export interface AudioStorage {
  save(input: {
    buffer: Buffer;
    mimeType: string;
    originalFileName: string;
    therapistId: string;
    patientId: string;
  }): Promise<SavedAudio>;
  getDescriptor(storageKey: string, mimeType: string): Promise<AudioDescriptor>;
  remove(storageKey: string): Promise<void>;
}

class LocalAudioStorage implements AudioStorage {
  private root = path.resolve(process.cwd(), process.env.AUDIO_STORAGE_ROOT ?? "storage/audio");

  async save(input: {
    buffer: Buffer;
    mimeType: string;
    originalFileName: string;
    therapistId: string;
    patientId: string;
  }) {
    const extension = path.extname(input.originalFileName) || ".bin";
    const fileName = `${crypto.randomUUID()}${extension.toLowerCase()}`;
    const storageKey = path.posix.join(input.therapistId, input.patientId, fileName);
    const absolutePath = path.join(this.root, storageKey);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, input.buffer);

    return {
      storageKey,
      byteSize: input.buffer.byteLength,
      checksum: crypto.createHash("sha256").update(input.buffer).digest("hex"),
      mimeType: input.mimeType,
      originalFileName: input.originalFileName
    };
  }

  async getDescriptor(storageKey: string, mimeType: string) {
    const absolutePath = path.join(this.root, storageKey);
    const stat = await fs.stat(absolutePath);

    return {
      size: stat.size,
      mimeType,
      createStream: (options?: { start?: number; end?: number }) =>
        createReadStream(absolutePath, {
          start: options?.start,
          end: options?.end
        })
    };
  }

  async remove(storageKey: string) {
    const absolutePath = path.join(this.root, storageKey);
    await fs.rm(absolutePath, { force: true });
  }
}

export const audioStorage: AudioStorage = new LocalAudioStorage();
