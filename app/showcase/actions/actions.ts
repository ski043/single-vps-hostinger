"use server";

import { revalidatePath } from "next/cache";

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

const entries: GuestbookEntry[] = [];

export async function getEntries(): Promise<GuestbookEntry[]> {
  return [...entries].reverse();
}

export async function addEntry(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !message) {
    return;
  }

  entries.push({
    id: crypto.randomUUID(),
    name: name.slice(0, 60),
    message: message.slice(0, 280),
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/showcase/actions");
}
