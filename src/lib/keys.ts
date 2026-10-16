/** "Black Holes", "black-holes" and "Black  holes " all become "black holes". Used as node ids. */
export function topicKey(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9()]+/g, " ")
    .trim();
}

/** URL slug for topic pages. */
export function slugify(text: string): string {
  return topicKey(text).replace(/[()]/g, "").trim().replace(/\s+/g, "-");
}

/** Removes control characters and extra spaces from user input; caps the length. */
export function cleanTopic(input: unknown, max = 80): string {
  return String(input ?? "")
    .replace(/[\u0000-\u001f\u007f<>{}`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
