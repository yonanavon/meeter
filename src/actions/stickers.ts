"use server";

import { prisma } from "@/lib/prisma";
import { whatsapp } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export async function getPendingStickers() {
  return whatsapp.getPendingStickers();
}

export async function savePendingSticker(index: number) {
  const stickers = whatsapp.getPendingStickers();
  const sticker = stickers[index];
  if (!sticker) throw new Error("Sticker not found");

  await prisma.sticker.create({
    data: {
      base64: sticker.base64,
      mimetype: sticker.mimetype,
    },
  });
  whatsapp.clearPendingSticker(index);
  revalidatePath("/admin/stickers");
}

export async function dismissPendingSticker(index: number) {
  whatsapp.clearPendingSticker(index);
}

export async function getApprovedStickers() {
  return prisma.sticker.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllStickers() {
  return prisma.sticker.findMany({ orderBy: { createdAt: "desc" } });
}

export async function toggleStickerApproval(id: number) {
  const sticker = await prisma.sticker.findUnique({ where: { id } });
  if (!sticker) throw new Error("Sticker not found");
  await prisma.sticker.update({
    where: { id },
    data: { approved: !sticker.approved },
  });
  revalidatePath("/admin/stickers");
}

export async function updateStickerLabel(id: number, label: string) {
  await prisma.sticker.update({ where: { id }, data: { label } });
  revalidatePath("/admin/stickers");
}

export async function deleteSticker(id: number) {
  await prisma.sticker.delete({ where: { id } });
  revalidatePath("/admin/stickers");
}
