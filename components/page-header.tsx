// 各ページ共通の上部固定ヘッダー。
// sticky top-0 でスクロール時も画面上部に残る。下部タブナビ (z-40) より下、
// スキップリンク (z-50) より下になるよう z-30 を割り当てている。
// PWA スタンドアロン起動時に iOS ステータスバーへ食い込まないよう
// pt-[env(safe-area-inset-top)] を入れている (ブラウザでは 0)。

type Props = { title: string };

export function PageHeader({ title }: Props) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-solid-gray-200 bg-white pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-screen-sm items-center px-4">
        <h1 className="text-std-16B-170">{title}</h1>
      </div>
    </header>
  );
}
