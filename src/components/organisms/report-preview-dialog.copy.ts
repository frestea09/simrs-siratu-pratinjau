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

const getSvgDimensions = (svg: SVGSVGElement) => {
  const rect = svg.getBoundingClientRect()
  const svgElement = svg as SVGSVGElement
  const viewBox = svgElement.viewBox?.baseVal

  const widthAttr = svg.getAttribute("width")
  const heightAttr = svg.getAttribute("height")

  const width = Math.ceil(
    rect.width ||
      (widthAttr ? parseFloat(widthAttr) : 0) ||
      (viewBox ? viewBox.width : 0) ||
      svg.clientWidth ||
      svg.scrollWidth ||
      0
  )

  const height = Math.ceil(
    rect.height ||
      (heightAttr ? parseFloat(heightAttr) : 0) ||
      (viewBox ? viewBox.height : 0) ||
      svg.clientHeight ||
      svg.scrollHeight ||
      0
  )

  return {
    width: width || 1,
    height: height || 1,
  }
}

const replaceSvgWithImages = async (original: HTMLElement, clone: HTMLElement) => {
  const originalSvgs = Array.from(original.querySelectorAll("svg"))
  const cloneSvgs = Array.from(clone.querySelectorAll("svg"))
  const serializer = new XMLSerializer()

  await Promise.all(
    originalSvgs.map(async (svg, index) => {
      const cloneSvg = cloneSvgs[index]
      if (!cloneSvg) return

      try {
        const svgClone = svg.cloneNode(true) as SVGSVGElement
        if (!svgClone.getAttribute("xmlns")) {
          svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
        }
        if (!svgClone.getAttribute("xmlns:xlink")) {
          svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
        }

        const { width, height } = getSvgDimensions(svgClone)
        svgClone.setAttribute("width", `${width}`)
        svgClone.setAttribute("height", `${height}`)

        const svgString = serializer.serializeToString(svgClone)
        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        })
        const url = URL.createObjectURL(svgBlob)

        try {
          const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = url
          })

          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height
          const context = canvas.getContext("2d")
          if (!context) return

          context.drawImage(imageElement, 0, 0, width, height)
          const dataUrl = canvas.toDataURL("image/png")

          const image = document.createElement("img")
          image.src = dataUrl

          image.width = width
          image.height = height

          const existingStyle = cloneSvg.getAttribute("style")
          if (existingStyle) {
            image.setAttribute("style", existingStyle)
          }

          if (!image.style.width) {
            image.style.width = `${width}px`
          }
          if (!image.style.height) {
            image.style.height = `${height}px`
          }

          if (!image.style.display) {
            image.style.display = "block"
          }
          if (!image.style.maxWidth) {
            image.style.maxWidth = "100%"
          }

          const svgClass = cloneSvg.getAttribute("class")
          if (svgClass) {
            image.className = svgClass
          }

          cloneSvg.replaceWith(image)
        } finally {
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.warn("Unable to capture svg for clipboard", error)
      }
    })
  )
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const replaceChartContainersWithImages = async (
  original: HTMLElement,
  clone: HTMLElement
) => {
  const originalCharts = Array.from(
    original.querySelectorAll<HTMLElement>("[data-export-chart]")
  )
  const cloneCharts = Array.from(
    clone.querySelectorAll<HTMLElement>("[data-export-chart]")
  )

  await Promise.all(
    originalCharts.map(async (chart, index) => {
      const cloneChart = cloneCharts[index]
      if (!cloneChart) return

      const rect = chart.getBoundingClientRect()
      const width = Math.ceil(
        rect.width || chart.scrollWidth || chart.clientWidth || 0
      )
      const height = Math.ceil(
        rect.height || chart.scrollHeight || chart.clientHeight || 0
      )

      if (!width || !height) return

      try {
        const snapshotBlob = await createImageBlob(
          cloneChart.outerHTML,
          width,
          height
        )

        if (!snapshotBlob) return

        const dataUrl = await blobToDataUrl(snapshotBlob)
        const image = document.createElement("img")

        image.src = dataUrl
        image.width = width
        image.height = height

        const fallbackWidth = `${width}px`
        const fallbackHeight = `${height}px`

        const existingStyle = cloneChart.getAttribute("style")
        if (existingStyle) {
          image.setAttribute("style", existingStyle)
        }

        if (!image.style.width) {
          image.style.width = fallbackWidth
        }
        if (!image.style.height) {
          image.style.height = fallbackHeight
        }

        image.style.display = image.style.display || "block"
        image.style.maxWidth = image.style.maxWidth || "100%"

        image.className = cloneChart.className

        cloneChart.replaceWith(image)
      } catch (error) {
        console.warn("Unable to capture chart container", error)
      }
    })
  )
}

const sanitizeContent = async (content: HTMLElement) => {
  const clone = content.cloneNode(true) as HTMLElement

  inlineComputedStyles(content, clone)
  replaceCanvasWithImages(content, clone)
  await replaceSvgWithImages(content, clone)

  await replaceChartContainersWithImages(content, clone)

  clone.querySelectorAll(removableSelectors.join(",")).forEach((node) => {
    node.remove()
  })

  clone
    .querySelectorAll<HTMLElement>('[data-export-scroll]')
    .forEach((node) => {
      node.classList.remove("overflow-y-auto", "-mr-6")
      node.classList.add("overflow-visible")
    })

  clone.querySelectorAll("[data-export-chart]").forEach((node) => {
    node.removeAttribute("data-export-chart")
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

  const clone = await sanitizeContent(content)

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

