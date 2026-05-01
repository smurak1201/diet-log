"use client";

import { useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import { type ActionState, upsertBodyComposition } from "./actions";

export function BodyEntry() {
  const [state, setState] = useState<ActionState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const headingId = useId();

  async function handleSubmit(formData: FormData) {
    const result = await upsertBodyComposition({ kind: "idle" }, formData);
    setState(result);
    setFieldErrors(
      result.kind === "error" ? (result.fieldErrors ?? {}) : {},
    );
    if (result.kind === "ok") {
      formRef.current?.reset();
    }
  }

  function handleFormChange(e: React.ChangeEvent<HTMLFormElement>) {
    const target = e.target;
    if (!(target instanceof HTMLInputElement) || !target.name) return;
    setFieldErrors((prev) => {
      if (!prev[target.name]) return prev;
      const next = { ...prev };
      delete next[target.name];
      return next;
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-12 bg-white p-4 shadow-1"
    >
      <h2 id={headingId} className="text-std-20B-160">
        体組成記録
      </h2>
      <p className="mt-1 text-std-14N-130 text-solid-gray-700">
        同じ日付で再登録すると上書きされます。
      </p>

      <form
        ref={formRef}
        action={handleSubmit}
        onChange={handleFormChange}
        className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4"
        noValidate
      >
        <Field
          label="日付"
          name="date"
          type="date"
          defaultValue={today}
          required
          error={fieldErrors.date}
        />
        <Field
          label="体重"
          name="weightKg"
          type="number"
          step="0.1"
          inputMode="decimal"
          required
          unit="kg"
          error={fieldErrors.weightKg}
        />
        <Field
          label="体脂肪率"
          name="bodyFatPct"
          type="number"
          step="0.1"
          inputMode="decimal"
          required
          unit="%"
          error={fieldErrors.bodyFatPct}
        />
        <Field
          label="筋肉量"
          name="muscleMassKg"
          type="number"
          step="0.1"
          inputMode="decimal"
          required
          unit="kg"
          error={fieldErrors.muscleMassKg}
        />
        <Field
          label="内臓脂肪"
          name="visceralFat"
          type="number"
          step="0.1"
          inputMode="decimal"
          required
          error={fieldErrors.visceralFat}
        />
        <Field
          label="基礎代謝"
          name="basalMetabolism"
          type="number"
          step="1"
          inputMode="numeric"
          required
          unit="kcal"
          error={fieldErrors.basalMetabolism}
        />

        <SubmitButton />

        <StatusMessage state={state} />
      </form>
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "col-span-2 min-h-11 cursor-pointer rounded-8 bg-blue-800 px-4 text-std-16B-170 text-white",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
        "transition-colors hover:bg-blue-900 active:bg-blue-900",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {pending ? "登録中…" : "登録する"}
    </button>
  );
}

function StatusMessage({ state }: { state: ActionState }) {
  let message = "";
  if (state.kind === "ok") {
    message = state.mode === "updated" ? "更新しました" : "登録しました";
  } else if (state.kind === "error") {
    message = state.error;
  }
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "col-span-2 min-h-6 text-std-14N-130",
        state.kind === "error" ? "text-error-1" : "text-success-1",
      )}
    >
      {message}
    </p>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type: "date" | "number";
  step?: string;
  inputMode?: "decimal" | "numeric";
  defaultValue?: string;
  required?: boolean;
  unit?: string;
  error?: string[];
};

function Field({
  label,
  name,
  type,
  step,
  inputMode,
  defaultValue,
  required,
  unit,
  error,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-std-14B-130">
        {label}
        {required && <span className="ml-1 text-error-1" aria-hidden>*</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          name={name}
          type={type}
          step={step}
          inputMode={inputMode}
          defaultValue={defaultValue}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-8 border border-solid-gray-420 bg-white px-3 text-std-16N-170",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
            error && "border-error-1",
          )}
        />
        {unit && (
          <span className="shrink-0 text-std-14N-130 text-solid-gray-700">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-std-14N-130 text-error-1">
          {error.join(" / ")}
        </p>
      )}
    </div>
  );
}
