export const printReport = (
  content: HTMLDivElement | null,
  title?: string,
  description?: string,
) => {
  if (!content) return

  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`

  const clonedContent = content.cloneNode(true) as HTMLDivElement
  const canvases = clonedContent.querySelectorAll('canvas')
  canvases.forEach((c) => c.setAttribute('data-chart-id', uid()))

  const originals = content.querySelectorAll('svg')
  const clones = clonedContent.querySelectorAll('svg')
  originals.forEach((svg, i) => {
    try {
      const bbox = (svg as SVGGraphicsElement).getBBox()
      const padding = 8
      const width = bbox.width + padding * 2
      const height = bbox.height + padding * 2
      const cloneSvg = clones[i] as SVGSVGElement
      cloneSvg.setAttribute('width', width.toString())
      cloneSvg.setAttribute('height', height.toString())
      cloneSvg.setAttribute(
        'viewBox',
        `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`,
      )
    } catch {}
  })

  const printWindow = window.open("", "", "width=1200,height=800")
  if (!printWindow) {
    alert("Please allow popups for this website")
    return
  }

  const contentHtml = clonedContent.innerHTML

  printWindow.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <title>${title || 'Laporan'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            @page { size: A4 landscape; margin: 1.5cm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-page { break-before: page; }
            .print-page-break { break-after: page; }
            .no-print { display: none; }
          }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; font-size: 11px; table-layout: auto; }
          th, td { border: 1px solid #e2e8f0; padding: 6px; text-align: left; vertical-align: top; word-break: break-word; }
          th { background-color: #f1f5f9; }
          .print-page { page-break-before: always; padding-top: 2rem; }
          .print-page:first-child { page-break-before: avoid; padding-top: 0; }
          .print-container, .print-container * { max-width: 100%; overflow: visible !important; }
          h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
          h2 { font-size: 20px; font-weight: bold; margin-bottom: 12px; }
          h3 { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="p-4 print-container">
           <h1>${title || 'Laporan'}</h1>
           <p>${description || ''}</p>
           <div class="mt-8">
             ${contentHtml}
           </div>
        </div>
      </body>
    </html>`)
  printWindow.document.close()

  setTimeout(() => {
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }, 500)
}
