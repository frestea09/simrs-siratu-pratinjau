const removableSelectors = [
  "[data-copy-exclude]",
  "[data-print-exclude]",
  "[data-export-exclude]",
  ".no-print",
]

const inlineComputedStyles = (source: Element, target: Element) => {
  if (!(target instanceof HTMLElement || target instanceof SVGElement)) {
    return
  }

  const computed = window.getComputedStyle(source)
  const existingStyle = target.getAttribute("style") ?? ""
  const serialized = Array.from(computed)
    .map((property) => `${property}:${computed.getPropertyValue(property)};`)
    .join("")

  target.setAttribute("style", `${existingStyle}${serialized}`)

  const sourceChildren = Array.from(source.children)
  const targetChildren = Array.from(target.children)

  sourceChildren.forEach((child, index) => {
    const targetChild = targetChildren[index]
    if (!targetChild) return
    inlineComputedStyles(child, targetChild)
  })
}

const replaceCanvasWithImages = (original: HTMLElement, clone: HTMLElement) => {
  const originalCanvases = Array.from(original.querySelectorAll("canvas"))
  const cloneCanvases = Array.from(clone.querySelectorAll("canvas"))

  originalCanvases.forEach((canvas, index) => {
    const cloneCanvas = cloneCanvases[index]
    if (!cloneCanvas) return

    try {
      const dataUrl = canvas.toDataURL("image/png")
      if (!dataUrl) return

      const image = document.createElement("img")
      const rect = canvas.getBoundingClientRect()

      if (rect.width) {
        image.style.width = `${rect.width}px`
      }
      if (rect.height) {
        image.style.height = `${rect.height}px`
      }

      const existingStyle = cloneCanvas.getAttribute("style")
      if (existingStyle) {
        image.setAttribute("style", existingStyle)
      }

      image.src = dataUrl
      cloneCanvas.replaceWith(image)
    } catch (error) {
      console.warn("Unable to capture canvas for clipboard", error)
    }
  })
}

const replaceSvgWithImages = (original: HTMLElement, clone: HTMLElement) => {
  const originalSvgs = Array.from(original.querySelectorAll("svg"))
  const cloneSvgs = Array.from(clone.querySelectorAll("svg"))
  const serializer = new XMLSerializer()

  originalSvgs.forEach((svg, index) => {
    const cloneSvg = cloneSvgs[index]
    if (!cloneSvg) return

    try {
      const svgClone = svg.cloneNode(true) as SVGElement
      if (!svgClone.getAttribute("xmlns")) {
        svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
      }

      const svgString = serializer.serializeToString(svgClone)
      const image = document.createElement("img")
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`

      const rect = svg.getBoundingClientRect()
      if (rect.width) {
        image.style.width = `${rect.width}px`
      }
      if (rect.height) {
        image.style.height = `${rect.height}px`
      }

      const existingStyle = cloneSvg.getAttribute("style")
      if (existingStyle) {
        image.setAttribute("style", existingStyle)
      }

      cloneSvg.replaceWith(image)
    } catch (error) {
      console.warn("Unable to capture svg for clipboard", error)
    }
  })
}

const sanitizeContent = (content: HTMLElement) => {
  const clone = content.cloneNode(true) as HTMLElement

  inlineComputedStyles(content, clone)
  replaceCanvasWithImages(content, clone)
  replaceSvgWithImages(content, clone)

  clone.querySelectorAll(removableSelectors.join(",")).forEach((node) => {
    node.remove()
  })

  clone.querySelectorAll<HTMLElement>('[data-export-scroll]').forEach((node) => {
    node.classList.remove("overflow-y-auto", "-mr-6")
    node.classList.add("overflow-visible")
  })

  if (!clone.style.backgroundColor) {
    clone.style.backgroundColor = "#ffffff"
  }

  clone.style.boxSizing = "border-box"

  return clone
}

const createImageBlob = async (html: string, width: number, height: number) => {
  if (!width || !height) return null

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;background:white;">${html}</div>
  </foreignObject>
</svg>`

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })

    const scale = window.devicePixelRatio || 1
    const canvas = document.createElement("canvas")
    canvas.width = Math.ceil(width * scale)
    canvas.height = Math.ceil(height * scale)

    const context = canvas.getContext("2d")
    if (!context) return null

    context.scale(scale, scale)
    context.drawImage(image, 0, 0)

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/png")
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export const copyReport = async (content: HTMLDivElement | null) => {
  if (!content) return Promise.reject("No content")

  const clone = sanitizeContent(content)

  const width = Math.ceil(Math.max(content.scrollWidth, content.getBoundingClientRect().width))
  const height = Math.ceil(
    Math.max(content.scrollHeight, content.getBoundingClientRect().height)
  )

  clone.style.width = `${width}px`
  clone.style.minHeight = `${height}px`

  const html = clone.outerHTML
  const text = clone.innerText

  const clipboardItems: Record<string, Blob> = {
    "text/html": new Blob([html], { type: "text/html" }),
    "text/plain": new Blob([text], { type: "text/plain" }),
  }

  try {
    const imageBlob = await createImageBlob(html, width, height)
    if (imageBlob) {
      clipboardItems["image/png"] = imageBlob
    }
  } catch (error) {
    console.warn("Unable to render image for clipboard", error)
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem(clipboardItems),
    ])
  } catch {
    await navigator.clipboard.writeText(text)
  }
}

