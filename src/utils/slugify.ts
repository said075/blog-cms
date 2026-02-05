/**
 * Slug Utility
 * Converts strings to URL-friendly slugs
 */

/**
 * Convert a string to a URL-friendly slug
 * @param text - String to convert
 * @returns URL-friendly slug
 * 
 * @example
 * slugify("Hello World!") // "hello-world"
 * slugify("TypeScript & Node.js") // "typescript-and-nodejs"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with -
    .replace(/\s+/g, '-')
    // Replace & with 'and'
    .replace(/&/g, 'and')
    // Remove all non-word characters except -
    .replace(/[^\w\-]+/g, '')
    // Replace multiple - with single -
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing -
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generate a unique slug by appending a number if needed
 * @param baseSlug - Base slug to start with
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 * 
 * @example
 * generateUniqueSlug("hello-world", ["hello-world"]) // "hello-world-2"
 * generateUniqueSlug("hello-world", ["hello-world", "hello-world-2"]) // "hello-world-3"
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 2;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Create a slug from title and ensure it's unique
 * @param title - Title to convert to slug
 * @param checkExistsFn - Async function that checks if slug exists
 * @returns Unique slug
 */
export async function createUniqueSlug(
  title: string,
  checkExistsFn: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = slugify(title);
  let counter = 2;

  while (await checkExistsFn(slug)) {
    slug = `${slugify(title)}-${counter}`;
    counter++;
  }

  return slug;
}
