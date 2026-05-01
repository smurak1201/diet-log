import type { Metadata } from "next";
import { BodyEntry } from "./body-entry";
import { WorkoutEntry } from "./workout-entry";

export const metadata: Metadata = {
  title: "データ登録 | ダイエットログ",
};

export default function EntryPage() {
  return (
    <>
      <header className="w-full border-b border-solid-gray-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-screen-sm items-center px-4">
          <h1 className="text-std-16B-170">データ登録</h1>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-screen-sm flex-1 flex-col gap-4 px-4 py-6"
      >
        <WorkoutEntry />
        <BodyEntry />
      </main>
    </>
  );
}
