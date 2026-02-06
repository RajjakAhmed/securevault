
import { supabase } from "./supabase";

export async function deleteEncryptedFromStorage(storageKey: string) {
  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .remove([storageKey]);

  if (error) {
    throw new Error("Supabase delete failed: " + error.message);
  }
}
