type ChartDetail = {
  name: string
  value: number
  color?: string
  colorName?: string
}

export async function copyChartImage(
  node: HTMLElement | null,
  details?: ChartDetail[],
) {
  if (!node) return Promise.reject("No element")
  const svg = node.querySelector("svg") as SVGSVGElement | null
  if (!svg) return Promise.reject("No chart")

  // clone SVG and inline computed styles so CSS variables resolve correctly
  const clone = svg.cloneNode(true) as SVGSVGElement
  const originalElements = svg.querySelectorAll("*")
  const clonedElements = clone.querySelectorAll("*")
  originalElements.forEach((el, i) => {
    const computed = getComputedStyle(el)
    const cloneEl = clonedElements[i] as HTMLElement
    cloneEl.setAttribute("fill", computed.fill)
    cloneEl.setAttribute("stroke", computed.stroke)
    cloneEl.setAttribute("stroke-width", computed.strokeWidth)
    cloneEl.setAttribute("font-size", computed.fontSize)
    cloneEl.setAttribute("font-family", computed.fontFamily)
  })

  const { width, height } = svg.getBoundingClientRect()
  clone.setAttribute("width", width.toString())
  clone.setAttribute("height", height.toString())
  clone.setAttribute("viewBox", `0 0 ${width} ${height}`)

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(clone)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return Promise.reject("No context")

  // set white background so transparent areas don't become black
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, width, height)

  const img = new Image()
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve()
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }
    img.src = url
  })

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve))
  if (!blob) return Promise.reject("No blob")

  const item: Record<string, Blob> = { [blob.type]: blob }

  if (details && details.length > 0) {
    const text = details
      .map((d) =>
        d.colorName ? `${d.name} (${d.colorName}): ${d.value}` : `${d.name}: ${d.value}`,
      )
      .join("\n")
    const dataUrl = canvas.toDataURL("image/png")
    const tableRows = details
      .map((d) => {
        const colorSwatch = d.color
          ? `<span style="display:inline-block;width:12px;height:12px;background:${d.color};margin-right:4px;"></span>`
          : ""
        const label = d.colorName ? `${d.name} (${d.colorName})` : d.name
        return `<tr><td>${colorSwatch}${label}</td><td>${d.value}</td></tr>`
      })
      .join("")
    const html = `<div><img src="${dataUrl}"/><table>${tableRows}</table></div>`

    item["text/plain"] = new Blob([text], { type: "text/plain" })
    item["text/html"] = new Blob([html], { type: "text/html" })
  }

  await navigator.clipboard.write([new ClipboardItem(item)])
}
