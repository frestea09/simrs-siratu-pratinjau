const sanitizeContent = (content: HTMLElement) => {
  const clone = content.cloneNode(true) as HTMLElement

  const removableSelectors = [
    "[data-copy-exclude]",
    "[data-print-exclude]",
    "[data-export-exclude]",
    ".no-print",
  ]
  clone.querySelectorAll(removableSelectors.join(",")).forEach((node) => {
    node.remove()
  })

  clone.querySelectorAll<HTMLElement>('[data-export-scroll]').forEach((node) => {
    node.classList.remove('overflow-y-auto', '-mr-6')
    node.classList.add('overflow-visible')
  })

  return clone
}

export const copyReport = async (content: HTMLDivElement | null) => {
  if (!content) return Promise.reject("No content")

  const clone = sanitizeContent(content)
  const html = clone.outerHTML
  const text = clone.innerText

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

