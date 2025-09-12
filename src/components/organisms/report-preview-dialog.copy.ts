export const copyReport = (
  content: HTMLDivElement | null,
  title?: string,
  description?: string
) => {
  if (!content) return Promise.reject("No content");

  const parts: string[] = [];
  if (title) parts.push(title);
  if (description) parts.push(description);
  parts.push(content.innerText);

  const text = parts.join("\n\n");
  return navigator.clipboard.writeText(text);
};

