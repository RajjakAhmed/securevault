import crypto from "crypto";
import fs from "fs";

const algorithm = "aes-256-cbc";
const key = crypto
  .createHash("sha256")
  .update(process.env.FILE_ENCRYPTION_KEY as string)
  .digest();

export const decryptFile = (inputPath: string, outputPath: string) => {
  return new Promise<void>((resolve, reject) => {
    const input = fs.createReadStream(inputPath);

    let iv: Buffer;

    input.once("readable", () => {
      iv = input.read(16);

      const decipher = crypto.createDecipheriv(algorithm, key, iv);

      const output = fs.createWriteStream(outputPath);

      input
        .pipe(decipher)
        .pipe(output)
        .on("finish", () => resolve())
        .on("error", (err) => reject(err));
    });
  });
};
