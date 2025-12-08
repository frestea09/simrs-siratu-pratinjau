'use client'

import { useEffect } from 'react'

const swaggerCssCdn = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css'
const swaggerJsCdn = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js'

export default function DocsPage() {
  useEffect(() => {
    const head = document.head

    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = swaggerCssCdn
    head.appendChild(css)

    const script = document.createElement('script')
    script.src = swaggerJsCdn
    script.onload = () => {
      const bundle = (window as { SwaggerUIBundle?: any }).SwaggerUIBundle
      if (typeof bundle === 'function') {
        bundle({
          url: '/api/docs',
          dom_id: '#swagger-ui',
          docExpansion: 'list',
          presets: [bundle.presets.apis],
          layout: 'BaseLayout',
          defaultModelExpandDepth: 1,
          defaultModelsExpandDepth: 1,
        })
      }
    }
    head.appendChild(script)

    return () => {
      head.removeChild(css)
      head.removeChild(script)
    }
  }, [])

  return (
    <main className="p-6 space-y-4">
      <section>
        <h1 className="text-2xl font-semibold">Dokumentasi API (Swagger)</h1>
        <p className="text-muted-foreground">
          Endpoint JSON tersedia di <code>/api/docs</code>. Halaman ini memuat Swagger UI
          menggunakan CDN sehingga tidak menambah dependensi build.
        </p>
      </section>
      <div id="swagger-ui" className="rounded-lg bg-white shadow" />
    </main>
  )
}
