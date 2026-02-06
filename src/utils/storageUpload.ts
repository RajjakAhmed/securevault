import fs from "fs";
import { supabase } from "./supabase";

export const uploadEncryptedToStorage = async (
  filePath: string,
  storageKey: string
) => {
  const fileBuffer = fs.readFileSync(filePath);

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET as string)
    .upload(storageKey, fileBuffer, {
      contentType: "application/octet-stream",
      upsert: true,
    });

  if (error) throw error;

  return data.path;
};
