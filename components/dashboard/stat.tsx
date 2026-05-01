// dl の中で使うラベル/値ペア。3 つのカードで同じ並びを使うので分離

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-std-14N-130 text-solid-gray-700">{label}</dt>
      <dd className="text-std-18B-160">{value}</dd>
    </div>
  );
}
