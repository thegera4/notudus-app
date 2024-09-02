/**
 * This function limits the content of a string to a certain length (used, for example, to limit the amount of characters in note card).
 */
export const limitContent = (content: string, maxLength: number) => content.length > maxLength ? content.substring(0, maxLength) + '...' : content;