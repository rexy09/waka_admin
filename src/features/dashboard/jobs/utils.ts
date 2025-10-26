import { ICategory } from "./types";

/**
 * Helper function to get category text from a string or ICategory object
 * @param category - Either a string or an ICategory object with translations
 * @returns The category text (English version if object)
 */
export const getCategoryText = (category: string | ICategory): string => {
  if (typeof category === "string") {
    return category;
  }
  return category?.en || "";
};
