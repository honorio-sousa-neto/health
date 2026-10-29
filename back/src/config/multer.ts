import multer from "multer";
import path from "path";
export const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, "../../private/uploads"));
export const legacyUploadDirectory = path.resolve(__dirname, "../../public");
// Buffering is bounded; files are persisted only after content and purchase checks.
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 5, parts: 6 } });
export function fileType(buffer: Buffer): { extension: string; mime: string } | null {
  if (buffer.subarray(0, 5).toString() === "%PDF-") return { extension: "pdf", mime: "application/pdf" };
  if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { extension: "png", mime: "image/png" };
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return { extension: "jpg", mime: "image/jpeg" };
  return null;
}
