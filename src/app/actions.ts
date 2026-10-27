"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LIST_COOKIE } from "@/lib/lists";
import { isValidZip, ZIP_COOKIE } from "@/lib/location";
import { TEMPLATES } from "@/lib/templates";

const YEAR = 60 * 60 * 24 * 365;

export async function setZip(formData: FormData) {
  const zip = String(formData.get("zip") ?? "").trim();
  const store = await cookies();
  if (isValidZip(zip)) {
    store.set(ZIP_COOKIE, zip, { maxAge: YEAR, path: "/", sameSite: "lax" });
  } else if (zip === "") {
    store.delete(ZIP_COOKIE);
  }
  refresh();
}

// ─── Project lists ──────────────────────────────────────────
// No accounts yet: the list id is the credential (an unguessable cuid in a
// cookie / share link).

const clampQty = (v: FormDataEntryValue | null) => Math.min(9999, Math.max(1, Math.floor(Number(v) || 1)));

/** The shopper's list, created on first use. */
async function ensureList() {
  const store = await cookies();
  const id = store.get(LIST_COOKIE)?.value;
  if (id && (await db.projectList.findUnique({ where: { id }, select: { id: true } }))) return id;
  const list = await db.projectList.create({ data: {} });
  store.set(LIST_COOKIE, list.id, { maxAge: YEAR, path: "/", sameSite: "lax" });
  return list.id;
}

export interface AddToListState {
  added: number;
  listId: string | null;
}

export async function addToList(_prev: AddToListState, formData: FormData): Promise<AddToListState> {
  const productId = String(formData.get("productId"));
  const quantity = clampQty(formData.get("quantity"));
  const listId = await ensureList();
  await db.projectItem.upsert({
    where: { listId_productId: { listId, productId } },
    create: { listId, productId, quantity },
    update: { quantity: { increment: quantity } },
  });
  refresh();
  return { added: quantity, listId };
}

export async function updateQuantity(formData: FormData) {
  const itemId = String(formData.get("itemId"));
  await db.projectItem.update({ where: { id: itemId }, data: { quantity: clampQty(formData.get("quantity")) } });
  refresh();
}

export async function removeItem(formData: FormData) {
  await db.projectItem.deleteMany({ where: { id: String(formData.get("itemId")) } });
  refresh();
}

export async function renameList(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (name) await db.projectList.update({ where: { id: String(formData.get("listId")) }, data: { name } });
  refresh();
}

export async function loadTemplate(formData: FormData) {
  const template = TEMPLATES.find((t) => t.key === formData.get("template"));
  if (!template) return;
  const listId = await ensureList();
  const products = await db.product.findMany({
    where: { slug: { in: template.items.map((i) => i.slug) } },
    select: { id: true, slug: true },
  });
  const ids = new Map(products.map((p) => [p.slug, p.id]));
  await db.$transaction([
    db.projectList.update({ where: { id: listId }, data: { name: template.name } }),
    ...template.items
      .filter((i) => ids.has(i.slug))
      .map((i) =>
        db.projectItem.upsert({
          where: { listId_productId: { listId, productId: ids.get(i.slug)! } },
          create: { listId, productId: ids.get(i.slug)!, quantity: i.quantity },
          update: { quantity: i.quantity },
        }),
      ),
  ]);
  redirect(`/lists/${listId}`);
}

/** Start a fresh, empty list (the old one stays reachable by its link). */
export async function startNewList() {
  const list = await db.projectList.create({ data: {} });
  (await cookies()).set(LIST_COOKIE, list.id, { maxAge: YEAR, path: "/", sameSite: "lax" });
  redirect("/list");
}

/** Copy a shared list into a new list owned by this browser. */
export async function copyList(formData: FormData) {
  const source = await db.projectList.findUnique({
    where: { id: String(formData.get("listId")) },
    include: { items: true },
  });
  if (!source) return;
  const list = await db.projectList.create({
    data: {
      name: source.name,
      items: { create: source.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
    },
  });
  (await cookies()).set(LIST_COOKIE, list.id, { maxAge: YEAR, path: "/", sameSite: "lax" });
  redirect(`/lists/${list.id}`);
}
