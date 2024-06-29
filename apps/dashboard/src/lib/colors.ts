'use client';

export function getCssVariable(variableName: string): string {
  return window
    .getComputedStyle(document.body)
    .getPropertyValue(`--${variableName}`);
}

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hslStringToHex(hslString: string): string {
  const [h, s, l] = hslString.split(' ').map(parseFloat);
  return hslToHex(h as number, s as number, l as number);
}

export function getCssVariableAsHex(variableName: string): string {
  const hslString = getCssVariable(variableName);
  return hslStringToHex(hslString);
}
