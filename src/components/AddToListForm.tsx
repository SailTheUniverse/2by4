"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addToList, type AddToListState } from "@/app/actions";

export function AddToListForm({ productId, unitHint }: { productId: string; unitHint?: string }) {
  const [state, action, pending] = useActionState<AddToListState, FormData>(addToList, { added: 0, listId: null });

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="qty">
          Quantity
        </label>
        <input
          id="qty"
          name="quantity"
          type="number"
          min={1}
          max={9999}
          defaultValue={1}
          className="tabular w-20 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg border border-ink px-3 py-2 text-sm font-semibold hover:bg-ink hover:text-white disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add to project list"}
        </button>
      </div>
      {unitHint && <p className="text-xs text-muted">Quantity is in packages ({unitHint} each).</p>}
      {state.added > 0 && (
        <p className="text-sm text-save" role="status">
          Added {state.added} to your list ·{" "}
          <Link href="/list" className="font-medium underline">
            Compare the whole list
          </Link>
        </p>
      )}
    </form>
  );
}
