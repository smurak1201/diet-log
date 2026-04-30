import type { Metadata } from "next";

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

      <main id="main" className="mx-auto w-full max-w-screen-sm flex-1 px-4 py-8">
        <p className="text-std-16N-170 text-solid-gray-700">
          ここに運動・体組成の入力フォームを配置します。
        </p>
      </main>
    </>
  );
}
