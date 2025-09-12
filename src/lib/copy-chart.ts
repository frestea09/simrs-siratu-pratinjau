export async function copyChartImage(node: HTMLElement | null) {
  if (!node) return Promise.reject("No element")
  const svg = node.querySelector("svg") as SVGSVGElement | null
  if (!svg) return Promise.reject("No chart")

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svg)
  const canvas = document.createElement("canvas")
  const { width, height } = svg.getBoundingClientRect()
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return Promise.reject("No context")

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
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
}
