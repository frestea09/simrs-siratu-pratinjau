const COPY_EXCLUDE_ATTRIBUTE = "copyExclude"

function cloneNodeWithStyles(element: HTMLElement): HTMLElement {
  const clonedElement = element.cloneNode(true) as HTMLElement

  const traverse = (source: Element, target: Element) => {
    const sourceChildren = Array.from(source.children)
    const targetChildren = Array.from(target.children)

    const computedStyle = window.getComputedStyle(source)
    if (target instanceof HTMLElement || target instanceof SVGElement) {
      target.setAttribute("style", computedStyle.cssText)
    }

    sourceChildren.forEach((child, index) => {
      const targetChild = targetChildren[index]
      if (!targetChild) {
        return
      }

      if (
        child instanceof HTMLElement &&
        child.dataset?.[COPY_EXCLUDE_ATTRIBUTE] === "true"
      ) {
        targetChild.remove()
        return
      }

      traverse(child, targetChild)
    })
  }

  traverse(element, clonedElement)
  return clonedElement
}

async function elementToPng(element: HTMLElement, pixelRatio = 2) {
  const width = element.offsetWidth
  const height = element.offsetHeight

  const clonedElement = cloneNodeWithStyles(element)
  clonedElement.setAttribute("xmlns", "http://www.w3.org/1999/xhtml")
  clonedElement.style.width = `${width}px`
  clonedElement.style.height = `${height}px`
  clonedElement.style.boxSizing = "border-box"

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  svg.setAttribute("width", `${width}`)
  svg.setAttribute("height", `${height}`)
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`)

  const foreignObject = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  )
  foreignObject.setAttribute("width", "100%")
  foreignObject.setAttribute("height", "100%")
  foreignObject.appendChild(clonedElement)

  svg.appendChild(foreignObject)

  const serializedSvg = new XMLSerializer().serializeToString(svg)
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedSvg)}`

  const img = new Image()
  img.src = svgDataUrl

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = (event) => reject(event)
  })

  const canvas = document.createElement("canvas")
  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio

  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Context tidak tersedia")
  }

  context.scale(pixelRatio, pixelRatio)
  context.drawImage(img, 0, 0, width, height)

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Gagal membuat gambar"))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = () => reject(new Error("Gagal membaca gambar"))
      reader.readAsDataURL(blob)
    }, "image/png")
  })
}

export async function copyElementAsImage(element: HTMLElement) {
  const dataUrl = await elementToPng(element)
  const response = await fetch(dataUrl)
  const blob = await response.blob()

  if (
    navigator.clipboard &&
    "write" in navigator.clipboard &&
    typeof ClipboardItem !== "undefined"
  ) {
    const clipboardItemInput: Record<string, Blob> = {
      [blob.type]: blob,
    }

    await navigator.clipboard.write([new ClipboardItem(clipboardItemInput)])
    return
  }

  throw new Error("Clipboard API tidak tersedia")
}
