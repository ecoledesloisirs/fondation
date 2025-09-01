// Charge TOUTES les SVG du dossier en RAW (string) côté build
export const RAW_ICONS = import.meta.glob("./*.svg", {
  as: "raw",
  eager: true,
});

// Typage pratique: "arrow-right" | "plus" | ...
export type IconName = keyof typeof RAW_ICONS extends `./${infer N}.svg`
  ? N
  : never;

export function getIcon(name: string): string | null {
  const key = `./${name}.svg`;
  return (RAW_ICONS as Record<string, string>)[key] ?? null;
}
