// src/utils/dateUtils.js

/**
 * Format a date string (ISO, timestamp, or Date object) to dd-mm-yy
 * Example: "2025-11-02" → "02-11-25"
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date)) return "";

  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
    .replaceAll("/", "-");
};


