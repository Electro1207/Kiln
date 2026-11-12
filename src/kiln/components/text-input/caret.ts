/* Reformatting an input while someone types moves the caret to the end unless we
   put it back. These helpers keep it beside the same "significant" character
   (a digit, say) it was beside before the text was reformatted. */

/** How many significant characters sit before position `pos` in `text`. */
export function countBefore(text: string, pos: number, significant: (ch: string) => boolean) {
  let n = 0;
  for (let i = 0; i < Math.min(pos, text.length); i++) if (significant(text[i])) n++;
  return n;
}

/** The position just after the `n`th significant character of `text`. */
export function positionAfter(text: string, n: number, significant: (ch: string) => boolean) {
  if (n <= 0) {
    // Before the first significant character, but after any fixed prefix such as "(" or "$".
    const first = [...text].findIndex(significant);
    return first < 0 ? text.length : first;
  }
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (significant(text[i])) seen++;
    if (seen === n) return i + 1;
  }
  return text.length;
}

/** Set the caret after React has written the new value. */
export function placeCaret(el: HTMLInputElement | null, pos: number) {
  if (!el || document.activeElement !== el) return;
  requestAnimationFrame(() => {
    try { el.setSelectionRange(pos, pos); } catch { /* type=number etc. */ }
  });
}
