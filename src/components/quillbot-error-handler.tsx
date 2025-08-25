"use client"

import { useEffect } from "react"

/**
 * Suppresses unhandled promise rejections coming from the Quillbot
 * browser extension so they don't freeze the page in development.
 */
export default function QuillbotErrorHandler() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const message = String(event?.reason?.message || "")
      if (message.includes("quillbot-content.js")) {
        event.preventDefault()
      }
    }
    window.addEventListener("unhandledrejection", handler)
    return () => window.removeEventListener("unhandledrejection", handler)
  }, [])
  return null
}
