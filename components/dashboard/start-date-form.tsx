"use client";

// ダイエット開始日の登録/更新フォーム本体 (シェル無し)
// useActionState のステートは Server Action 戻り値を素直に表示するだけ

import { useActionState, useEffect, useId } from "react";
import { toast } from "sonner";
import { setDietStartDate, type SettingActionState } from "@/app/actions";
import { cn } from "@/lib/cn";

const initialState: SettingActionState = { kind: "idle" };

type Props = {
  todayIso: string;
  defaultValue?: string;
  submitLabel: string;
  successMessage: string;
};

export function StartDateForm({
  todayIso,
  defaultValue,
  submitLabel,
  successMessage,
}: Props) {
  const [state, action, pending] = useActionState(
    setDietStartDate,
    initialState,
  );
  const inputId = useId();

  useEffect(() => {
    if (state.kind === "ok") {
      toast.success(successMessage);
    }
  }, [state, successMessage]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-std-14N-130 text-solid-gray-700"
        >
          開始日
        </label>
        <input
          id={inputId}
          name="date"
          type="date"
          required
          max={todayIso}
          defaultValue={defaultValue ?? todayIso}
          className={cn(
            "rounded-8 border border-solid-gray-300 bg-white px-3 py-2 text-std-16N-170",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
          )}
        />
        {state.kind === "error" && state.fieldErrors?.date && (
          <p
            role="alert"
            aria-live="polite"
            className="text-std-14N-130 text-error-1"
          >
            {state.fieldErrors.date[0]}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={cn(
          "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-8 bg-blue-800 px-4 text-std-16B-170 text-white",
          "transition-all hover:bg-blue-900 active:translate-y-px active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
        )}
      >
        {pending ? "保存中…" : submitLabel}
      </button>
      {state.kind === "error" && !state.fieldErrors && (
        <p
          role="alert"
          aria-live="polite"
          className="text-std-14N-130 text-error-1"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
