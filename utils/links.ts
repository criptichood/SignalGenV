// A simple regex to find URLs in a string.
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * Extracts all URLs from a given string.
 * @param text The text to search for URLs.
 * @returns An array of URL strings found in the text.
 */
export function extractLinks(text: string): string[] {
    if (!text) return [];
    const matches = text.match(URL_REGEX);
    return matches || [];
}
