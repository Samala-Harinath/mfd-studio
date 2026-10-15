"use client";

import { readImageFile } from "@/lib/read-image";

export function ImageUpload({
  label,
  hint,
  value,
  emptyLabel,
  onChange,
  onError,
}: {
  label: string;
  hint: string;
  value: string | null;
  emptyLabel: string;
  onChange: (value: string | null) => void;
  onError: (message: string) => void;
}) {
  return (
    <div>
      <p className="text-[13px] font-medium text-ink">{label}</p>
      <p className="mt-1 text-[13px] leading-5 text-muted">{hint}</p>
      <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line-strong bg-canvas px-3 py-3 hover:border-brand">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-14 w-14 rounded-lg bg-white object-contain" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface text-[11px] font-semibold text-muted">
            {emptyLabel}
          </span>
        )}
        <span>
          <span className="block text-sm font-semibold text-ink">{value ? "Replace image" : "Choose an image"}</span>
          <span className="mt-0.5 block text-xs text-muted">PNG, JPG, or WebP · up to 5 MB</span>
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            void readImageFile(file).then(onChange).catch((error: unknown) => {
              onError(error instanceof Error ? error.message : "Could not read that image.");
            });
          }}
        />
      </label>
      {value ? (
        <button type="button" className="mt-2 text-sm font-medium text-bad" onClick={() => onChange(null)}>
          Remove
        </button>
      ) : null}
    </div>
  );
}
