import crypto from "crypto";
import fs from "fs";

const algorithm = "aes-256-cbc";
const key = crypto
  .createHash("sha256")
  .update(process.env.FILE_ENCRYPTION_KEY as string)
  .digest();

export const encryptFile = (inputPath: string, outputPath: string) => {
  return new Promise<void>((resolve, reject) => {
    const iv = crypto.randomBytes(16);

    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    // Write IV first
    output.write(iv);

    input
      .pipe(cipher)
      .pipe(output)
      .on("finish", () => resolve())
      .on("error", (err) => reject(err));
  });
};
