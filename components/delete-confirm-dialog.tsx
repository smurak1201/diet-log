"use client";

// 削除確認モーダル
// - ネイティブ <dialog> + showModal() (focus trap / ESC 閉鎖は標準動作)
// - 開いた瞬間にキャンセルボタンへフォーカス → 誤削除防止
// - 確認は <form action> + useFormStatus で entry 既存パターンと統一

import { useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

export type DeleteResult = { kind: "ok" } | { kind: "error"; error: string };

type Props = {
  /// "2026/04/30 の体組成記録" など、ボタン aria-label とタイトルに使う
  label: string;
  /// 削除実行する Server Action (id を bind 済みで渡す想定)
  action: () => Promise<DeleteResult>;
};

export function DeleteConfirmDialog({ label, action }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  async function handleConfirm() {
    const result = await action();
    if (result.kind === "ok") {
      toast.success("削除しました");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${label}を削除`}
        className={cn(
          "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-8 text-solid-gray-700",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
          "transition-all hover:bg-solid-gray-50 active:scale-[0.96] active:bg-solid-gray-100",
        )}
      >
        <span className="material-symbols-outlined" aria-hidden>
          delete
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        className={cn(
          "rounded-12 bg-white p-0 shadow-4",
          "w-[min(28rem,calc(100vw-2rem))]",
          // Tailwind preflight が UA の `margin: auto` を `margin: 0` に潰すため、
          // showModal で中央寄せされるよう m-auto で復元する
          "fixed inset-0 m-auto",
          "backdrop:bg-solid-gray-900/40",
        )}
      >
        <form action={handleConfirm} className="flex flex-col gap-4 p-5">
          <h2 id={titleId} className="text-std-18B-160">
            {label}を削除しますか?
          </h2>
          <p className="text-std-14N-130 text-solid-gray-700">
            この操作は取り消せません。
          </p>
          <div className="flex justify-end gap-2">
            <button
              ref={cancelRef}
              type="button"
              onClick={() => setOpen(false)}
              className={cn(
                "min-h-11 cursor-pointer rounded-8 border border-solid-gray-420 px-4 text-std-16N-170 text-solid-gray-900",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
                "transition-all hover:bg-solid-gray-50 active:translate-y-px active:scale-[0.98]",
              )}
            >
              キャンセル
            </button>
            <ConfirmButton />
          </div>
        </form>
      </dialog>
    </>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "min-h-11 cursor-pointer rounded-8 bg-error-1 px-4 text-std-16B-170 text-white",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
        "transition-all active:translate-y-px active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {pending ? "削除中…" : "削除する"}
    </button>
  );
}
