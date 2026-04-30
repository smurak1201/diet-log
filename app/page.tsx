export default function Home() {
  return (
    <>
      <header className="w-full border-b border-solid-gray-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-screen-sm items-center px-4">
          <span className="text-std-16B-170">ダイエットログ</span>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-screen-sm flex-1 px-4 py-8">
        <h1 className="text-std-24B-150">ようこそ</h1>
        <p className="mt-3 text-std-16N-170">
          毎日の運動と体組成を記録しましょう。
        </p>

        <section aria-label="記録メニュー" className="mt-8 grid grid-cols-1 gap-3">
          <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
            <h2 className="text-std-18B-160">運動記録</h2>
            <p className="mt-1 text-std-16N-170 text-solid-gray-700">
              距離・ペース・時間・消費カロリー・心拍数を記録します。
            </p>
          </article>
          <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
            <h2 className="text-std-18B-160">体重・体組成</h2>
            <p className="mt-1 text-std-16N-170 text-solid-gray-700">
              体重・体脂肪率・筋肉量・内臓脂肪・基礎代謝を記録します。
            </p>
          </article>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-screen-sm px-4 py-6 text-dns-14N-130 text-solid-gray-700">
        <span>diet-log</span>
      </footer>
    </>
  );
}
