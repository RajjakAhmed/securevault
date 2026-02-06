import crypto from "crypto";
import fs from "fs";

const algorithm = "aes-256-cbc";

export const decryptFile = (inputPath: string, outputPath: string) => {
  const secret = process.env.FILE_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error("FILE_ENCRYPTION_KEY missing in .env");
  }

  const key = crypto.createHash("sha256").update(secret).digest();

  const input = fs.createReadStream(inputPath);

  // Read IV from first 16 bytes
  let iv: Buffer;

  input.once("readable", () => {
    iv = input.read(16);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    const output = fs.createWriteStream(outputPath);

    input.pipe(decipher).pipe(output);
  });
};
