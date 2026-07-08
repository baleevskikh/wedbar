import { nanoid } from "nanoid";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { getUploadsDir } from "./db";
import { ValidationError } from "./errors";

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const videoTypes = new Map([
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
]);

export async function saveImage(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!imageTypes.has(file.type)) {
    throw new ValidationError("Изображение должно быть jpeg, png или webp");
  }

  if (file.size > 12 * 1024 * 1024) {
    throw new ValidationError("Изображение слишком большое");
  }

  const filename = `${nanoid(14)}.webp`;
  const outputPath = path.join(getUploadsDir(), filename);
  const input = Buffer.from(await file.arrayBuffer());

  await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 2200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(outputPath);

  return filename;
}

export async function saveVideo(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  const extension = videoTypes.get(file.type);
  if (!extension) {
    throw new ValidationError("Видео должно быть mp4 или webm");
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new ValidationError("Видео должно быть не больше 50 МБ");
  }

  const filename = `${nanoid(14)}.${extension}`;
  await fs.writeFile(path.join(getUploadsDir(), filename), Buffer.from(await file.arrayBuffer()));
  return filename;
}
