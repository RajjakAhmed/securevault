import crypto from "crypto";
import fs from "fs";

const algorithm = "aes-256-cbc";

// Secret key must be 32 bytes
const key = crypto
  .createHash("sha256")
  .update(process.env.FILE_ENCRYPTION_KEY as string)
  .digest();

/**
 * Encrypts a file and saves encrypted version
 */
export const encryptFile = (inputPath: string, outputPath: string) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  // Save IV at start of file
  output.write(iv);

  input.pipe(cipher).pipe(output);
};
