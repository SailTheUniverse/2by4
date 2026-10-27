"use client";

import { useState } from "react";

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy this link", new URL(path, window.location.origin).toString());
        }
      }}
      className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium hover:border-accent"
    >
      {copied ? "Link copied ✓" : "Copy share link"}
    </button>
  );
}
