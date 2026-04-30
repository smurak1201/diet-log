export const TABS = [
  { href: "/", label: "ホーム", icon: "home" },
  { href: "/workout", label: "運動記録", icon: "directions_run" },
  { href: "/body", label: "体組成", icon: "monitor_weight" },
  { href: "/entry", label: "データ登録", icon: "add_circle" },
] as const;

export type Tab = (typeof TABS)[number];
