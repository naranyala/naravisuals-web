/**
 * useReadingTime
 *
 * Estimates reading time in minutes based on word count.
 * Accepts either a text string or a word count directly.
 *
 * Average adult reading speed: ~200-250 words per minute.
 */

export function useReadingTime(
  text: string | undefined | null,
  wordsPerMinute = 225
): { minutes: number; words: number; formatted: string } {
  if (!text) return { minutes: 0, words: 0, formatted: "0 min read" };

  // Strip HTML tags and markdown to get plain text
  const plainText = text
    .replace(/<[^>]+>/g, " ")
    .replace(/```[\s\S]*?```/g, " code ")
    .replace(/`[^`]+`/g, " code ")
    .replace(/[#*>_~\-[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = plainText ? plainText.split(" ").length : 0;
  const minutes = Math.ceil(words / wordsPerMinute);

  return {
    minutes,
    words,
    formatted: minutes < 1 ? "< 1 min read" : `${minutes} min read`,
  };
}
