import { LEVEL_CAP } from "./levels";

export function canPrestige(level: number) {
  return level >= LEVEL_CAP;
}

export function toRoman(value: number): string {
  if (value <= 0) return "0";
  const numerals: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let out = "";
  let remaining = Math.floor(value);

  for (const [amount, symbol] of numerals) {
    while (remaining >= amount) {
      out += symbol;
      remaining -= amount;
    }
  }

  return out;
}

export function prestigeLabel(prestigeLevel: number) {
  return prestigeLevel > 0 ? `Prestige ${toRoman(prestigeLevel)}` : "Sem prestige";
}
