import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { BodyEntry } from "./body-entry";
import { WorkoutEntry } from "./workout-entry";

export const metadata: Metadata = {
  title: "データ登録 | ダイエットログ",
};

export default function EntryPage() {
  return (
    <>
      <PageHeader title="データ登録" />

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
