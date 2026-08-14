export function formatDate(dateTaken: string): string {
  const [year, month, day] = dateTaken.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
