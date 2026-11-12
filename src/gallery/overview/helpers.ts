export const noop = () => {};
export const pick = <T,>(xs: T[], n: number) => xs[n % xs.length];
