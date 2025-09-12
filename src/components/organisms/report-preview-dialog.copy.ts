export const copyReport = async (
  content: HTMLDivElement | null,
  title?: string,
  description?: string
) => {
  if (!content) return Promise.reject("No content")

  const htmlParts: string[] = []
  const textParts: string[] = []

  if (title) {
    htmlParts.push(`<h1>${title}</h1>`)
    textParts.push(title)
  }
  if (description) {
    htmlParts.push(`<p>${description}</p>`)
    textParts.push(description)
  }

  htmlParts.push(content.innerHTML)
  textParts.push(content.innerText)

  const html = htmlParts.join("\n")
  const text = textParts.join("\n\n")

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ])
  } catch {
    await navigator.clipboard.writeText(text)
  }
}

