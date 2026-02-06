import fs from "fs";
import { supabase } from "./supabase";

export const downloadEncryptedFromStorage = async (
  storageKey: string,
  outputPath: string
) => {
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET as string)
    .download(storageKey);

  if (error) throw error;

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(outputPath, buffer);
};
