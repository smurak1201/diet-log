"use client";

import {
  type ChangeEvent,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import {
  type ActionState,
  createWorkout,
  recognizeWorkoutImage,
} from "./actions";

// Server から返る認識結果の形 (lib/gemini.ts の RunRecognition と同形だが、Client にロードされないよう型をここに持つ)
type RunRecognition = {
  date: string | null;
  distanceKm: number | null;
  paceSecPerKm: number | null;
  durationSec: number | null;
  calories: number | null;
  avgHeartRate: number | null;
};

export function WorkoutEntry() {
  // useActionState は使わず、自前で state 管理する。submit 成功時に
  // form リセット・認識結果クリアを transition コールバック内で同期実行するため
  // (Effect 内で setState すると set-state-in-effect lint に引っかかる)
  const [state, setState] = useState<ActionState>({ kind: "idle" });
  const [recognized, setRecognized] = useState<RunRecognition | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [recognizeError, setRecognizeError] = useState<string | null>(null);
  const [isRecognizing, startRecognize] = useTransition();

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headingId = useId();

  async function handleSubmit(formData: FormData) {
    const result = await createWorkout({ kind: "idle" }, formData);
    setState(result);
    if (result.kind === "ok") {
      formRef.current?.reset();
      setRecognized(null);
      setFormKey((k) => k + 1);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // 新しい画像を選んだ瞬間にフォームを空にする
    // (認識失敗時に前回の認識結果が残るのを防ぐ + 認識中に古い値を見せない)
    setRecognizeError(null);
    setRecognized(null);
    setFormKey((k) => k + 1);

    startRecognize(async () => {
      const compressed = await compressImage(file).catch(() => file);
      const formData = new FormData();
      formData.append("image", compressed);
      const result = await recognizeWorkoutImage({ kind: "idle" }, formData);
      if (result.kind === "ok") {
        setRecognized(result.data);
        setFormKey((k) => k + 1);
      } else if (result.kind === "error") {
        setRecognizeError(result.error);
      }
    });
  }

  const fieldErrors = state.kind === "error" ? state.fieldErrors : undefined;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-12 bg-white p-4 shadow-1"
    >
      <h2 id={headingId} className="text-std-20B-160">
        運動記録
      </h2>
      <p className="mt-1 text-std-14N-130 text-solid-gray-700">
        Nike Run Club のスクショから自動入力できます。値を確認・修正してから登録してください。
      </p>

      <div className="mt-4">
        <label
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-8 border border-blue-800 px-4 text-std-16B-170 text-blue-800",
            "cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-blue",
            isRecognizing && "opacity-60",
          )}
        >
          <span
            className={cn(
              "material-symbols-outlined",
              isRecognizing && "animate-spin",
            )}
            aria-hidden
          >
            {isRecognizing ? "progress_activity" : "add_a_photo"}
          </span>
          <span>{isRecognizing ? "読み取り中…" : "写真から取り込む"}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isRecognizing}
            aria-label="Nike Run Club のスクリーンショット"
          />
        </label>
        <p
          role="status"
          aria-live="polite"
          className="mt-2 min-h-6 text-std-14N-130 text-error-1"
        >
          {recognizeError ?? ""}
        </p>
      </div>

      <form
        key={formKey}
        ref={formRef}
        action={handleSubmit}
        className="mt-2 grid grid-cols-2 gap-x-3 gap-y-4"
        noValidate
      >
        <Field
          wide
          label="日時"
          name="date"
          type="datetime-local"
          defaultValue={recognized?.date ? toDateTimeLocal(recognized.date) : ""}
          required
          error={fieldErrors?.date}
        />
        <Field
          label="距離"
          name="distanceKm"
          type="number"
          step="0.01"
          inputMode="decimal"
          defaultValue={recognized?.distanceKm?.toString() ?? ""}
          required
          unit="km"
          error={fieldErrors?.distanceKm}
        />
        <Field
          label="平均ペース"
          name="paceSecPerKm"
          type="text"
          inputMode="numeric"
          placeholder="5:30"
          defaultValue={
            recognized?.paceSecPerKm != null
              ? formatPace(recognized.paceSecPerKm)
              : ""
          }
          required
          unit="/km"
          error={fieldErrors?.paceSecPerKm}
        />
        <Field
          label="時間"
          name="durationSec"
          type="text"
          inputMode="numeric"
          placeholder="32:10"
          defaultValue={
            recognized?.durationSec != null
              ? formatDuration(recognized.durationSec)
              : ""
          }
          required
          error={fieldErrors?.durationSec}
        />
        <Field
          label="消費カロリー"
          name="calories"
          type="number"
          step="1"
          inputMode="numeric"
          defaultValue={recognized?.calories?.toString() ?? ""}
          required
          unit="kcal"
          error={fieldErrors?.calories}
        />
        <Field
          wide
          label="平均心拍数"
          name="avgHeartRate"
          type="number"
          step="1"
          inputMode="numeric"
          defaultValue={recognized?.avgHeartRate?.toString() ?? ""}
          required
          unit="bpm"
          error={fieldErrors?.avgHeartRate}
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
        "col-span-2 min-h-11 rounded-8 bg-blue-800 px-4 text-std-16B-170 text-white",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
        "disabled:opacity-60",
      )}
    >
      {pending ? "登録中…" : "登録する"}
    </button>
  );
}

function StatusMessage({ state }: { state: ActionState }) {
  let message = "";
  if (state.kind === "ok") message = "登録しました";
  else if (state.kind === "error") message = state.error;
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
  type: "datetime-local" | "number" | "text";
  step?: string;
  inputMode?: "decimal" | "numeric";
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  unit?: string;
  error?: string[];
  wide?: boolean;
};

function Field({
  label,
  name,
  type,
  step,
  inputMode,
  placeholder,
  defaultValue,
  required,
  unit,
  error,
  wide,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={cn("flex flex-col gap-1", wide && "col-span-2")}>
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
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "min-h-11 min-w-0 flex-1 rounded-8 border border-solid-gray-420 bg-white px-3 text-std-16N-170",
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

// ---- ヘルパー --------------------------------------------------------------

// "2026-05-01T07:30:00Z" 等の ISO 文字列から datetime-local の "YYYY-MM-DDTHH:mm" 形式に
function toDateTimeLocal(iso: string): string {
  const trimmed = iso.replace(/Z$/, "").replace(/([+-]\d{2}:?\d{2})$/, "");
  return trimmed.slice(0, 16);
}

function formatPace(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

// 長辺 1280px / JPEG 0.85 品質に縮小。Server Action のペイロードと Gemini のトークンを節約
async function compressImage(file: File, maxEdge = 1280): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1024 * 1024) {
    bitmap.close();
    return file;
  }
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) return file;
  return new File([blob], "workout.jpg", { type: "image/jpeg" });
}
