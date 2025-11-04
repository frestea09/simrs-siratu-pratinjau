export const printReport = (
  content: HTMLDivElement | null,
  title?: string,
  description?: string,
) => {
  if (!content) return

  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`

  const charts = Array.from(content.querySelectorAll('canvas'))
  const chartImages = new Map<string, { dataUrl: string; width: number; height: number }>()
  charts.forEach((canvas) => {
    const id = uid()
    canvas.setAttribute('data-chart-id', id)
    try {
      chartImages.set(id, {
        dataUrl: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
      })
    } catch (error) {
      console.error('Failed to convert chart to image', error)
    }
  })

  const printWindow = window.open("", "", "width=1200,height=800")
  if (!printWindow) {
    alert("Please allow popups for this website")
    return
  }

  const contentHtml = content.innerHTML

  const printDocument = printWindow.document
  printDocument.open()
  printDocument.write("<!DOCTYPE html><html><head></head><body></body></html>")
  printDocument.close()

  const { head, body, documentElement } = printDocument

  const pageTitle = printDocument.createElement('title')
  pageTitle.textContent = title || 'Laporan'
  head.appendChild(pageTitle)

  const sourceHeadElements = Array.from(
    document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"], style')
  )

  sourceHeadElements.forEach((element) => {
    if (element.tagName === 'STYLE') {
      head.appendChild(element.cloneNode(true))
      return
    }

    const link = element as HTMLLinkElement
    if (!link.href) return

    const clonedLink = printDocument.createElement('link')
    clonedLink.rel = 'stylesheet'
    clonedLink.href = link.href
    head.appendChild(clonedLink)
  })

  const customStyle = printDocument.createElement('style')
  customStyle.textContent = `
    @media print {
      @page { size: A4 landscape; margin: 1.5cm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-page { break-before: page; }
      .print-page-break { break-after: page; }
      .no-print { display: none; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: hsl(var(--background));
      color: hsl(var(--foreground));
    }
    table { border-collapse: collapse; width: 100%; font-size: 11px; table-layout: auto; }
    th, td { border: 1px solid #e2e8f0; padding: 6px; text-align: left; vertical-align: top; word-break: break-word; }
    th { background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); }
    .print-page { page-break-before: always; padding-top: 2rem; }
    .print-page:first-child { page-break-before: avoid; padding-top: 0; }
    .print-container, .print-container * { max-width: 100%; overflow: visible !important; }
    h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
    h2 { font-size: 20px; font-weight: bold; margin-bottom: 12px; }
    h3 { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
  `
  head.appendChild(customStyle)

  documentElement.className = document.documentElement.className
  document.documentElement.getAttributeNames().forEach((attr) => {
    const value = document.documentElement.getAttribute(attr)
    if (value !== null) {
      documentElement.setAttribute(attr, value)
    }
  })

  body.className = document.body.className
  document.body.getAttributeNames().forEach((attr) => {
    const value = document.body.getAttribute(attr)
    if (value !== null) {
      body.setAttribute(attr, value)
    }
  })

  const container = printDocument.createElement('div')
  container.className = 'p-6 print-container'
  container.innerHTML = `
    <h1 class="text-2xl font-bold text-primary mb-2">${title || 'Laporan'}</h1>
    <p class="text-sm text-muted-foreground">${description || ''}</p>
    <div class="mt-8 space-y-6">${contentHtml}</div>
  `
  body.appendChild(container)

  chartImages.forEach((chart, id) => {
    const target = printDocument.querySelector<HTMLCanvasElement>(`canvas[data-chart-id="${id}"]`)
    if (!target) return

    const image = printDocument.createElement('img')
    image.src = chart.dataUrl
    image.width = chart.width
    image.height = chart.height
    image.style.maxWidth = '100%'
    image.style.height = 'auto'
    target.replaceWith(image)
  })

  setTimeout(() => {
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }, 500)
}
